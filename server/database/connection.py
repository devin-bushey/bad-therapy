from supabase import create_client, Client
from core.config import get_settings

settings = get_settings()

def get_supabase_client() -> Client:
    url: str = settings.SUPABASE_DB_URL
    key: str = settings.SUPABASE_ANON_KEY
    return create_client(url, key) 