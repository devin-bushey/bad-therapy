from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage
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