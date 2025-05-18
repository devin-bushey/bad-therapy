from langgraph.graph import StateGraph, END
from agents.primary_therapist_agent import primary_therapist_agent
from agents.safety_agent import safety_agent
from models.therapy import TherapyState

def _route_safety(state: TherapyState):
    return state.is_safe

def build_therapy_graph() -> StateGraph:
    workflow = StateGraph(TherapyState)
    workflow.add_node("safety", safety_agent)
    workflow.add_node("primary_therapist", primary_therapist_agent)
    workflow.add_conditional_edges(
        "safety",
        _route_safety,
        {"blocked": END, "safe": "primary_therapist"}
    )
    workflow.add_edge("primary_therapist", END)
    workflow.set_entry_point("safety")
    return workflow.compile() 

