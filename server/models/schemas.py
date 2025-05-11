from pydantic import BaseModel
from typing import List, Optional

class AIRequest(BaseModel):
    prompt: str
    session_id: str

class AIResponse(BaseModel):
    result: str

class Message(BaseModel):
    content: str
    isFromUser: bool

    class Config:
        fields = {
            "isFromUser": "is_from_user"
        }

class Session(BaseModel):
    id: str
    user_id: str
    name: str
    created_at: str
    messages: Optional[List[Message]] = None

class SessionCreate(BaseModel):
    name: str
    user_id: str

class UserProfile(BaseModel):
    id: str
    user_id: str
    full_name: Optional[str] = None
    age: Optional[str] = None
    bio: Optional[str] = None
    gender: Optional[str] = None
    ethnicity: Optional[str] = None
    goals: Optional[str] = None
    coaching_style: Optional[str] = None
    preferred_focus_area: Optional[str] = None
    created_at: str

class UserProfileCreate(BaseModel):
    full_name: Optional[str] = None
    age: Optional[str] = None
    bio: Optional[str] = None
    gender: Optional[str] = None
    ethnicity: Optional[str] = None
    goals: Optional[str] = None
    coaching_style: Optional[str] = None
    preferred_focus_area: Optional[str] = None 