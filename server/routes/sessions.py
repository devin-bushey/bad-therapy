from fastapi import APIRouter, Depends, HTTPException, Request
from models.schemas import Session, SessionCreate
from database.conversation_history import get_recent_sessions, create_session, update_session, get_conversation_history
from utils.jwt_bearer import require_auth

router = APIRouter()

@router.post("/sessions", response_model=Session)
async def create_new_session(session: SessionCreate, user=Depends(require_auth)) -> Session:
    created_session = create_session(name=session.name, user_id=session.user_id)
    return Session(**created_session)

@router.get("/sessions", response_model=list[Session])
async def list_sessions(request: Request, user=Depends(require_auth)) -> list[Session]:
    limit = request.query_params.get("limit")
    sessions = get_recent_sessions(user_id=user.sub, limit=limit)
    return [Session(**s) for s in sessions]

@router.get("/sessions/{session_id}", response_model=Session)
async def get_session(session_id: str, user=Depends(require_auth)) -> Session:
    sessions = get_recent_sessions(user_id=user.sub)
    session = next((s for s in sessions if s["id"] == session_id), None)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
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