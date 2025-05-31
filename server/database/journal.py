import json
from datetime import datetime
from database.connection import get_supabase_client
from core.config import get_settings
from utils.obfuscation import encrypt_data, decrypt_data

settings = get_settings()

def create_new_journal(user_id: str):
    upsert_journal(user_id, [])
    return {'content': []}

def fetch_journal(user_id: str):
    supabase = get_supabase_client()
    result = supabase.table("journals").select("content").eq("user_id", user_id).maybe_single().execute()

    # If no journal exists, create a new one
    if not result or not getattr(result, 'data', None):
        return create_new_journal(user_id)
    
    if result.data.get('content'):
        try:
            decrypted = decrypt_data(data=result.data['content'])
            return {'content': json.loads(decrypted.data)}
        except Exception:
            # TODO: Handle this error better
            return create_new_journal(user_id)
    # TODO: Handle this error better
    return create_new_journal(user_id)

def upsert_journal(user_id: str, content):
    supabase = get_supabase_client()
    encrypted = encrypt_data(data=json.dumps(content))
    data = {
        "user_id": user_id,
        "content": encrypted.data,
        "updated_at": datetime.utcnow().isoformat()
    }
    supabase.table("journals").upsert(data, on_conflict=["user_id"]).execute() 