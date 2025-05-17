from pydantic import BaseModel
from typing import List, Optional
from langchain_core.messages import BaseMessage

class Session(BaseModel):
    id: str
    user_id: str
    name: str
    created_at: str
    messages: Optional[list[dict]] = None

class SessionCreate(BaseModel):
    name: str
    user_id: str 