from langgraph.graph import StateGraph, END
from agents.primary_therapist_agent import primary_therapist_agent
from agents.safety_agent import safety_agent
from models.therapy import TherapyState
from agents.router_node import router_node
from agents.find_therapist_agent import find_therapist_agent

def _route_safety(state: TherapyState):
    return state.is_safe

def _route_decision(state: TherapyState):
    if state.next == "primary_therapist":
        return "primary_therapist"
    elif state.next == "find_therapist":
        return "find_therapist"
    else:
        return END

def build_therapy_graph() -> StateGraph:
    workflow = StateGraph(TherapyState)
    workflow.add_node("safety", safety_agent)
    workflow.add_node("primary_therapist", primary_therapist_agent)
    workflow.add_node("find_therapist", find_therapist_agent)
    workflow.add_node("router", router_node)
    workflow.add_conditional_edges(
        "safety",
        _route_safety,
        {"blocked": END, "safe": "router"}
    )
    workflow.add_conditional_edges(
        "router",
        _route_decision,
        {"primary_therapist": "primary_therapist", "find_therapist": "find_therapist"}
    )
    workflow.add_edge("find_therapist", END)
    workflow.add_edge("primary_therapist", END)
    workflow.set_entry_point("safety")
    return workflow.compile() 

