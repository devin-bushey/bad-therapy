import json
from datetime import datetime
from typing import List, Optional
from database.connection import get_supabase_client
from core.config import get_settings
from utils.obfuscation import encrypt_data, decrypt_data
from models.journal_entries import JournalEntry, JournalEntryCreate, JournalEntryUpdate

settings = get_settings()

def create_journal_entry(user_id: str, entry_data: JournalEntryCreate) -> dict:
    """Create a new journal entry for a user."""
    supabase = get_supabase_client()
    
    # Encrypt content
    encrypted_content = encrypt_data(data=json.dumps(entry_data.content))
    encrypted_title = encrypt_data(data=entry_data.title) if entry_data.title else None
    
    data = {
        "user_id": user_id,
        "title": encrypted_title.data if encrypted_title else None,
        "content": encrypted_content.data,
        "created_at": datetime.utcnow().isoformat(),
        "updated_at": datetime.utcnow().isoformat()
    }
    
    result = supabase.table("journal_entries").insert(data).execute()
    return result.data[0]

def get_journal_entries(user_id: str, limit: int = 100) -> List[dict]:
    """Get all journal entries for a user, ordered by creation date (newest first)."""
    supabase = get_supabase_client()
    
    result = supabase.table("journal_entries")\
        .select("*")\
        .eq("user_id", user_id)\
        .order("created_at", desc=True)\
        .limit(limit)\
        .execute()
    
    # Decrypt content and title for each entry
    for item in result.data:
        try:
            if item['content']:
                decrypted_content = decrypt_data(data=item['content'])
                item['content'] = json.loads(decrypted_content.data)
            if item['title']:
                decrypted_title = decrypt_data(data=item['title'])
                item['title'] = decrypted_title.data
        except Exception:
            # Handle decryption errors gracefully
            pass
    
    return result.data

def get_journal_entry(entry_id: str, user_id: str) -> Optional[dict]:
    """Get a specific journal entry by ID, ensuring it belongs to the user."""
    supabase = get_supabase_client()
    
    result = supabase.table("journal_entries")\
        .select("*")\
        .eq("id", entry_id)\
        .eq("user_id", user_id)\
        .maybe_single()\
        .execute()
    
    if not result.data:
        return None
    
    # Decrypt content and title
    try:
        if result.data['content']:
            decrypted_content = decrypt_data(data=result.data['content'])
            result.data['content'] = json.loads(decrypted_content.data)
        if result.data['title']:
            decrypted_title = decrypt_data(data=result.data['title'])
            result.data['title'] = decrypted_title.data
    except Exception:
        # Handle decryption errors gracefully
        pass
    
    return result.data

def update_journal_entry(entry_id: str, user_id: str, update_data: JournalEntryUpdate) -> Optional[dict]:
    """Update a journal entry."""
    supabase = get_supabase_client()
    
    # Build update data
    data = {
        "updated_at": datetime.utcnow().isoformat()
    }
    
    if update_data.content is not None:
        encrypted_content = encrypt_data(data=json.dumps(update_data.content))
        data["content"] = encrypted_content.data
    
    if update_data.title is not None:
        if update_data.title:
            encrypted_title = encrypt_data(data=update_data.title)
            data["title"] = encrypted_title.data
        else:
            data["title"] = None
    
    result = supabase.table("journal_entries")\
        .update(data)\
        .eq("id", entry_id)\
        .eq("user_id", user_id)\
        .execute()
    
    if not result.data:
        return None
    
    return result.data[0]

def delete_journal_entry(entry_id: str, user_id: str) -> bool:
    """Delete a journal entry."""
    supabase = get_supabase_client()
    
    result = supabase.table("journal_entries")\
        .delete()\
        .eq("id", entry_id)\
        .eq("user_id", user_id)\
        .execute()
    
    return len(result.data) > 0

def get_recent_journal_entries(user_id: str, limit: int = 5) -> List[dict]:
    """Get recent journal entries for dashboard display."""
    return get_journal_entries(user_id, limit)