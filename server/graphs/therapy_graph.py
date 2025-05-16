from langgraph.graph import StateGraph, END
from agents.primary_therapist_agent import primary_therapist_agent
from models.therapy import TherapyState
def build_therapy_graph() -> StateGraph:
    workflow = StateGraph(TherapyState)
    workflow.add_node("primary_therapist", primary_therapist_agent)
    workflow.add_edge("primary_therapist", END)
    workflow.set_entry_point("primary_therapist")
    return workflow.compile() 

