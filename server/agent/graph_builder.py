from agent.agents.primary_therapist_agent import primary_therapist_agent
from agent.types import TherapyState
from langgraph.graph import StateGraph, END


def build_therapy_graph() -> StateGraph:
    workflow = StateGraph(TherapyState)
    workflow.add_node("primary_therapist", primary_therapist_agent)
    workflow.add_edge("primary_therapist", END)
    workflow.set_entry_point("primary_therapist")
    return workflow.compile() 