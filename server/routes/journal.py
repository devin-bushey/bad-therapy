from fastapi import APIRouter, Depends, HTTPException, Request
from slowapi import Limiter
from starlette.status import HTTP_401_UNAUTHORIZED
from service.journal_service import get_journal, save_journal
from utils.jwt_bearer import require_auth
from utils.rate_limit_utils import get_user_id_for_rate_limit

router = APIRouter()

# Initialize rate limiter for this router
limiter = Limiter(key_func=get_user_id_for_rate_limit)

async def get_user_id(request: Request):
    payload = await require_auth(request)
    user_id = getattr(payload, 'sub', None)
    if not user_id:
        raise HTTPException(status_code=HTTP_401_UNAUTHORIZED, detail='Invalid token')
    return user_id

@router.get('/journal')
@limiter.limit("60/minute")
async def read_journal(request: Request, user_id: str = Depends(get_user_id)):
    return get_journal(user_id)

@router.post('/journal')
@limiter.limit("60/minute")
async def write_journal(request: Request, data: dict, user_id: str = Depends(get_user_id)):
    content = data.get('content')
    if content is None:
        raise HTTPException(status_code=400, detail='Missing content')
    save_journal(user_id, content)
    return {'ok': True} 