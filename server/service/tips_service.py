from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, AIMessage
from prompts.tips_prompts import get_tips_prompt, get_fallback_tips
from models.tips import DailyTip, ResourceLink
from tools.search_mental_health_resources_tool import search_mental_health_resources_tool, TOOL_SEARCH_MENTAL_HEALTH_RESOURCES
from tools.validate_resource_tool import validate_resource_tool, TOOL_VALIDATE_RESOURCE
from core.config import get_settings
import json
import logging
import random

logger = logging.getLogger(__name__)

settings = get_settings()

# Create tool-enabled LLM
llm = ChatOpenAI(
    model=settings.OPENAI_MODEL, 
    temperature=0.7
).bind_tools([search_mental_health_resources_tool, validate_resource_tool])

async def generate_daily_tip() -> DailyTip:
    """Generate a daily tip using tool-enabled LLM, with fallback to curated tips on failure"""
    try:
        prompt = get_tips_prompt()
        response = await llm.ainvoke([HumanMessage(content=prompt)])
        
        # Handle tool calls if present
        tip_data = None
        best_link = None
        
        if getattr(response, "tool_calls", None):
            # Process tool calls
            candidate_links = []
            
            for tool_call in response.tool_calls:
                try:
                    if tool_call["name"] == TOOL_SEARCH_MENTAL_HEALTH_RESOURCES:
                        # Search for resources
                        search_results = search_mental_health_resources_tool.invoke(tool_call["args"])
                        
                        # Validate each found resource
                        for resource in search_results:
                            validation_result = validate_resource_tool.invoke({"url": resource["url"]})
                            if validation_result["is_accessible"] and validation_result["safety_score"] > 0.6:
                                candidate_links.append(ResourceLink(
                                    url=resource["url"],
                                    title=resource["title"],
                                    description=resource.get("description"),
                                    source_type=resource.get("source_type", "general"),
                                    credibility_score=resource.get("credibility_score", validation_result["safety_score"])
                                ))
                    
                    elif tool_call["name"] == TOOL_VALIDATE_RESOURCE:
                        # Handle direct resource validation (if needed)
                        validation_result = validate_resource_tool.invoke(tool_call["args"])
                        logger.info(f"Resource validation result: {validation_result}")
                        
                except Exception as e:
                    logger.warning(f"Tool call failed: {tool_call['name']} - {e}")
                    continue
            
            # Select the best link based on credibility score
            if candidate_links:
                best_link = max(candidate_links, key=lambda link: link.credibility_score or 0.0)
        
        # Parse the main response content
        if response.content:
            try:
                tip_data = json.loads(response.content)
            except json.JSONDecodeError:
                # If response is not JSON, it might be a regular response, try to extract JSON
                content = response.content.strip()
                if content.startswith('{') and content.endswith('}'):
                    tip_data = json.loads(content)
                else:
                    # If we have tool calls but no valid JSON content, create a resource tip
                    if best_link:
                        tip_data = {
                            "content": "Check out this helpful mental health resource that might be relevant to your current situation.",
                            "type": "resource",
                            "technique_category": "general"
                        }
                    else:
                        raise ValueError("Response is not valid JSON and no tool results available")
        
        # Validate the response structure
        if not tip_data or not isinstance(tip_data, dict):
            # If we have a validated link but no tip data, create a resource tip
            if best_link:
                tip_data = {
                    "content": "Here is a helpful mental health resource that might be valuable for your therapeutic journey.",
                    "type": "resource",
                    "technique_category": "general"
                }
            else:
                raise ValueError("Response is not a valid dictionary")
        
        if "content" not in tip_data or "type" not in tip_data:
            raise ValueError("Missing required fields: content and type")
        
        if tip_data["type"] not in ["prompt", "info", "ai_guidance", "resource"]:
            raise ValueError(f"Invalid tip type: {tip_data['type']}")
        
        if not isinstance(tip_data["content"], str) or not tip_data["content"].strip():
            raise ValueError("Invalid content")
        
        # Add the best validated link if found
        if best_link:
            tip_data["link"] = best_link.model_dump()
        
        # Ensure backward compatibility for existing fields
        tip_data.setdefault("technique_category", "general")
        tip_data.setdefault("follow_up_prompts", None)
        tip_data.setdefault("confidence_score", None)
        
        return DailyTip(**tip_data)
        
    except Exception as e:
        logger.error(f"Failed to generate tip: {e}")
        # Fall back to curated tips
        fallback_tips = get_fallback_tips()
        random_tip = random.choice(fallback_tips)
        
        # Ensure fallback tips have all required fields
        random_tip.setdefault("technique_category", "general")
        random_tip.setdefault("follow_up_prompts", None)
        random_tip.setdefault("link", None)
        random_tip.setdefault("confidence_score", None)
        
        return DailyTip(**random_tip)