from pydantic import BaseModel, Field
from langchain_core.messages import BaseMessage
from typing import Optional
from models.mood import MoodEntry

class Therapist(BaseModel):
    name: str
    specialty: str
    website: Optional[str] = None

class TherapistList(BaseModel):
    summary: str
    therapists: list[Therapist]

class TherapyState(BaseModel):
    session_id: str = Field(..., description="Session ID")
    user_id: str = Field(..., description="User ID")
    prompt: str = Field(..., description="User prompt")
    history: list[BaseMessage] = Field(..., description="Conversation history")
    next: str = Field(..., description="Next step to take") 
    is_safe: str = Field(..., description="Is the user safe? \"blocked\" or \"safe\"")
    therapists: list[Therapist] = Field(..., description="List of therapists")
    therapists_summary: str = Field(..., description="Summary of therapists")
    current_mood: Optional[MoodEntry] = Field(None, description="User's current mood entry for today")
    mood_context: Optional[str] = Field(None, description="AI-generated mood context for therapy session")
    is_tip_message: bool = Field(False, description="Whether this message originated from a tip")

class SafetyCheckResult(BaseModel):
    is_safe: str
    safety_response: str
