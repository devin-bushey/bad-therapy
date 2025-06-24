from pydantic import BaseModel
from typing import Optional

class Session(BaseModel):
    id: str
    user_id: str
    name: str
    created_at: str
    messages: Optional[list[dict]] = None

class SessionCreate(BaseModel):
    name: str
    user_id: Optional[str] = None 