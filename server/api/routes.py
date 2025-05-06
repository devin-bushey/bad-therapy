from fastapi import APIRouter, Depends, HTTPException
from models.schemas import AIRequest, AIResponse, Session, SessionCreate
from services.openai_service import OpenAIService
from database.conversation_history import get_recent_sessions, create_session, update_session, get_conversation_history
from fastapi.responses import StreamingResponse

router = APIRouter()

@router.get("/")
async def read_root():
    return {"Hello": "From Bad Therapy!"}

@router.post("/sessions", response_model=Session)
async def create_new_session(session: SessionCreate) -> Session:
    created_session = create_session(name=session.name)
    return Session(**created_session)

@router.get("/sessions", response_model=list[Session])
async def list_sessions() -> list[Session]:
    sessions = get_recent_sessions()
    return [Session(**s) for s in sessions]

@router.get("/sessions/{session_id}", response_model=Session)
async def get_session(session_id: str) -> Session:
    sessions = get_recent_sessions()
    session = next((s for s in sessions if s["id"] == session_id), None)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    # Get conversation history
    history = get_conversation_history(session_id=session_id)
    messages = []
    # Sort history from oldest to newest
    for entry in reversed(history):
        messages.append({"content": entry["prompt"], "isFromUser": True})
        messages.append({"content": entry["response"], "isFromUser": False})
    
    session["messages"] = messages
    return Session(**session)

@router.patch("/sessions/{session_id}", response_model=Session)
async def rename_session(session_id: str, session: SessionCreate) -> Session:
    updated_session = update_session(session_id=session_id, name=session.name)
    return Session(**updated_session)

@router.post("/ai/generate", response_model=AIResponse)
async def generate_ai_response(
    data: AIRequest,
    openai_service: OpenAIService = Depends()
) -> AIResponse:
    result = await openai_service.generate_response(session_id=data.session_id, prompt=data.prompt)
    return AIResponse(result=result)

@router.post("/ai/generate-stream")
async def generate_ai_response_stream(
    data: AIRequest,
    openai_service: OpenAIService = Depends()
):
    async def streamer():
        async for chunk in openai_service.generate_response_stream(session_id=data.session_id, prompt=data.prompt):
            yield chunk
    return StreamingResponse(streamer(), media_type="text/plain") 