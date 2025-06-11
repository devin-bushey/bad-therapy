from pydantic import BaseModel
from typing import Optional, List

class ResourceLink(BaseModel):
    url: str
    title: str
    description: Optional[str] = None
    source_type: str  # "article", "video", "app", "exercise", "crisis_support"
    credibility_score: Optional[float] = None

class DailyTip(BaseModel):
    content: str
    type: str  # "prompt", "info", "ai_guidance", "resource"
    link: Optional[ResourceLink] = None
    follow_up_prompts: Optional[List[str]] = None
    technique_category: Optional[str] = None  # "CBT", "DBT", "mindfulness", "AI_usage", etc.
    confidence_score: Optional[float] = None