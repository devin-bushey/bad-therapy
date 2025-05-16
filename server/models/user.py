from pydantic import BaseModel
from typing import Optional

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