from typing import List, Optional
from models.journal_entries import JournalEntry, JournalEntryCreate, JournalEntryUpdate
from database.journal_entries import (
    create_journal_entry,
    get_journal_entries,
    get_journal_entry,
    update_journal_entry,
    delete_journal_entry,
    get_recent_journal_entries
)
import logging

logger = logging.getLogger(__name__)

def create_journal_entry_service(user_id: str, entry_data: JournalEntryCreate) -> dict:
    """Create a new journal entry for a user."""
    try:
        result = create_journal_entry(user_id, entry_data)
        logger.info(f"Created journal entry for user {user_id}")
        return result
    except Exception as e:
        logger.error(f"Failed to create journal entry for user {user_id}: {str(e)}")
        raise

def get_journal_entries_service(user_id: str, limit: int = 100) -> List[dict]:
    """Get all journal entries for a user."""
    try:
        entries = get_journal_entries(user_id, limit)
        logger.info(f"Retrieved {len(entries)} journal entries for user {user_id}")
        return entries
    except Exception as e:
        logger.error(f"Failed to get journal entries for user {user_id}: {str(e)}")
        raise

def get_journal_entry_service(entry_id: str, user_id: str) -> Optional[dict]:
    """Get a specific journal entry."""
    try:
        entry = get_journal_entry(entry_id, user_id)
        if entry:
            logger.info(f"Retrieved journal entry {entry_id} for user {user_id}")
        else:
            logger.warning(f"Journal entry {entry_id} not found for user {user_id}")
        return entry
    except Exception as e:
        logger.error(f"Failed to get journal entry {entry_id} for user {user_id}: {str(e)}")
        raise

def update_journal_entry_service(entry_id: str, user_id: str, update_data: JournalEntryUpdate) -> Optional[dict]:
    """Update a journal entry."""
    try:
        result = update_journal_entry(entry_id, user_id, update_data)
        if result:
            logger.info(f"Updated journal entry {entry_id} for user {user_id}")
        else:
            logger.warning(f"Journal entry {entry_id} not found for user {user_id}")
        return result
    except Exception as e:
        logger.error(f"Failed to update journal entry {entry_id} for user {user_id}: {str(e)}")
        raise

def delete_journal_entry_service(entry_id: str, user_id: str) -> bool:
    """Delete a journal entry."""
    try:
        success = delete_journal_entry(entry_id, user_id)
        if success:
            logger.info(f"Deleted journal entry {entry_id} for user {user_id}")
        else:
            logger.warning(f"Journal entry {entry_id} not found for user {user_id}")
        return success
    except Exception as e:
        logger.error(f"Failed to delete journal entry {entry_id} for user {user_id}: {str(e)}")
        raise

def get_recent_journal_entries_service(user_id: str, limit: int = 5) -> List[dict]:
    """Get recent journal entries for dashboard display."""
    try:
        entries = get_recent_journal_entries(user_id, limit)
        logger.info(f"Retrieved {len(entries)} recent journal entries for user {user_id}")
        return entries
    except Exception as e:
        logger.error(f"Failed to get recent journal entries for user {user_id}: {str(e)}")
        raise

def get_journal_entries_for_insights_service(user_id: str, limit: int = 10) -> List[dict]:
    """Get recent journal entries content for AI insights analysis."""
    try:
        entries = get_journal_entries(user_id, limit)
        
        # Extract content for insights - we need the text content, not the full TipTap JSON
        insights_data = []
        for entry in entries:
            if entry.get('content') and entry.get('created_at'):
                # Extract text from TipTap JSON structure
                content_text = extract_text_from_tiptap_content(entry['content'])
                if content_text.strip():  # Only include entries with actual content
                    insights_data.append({
                        'title': entry.get('title', 'Untitled Entry'),
                        'content': content_text,
                        'created_at': entry['created_at']
                    })
        
        logger.info(f"Retrieved {len(insights_data)} journal entries with content for insights for user {user_id}")
        return insights_data
    except Exception as e:
        logger.error(f"Failed to get journal entries for insights for user {user_id}: {str(e)}")
        raise

def extract_text_from_tiptap_content(tiptap_json: dict) -> str:
    """Extract plain text from TipTap JSON content structure."""
    def extract_text_recursive(node):
        text = ""
        if isinstance(node, dict):
            # If this node has text content, add it
            if node.get('text'):
                text += node['text']
            # If this node has content (children), process them
            if node.get('content'):
                for child in node['content']:
                    text += extract_text_recursive(child)
        elif isinstance(node, list):
            # If it's a list of nodes, process each one
            for item in node:
                text += extract_text_recursive(item)
        return text
    
    try:
        return extract_text_recursive(tiptap_json).strip()
    except Exception:
        return ""