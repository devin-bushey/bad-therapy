from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from utils.rate_limit_utils import get_user_id_for_rate_limit, get_remote_address
from routes.routes import router
from core.config import get_settings
from dotenv import load_dotenv

load_dotenv()

settings = get_settings()

# Initialize rate limiter with in-memory storage
# Use user ID for authenticated requests, IP for unauthenticated
limiter = Limiter(key_func=get_user_id_for_rate_limit)
app = FastAPI(title="Bad Therapy API")
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174", "https://bad-therapy-client.onrender.com", "https://badtherapy.cool", "https://www.badtherapy.cool"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)

if __name__ == "__main__":
    import os
    import uvicorn
    port = int(os.environ.get("PORT", 10000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=False) 