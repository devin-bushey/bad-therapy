from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from models.schemas import AIRequest
from agent.types import TherapyState
from utils.jwt_bearer import require_auth
from dotenv import load_dotenv
from langgraph.graph import StateGraph, END
from langchain_openai import ChatOpenAI
from core.config import get_settings
from database.conversation_history import get_conversation_history, save_conversation, update_session
from prompts.chat_prompts import get_system_prompt
from database.user_profile import get_user_profile
from agent.agents.session_agent import generate_session_name, generate_suggested_prompts
from langchain_core.messages import HumanMessage, AIMessage
import asyncio


load_dotenv()
settings = get_settings()

router = APIRouter()

model = "gpt-4.1-mini"
llm = ChatOpenAI(model=model, temperature=0.7)

def convert_to_langchain_messages(history: list[dict], prompt: str, is_first_message: bool = False, user_profile: dict | None = None) -> list:
    messages = [HumanMessage(content=get_system_prompt(is_first_message, user_profile))]
    for entry in reversed(history):
        messages.append(HumanMessage(content=entry["prompt"]))
        messages.append(AIMessage(content=entry["response"]))
    messages.append(HumanMessage(content=prompt))
    return messages

def primary_therapist_agent(state: TherapyState) -> TherapyState:
    response = llm.invoke(state["messages"])
    return {**state, "messages": state["messages"] + [response], "response": response.content}

def caution_handler(state: TherapyState) -> TherapyState:
    return {
        **state,
        "response": "I'm detecting some concerns in your message. Please consider reaching out to a professional or a crisis helpline for support.",
        "next": END
    }

def build_therapy_graph() -> StateGraph:
    workflow = StateGraph(TherapyState)
    # workflow.add_node("safety", safety_agent)
    workflow.add_node("primary_therapist", primary_therapist_agent)
    # workflow.add_node("caution_handler", caution_handler)
    # workflow.add_conditional_edges(
    #     "safety",
    #     lambda state: state.get("safety_level", "safe"),
    #     {
    #         "crisis": END,
    #         "caution": "caution_handler",
    #         "safe": "primary_therapist"
    #     }
    # )
    # workflow.add_edge("caution_handler", END)
    workflow.add_edge("primary_therapist", END)
    workflow.set_entry_point("primary_therapist")
    # workflow.set_entry_point("safety")
    return workflow.compile()

async def update_session_name(session_id: str, history: list[dict], full_response: str):
    user1 = history[0]["prompt"] if len(history) > 0 else ""
    user2 = history[1]["prompt"] if len(history) > 1 else ""
    bot2 = history[1]["response"] if len(history) > 1 else ""
    bot3 = full_response.strip()
    name = await generate_session_name(user1, user2, bot2, bot3)
    update_session(session_id=session_id, name=name)
    print("updated name")

@router.post("/ai/generate-stream")
async def generate_ai_response_stream(
    data: AIRequest,
    user=Depends(require_auth)
):
    history = get_conversation_history(session_id=data.session_id, user_id=user.sub)
    is_first_message = not history
    should_update_name = history and len(history) == 2
    user_profile = get_user_profile(user_id=user.sub)
    lc_messages = convert_to_langchain_messages(history, data.prompt, is_first_message, user_profile)

    state: TherapyState = {
        "session_id": data.session_id,
        "user_id": user.sub,
        "prompt": data.prompt,
        "messages": lc_messages,
        "response": "",
        "safety_level": "safe",
        "next": ""
    }

    suggested_prompts = []
    if is_first_message:
        suggested_prompts = await generate_suggested_prompts()

    loop = asyncio.get_running_loop()


    def event_stream():
        graph = build_therapy_graph()
        full_response = ""

        for message_chunk, metadata in graph.stream(state, stream_mode="messages"):
            # Stream the LLM tokens from the primary therapist
            if metadata["langgraph_node"] == "primary_therapist":
                full_response += message_chunk.content
                yield f"{message_chunk.content}"

                # print("message_chunk", message_chunk)
                # print("metadata", metadata)

                # If the primary therapist has finished generating the response: 
                # - give the suggested prompts, 
                # - update the session name 
                # - and save the conversation
                if message_chunk.response_metadata and message_chunk.response_metadata.get("finish_reason") == "stop":
                    if is_first_message:
                        # The fronted will check for "suggested_prompts" then parse the rest of the response into a json object
                        yield '\n\n{"suggested_prompts": %s}\n' % suggested_prompts
                    if should_update_name:
                        # Create a task to update the session name in the background
                        loop.create_task(update_session_name(data.session_id, history, full_response))
                    
                    # Save the conversation in supabase
                    save_conversation(session_id=data.session_id, user_id=user.sub, prompt=data.prompt, response=full_response)
                    break

    return StreamingResponse(event_stream(), media_type="text/event-stream")

