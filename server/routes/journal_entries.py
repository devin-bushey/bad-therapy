from fastapi import APIRouter, Depends, HTTPException, Request
from typing import List, Optional
from models.journal_entries import JournalEntry, JournalEntryCreate, JournalEntryUpdate
from service.journal_entries_service import (
    create_journal_entry_service,
    get_journal_entries_service,
    get_journal_entry_service,
    update_journal_entry_service,
    delete_journal_entry_service,
    get_recent_journal_entries_service
)
from utils.jwt_bearer import require_auth

router = APIRouter()

@router.post("/journal-entries", response_model=dict)
async def create_journal_entry_endpoint(
    entry_data: JournalEntryCreate, 
    user=Depends(require_auth)
) -> dict:
    """Create a new journal entry."""
    try:
        result = create_journal_entry_service(user.sub, entry_data)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/journal-entries", response_model=List[dict])
async def get_journal_entries_endpoint(
    request: Request,
    user=Depends(require_auth)
) -> List[dict]:
    """Get all journal entries for the authenticated user."""
    try:
        limit = int(request.query_params.get("limit", "100"))
        entries = get_journal_entries_service(user.sub, limit)
        return entries
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/journal-entries/recent", response_model=List[dict])
async def get_recent_journal_entries_endpoint(
    request: Request,
    user=Depends(require_auth)
) -> List[dict]:
    """Get recent journal entries for dashboard display."""
    try:
        limit = int(request.query_params.get("limit", "5"))
        entries = get_recent_journal_entries_service(user.sub, limit)
        return entries
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/journal-entries/{entry_id}", response_model=dict)
async def get_journal_entry_endpoint(
    entry_id: str, 
    user=Depends(require_auth)
) -> dict:
    """Get a specific journal entry."""
    try:
        entry = get_journal_entry_service(entry_id, user.sub)
        if not entry:
            raise HTTPException(status_code=404, detail="Journal entry not found")
        return entry
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/journal-entries/{entry_id}", response_model=dict)
async def update_journal_entry_endpoint(
    entry_id: str,
    update_data: JournalEntryUpdate,
    user=Depends(require_auth)
) -> dict:
    """Update a journal entry."""
    try:
        result = update_journal_entry_service(entry_id, user.sub, update_data)
        if not result:
            raise HTTPException(status_code=404, detail="Journal entry not found")
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/journal-entries/{entry_id}", status_code=204)
async def delete_journal_entry_endpoint(
    entry_id: str, 
    user=Depends(require_auth)
):
    """Delete a journal entry."""
    try:
        success = delete_journal_entry_service(entry_id, user.sub)
        if not success:
            raise HTTPException(status_code=404, detail="Journal entry not found")
        return None
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))