from typing import AsyncGenerator
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, SystemMessage, AIMessage
from agent.types import TherapyState
from core.config import get_settings
from dotenv import load_dotenv
from database.conversation_history import get_conversation_history
from prompts.chat_prompts import get_system_prompt
from database.user_profile import get_user_profile

load_dotenv()
settings = get_settings()

model = "gpt-4.1-mini"
llm = ChatOpenAI(model=model, temperature=0.7)


def build_messages(
    history: list[dict], prompt: str, is_first_message: bool = False, user_profile: dict | None = None
) -> list[object]:
    messages = [SystemMessage(content=get_system_prompt(is_first_message, user_profile))]
    for entry in reversed(history):
        messages.append(HumanMessage(content=entry["prompt"]))
        messages.append(AIMessage(content=entry["response"]))
    messages.append(HumanMessage(content=prompt))
    return messages


async def primary_therapist_agent(state: TherapyState) -> AsyncGenerator[str, None]:
    history = get_conversation_history(session_id=state["session_id"], user_id=state["user_id"])
    user_profile = get_user_profile(user_id=state["user_id"])
    messages = build_messages(history, state["prompt"], is_first_message=not history, user_profile=user_profile)

    async for chunk in llm.stream(messages, stream_mode="messages"):
        yield chunk
