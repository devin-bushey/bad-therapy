from langgraph.graph import StateGraph, END
from agents.primary_therapist_agent import primary_therapist_agent
from agents.session_name_agent import session_name_node
from models.therapy import TherapyState

def build_therapy_graph() -> StateGraph:
    workflow = StateGraph(TherapyState)
    workflow.add_node("primary_therapist", primary_therapist_agent)
    workflow.add_node("session_name", session_name_node)
    workflow.add_edge("primary_therapist", "session_name")
    workflow.add_edge("session_name", END)
    workflow.set_entry_point("primary_therapist")
    return workflow.compile() 

