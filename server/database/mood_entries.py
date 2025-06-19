from datetime import datetime, timedelta, timezone
from typing import List, Optional
from database.connection import get_supabase_client

def get_mood_entries_table() -> str:
    """Get the mood entries table name."""
    return "mood_entries"

def create_or_update_daily_mood(*, user_id: str, mood_score: int, mood_emoji: str, local_date: Optional[str] = None) -> dict:
    """Create a new mood entry or update today's existing entry."""
    supabase = get_supabase_client()
    table = get_mood_entries_table()
    
    # Get user's local date or fall back to UTC
    if local_date:
        try:
            target_date_str = local_date  # Already in YYYY-MM-DD format
        except:
            target_date_str = datetime.now(timezone.utc).date().isoformat()
    else:
        target_date_str = datetime.now(timezone.utc).date().isoformat()
    
    # Check if there's already an entry for this date
    # Look for entries from the last 48 hours and filter by date string
    cutoff_time = datetime.now(timezone.utc) - timedelta(hours=48)
    
    existing_result = supabase.table(table)\
        .select('*')\
        .eq('user_id', user_id)\
        .gte('created_at', cutoff_time.isoformat())\
        .order('created_at', desc=True)\
        .execute()
    
    # Find existing entry for the target date
    existing_entry = None
    for entry in existing_result.data:
        if entry['created_at'][:10] == target_date_str:  # Compare YYYY-MM-DD part
            existing_entry = entry
            break
    
    data = {
        "user_id": user_id,
        "mood_score": mood_score,
        "mood_emoji": mood_emoji,
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    
    if existing_entry:
        # Update existing entry
        result = supabase.table(table)\
            .update(data)\
            .eq('id', existing_entry['id'])\
            .execute()
    else:
        # Create new entry with current timestamp (preserves timezone info)
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

def get_today_mood_entry(*, user_id: str, local_date: Optional[str] = None) -> Optional[dict]:
    """Get today's mood entry if it exists.
    
    Args:
        user_id: The user's ID
        local_date: The user's local date in YYYY-MM-DD format. If not provided, uses last 48 hours.
    """
    supabase = get_supabase_client()
    table = get_mood_entries_table()
    
    if local_date:
        # Use the provided local date to filter entries
        # Get all entries from the last 48 hours and filter by local date on the client side
        cutoff_time = datetime.now(timezone.utc) - timedelta(hours=48)
        
        result = supabase.table(table)\
            .select('*')\
            .eq('user_id', user_id)\
            .gte('created_at', cutoff_time.isoformat())\
            .order('created_at', desc=True)\
            .execute()
        
        # Filter to find entries that match the user's local date
        for entry in result.data:
            # Extract just the date part from the stored timestamp
            stored_date = entry['created_at'][:10]  # Gets YYYY-MM-DD
            if stored_date == local_date:
                return entry
        
        return None
    else:
        # Fallback: get the most recent entry from the last 24 hours
        cutoff_time = datetime.now(timezone.utc) - timedelta(hours=24)
        
        result = supabase.table(table)\
            .select('*')\
            .eq('user_id', user_id)\
            .gte('created_at', cutoff_time.isoformat())\
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