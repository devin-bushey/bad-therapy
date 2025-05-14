from fastapi import HTTPException
from prompts.chat_prompts import get_session_name_prompt
from langchain_core.messages import HumanMessage

async def generate_session_name(user1: str, user2: str, bot2: str, bot3: str) -> str:
    from langchain_openai import ChatOpenAI
    llm = ChatOpenAI(model="gpt-4.1-mini", temperature=0.5)
    prompt = get_session_name_prompt() + f"\nFirst user message: {user1}\nSecond user message: {user2}\nSecond bot message: {bot2}\nThird bot message: {bot3}"
    resp = llm.invoke([HumanMessage(content=prompt)])
    return resp.content.strip().replace("\n", " ") if resp.content else "New Chat"

async def generate_suggested_prompts() -> list[str]:
    from langchain_openai import ChatOpenAI
    import re, json
    llm = ChatOpenAI(model="gpt-4.1-mini", temperature=0.7)
    prompt = (
        "You are a helpful therapy assistant. "
        "Generate 3 concise, friendly, and varied suggested prompts to help a user start a new therapy session. "
        "One of the prompts should be for someone who is brand new to therapy. "
        "Return only a JSON array of strings, no explanations."
    )
    resp = llm.invoke([HumanMessage(content=prompt)])
    default_prompts = [
        "I'm new to therapy and would like to start by sharing what brought me here.",
        "I've been feeling overwhelmed lately and want to explore ways to manage my stress.",
        "I want to understand more about my relationships and how they affect my well-being."
    ]
    try:
        match = re.search(r'\[.*?\]', resp.content, re.DOTALL)
        prompts = json.loads(match.group(0)) if match else None
        if not isinstance(prompts, list) or not all(isinstance(p, str) and p.strip() for p in prompts):
            raise ValueError
        return [p.strip() for p in prompts]
    except Exception:
        return default_prompts 