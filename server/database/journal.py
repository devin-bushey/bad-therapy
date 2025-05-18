import json
from datetime import datetime
from database.connection import get_supabase_client
from core.config import get_settings
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.backends import default_backend
from cryptography.fernet import Fernet
import base64, os

settings = get_settings()

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

def fetch_journal(user_id: str):
    supabase = get_supabase_client()
    password = settings.PG_CRYPTO_KEY
    result = supabase.table("journals").select("content").eq("user_id", user_id).maybe_single().execute()
    if result.data and result.data.get('content'):
        try:
            decrypted = decrypt_data(data=result.data['content'], password=password)
            return {'content': json.loads(decrypted.data)}
        except Exception:
            return {'content': ''}
    return {'content': ''}

def upsert_journal(user_id: str, content):
    supabase = get_supabase_client()
    password = settings.PG_CRYPTO_KEY
    encrypted = encrypt_data(data=json.dumps(content), password=password)
    data = {
        "user_id": user_id,
        "content": encrypted.data,
        "updated_at": datetime.utcnow().isoformat()
    }
    supabase.table("journals").upsert(data, on_conflict=["user_id"]).execute() 