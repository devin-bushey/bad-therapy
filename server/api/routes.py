from fastapi import APIRouter
from .sessions import router as sessions_router
from .user_profile import router as user_profile_router
from .ai import router as ai_router

router = APIRouter()
router.include_router(sessions_router)
router.include_router(user_profile_router)
router.include_router(ai_router)


