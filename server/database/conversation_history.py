from datetime import datetime
from database.connection import get_supabase_client

def create_session(*, name: str) -> dict:
    supabase = get_supabase_client()
    data = {
        "name": name,
        "created_at": datetime.utcnow().isoformat()
    }
    result = supabase.table("sessions").insert(data).execute()
    return result.data[0]

def update_session(*, session_id: str, name: str) -> dict:
    supabase = get_supabase_client()
    result = supabase.table("sessions").update({"name": name}).eq("id", session_id).execute()
    return result.data[0]

def save_conversation(*, session_id: str, prompt: str, response: str) -> None:
    supabase = get_supabase_client()
    data = {
        "session_id": session_id,
        "prompt": prompt,
        "response": response,
        "created_at": datetime.utcnow().isoformat()
    }
    supabase.table("conversation_history").insert(data).execute()

def get_conversation_history(*, session_id: str, limit: int = 10) -> list[dict]:
    supabase = get_supabase_client()
    result = supabase.table("conversation_history")\
        .select("*")\
        .eq("session_id", session_id)\
        .order("created_at", desc=True)\
        .limit(limit)\
        .execute()
    return result.data

def get_recent_sessions(limit: int = 5) -> list[dict]:
    supabase = get_supabase_client()
    result = supabase.table("sessions")\
        .select("*")\
        .order("created_at", desc=True)\
        .limit(limit)\
        .execute()
    return result.data 