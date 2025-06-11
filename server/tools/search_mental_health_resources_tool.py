from langchain_perplexity import ChatPerplexity
from langchain_core.tools import StructuredTool
from langchain_core.messages import HumanMessage
from pydantic import BaseModel, Field
from core.config import get_settings
from models.tips import ResourceLink
from typing import List
import json
import logging

logger = logging.getLogger(__name__)

TOOL_SEARCH_MENTAL_HEALTH_RESOURCES = "search_mental_health_resources"

settings = get_settings()
perplexity_llm = ChatPerplexity(
    model='sonar-pro', 
    temperature=0.3, 
    api_key=settings.PERPLEXITY_API_KEY
)

class SearchResourcesInput(BaseModel):
    query: str = Field(..., description="The search query for mental health resources")
    resource_type: str = Field(default="general", description="Type of resource: 'article', 'video', 'app', 'exercise', 'crisis_support', 'general'")
    max_results: int = Field(default=3, description="Maximum number of resources to return (1-5)")

def _search_mental_health_resources(query: str, resource_type: str = "general", max_results: int = 3) -> List[dict]:
    """Search for mental health resources using Perplexity API"""
    try:
        # Construct search prompt based on resource type
        search_prompts = {
            "article": f"Find {max_results} high-quality mental health articles about {query}. Focus on reputable sources like Psychology Today, Mayo Clinic, NIMH, or peer-reviewed publications.",
            "video": f"Find {max_results} helpful mental health videos or channels about {query}. Prefer educational content from licensed therapists or mental health organizations.",
            "app": f"Find {max_results} well-reviewed mental health apps related to {query}. Focus on apps with good ratings and evidence-based approaches.",
            "exercise": f"Find {max_results} practical mental health exercises or techniques for {query}. Look for specific, actionable methods from therapeutic approaches.",
            "crisis_support": f"Find {max_results} crisis support resources for {query}. Focus on hotlines, emergency services, and immediate help resources.",
            "general": f"Find {max_results} helpful mental health resources about {query}. Include a mix of articles, tools, and reputable websites."
        }
        
        search_prompt = search_prompts.get(resource_type, search_prompts["general"])
        search_prompt += f"\n\nReturn results as a JSON array with this exact format: [{{'url': 'https://example.com', 'title': 'Resource Title', 'description': 'Brief description', 'source_type': '{resource_type}'}}]. Only return the JSON array, no other text."
        
        response = perplexity_llm.invoke([HumanMessage(content=search_prompt)])
        
        # Parse response - handle both JSON and Python list formats
        try:
            # First try to parse as JSON
            resources_data = json.loads(response.content)
        except json.JSONDecodeError:
            # If JSON parsing fails, try to evaluate as Python literal (safer than eval)
            try:
                import ast
                resources_data = ast.literal_eval(response.content)
            except (ValueError, SyntaxError):
                logger.error(f"Failed to parse response from Perplexity: {response.content}")
                return []
        
        if isinstance(resources_data, list):
            # Validate and clean the resources
            valid_resources = []
            for resource in resources_data[:max_results]:
                if isinstance(resource, dict) and 'url' in resource and 'title' in resource:
                    # Add credibility score based on known reputable sources
                    credibility_score = _calculate_credibility_score(resource.get('url', ''))
                    resource['credibility_score'] = credibility_score
                    valid_resources.append(resource)
            
            return valid_resources
        else:
            logger.warning(f"Unexpected response format from Perplexity: {response.content}")
            return []
            
    except Exception as e:
        logger.error(f"Error searching mental health resources: {e}")
        return []

def _calculate_credibility_score(url: str) -> float:
    """Calculate credibility score based on known reputable mental health sources"""
    reputable_domains = {
        'psychologytoday.com': 0.9,
        'mayoclinic.org': 0.95,
        'nimh.nih.gov': 0.98,
        'apa.org': 0.95,
        'nami.org': 0.9,
        'mentalhealthamerica.net': 0.9,
        'samhsa.gov': 0.95,
        'cdc.gov': 0.95,
        'who.int': 0.9,
        'healthline.com': 0.8,
        'webmd.com': 0.75,
        'verywellmind.com': 0.85,
        'betterhelp.com': 0.8,
        'talkspace.com': 0.8,
        'headspace.com': 0.85,
        'calm.com': 0.85
    }
    
    # Check if URL contains any reputable domain
    for domain, score in reputable_domains.items():
        if domain in url.lower():
            return score
    
    # Default score for unknown sources
    return 0.6

search_mental_health_resources_tool = StructuredTool.from_function(
    func=_search_mental_health_resources,
    args_schema=SearchResourcesInput,
    name=TOOL_SEARCH_MENTAL_HEALTH_RESOURCES,
    description=(
        "Search for mental health resources including articles, videos, apps, exercises, or crisis support. "
        "Use this tool when generating tips that could benefit from external resources or links. "
        "Specify the resource_type to get more targeted results: 'article', 'video', 'app', 'exercise', 'crisis_support', or 'general'."
    ),
)