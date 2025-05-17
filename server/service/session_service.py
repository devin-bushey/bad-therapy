from prompts.chat_prompts import get_session_name_prompt
from langchain_core.messages import HumanMessage
from langchain_openai import ChatOpenAI
from langchain_core.messages import BaseMessage
from database.conversation_history import update_session

import logging


logger = logging.getLogger(__name__)

async def generate_session_name(user1: str, user2: str, bot1: str, bot2: str) -> str:
    llm = ChatOpenAI(model="gpt-4.1-mini", temperature=0.5)
    prompt = get_session_name_prompt() + f"\nFirst user message: {user1}\nSecond user message: {user2}\nFirst bot message: {bot1}\nSecond bot message: {bot2}"
    resp = llm.invoke([HumanMessage(content=prompt)])
    return resp.content.strip().replace("\n", " ") if resp.content else "New Chat"    

async def update_session_name(session_id: str, history: list[BaseMessage], prompt: str):
    try:
        bot1 = history[1].content
        user1 = history[2].content
        bot2 = history[3].content
        user2 = prompt

        name = await generate_session_name(user1, user2, bot1, bot2)
        update_session(session_id=session_id, name=name)
        logger.info(f"Updated session name for session {session_id}")
    except Exception as e:
        print("error", e)
        logger.error(f"Failed to update session name: {str(e)}") 