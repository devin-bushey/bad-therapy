from pydantic import BaseModel, Field
from langchain_core.messages import BaseMessage, AIMessage

class TherapyState(BaseModel):
    messages: list[BaseMessage] = Field(..., description="Conversation history")
    session_id: str = Field(..., description="Session ID")
    user_id: str = Field(..., description="User ID")
    prompt: str = Field(..., description="User prompt")
    history: list[BaseMessage] = Field(..., description="Conversation history")
    next: str = Field(..., description="Next step to take") 
