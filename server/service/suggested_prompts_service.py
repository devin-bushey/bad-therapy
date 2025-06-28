from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, SystemMessage
from prompts.suggested_prompts import get_suggested_default_prompts, get_suggested_prompts
from prompts.journal_prompts import get_journal_writing_prompts, get_journal_writing_default_prompts

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

async def generate_journal_writing_prompts() -> list[dict]:
    """Generate AI-powered writing prompts with titles for journal entries."""
    llm = ChatOpenAI(model="gpt-4.1-mini", temperature=0.7)
    prompt = get_journal_writing_prompts()
    resp = await llm.ainvoke([HumanMessage(content=prompt)])
    default_prompts = get_journal_writing_default_prompts()
    try:
        # Parse and validate the response
        prompts = json.loads(resp.content)
        if not isinstance(prompts, list):
            raise ValueError("Response is not a list")
        
        # Validate each prompt object has text and title fields
        for prompt_obj in prompts:
            if not isinstance(prompt_obj, dict) or 'text' not in prompt_obj or 'title' not in prompt_obj:
                raise ValueError("Invalid prompt object format")
            if not isinstance(prompt_obj['text'], str) or not isinstance(prompt_obj['title'], str):
                raise ValueError("Prompt text and title must be strings")
            if not prompt_obj['text'].strip() or not prompt_obj['title'].strip():
                raise ValueError("Prompt text and title cannot be empty")
        
        return prompts
    except Exception:
        logger.error(f"Failed to generate journal writing prompts: {resp.content}")
        return default_prompts