from fastapi import APIRouter
from .sessions import router as sessions_router
from .user_profile import router as user_profile_router
from .ai import router as ai_router
from .journal import router as journal_router
from .mood_entries import router as mood_entries_router

router = APIRouter()

@router.get("/")
async def read_root():
    return {"Hello": "From Bad Therapy!"}

router.include_router(sessions_router)
router.include_router(user_profile_router)
router.include_router(ai_router)
router.include_router(journal_router)
router.include_router(mood_entries_router)


