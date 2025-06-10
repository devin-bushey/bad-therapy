from datetime import datetime, timedelta, timezone
from typing import List, Optional
from database.connection import get_supabase_client

def get_mood_entries_table() -> str:
    """Get the mood entries table name."""
    return "mood_entries"

def create_or_update_daily_mood(*, user_id: str, mood_score: int, mood_emoji: str) -> dict:
    """Create a new mood entry or update today's existing entry."""
    supabase = get_supabase_client()
    table = get_mood_entries_table()
    
    # Check if there's already an entry for today
    today = datetime.now(timezone.utc).date()
    today_start = datetime.combine(today, datetime.min.time(), timezone.utc)
    today_end = datetime.combine(today, datetime.max.time(), timezone.utc)
    
    existing_result = supabase.table(table)\
        .select('*')\
        .eq('user_id', user_id)\
        .gte('created_at', today_start.isoformat())\
        .lte('created_at', today_end.isoformat())\
        .execute()
    
    data = {
        "user_id": user_id,
        "mood_score": mood_score,
        "mood_emoji": mood_emoji,
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    
    if existing_result.data:
        # Update existing entry
        entry_id = existing_result.data[0]['id']
        result = supabase.table(table)\
            .update(data)\
            .eq('id', entry_id)\
            .execute()
    else:
        # Create new entry
        data["created_at"] = datetime.now(timezone.utc).isoformat()
        result = supabase.table(table)\
            .insert(data)\
            .execute()
    
    return result.data[0]

def get_recent_mood_entries(*, user_id: str, days: int = 7) -> List[dict]:
    """Get mood entries for the last N days."""
    supabase = get_supabase_client()
    table = get_mood_entries_table()
    
    cutoff_date = (datetime.now(timezone.utc) - timedelta(days=days)).isoformat()
    
    result = supabase.table(table)\
        .select('*')\
        .eq('user_id', user_id)\
        .gte('created_at', cutoff_date)\
        .order('created_at', desc=False)\
        .execute()
    
    return result.data

def get_today_mood_entry(*, user_id: str) -> Optional[dict]:
    """Get today's mood entry if it exists."""
    supabase = get_supabase_client()
    table = get_mood_entries_table()
    
    today = datetime.now(timezone.utc).date()
    today_start = datetime.combine(today, datetime.min.time(), timezone.utc)
    today_end = datetime.combine(today, datetime.max.time(), timezone.utc)
    
    result = supabase.table(table)\
        .select('*')\
        .eq('user_id', user_id)\
        .gte('created_at', today_start.isoformat())\
        .lte('created_at', today_end.isoformat())\
        .order('created_at', desc=True)\
        .limit(1)\
        .execute()
    
    return result.data[0] if result.data else None

def get_mood_entries_by_date_range(*, user_id: str, start_date: datetime, end_date: datetime) -> List[dict]:
    """Get mood entries within a specific date range."""
    supabase = get_supabase_client()
    table = get_mood_entries_table()
    
    result = supabase.table(table)\
        .select('*')\
        .eq('user_id', user_id)\
        .gte('created_at', start_date.isoformat())\
        .lte('created_at', end_date.isoformat())\
        .order('created_at', desc=False)\
        .execute()
    
    return result.data

def delete_mood_entry(*, user_id: str, entry_id: str) -> bool:
    """Delete a mood entry (admin function)."""
    supabase = get_supabase_client()
    table = get_mood_entries_table()
    
    result = supabase.table(table)\
        .delete()\
        .eq('id', entry_id)\
        .eq('user_id', user_id)\
        .execute()
    
    return len(result.data) > 0