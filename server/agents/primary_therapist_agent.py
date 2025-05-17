from langchain_openai import ChatOpenAI
from core.config import get_settings
from models.therapy import TherapyState
from database.user_profile import get_user_profile
from prompts.chat_prompts import get_system_prompt
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage

settings = get_settings()
llm = ChatOpenAI(model=settings.OPENAI_MODEL, temperature=0.7)

def primary_therapist_agent(state: TherapyState) -> TherapyState:
    user_profile = get_user_profile(user_id=state.user_id)
    is_first_message = not state.history or len(state.history) == 0

    system_prompt = SystemMessage(content=get_system_prompt(is_first_message, user_profile))
    human_prompt = HumanMessage(content=state.prompt)

    prompt = [system_prompt] + state.history + [human_prompt]

    response = llm.invoke(prompt)
    converted_response = AIMessage(content=response.content)

    return { "messages": state.messages + [converted_response] } 


