from typing import TypedDict, Annotated, Sequence, Literal
from langgraph.graph import StateGraph, END
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, AIMessage
from core.config import get_settings
from dotenv import load_dotenv

load_dotenv()

settings = get_settings()

class TherapyState(TypedDict):
    messages: Annotated[Sequence[HumanMessage | AIMessage], "Conversation history"]
    emotional_state: Annotated[str, "Current emotional state"]
    therapeutic_approach: Annotated[str, "Current therapeutic approach"]
    safety_level: Annotated[Literal["safe", "caution", "crisis"], "Safety assessment"]
    session_notes: Annotated[str, "Session progress notes"]
    next: Annotated[str, "Next step to take"]


model = "gpt-4.1-nano"

class SafetyAgent:
    def __init__(self):
        self.llm = ChatOpenAI(model=model, temperature=0.1)
    def __call__(self, state: TherapyState) -> TherapyState:
        response = self.llm.invoke([
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

class CoordinatorAgent:
    def __init__(self):
        self.llm = ChatOpenAI(model=model, temperature=0.7)
    def __call__(self, state: TherapyState) -> TherapyState:
        response = self.llm.invoke([
            *state["messages"],
            HumanMessage(content=f"""As the primary therapist, coordinate the session. Current emotional state: {state['emotional_state']} Safety level: {state['safety_level']} Determine the most appropriate therapeutic approach (CBT, DBT, or general support).""")
        ])
        return {
            **state,
            "therapeutic_approach": response.content,
            "next": "specialist"
        }

class SpecialistAgent:
    def __init__(self):
        self.llm = ChatOpenAI(model=model, temperature=0.7)
    def __call__(self, state: TherapyState) -> TherapyState:
        approach = state["therapeutic_approach"]
        response = self.llm.invoke([
            *state["messages"],
            HumanMessage(content=f"""Respond as a {approach} specialist. Current emotional state: {state['emotional_state']} Safety level: {state['safety_level']} Provide therapeutic intervention appropriate for this approach.""")
        ])
        return {
            **state,
            "messages": state["messages"] + [response],
            "next": "progress_tracker"
        }

class ProgressTrackerAgent:
    def __init__(self):
        self.llm = ChatOpenAI(model=model, temperature=0.3)
    def __call__(self, state: TherapyState) -> TherapyState:
        response = self.llm.invoke([
            *state["messages"],
            HumanMessage(content="""Analyze the conversation and update: 1. Emotional state 2. Session progress 3. Key insights or breakthroughs""")
        ])
        return {
            **state,
            "session_notes": state["session_notes"] + "\n" + response.content,
            "next": END
        }

def build_therapy_graph() -> StateGraph:
    workflow = StateGraph(TherapyState)
    safety_agent = SafetyAgent()
    coordinator_agent = CoordinatorAgent()
    specialist_agent = SpecialistAgent()
    progress_tracker = ProgressTrackerAgent()
    workflow.add_node("safety_check", safety_agent)
    workflow.add_node("coordinator", coordinator_agent)
    workflow.add_node("specialist", specialist_agent)
    workflow.add_node("progress_tracker", progress_tracker)
    workflow.add_edge("safety_check", "coordinator")
    workflow.add_edge("safety_check", END)
    workflow.add_edge("coordinator", "specialist")
    workflow.add_edge("specialist", "progress_tracker")
    workflow.add_edge("progress_tracker", END)
    workflow.set_entry_point("safety_check")
    return workflow.compile() 