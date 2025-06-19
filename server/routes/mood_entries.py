from fastapi import APIRouter, Depends, HTTPException
from typing import List
from datetime import datetime, timedelta, timezone

from database.mood_entries import (
    create_or_update_daily_mood,
    get_recent_mood_entries,
    get_today_mood_entry,
    get_mood_entries_by_date_range
)
from utils.jwt_bearer import require_auth
from models.mood import MoodEntry, MoodEntryCreate, MoodTrendData, MoodSummary

router = APIRouter()

@router.put("/mood/daily", response_model=MoodEntry)
async def update_daily_mood(entry: MoodEntryCreate, user=Depends(require_auth), date: str = None) -> MoodEntry:
    """Create or update today's mood entry.
    
    Args:
        entry: The mood entry data
        date: Optional local date in YYYY-MM-DD format
    """
    try:
        created = create_or_update_daily_mood(
            user_id=user.sub,
            mood_score=entry.mood_score,
            mood_emoji=entry.mood_emoji,
            local_date=date
        )
        return MoodEntry(**created)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save mood entry: {str(e)}")

@router.get("/mood/today", response_model=MoodEntry | None)
async def get_today_mood(user=Depends(require_auth), date: str = None) -> MoodEntry | None:
    """Get today's mood entry if it exists.
    
    Args:
        date: Optional local date in YYYY-MM-DD format. If not provided, uses recent entries.
    """
    try:
        today_entry = get_today_mood_entry(user_id=user.sub, local_date=date)
        return MoodEntry(**today_entry) if today_entry else None
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch today's mood: {str(e)}")

@router.get("/mood/recent", response_model=List[MoodEntry])
async def get_recent_moods(user=Depends(require_auth), days: int = 7) -> List[MoodEntry]:
    """Get mood entries for the last N days."""
    try:
        if days < 1 or days > 365:
            raise HTTPException(status_code=400, detail="Days must be between 1 and 365")
        
        entries = get_recent_mood_entries(user_id=user.sub, days=days)
        return [MoodEntry(**entry) for entry in entries]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch recent moods: {str(e)}")

@router.get("/mood/trend", response_model=List[MoodTrendData])
async def get_mood_trend(user=Depends(require_auth), days: int = 7) -> List[MoodTrendData]:
    """Get mood trend data for visualization, including days with no entries."""
    try:
        if days < 1 or days > 30:
            raise HTTPException(status_code=400, detail="Days must be between 1 and 30")
        
        # Get all mood entries for the period
        entries = get_recent_mood_entries(user_id=user.sub, days=days)
        
        # Create a map of date -> mood entry
        mood_map = {}
        for entry in entries:
            date_str = entry['created_at'][:10]  # Get YYYY-MM-DD
            mood_map[date_str] = entry
        
        # Generate trend data for each day
        trend_data = []
        for i in range(days):
            date = datetime.now(timezone.utc).date() - timedelta(days=days-1-i)
            date_str = date.isoformat()
            day_name = date.strftime('%a')  # Mon, Tue, etc.
            
            if date_str in mood_map:
                entry = mood_map[date_str]
                trend_data.append(MoodTrendData(
                    date=date_str,
                    day=day_name,
                    mood_score=entry['mood_score'],
                    mood_emoji=entry['mood_emoji'],
                    has_entry=True
                ))
            else:
                # No entry for this day - use neutral values
                trend_data.append(MoodTrendData(
                    date=date_str,
                    day=day_name,
                    mood_score=5,  # Neutral mood
                    mood_emoji='😐',  # Neutral emoji
                    has_entry=False
                ))
        
        return trend_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch mood trend: {str(e)}")

@router.get("/mood/summary", response_model=MoodSummary)
async def get_mood_summary(user=Depends(require_auth)) -> MoodSummary:
    """Get mood summary statistics."""
    try:
        # Get today's mood
        today_entry = get_today_mood_entry(user_id=user.sub)
        today_mood = MoodEntry(**today_entry) if today_entry else None
        
        # Get recent entries for analysis
        recent_entries = get_recent_mood_entries(user_id=user.sub, days=7)
        
        # Calculate statistics
        total_entries = len(recent_entries)
        recent_average = None
        trend_direction = "stable"
        streak_days = 0
        
        if recent_entries:
            scores = [entry['mood_score'] for entry in recent_entries]
            recent_average = sum(scores) / len(scores)
            
            # Simple trend analysis
            if len(scores) >= 3:
                recent_avg = sum(scores[-3:]) / 3
                older_avg = sum(scores[:-3]) / len(scores[:-3]) if len(scores) > 3 else recent_avg
                
                if recent_avg > older_avg + 0.5:
                    trend_direction = "improving"
                elif recent_avg < older_avg - 0.5:
                    trend_direction = "declining"
            
            # Calculate streak (consecutive days with entries)
            streak_days = 0
            for i in range(min(7, total_entries)):
                check_date = datetime.now(timezone.utc).date() - timedelta(days=i)
                date_str = check_date.isoformat()
                has_entry = any(entry['created_at'][:10] == date_str for entry in recent_entries)
                if has_entry:
                    streak_days += 1
                else:
                    break
        
        return MoodSummary(
            current_mood=today_mood,
            recent_average=round(recent_average, 1) if recent_average else None,
            trend_direction=trend_direction,
            total_entries=total_entries,
            streak_days=streak_days
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch mood summary: {str(e)}")