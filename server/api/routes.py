from fastapi import APIRouter, Depends, HTTPException, Request
from models.schemas import AIRequest, Session, SessionCreate
from agent.therapy_agents import build_therapy_graph
from services.openai_service import OpenAIService
from database.conversation_history import get_recent_sessions, create_session, update_session, get_conversation_history
from fastapi.responses import StreamingResponse
from langchain_core.messages import HumanMessage
from utils.jwt_bearer import require_auth


router = APIRouter()
graph = build_therapy_graph()

@router.get("/")
async def read_root():
    return {"Hello": "From Bad Therapy!"}

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
    
    # Get conversation history
    history = get_conversation_history(session_id=session_id, user_id=user.sub)
    messages = []
    # Sort history from oldest to newest
    for entry in reversed(history):
        messages.append({"content": entry["prompt"], "isFromUser": True})
        messages.append({"content": entry["response"], "isFromUser": False})
    
    session["messages"] = messages
    return Session(**session)

@router.patch("/sessions/{session_id}", response_model=Session)
async def rename_session(session_id: str, session: SessionCreate, user=Depends(require_auth)) -> Session:
    updated_session = update_session(session_id=session_id, name=session.name)
    return Session(**updated_session)


@router.post("/ai/generate-stream")
async def generate_ai_response_stream(
    data: AIRequest,
    openai_service: OpenAIService = Depends(),
    user=Depends(require_auth)
):
    async def streamer():
        async for chunk in openai_service.generate_response_stream(session_id=data.session_id, prompt=data.prompt, user_id=user.sub):
            yield chunk
    return StreamingResponse(streamer(), media_type="text/plain") 


@router.post("/agent/therapy")
async def run_therapy(request: Request, user=Depends(require_auth)):
    data = await request.json()
    user_message = data.get("message", "")
    emotional_state = data.get("emotional_state", "neutral")
    initial_state = {
        "messages": [HumanMessage(content=user_message)],
        "emotional_state": emotional_state,
        "therapeutic_approach": "",
        "safety_level": "safe",
        "session_notes": "",
        "next": "safety_check"
    }
    result = graph.invoke(initial_state)
    return {
        "safety_level": result["safety_level"],
        "therapeutic_approach": result["therapeutic_approach"],
        "session_notes": result["session_notes"],
        "conversation": [
            {"type": m.type, "content": m.content} for m in result["messages"]
        ]
    }