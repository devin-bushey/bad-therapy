from pydantic import BaseModel

class AIRequest(BaseModel):
    prompt: str
    session_id: str
    is_tip_message: bool = False

class AIResponse(BaseModel):
    result: str 