from models.therapy import TherapyState, SafetyCheckResult
from prompts.safety_prompts import get_safety_prompt
from langchain_openai import ChatOpenAI
from core.config import get_settings
from langchain_core.messages import SystemMessage, HumanMessage, AIMessage

settings = get_settings()
llm = ChatOpenAI(model=settings.OPENAI_MODEL, temperature=0.7)

def safety_node(state: TherapyState) -> TherapyState:
    system_prompt = SystemMessage(content=get_safety_prompt())
    human_prompt = HumanMessage(content=state.prompt)
    structured_llm = llm.with_structured_output(SafetyCheckResult)
    result = structured_llm.invoke([system_prompt, human_prompt])
    if result.is_safe == "safe":
        return state.model_copy(update={"is_safe": result.is_safe})
    converted_response = AIMessage(content=result.safety_response)
    return state.model_copy(update={
        "is_safe": "blocked",
        "history": state.history + [converted_response]
    })
