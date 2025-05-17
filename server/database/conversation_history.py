from datetime import datetime
from database.connection import get_supabase_client
from openai import OpenAI
from core.config import get_settings
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.backends import default_backend
from cryptography.fernet import Fernet
import base64, os
from dotenv import load_dotenv
from langchain_core.messages import BaseMessage
from utils.message_utils import convert_to_langchain_messages

load_dotenv()

client = OpenAI()
settings = get_settings()

def create_session(*, name: str, user_id: str) -> dict:
    supabase = get_supabase_client()
    password = settings.PG_CRYPTO_KEY
    encrypted_name = encrypt_data(data=name, password=password)
    data = {
        "name": encrypted_name.data,
        "user_id": user_id,
        "created_at": datetime.utcnow().isoformat()
    }
    result = supabase.table("sessions").insert(data).execute()
    return result.data[0]

def update_session(*, session_id: str, name: str) -> dict:
    supabase = get_supabase_client()
    password = settings.PG_CRYPTO_KEY
    encrypted_name = encrypt_data(data=name, password=password)
    result = supabase.table("sessions").update({"name": encrypted_name.data}).eq("id", session_id).execute()
    return result.data[0]

def get_embedding(text: str) -> list[float]:
    response = client.embeddings.create(input=text, model="text-embedding-3-small")
    return response.data[0].embedding

def _derive_key(password: str, salt: bytes) -> bytes:
    kdf = PBKDF2HMAC(
        algorithm=hashes.SHA256(),
        length=32,
        salt=salt,
        iterations=390000,
        backend=default_backend()
    )
    return base64.urlsafe_b64encode(kdf.derive(password.encode()))

def encrypt_data(*, data: str, password: str):
    salt = os.urandom(16)
    key = _derive_key(password, salt)
    f = Fernet(key)
    token = f.encrypt(data.encode())
    return type('Obj', (), {'data': base64.b64encode(salt + token).decode()})

def decrypt_data(*, data: str, password: str):
    raw = base64.b64decode(data.encode())
    salt, token = raw[:16], raw[16:]
    key = _derive_key(password, salt)
    f = Fernet(key)
    return type('Obj', (), {'data': f.decrypt(token).decode()})

def save_conversation(*, session_id: str, user_id: str, prompt: str, response: str) -> None:
    supabase = get_supabase_client()
    embedding = get_embedding(prompt + " " + response)
    password = settings.PG_CRYPTO_KEY

    encrypted_prompt = encrypt_data(data=prompt, password=password)
    encrypted_response = encrypt_data(data=response, password=password)

    data = {
        "session_id": session_id,
        "user_id": user_id,
        "prompt": encrypted_prompt.data,
        "response": encrypted_response.data,
        "embedding": embedding,
        "created_at": datetime.utcnow().isoformat()
    }
    supabase.table("conversation_history").insert(data).execute()

def get_conversation_history(*, session_id: str, user_id: str, limit: int = 10) -> list[BaseMessage]:
    supabase = get_supabase_client()
    password = settings.PG_CRYPTO_KEY
    result = supabase.table("conversation_history")\
        .select("*")\
        .eq("session_id", session_id)\
        .eq("user_id", user_id)\
        .order("created_at", desc=True)\
        .limit(limit)\
        .execute()
    
    for item in result.data:
        item['prompt'] = decrypt_data(data=item['prompt'], password=password).data
        item['response'] = decrypt_data(data=item['response'], password=password).data

    history = convert_to_langchain_messages(result.data)

    return history

def get_recent_sessions(user_id: str, limit: int = 100) -> list[dict]:
    supabase = get_supabase_client()
    password = settings.PG_CRYPTO_KEY
    result = supabase.table("sessions")\
        .select("*")\
        .eq("user_id", user_id)\
        .order("created_at", desc=True)\
        .limit(limit)\
        .execute()
    for item in result.data:
        try:
            item['name'] = decrypt_data(data=item['name'], password=password).data
        except Exception:
            pass
    return result.data
