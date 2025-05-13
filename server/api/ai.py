from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from models.schemas import AIRequest
from services.openai_service import OpenAIService
from utils.jwt_bearer import require_auth
from database.user_profile import get_user_profile

router = APIRouter()

@router.get("/")
async def read_root():
    return {"Hello": "From Bad Therapy!"}

@router.post("/ai/generate-stream")
async def generate_ai_response_stream(
    data: AIRequest,
    openai_service: OpenAIService = Depends(),
    user=Depends(require_auth)
):
    profile = get_user_profile(user_id=user.sub)
    async def streamer():
        async for chunk in openai_service.generate_response_stream(session_id=data.session_id, prompt=data.prompt, user_id=user.sub, user_profile=profile):
            yield chunk
    return StreamingResponse(streamer(), media_type="text/plain")

@router.get("/ai/suggested-prompts")
async def get_suggested_prompts(openai_service: OpenAIService = Depends(), user=Depends(require_auth)):
    prompts = await openai_service.generate_suggested_prompts()
    return {"prompts": prompts} 