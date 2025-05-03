from datetime import datetime
from database.connection import get_supabase_client

def save_conversation(prompt: str, response: str):
    supabase = get_supabase_client()
    data = {
        "prompt": prompt,
        "response": response,
        "created_at": datetime.utcnow().isoformat()
    }
    supabase.table("conversation_history").insert(data).execute()

def get_conversation_history(limit: int = 10) -> list[dict]:
    supabase = get_supabase_client()
    result = supabase.table("conversation_history")\
        .select("*")\
        .order("created_at", desc=True)\
        .limit(limit)\
        .execute()
    return result.data 