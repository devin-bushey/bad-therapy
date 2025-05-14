from fastapi import APIRouter, Depends, HTTPException, Request
from models.schemas import Session, SessionCreate
from database.conversation_history import create_session, update_session, get_conversation_history
from utils.jwt_bearer import require_auth
from database.connection import get_supabase_client
from core.config import get_settings
from database.conversation_history import decrypt_data

router = APIRouter()
settings = get_settings()

@router.post("/sessions", response_model=Session)
async def create_new_session(session: SessionCreate, user=Depends(require_auth)) -> Session:
    created_session = create_session(name=session.name, user_id=session.user_id)
    return Session(**created_session)

@router.get("/sessions", response_model=list[Session])
async def list_sessions(request: Request, user=Depends(require_auth)) -> list[Session]:
    page = int(request.query_params.get("page", "1"))
    page_size = int(request.query_params.get("page_size", "20"))
    offset = (page - 1) * page_size
    supabase = get_supabase_client()
    result = supabase.table("sessions")\
        .select("*")\
        .eq("user_id", user.sub)\
        .order("created_at", desc=True)\
        .range(offset, offset + page_size - 1)\
        .execute()
    sessions = []
    for item in result.data:
        try:
            item['name'] = decrypt_data(data=item['name'], password=settings.PG_CRYPTO_KEY).data
        except Exception:
            pass
        sessions.append(Session(**item))
    return sessions

@router.get("/sessions/{session_id}", response_model=Session)
async def get_session(session_id: str, user=Depends(require_auth)) -> Session:
    supabase = get_supabase_client()
    result = supabase.table("sessions")\
        .select("*")\
        .eq("id", session_id)\
        .eq("user_id", user.sub)\
        .single()\
        .execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Session not found")
    session = result.data
    session['name'] = decrypt_data(data=session['name'], password=settings.PG_CRYPTO_KEY).data
    history = get_conversation_history(session_id=session_id, user_id=user.sub)
    messages = []
    for entry in reversed(history):
        messages.append({"content": entry["prompt"], "isFromUser": True})
        messages.append({"content": entry["response"], "isFromUser": False})
    session["messages"] = messages
    return Session(**session)

@router.patch("/sessions/{session_id}", response_model=Session)
async def rename_session(session_id: str, session: SessionCreate, user=Depends(require_auth)) -> Session:
    updated_session = update_session(session_id=session_id, name=session.name)
    return Session(**updated_session) 