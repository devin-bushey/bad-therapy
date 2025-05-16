from langchain_openai import ChatOpenAI
from core.config import get_settings
from models.therapy import TherapyState

settings = get_settings()
llm = ChatOpenAI(model=settings.OPENAI_MODEL, temperature=0.7)

def primary_therapist_agent(state: TherapyState) -> TherapyState:
    response = llm.invoke(state["messages"])
    return {**state, "messages": state["messages"] + [response], "response": response.content} 