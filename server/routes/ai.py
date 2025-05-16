from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from models.schemas import AIRequest, TherapyState
from utils.jwt_bearer import require_auth
from graphs.therapy_graph import build_therapy_graph
from database.conversation_history import get_conversation_history, save_conversation
from database.user_profile import get_user_profile
from utils.message_utils import convert_to_langchain_messages
from service.session_service import generate_suggested_prompts, update_session_name
import asyncio
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

@router.post("/ai/generate-stream")
async def generate_ai_response_stream(
    data: AIRequest,
    user=Depends(require_auth)
):
    try:
        history = get_conversation_history(session_id=data.session_id, user_id=user.sub)
        is_first_message = not history
        should_update_name = history and len(history) == 2
        user_profile = get_user_profile(user_id=user.sub)
        
        state: TherapyState = {
            "session_id": data.session_id,
            "user_id": user.sub,
            "prompt": data.prompt,
            "messages": convert_to_langchain_messages(history, data.prompt, is_first_message, user_profile),
            "response": "",
            "safety_level": "safe",
            "next": "",
            "suggested_prompts": []
        }

        if is_first_message:
            state["suggested_prompts"] = await generate_suggested_prompts()

        async def event_stream():
            graph = build_therapy_graph()
            full_response = ""

            # Stream the LLM tokens from the primary therapist node
            async for message_chunk, metadata in graph.astream(state, stream_mode="messages"):
                if metadata["langgraph_node"] == "primary_therapist":
                    full_response += message_chunk.content
                    yield f"{message_chunk.content}"

                    # When the LLM finishes:
                    # - yield suggested prompts (if first message)
                    # - update the session name (if needed)
                    # - save the conversation
                    if message_chunk.response_metadata and message_chunk.response_metadata.get("finish_reason") == "stop":
                        if is_first_message:
                            # The frontend will check for "suggested_prompts" and parse the rest of the response into a JSON object
                            yield f'\n\n{{"suggested_prompts": {state["suggested_prompts"]}}}\n'
                        
                        if should_update_name:
                            # Create a background task to update the session name
                            asyncio.create_task(update_session_name(data.session_id, history, full_response))
                        
                        # Save the conversation in the database
                        save_conversation(
                            session_id=data.session_id,
                            user_id=user.sub,
                            prompt=data.prompt,
                            response=full_response
                        )
                        break

        return StreamingResponse(event_stream(), media_type="text/event-stream")
    
    except Exception as e:
        logger.error(f"Error in generate_ai_response_stream: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

