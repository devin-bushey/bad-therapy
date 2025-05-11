from datetime import datetime
from database.connection import get_supabase_client, get_user_profile_table
from core.config import get_settings
from .conversation_history import encrypt_data, decrypt_data
from typing import Optional

def create_user_profile(*, user_id: str, full_name: Optional[str], age: Optional[int], bio: Optional[str], gender: Optional[str] = None, ethnicity: Optional[str] = None, goals: Optional[str] = None, coaching_style: Optional[str] = None, preferred_focus_area: Optional[str] = None) -> dict:
    supabase = get_supabase_client()
    password = get_settings().PG_CRYPTO_KEY
    encrypted_full_name = encrypt_data(data=full_name or '', password=password)
    encrypted_age = encrypt_data(data=age or '', password=password)
    encrypted_bio = encrypt_data(data=bio or '', password=password)
    encrypted_gender = encrypt_data(data=gender or '', password=password)
    encrypted_ethnicity = encrypt_data(data=ethnicity or '', password=password)
    encrypted_goals = encrypt_data(data=goals or '', password=password)
    encrypted_coaching_style = encrypt_data(data=coaching_style or '', password=password)
    encrypted_preferred_focus_area = encrypt_data(data=preferred_focus_area or '', password=password)
    # Check if profile exists
    existing = supabase.table(get_user_profile_table()).select('id').eq('user_id', user_id).limit(1).execute()
    data = {
        "user_id": user_id,
        "full_name": encrypted_full_name.data,
        "age": encrypted_age.data,
        "bio": encrypted_bio.data,
        "gender": encrypted_gender.data,
        "ethnicity": encrypted_ethnicity.data,
        "goals": encrypted_goals.data,
        "coaching_style": encrypted_coaching_style.data,
        "preferred_focus_area": encrypted_preferred_focus_area.data,
        "created_at": datetime.utcnow().isoformat()
    }
    if existing.data:
        # Update existing profile
        result = supabase.table(get_user_profile_table()).update(data).eq('user_id', user_id).execute()
    else:
        # Create new profile
        result = supabase.table(get_user_profile_table()).insert(data).execute()
    return result.data[0]

def get_user_profile(*, user_id: str) -> Optional[dict]:
    supabase = get_supabase_client()
    password = get_settings().PG_CRYPTO_KEY
    result = supabase.table(get_user_profile_table()).select('*').eq('user_id', user_id).limit(1).execute()
    if not result.data:
        return None
    item = result.data[0]
    item['full_name'] = decrypt_data(data=item['full_name'], password=password).data
    item['age'] = decrypt_data(data=item['age'], password=password).data
    item['bio'] = decrypt_data(data=item['bio'], password=password).data
    item['gender'] = decrypt_data(data=item.get('gender', ''), password=password).data
    item['ethnicity'] = decrypt_data(data=item.get('ethnicity', ''), password=password).data
    item['goals'] = decrypt_data(data=item.get('goals', ''), password=password).data
    item['coaching_style'] = decrypt_data(data=item.get('coaching_style', ''), password=password).data
    item['preferred_focus_area'] = decrypt_data(data=item.get('preferred_focus_area', ''), password=password).data
    return item

