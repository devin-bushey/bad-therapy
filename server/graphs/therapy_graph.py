from langgraph.graph import StateGraph, END
from nodes.primary_therapist_node import primary_therapist_node
from nodes.safety_node import safety_node
from models.therapy import TherapyState
from nodes.router_node import router_node
from nodes.find_therapist_node import find_therapist_node
from nodes.journal_insights_node import journal_insights_node
from nodes.context_node import context_node

def _route_safety(state: TherapyState):
    return state.is_safe

def _route_decision(state: TherapyState):
    if state.next == "primary_therapist":
        return "context"
    elif state.next == "find_therapist":
        return "find_therapist"
    elif state.next == "journal_insights":
        return "journal_insights"
    else:
        return END

def build_therapy_graph() -> StateGraph:
    workflow = StateGraph(TherapyState)
    workflow.add_node("safety", safety_node)
    workflow.add_node("context", context_node)
    workflow.add_node("primary_therapist", primary_therapist_node)
    workflow.add_node("find_therapist", find_therapist_node)
    workflow.add_node("journal_insights", journal_insights_node)
    workflow.add_node("router", router_node)
    workflow.add_conditional_edges(
        "safety",
        _route_safety,
        {"blocked": END, "safe": "router"}
    )
    workflow.add_conditional_edges(
        "router",
        _route_decision,
        {
            "context": "context", 
            "find_therapist": "find_therapist",
            "journal_insights": "journal_insights"
        }
    )
    workflow.add_edge("context", "primary_therapist")
    workflow.set_entry_point("safety")
    return workflow.compile() 

