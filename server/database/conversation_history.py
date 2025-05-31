from datetime import datetime
from database.connection import get_supabase_client
from openai import OpenAI
from core.config import get_settings
from dotenv import load_dotenv
from langchain_core.messages import BaseMessage
from utils.message_utils import convert_to_langchain_messages
from langchain_openai import OpenAIEmbeddings
from langchain_core.vectorstores import InMemoryVectorStore
from utils.obfuscation import encrypt_data, decrypt_data

load_dotenv()

client = OpenAI()
settings = get_settings()

def create_session(*, name: str, user_id: str) -> dict:
    supabase = get_supabase_client()
    encrypted_name = encrypt_data(data=name)
    data = {
        "name": encrypted_name.data,
        "user_id": user_id,
        "created_at": datetime.utcnow().isoformat()
    }
    result = supabase.table("sessions").insert(data).execute()
    return result.data[0]

def update_session(*, session_id: str, name: str) -> dict:
    supabase = get_supabase_client()
    encrypted_name = encrypt_data(data=name)
    result = supabase.table("sessions").update({"name": encrypted_name.data}).eq("id", session_id).execute()
    return result.data[0]

def get_embedding(text: str) -> list[float]:
    response = client.embeddings.create(input=text, model=settings.OPENAI_EMBEDDING_MODEL)
    return response.data[0].embedding

def save_conversation(*, session_id: str, user_id: str, prompt: str, response: str) -> None:
    supabase = get_supabase_client()
    embedding = get_embedding(prompt + " " + response)

    encrypted_prompt = encrypt_data(data=prompt)
    encrypted_response = encrypt_data(data=response)

    data = {
        "session_id": session_id,
        "user_id": user_id,
        "human": encrypted_prompt.data,
        "ai": encrypted_response.data,
        "embedding": embedding,
        "created_at": datetime.utcnow().isoformat()
    }
    supabase.table("conversation_history").insert(data).execute()

def get_conversation_history(*, session_id: str, user_id: str, limit: int = 10) -> list[BaseMessage]:
    supabase = get_supabase_client()
    result = supabase.table("conversation_history")\
        .select("*")\
        .eq("session_id", session_id)\
        .eq("user_id", user_id)\
        .order("created_at", desc=False)\
        .limit(limit)\
        .execute()
    
    for item in result.data:
        item['human'] = decrypt_data(data=item['human']).data
        item['ai'] = decrypt_data(data=item['ai']).data

    history = convert_to_langchain_messages(result.data)

    return history

def get_recent_sessions(user_id: str, limit: int = 100) -> list[dict]:
    supabase = get_supabase_client()
    result = supabase.table("sessions")\
        .select("*")\
        .eq("user_id", user_id)\
        .order("created_at", desc=True)\
        .limit(limit)\
        .execute()
    for item in result.data:
        try:
            item['name'] = decrypt_data(data=item['name']).data
        except Exception:
            pass
    return result.data

def fetch_user_conversations(user_id: str) -> list:
    """Fetch all conversation history items for a user."""
    supabase = get_supabase_client()
    return supabase.table("conversation_history")\
        .select("human, ai, embedding")\
        .eq("user_id", user_id)\
        .execute().data

def get_relevant_conversations(user_id: str, prompt: str, top_k: int = 3) -> list[str]:
    """Return the top_k most relevant decrypted conversations for a user using LangChain retriever interface."""
    conversations = fetch_user_conversations(user_id)
    convo_texts = []
    for item in conversations:
        convo_texts.append(
            f"Human: {decrypt_data(data=item['human']).data}\n"
            f"AI: {decrypt_data(data=item['ai']).data}"
        )
    if not convo_texts:
        return []
    embeddings = OpenAIEmbeddings(model=settings.OPENAI_EMBEDDING_MODEL)
    vectorstore = InMemoryVectorStore.from_texts(convo_texts, embedding=embeddings)
    retriever = vectorstore.as_retriever(search_kwargs={"k": top_k})
    docs = retriever.invoke(prompt)
    return [doc.page_content for doc in docs]

def get_relevant_context(user_id: str, prompt: str, top_k: int = 3) -> str:
    """Return a string of the most relevant past conversations for a prompt."""
    relevant_convos = get_relevant_conversations(user_id, prompt, top_k)
    return "\n".join(relevant_convos)
