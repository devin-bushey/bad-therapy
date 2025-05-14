from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage
from langgraph.graph import END
from agent.types import TherapyState
from core.config import get_settings
from dotenv import load_dotenv

load_dotenv()
settings = get_settings()

model = "gpt-4.1-mini"
llm = ChatOpenAI(model=model, temperature=0.1)

def safety_agent(state: TherapyState) -> TherapyState:
    response = llm.invoke([
        *state["messages"],
        HumanMessage(content="""Analyze this conversation for safety concerns. Consider: self-harm, harm to others, acute distress, or crisis situations. Respond with one of: 'safe', 'caution', or 'crisis'.""")
    ])
    safety_level = response.content.lower().strip()
    next_node = END if safety_level == "crisis" else "coordinator"
    return {
        **state,
        "safety_level": safety_level,
        "next": next_node
    } 