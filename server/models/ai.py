from pydantic import BaseModel

class AIRequest(BaseModel):
    prompt: str
    session_id: str

class AIResponse(BaseModel):
    result: str 