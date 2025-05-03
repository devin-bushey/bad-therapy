from fastapi import APIRouter, Depends
from models.schemas import AIRequest, AIResponse
from services.openai_service import OpenAIService

router = APIRouter()

@router.get("/")
async def read_root():
    return {"Hello": "From Bad Therapy!"}

@router.post("/ai/generate", response_model=AIResponse)
async def generate_ai_response(
    data: AIRequest,
    openai_service: OpenAIService = Depends()
) -> AIResponse:
    result = await openai_service.generate_response(data.prompt)
    return AIResponse(result=result) 