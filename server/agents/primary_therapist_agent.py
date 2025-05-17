from langchain_openai import ChatOpenAI
from core.config import get_settings
from models.therapy import TherapyState
from database.user_profile import get_user_profile
from utils.message_utils import convert_to_langchain_messages

settings = get_settings()
llm = ChatOpenAI(model=settings.OPENAI_MODEL, temperature=0.7)

def primary_therapist_agent(state: TherapyState) -> TherapyState:

    user_profile = get_user_profile(user_id=state.user_id)
    messages = convert_to_langchain_messages(state.history, state.prompt, not state.history, user_profile)

    response = llm.invoke(messages)

    return {"latest_ai_response": response.content} 


