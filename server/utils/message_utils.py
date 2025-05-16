from langchain_core.messages import HumanMessage, AIMessage
from prompts.chat_prompts import get_system_prompt
import logging

logger = logging.getLogger(__name__)

def convert_to_langchain_messages(history: list[dict], prompt: str, is_first_message: bool = False, user_profile: dict | None = None) -> list:
    messages = [HumanMessage(content=get_system_prompt(is_first_message, user_profile))]
    for entry in reversed(history):
        messages.append(HumanMessage(content=entry["prompt"]))
        messages.append(AIMessage(content=entry["response"]))
    messages.append(HumanMessage(content=prompt))
    return messages
