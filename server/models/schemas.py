from pydantic import BaseModel

class AIRequest(BaseModel):
    prompt: str
    session_id: str

class AIResponse(BaseModel):
    result: str

class Session(BaseModel):
    id: str
    name: str
    created_at: str

class SessionCreate(BaseModel):
    name: str 