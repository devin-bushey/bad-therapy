from datetime import datetime
from database.connection import get_supabase_client, get_user_profile_table
from typing import Optional
from utils.obfuscation import encrypt_data, decrypt_data

def create_user_profile(*, user_id: str, full_name: Optional[str], age: Optional[int], bio: Optional[str], gender: Optional[str] = None, ethnicity: Optional[str] = None, goals: Optional[str] = None, coaching_style: Optional[str] = None, preferred_focus_area: Optional[str] = None) -> dict:
    supabase = get_supabase_client()
    encrypted_full_name = encrypt_data(data=full_name or '')
    encrypted_age = encrypt_data(data=age or '')
    encrypted_bio = encrypt_data(data=bio or '')
    encrypted_gender = encrypt_data(data=gender or '')
    encrypted_ethnicity = encrypt_data(data=ethnicity or '')
    encrypted_goals = encrypt_data(data=goals or '')
    encrypted_coaching_style = encrypt_data(data=coaching_style or '')
    encrypted_preferred_focus_area = encrypt_data(data=preferred_focus_area or '')
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
    result = supabase.table(get_user_profile_table()).select('*').eq('user_id', user_id).limit(1).execute()
    if not result.data:
        return None
    item = result.data[0]
    item['full_name'] = decrypt_data(data=item['full_name']).data
    item['age'] = decrypt_data(data=item['age']).data
    item['bio'] = decrypt_data(data=item['bio']).data
    item['gender'] = decrypt_data(data=item.get('gender', '')).data
    item['ethnicity'] = decrypt_data(data=item.get('ethnicity', '')).data
    item['goals'] = decrypt_data(data=item.get('goals', '')).data
    item['coaching_style'] = decrypt_data(data=item.get('coaching_style', '')).data
    item['preferred_focus_area'] = decrypt_data(data=item.get('preferred_focus_area', '')).data
    return item

