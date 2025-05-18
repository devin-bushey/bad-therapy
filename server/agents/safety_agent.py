import logging
from models.therapy import TherapyState
from prompts.safety_prompts import get_safety_prompt
from langchain_openai import ChatOpenAI
from core.config import get_settings
from langchain_core.messages import SystemMessage, HumanMessage, AIMessage
import json

settings = get_settings()
llm = ChatOpenAI(model=settings.OPENAI_MODEL, temperature=0.7)
logger = logging.getLogger(__name__)

def safety_agent(state: TherapyState) -> TherapyState:

    system_prompt = SystemMessage(content=get_safety_prompt())
    human_prompt = HumanMessage(content=state.prompt)

    result = llm.invoke([system_prompt, human_prompt])


    result_json = json.loads(result.content)
    is_safe = result_json["is_safe"]
    safety_response = result_json["safety_response"]

    if (is_safe == "safe"):
        return state.model_copy(update={"is_safe": is_safe})

    converted_response = AIMessage(content=safety_response)

    logger.warn(f"Safety agent blocked")

    return state.model_copy(update={
        "is_safe": "blocked",
        "history": state.history + [converted_response]
    })
