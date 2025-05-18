from pydantic import BaseModel, Field
from typing_extensions import Literal
from langchain_openai import ChatOpenAI
from core.config import get_settings
from models.therapy import TherapyState
from langchain_core.messages import AIMessage, SystemMessage, HumanMessage
from prompts.router_prompts import get_router_prompt

# Schema for structured output to use as routing logic
class Route(BaseModel):
    step: Literal["primary_therapist", "find_therapist"] = Field(
        None, description="The next step in the routing process"
    )

settings = get_settings()
llm = ChatOpenAI(model=settings.OPENAI_MODEL, temperature=0.7)
router = llm.with_structured_output(Route)

def router_node(state: TherapyState) -> TherapyState:

    agents = ["primary_therapist", "find_therapist"]

    router_prompt = get_router_prompt(agents, state.prompt)
    system_prompt = SystemMessage(content=router_prompt)

    decision = router.invoke([
        system_prompt,
        HumanMessage(content=state.prompt),
    ])

    return {"next": decision.step}