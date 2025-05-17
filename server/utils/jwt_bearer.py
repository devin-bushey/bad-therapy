import os
from fastapi import Request, HTTPException, status
from jose import jwt, JWTError
from pydantic import BaseModel
from urllib.request import urlopen
import json

class TokenPayload(BaseModel):
    sub: str
    iss: str
    aud: str | list[str]

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
        return TokenPayload(**payload)
    except JWTError:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, detail="Invalid token") 