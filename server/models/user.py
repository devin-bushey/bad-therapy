from pydantic import BaseModel
from typing import Optional

class UserProfile(BaseModel):
    id: str
    user_id: str
    email: Optional[str] = None
    full_name: Optional[str] = None
    age: Optional[str] = None
    bio: Optional[str] = None
    gender: Optional[str] = None
    ethnicity: Optional[str] = None
    goals: Optional[str] = None
    coaching_style: Optional[str] = None
    preferred_focus_area: Optional[str] = None
    message_count: int = 0
    is_premium: bool = False
    stripe_customer_id: Optional[str] = None
    stripe_session_id: Optional[str] = None
    created_at: str

class UserProfileCreate(BaseModel):
    email: Optional[str] = None
    full_name: Optional[str] = None
    age: Optional[str] = None
    bio: Optional[str] = None
    gender: Optional[str] = None
    ethnicity: Optional[str] = None
    goals: Optional[str] = None
    coaching_style: Optional[str] = None
    preferred_focus_area: Optional[str] = None 