from datetime import datetime
from database.connection import get_supabase_client, get_user_profile_table, get_journal_table
from typing import Optional
from utils.obfuscation import encrypt_data, decrypt_data

def create_user_profile(*, user_id: str, email: Optional[str] = None, full_name: Optional[str], age: Optional[int], bio: Optional[str], gender: Optional[str] = None, ethnicity: Optional[str] = None, goals: Optional[str] = None, coaching_style: Optional[str] = None, preferred_focus_area: Optional[str] = None) -> dict:
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
        "email": email,  # Store email in plaintext
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
    # Email is stored in plaintext, no decryption needed
    # item['email'] already contains the plaintext email
    item['full_name'] = decrypt_data(data=item['full_name']).data
    item['age'] = decrypt_data(data=item['age']).data
    item['bio'] = decrypt_data(data=item['bio']).data
    item['gender'] = decrypt_data(data=item.get('gender', '')).data
    item['ethnicity'] = decrypt_data(data=item.get('ethnicity', '')).data
    item['goals'] = decrypt_data(data=item.get('goals', '')).data
    item['coaching_style'] = decrypt_data(data=item.get('coaching_style', '')).data
    item['preferred_focus_area'] = decrypt_data(data=item.get('preferred_focus_area', '')).data
    return item

def update_user_profile(user_id: str, updates: dict) -> dict:
    """Update specific fields in user profile"""
    supabase = get_supabase_client()
    result = supabase.table(get_user_profile_table()).update(updates).eq('user_id', user_id).execute()
    return result.data[0] if result.data else None

def increment_message_count(user_id: str) -> dict:
    """Increment the message count for a user"""
    supabase = get_supabase_client()
    
    # Get current message count
    result = supabase.table(get_user_profile_table()).select('message_count').eq('user_id', user_id).limit(1).execute()
    
    if not result.data:
        # Create user profile with message count 1 if it doesn't exist
        data = {
            "user_id": user_id,
            "message_count": 1,
            "is_premium": False,
            "created_at": datetime.utcnow().isoformat()
        }
        create_result = supabase.table(get_user_profile_table()).insert(data).execute()
        return create_result.data[0] if create_result.data else None
    
    # Increment existing count
    current_count = result.data[0].get('message_count', 0)
    new_count = current_count + 1
    
    update_result = supabase.table(get_user_profile_table()).update({
        'message_count': new_count
    }).eq('user_id', user_id).execute()
    
    return update_result.data[0] if update_result.data else None

def delete_user_account(user_id: str) -> bool:
    """Permanently delete user account and all associated data"""
    supabase = get_supabase_client()
    
    try:
        # Delete conversation history (messages)
        supabase.table('conversation_history').delete().eq('user_id', user_id).execute()
        
        # Delete sessions
        supabase.table('sessions').delete().eq('user_id', user_id).execute()
        
        # Delete journal entries
        supabase.table(get_journal_table()).delete().eq('user_id', user_id).execute()
        
        # Delete mood entries
        supabase.table('mood_entries').delete().eq('user_id', user_id).execute()
        
        # Delete user profile (last)
        supabase.table(get_user_profile_table()).delete().eq('user_id', user_id).execute()
        
        return True
        
    except Exception as e:
        print(f"Error deleting account for user {user_id}: {e}")
        raise e

