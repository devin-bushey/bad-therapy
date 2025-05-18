from fastapi import APIRouter, Depends, HTTPException, Request
from starlette.status import HTTP_401_UNAUTHORIZED
from service.journal_service import get_journal, save_journal
from utils.jwt_bearer import require_auth

router = APIRouter()

async def get_user_id(request: Request):
    payload = await require_auth(request)
    user_id = getattr(payload, 'sub', None)
    if not user_id:
        raise HTTPException(status_code=HTTP_401_UNAUTHORIZED, detail='Invalid token')
    return user_id

@router.get('/journal')
async def read_journal(user_id: str = Depends(get_user_id)):
    return get_journal(user_id)

@router.post('/journal')
async def write_journal(data: dict, user_id: str = Depends(get_user_id)):
    content = data.get('content')
    if content is None:
        raise HTTPException(status_code=400, detail='Missing content')
    save_journal(user_id, content)
    return {'ok': True} 