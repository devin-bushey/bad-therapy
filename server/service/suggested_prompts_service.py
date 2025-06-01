from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, SystemMessage
from prompts.suggested_prompts import get_suggested_default_prompts, get_suggested_prompts

import json
import logging


logger = logging.getLogger(__name__)

async def generate_suggested_prompts() -> list[str]:
    llm = ChatOpenAI(model="gpt-4.1-mini", temperature=0.7)
    prompt = get_suggested_prompts()
    resp = await llm.ainvoke([HumanMessage(content=prompt)])
    default_prompts = get_suggested_default_prompts()
    try:
        # make sure the response is a list of strings
        prompts = json.loads(resp.content)
        if not isinstance(prompts, list) or not all(isinstance(p, str) and p.strip() for p in prompts):
            raise ValueError
        return prompts
    except Exception:
        logger.error(f"Failed to generate suggested prompts: {resp.content}")
        return default_prompts 

async def generate_followup_suggestions(history: list) -> list[str]:
    llm = ChatOpenAI(model="gpt-4.1-mini", temperature=0.7)
    # Prepare a prompt for the LLM to generate follow-up suggestions
    last_messages = history[-4:] if len(history) > 4 else history
    prompt = (
        "You are a helpful therapy assistant. "
        "Given the following recent conversation between a user and a therapist, "
        "suggest 3 concise, context-aware follow-up prompts that the user could ask the therapist. "
        "These should help the user clarify, go deeper, or summarize their thoughts. "
        "Return only a JSON array of strings, no explanations. "
        "The JSON must be formatted like this: [\"prompt1\", \"prompt2\", \"prompt3\"]\n"
        f"Conversation:\n{last_messages}"
    )
    resp = await llm.ainvoke([SystemMessage(content=prompt)])
    default_prompts = [
        "Can you please clarify what you meant by that?",
        "Can we explore that in more detail?",
        "Can you please share more about that?"
    ]
    try:
        prompts = json.loads(resp.content)
        if not isinstance(prompts, list) or not all(isinstance(p, str) and p.strip() for p in prompts):
            raise ValueError
        return prompts
    except Exception:
        logger.error(f"Failed to generate follow-up suggestions: {resp.content}")
        return default_prompts 