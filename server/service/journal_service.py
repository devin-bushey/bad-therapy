from database.journal import fetch_journal, upsert_journal

def get_journal(user_id: str):
    return fetch_journal(user_id)

def save_journal(user_id: str, content):
    upsert_journal(user_id, content) 