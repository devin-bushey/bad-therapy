import os
from fastapi import Request, HTTPException, status
from jose import jwt, JWTError
from pydantic import BaseModel
from urllib.request import urlopen
import json
from database.user_profile import get_user_profile, create_user_profile

class TokenPayload(BaseModel):
    sub: str
    iss: str
    aud: str | list[str]
    email: str | None = None

def get_auth0_jwks():
    domain = os.environ["AUTH0_DOMAIN"]
    with urlopen(f"https://{domain}/.well-known/jwks.json") as resp:
        return json.load(resp)["keys"]

def get_token_auth_header(request: Request) -> str:
    auth = request.headers.get("Authorization")
    if not auth or not auth.startswith("Bearer "):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, detail="Missing or invalid Authorization header")
    return auth.split()[1]

async def require_auth(request: Request):
    token = get_token_auth_header(request)
    try:
        unverified_header = jwt.get_unverified_header(token)
        jwks = get_auth0_jwks()
        rsa_key = next(
            {k: key[k] for k in ("kty", "kid", "use", "n", "e")} for key in jwks if key["kid"] == unverified_header["kid"]
        )
    except Exception:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, detail="Invalid header or JWKS")
    try:
        payload = jwt.decode(
            token,
            rsa_key,
            algorithms=["RS256"],
            audience=os.environ["AUTH0_AUDIENCE"],
            issuer=f"https://{os.environ['AUTH0_DOMAIN']}/",
        )

        
        user = TokenPayload(**payload)
        
        # Auto-create user profile if it doesn't exist or update email if needed
        try:
            existing_profile = get_user_profile(user_id=user.sub)
            if not existing_profile:
                create_user_profile(
                    user_id=user.sub,
                    email=user.email,
                    full_name=None,
                    age=None,
                    bio=None,
                    gender=None,
                    ethnicity=None,
                    goals=None,
                    coaching_style=None,
                    preferred_focus_area=None
                )
            elif user.email and existing_profile.get('email') != user.email:
                # Update email if it's different (user might have changed email in Auth0)
                from database.user_profile import update_user_profile
                update_user_profile(user.sub, {'email': user.email})
        except Exception as e:
            # Log the error but don't fail auth - user can still use the app
            print(f"Warning: Failed to auto-create/update user profile for {user.sub}: {e}")
        
        return user
    except JWTError:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, detail="Invalid token") 