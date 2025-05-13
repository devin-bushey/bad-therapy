from fastapi import APIRouter, Depends, HTTPException
from models.schemas import UserProfile, UserProfileCreate
from database.user_profile import create_user_profile, get_user_profile
from utils.jwt_bearer import require_auth

router = APIRouter()

@router.post("/user/profile", response_model=UserProfile)
async def create_profile(profile: UserProfileCreate, user=Depends(require_auth)) -> UserProfile:
    created = create_user_profile(
        user_id=user.sub,
        full_name=profile.full_name,
        age=profile.age,
        bio=profile.bio,
        gender=profile.gender,
        ethnicity=profile.ethnicity,
        goals=profile.goals,
        coaching_style=profile.coaching_style,
        preferred_focus_area=profile.preferred_focus_area
    )
    return UserProfile(**created)

@router.get("/user/profile", response_model=UserProfile)
async def get_profile(user=Depends(require_auth)) -> UserProfile:
    profile = get_user_profile(user_id=user.sub)
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    return UserProfile(**profile) 