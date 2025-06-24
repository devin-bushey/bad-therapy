from pydantic import BaseModel
from typing import List, Optional

class AIRequest(BaseModel):
    prompt: str
    session_id: str
    is_tip_message: bool = False
    is_journal_insights: bool = False
    journal_insights_limit: int = 10

class AIResponse(BaseModel):
    result: str

class JournalInsightsRequest(BaseModel):
    limit: Optional[int] = 10  # Number of recent entries to analyze

class JournalInsightsResponse(BaseModel):
    insights: str
    entries_analyzed: int 