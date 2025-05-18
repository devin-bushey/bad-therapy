from core.config import get_settings
from models.therapy import TherapistList, TherapyState
from database.user_profile import get_user_profile
from langchain_core.messages import AIMessage, SystemMessage, HumanMessage
from langchain_perplexity import ChatPerplexity
from prompts.find_therapist_prompts import get_find_therapist_prompt

settings = get_settings()
llm = ChatPerplexity(model='sonar-pro', temperature=0.7, api_key=settings.PERPLEXITY_API_KEY)
    

def find_therapist_agent(state: TherapyState) -> TherapyState:
    user_profile = get_user_profile(user_id=state.user_id)
    find_therapist_prompt = get_find_therapist_prompt(user_profile)
    system_prompt = SystemMessage(content=find_therapist_prompt)
    user_message = HumanMessage(content=state.prompt if state.prompt else "Find me a therapist.")

    # TODO: Go through previous messages to help find a better fit for the user

    structured_llm = llm.with_structured_output(TherapistList)
    result = structured_llm.invoke([system_prompt, user_message])
    
    return {
        "therapists": result.therapists,
        "therapists_summary": result.summary
    } 


