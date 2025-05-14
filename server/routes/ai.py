import time
from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from models.schemas import AIRequest
from prompts.chat_prompts import get_disclaimer, get_prompt_help, get_system_prompt
from database.conversation_history import get_conversation_history, save_conversation, update_session
from database.user_profile import get_user_profile
from utils.jwt_bearer import require_auth
from agent.agents.session_agent import generate_session_name, generate_suggested_prompts
from dotenv import load_dotenv
from langchain.chat_models import init_chat_model

router = APIRouter()

load_dotenv()
model = "openai:gpt-4.1-mini"
llm = init_chat_model(model=model, temperature=0.7)

def build_messages(history: list[dict], prompt: str, is_first_message: bool = False, user_profile: dict | None = None) -> list[dict]:
    messages = [{"role": "system", "content": get_system_prompt(is_first_message, user_profile)}]
    for entry in reversed(history):
        messages.append({"role": "user", "content": entry["prompt"]})
        messages.append({"role": "assistant", "content": entry["response"]})
    messages.append({"role": "user", "content": prompt})
    return messages

async def update_session_name(session_id: str, history: list[dict], full_response: str):
    user1 = history[0]["prompt"] if len(history) > 0 else ""
    user2 = history[1]["prompt"] if len(history) > 1 else ""
    bot2 = history[1]["response"] if len(history) > 1 else ""
    bot3 = full_response.strip()
    name = await generate_session_name(user1, user2, bot2, bot3)
    update_session(session_id=session_id, name=name)
    

@router.post("/ai/generate-stream")
async def generate_ai_response_stream(
    data: AIRequest,
    user=Depends(require_auth)
):
    state = {"prompt": data.prompt, "session_id": data.session_id, "user_id": user.sub}
    history = get_conversation_history(session_id=data.session_id, user_id=user.sub)
    is_first_message = not history
    should_update_name = history and len(history) == 2
    user_profile = get_user_profile(user_id=state["user_id"])
    messages = build_messages(history, data.prompt, is_first_message, user_profile)

    async def event_stream():
        full_response = ""
        async for chunk in llm.astream(input=messages):
            full_response += str(chunk.content)
            yield str(chunk.content)

        if is_first_message:
            prompts = await generate_suggested_prompts()
            yield '{"suggested_prompts": %s}\n' % prompts

        if should_update_name:
            await update_session_name(data.session_id, history, full_response)

        save_conversation(session_id=data.session_id, user_id=user.sub, prompt=data.prompt, response=full_response)

    return StreamingResponse(event_stream(), media_type="text/plain")
