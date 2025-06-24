from fastapi import APIRouter, Depends, HTTPException, Request
from models.session import Session, SessionCreate
from database.conversation_history import create_session, update_session, get_conversation_history
from utils.jwt_bearer import require_auth
from database.connection import get_supabase_client
from core.config import get_settings
from langchain_core.messages import HumanMessage, AIMessage
from utils.obfuscation import decrypt_data

router = APIRouter()
settings = get_settings()

@router.post("/sessions", response_model=Session)
async def create_new_session(session: SessionCreate, user=Depends(require_auth)) -> Session:
    created_session = create_session(name=session.name, user_id=user.sub)
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
            item['name'] = decrypt_data(data=item['name']).data
        except Exception:
            pass
        sessions.append(Session(**item))
    return sessions

@router.get("/sessions/{session_id}")
async def get_session(session_id: str, user=Depends(require_auth)):
    supabase = get_supabase_client()
    result = supabase.table("sessions")\
        .select("*")\
        .eq("id", session_id)\
        .eq("user_id", user.sub)\
        .maybe_single()\
        .execute()
    if not result or not result.data:
        raise HTTPException(status_code=404, detail="Session not found")
    session = result.data
    session['name'] = decrypt_data(data=session['name']).data
    history = get_conversation_history(session_id=session_id, user_id=user.sub)
    def message_to_dict(msg):
        if isinstance(msg, HumanMessage): return {"content": msg.content, "type": "human"}
        if isinstance(msg, AIMessage): return {"content": msg.content, "type": "ai"}
        return {"content": msg.content, "type": "other"}
    messages = [message_to_dict(entry) for entry in history]
    session["messages"] = messages
    return session

@router.patch("/sessions/{session_id}", response_model=Session)
async def rename_session(session_id: str, session: SessionCreate, user=Depends(require_auth)) -> Session:
    updated_session = update_session(session_id=session_id, name=session.name)
    return Session(**updated_session)

@router.delete("/sessions/{session_id}", status_code=204)
async def delete_session(session_id: str, user=Depends(require_auth)):
    supabase = get_supabase_client()
    # Ensure the session belongs to the user
    result = supabase.table("sessions") \
        .select("id") \
        .eq("id", session_id) \
        .eq("user_id", user.sub) \
        .single() \
        .execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Session not found")
    # Delete the session
    supabase.table("sessions").delete().eq("id", session_id).execute()
    return None 