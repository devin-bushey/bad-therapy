from core.config import get_settings
from models.therapy import Therapist, TherapistList, TherapyState
from database.user_profile import get_user_profile
from langchain_core.messages import SystemMessage, HumanMessage
from langchain_perplexity import ChatPerplexity
from prompts.find_therapist_prompts import get_find_therapist_prompt
from serpapi import GoogleSearch

settings = get_settings()
llm = ChatPerplexity(
    model='sonar-pro', 
    temperature=0.7, 
    api_key=settings.PERPLEXITY_API_KEY
)
    

def get_real_website(name: str) -> str | None:
    """Search Google via SerpApi for a therapist's real website and return the first link."""
    query = f"{name} therapist"
    params = {
        "q": query,
        "api_key": settings.SERPAPI_API_KEY,
        "engine": "google",
        "num": 1,
        "hl": "en",
        "gl": "ca"
    }
    search = GoogleSearch(params)
    results = search.get_dict()
    for r in results.get("organic_results", []):
        link = r.get("link")
        if link:
            return link
    return None

def update_therapist_websites(therapists: list[Therapist]) -> list[Therapist]:
    for t in therapists:
        url = get_real_website(t.name)
        if url:
            t.website = url
    return therapists

def find_therapist_node(state: TherapyState) -> TherapyState:
    user_profile = get_user_profile(user_id=state.user_id)
    find_therapist_prompt = get_find_therapist_prompt(user_profile)
    system_prompt = SystemMessage(content=find_therapist_prompt)
    user_message = HumanMessage(content=state.prompt if state.prompt else "Find me a therapist.")

    # TODO: Go through previous messages to help find a better fit for the user

    structured_llm = llm.with_structured_output(TherapistList)
    result = structured_llm.invoke(
        input=[system_prompt, user_message],
        extra_body={
            "web_search_options": {"user_location": {"country": "CA"}}
        }
    )
    therapists = update_therapist_websites(result.therapists)

    return {"therapists": therapists, "therapists_summary": result.summary} 


