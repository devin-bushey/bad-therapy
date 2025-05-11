from supabase import create_client, Client
from core.config import get_settings

settings = get_settings()

def get_supabase_client() -> Client:
    url: str = settings.SUPABASE_DB_URL
    key: str = settings.SUPABASE_SERVICE_ROLE_KEY
    return create_client(url, key)

def get_user_profile_table() -> str:
    return "user_profile"
