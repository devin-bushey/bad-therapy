from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class MoodEntryCreate(BaseModel):
    """Model for creating a new mood entry."""
    mood_score: int = Field(ge=1, le=10, description="Mood score from 1 (very sad) to 10 (excellent)")
    mood_emoji: str = Field(min_length=1, max_length=10, description="Emoji representation of mood")

class MoodEntry(BaseModel):
    """Model for mood entry response."""
    id: str
    user_id: str
    mood_score: int = Field(ge=1, le=10)
    mood_emoji: str
    created_at: str
    updated_at: str

class MoodTrendData(BaseModel):
    """Model for mood trend visualization data."""
    date: str
    day: str
    mood_score: int
    mood_emoji: str
    has_entry: bool = True

class MoodSummary(BaseModel):
    """Model for mood summary statistics."""
    current_mood: Optional[MoodEntry] = None
    recent_average: Optional[float] = None
    trend_direction: Optional[str] = None  # "improving", "declining", "stable"
    total_entries: int = 0
    streak_days: int = 0

class MoodContext(BaseModel):
    """Model for mood context used in therapy sessions."""
    today_mood: Optional[MoodEntry] = None
    recent_trend: list[MoodEntry] = []
    mood_summary: str = ""
    pattern_analysis: str = ""