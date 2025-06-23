from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime

class JournalEntry(BaseModel):
    id: str
    user_id: str
    title: Optional[str] = None
    content: Dict[Any, Any]  # TipTap JSON format
    created_at: datetime
    updated_at: datetime

class JournalEntryCreate(BaseModel):
    title: Optional[str] = None
    content: Dict[Any, Any]  # TipTap JSON format

class JournalEntryUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[Dict[Any, Any]] = None  # TipTap JSON format