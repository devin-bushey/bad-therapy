from fastapi import APIRouter, Depends
from service.tips_service import generate_daily_tip
from models.tips import DailyTip
from utils.jwt_bearer import require_auth

router = APIRouter()

@router.get("/tips/daily", response_model=DailyTip)
async def get_daily_tip(user=Depends(require_auth)):
    """Get a daily AI-generated mental health tip"""
    return await generate_daily_tip()