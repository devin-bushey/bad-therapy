from typing import TypedDict, Annotated, Sequence
from langchain_core.messages import HumanMessage, AIMessage

class TherapyState(TypedDict):
    messages: Annotated[Sequence[HumanMessage | AIMessage], "Conversation history"]
    session_id: Annotated[str, "Session ID"]
    user_id: Annotated[str, "User ID"]
    prompt: Annotated[str, "User prompt"]
    suggested_prompts: Annotated[list[str], "Suggested prompts"]
    next: Annotated[str, "Next step to take"] 