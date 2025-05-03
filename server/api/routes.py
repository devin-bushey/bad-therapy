from fastapi import APIRouter, Depends
from models.schemas import AIRequest, AIResponse, Session, SessionCreate
from services.openai_service import OpenAIService
from database.conversation_history import get_recent_sessions, create_session

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

@router.post("/ai/generate", response_model=AIResponse)
async def generate_ai_response(
    data: AIRequest,
    openai_service: OpenAIService = Depends()
) -> AIResponse:
    result = await openai_service.generate_response(session_id=data.session_id, prompt=data.prompt)
    return AIResponse(result=result) 