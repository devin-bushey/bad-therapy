from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage
from langgraph.graph import END
from agent.types import TherapyState
from core.config import get_settings
from dotenv import load_dotenv

load_dotenv()
settings = get_settings()

model = "gpt-4.1-mini"
llm = ChatOpenAI(model=model, temperature=0.3)

def progress_tracker_agent(state: TherapyState) -> TherapyState:
    response = llm.invoke([
        *state["messages"],
        HumanMessage(content="""Analyze the conversation and update: 1. Emotional state 2. Session progress 3. Key insights or breakthroughs""")
    ])
    return {
        **state,
        "session_notes": state["session_notes"] + "\n" + response.content,
        "next": END
    } 