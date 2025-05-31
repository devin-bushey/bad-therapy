from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    OPENAI_API_KEY: str
    OPENAI_MODEL: str = "gpt-4.1-mini"
    OPENAI_MAX_TOKENS: int = 256
    OPENAI_TIMEOUT: int = 15
    SUPABASE_DB_URL: str
    SUPABASE_ANON_KEY: str
    SUPABASE_PASS: str
    SUPABASE_JWT_SECRET: str
    SUPABASE_SERVICE_ROLE_KEY: str
    LANGSMITH_API_KEY: str
    LANGSMITH_TRACING: bool
    LANGSMITH_ENDPOINT: str
    LANGSMITH_PROJECT: str
    LANGSMITH_HIDE_INPUTS: bool
    LANGSMITH_HIDE_OUTPUTS: bool
    PG_CRYPTO_KEY: str
    AUTH0_DOMAIN: str
    AUTH0_AUDIENCE: str
    PERPLEXITY_API_KEY: str
    GOOGLE_MAPS_API_KEY: str
    SERPAPI_API_KEY: str

    class Config:
        env_file = ".env"

@lru_cache()
def get_settings() -> Settings:
    return Settings() 