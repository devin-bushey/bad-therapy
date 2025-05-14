from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage
from agent.types import TherapyState
from core.config import get_settings
from dotenv import load_dotenv

load_dotenv()
settings = get_settings()

model = "gpt-4.1-mini"
llm = ChatOpenAI(model=model, temperature=0.7)

def specialist_agent(state: TherapyState) -> TherapyState:
    approach = state["therapeutic_approach"]
    response = llm.invoke([
        *state["messages"],
        HumanMessage(content=f"""Respond as a {approach} specialist. Current emotional state: {state['emotional_state']} Safety level: {state['safety_level']} Provide therapeutic intervention appropriate for this approach.""")
    ])
    return {
        **state,
        "messages": state["messages"] + [response],
        "next": "progress_tracker"
    } 