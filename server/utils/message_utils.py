from langchain_core.messages import HumanMessage, AIMessage, BaseMessage
import logging

logger = logging.getLogger(__name__)

def convert_to_langchain_messages(history: list[dict]) -> list[BaseMessage]:
    messages = []
    for entry in reversed(history):
        messages.append(HumanMessage(content=entry["prompt"]))
        messages.append(AIMessage(content=entry["response"]))
    return messages
