from pydantic import BaseModel
from typing import List, Optional
from .message import Message

class Session(BaseModel):
    id: str
    user_id: str
    name: str
    created_at: str
    messages: Optional[List[Message]] = None

class SessionCreate(BaseModel):
    name: str
    user_id: str 