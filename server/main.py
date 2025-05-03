from fastapi import FastAPI
from api.routes import router
from core.config import get_settings

settings = get_settings()
app = FastAPI(title="Bad Therapy API")
app.include_router(router) 