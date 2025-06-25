from pydantic import BaseModel, Field
from typing_extensions import Literal
from langchain_openai import ChatOpenAI
from core.config import get_settings
from models.therapy import TherapyState
from langchain_core.messages import AIMessage, SystemMessage, HumanMessage
from prompts.router_prompts import get_router_prompt

# Schema for structured output to use as routing logic
class Route(BaseModel):
    step: Literal["primary_therapist", "find_therapist", "journal_insights"] = Field(
        None, description="The next step in the routing process"
    )

settings = get_settings()
llm = ChatOpenAI(model=settings.OPENAI_MODEL, temperature=0.7)
router = llm.with_structured_output(Route)

def router_node(state: TherapyState) -> TherapyState:
    # Check if this is explicitly a journal insights request
    if state.is_journal_insights:
        print(f"Router: Routing journal insights request for user {state.user_id} to journal_insights node")
        return {"next": "journal_insights"}

    agents = ["primary_therapist", "find_therapist", "journal_insights"]

    router_prompt = get_router_prompt(agents, state.prompt)
    system_prompt = SystemMessage(content=router_prompt)

    decision = router.invoke([
        system_prompt,
        HumanMessage(content=state.prompt),
    ])

    print(f"Router: decision: {decision}")

    return {"next": decision.step}