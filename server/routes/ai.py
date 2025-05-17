from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from service.session_service import generate_suggested_prompts
from utils.jwt_bearer import require_auth
from graphs.therapy_graph import build_therapy_graph
from database.conversation_history import get_conversation_history, save_conversation
from database.user_profile import get_user_profile
from utils.message_utils import convert_to_langchain_messages
from models.ai import AIRequest
from models.therapy import TherapyState
import logging
import json
from langchain_core.messages import AIMessage

router = APIRouter()
logger = logging.getLogger(__name__)

@router.post("/ai/generate-stream")
async def generate_ai_response_stream(
    data: AIRequest,
    user=Depends(require_auth)
):
    try:
        history = get_conversation_history(session_id=data.session_id, user_id=user.sub)
        state = TherapyState(
            session_id=data.session_id,
            user_id=user.sub,
            prompt=data.prompt,
            messages=[],
            response="",
            safety_level="safe",
            next="",
            suggested_prompts=[],
            history=history,
            latest_ai_response=AIMessage(content="")
        )

        graph = build_therapy_graph()

        async def event_stream():
            
            full_response = ""
            
            async for message_chunk, metadata in graph.astream(state, stream_mode="messages"):

                node = metadata["langgraph_node"]
                finish_reason = message_chunk.response_metadata.get("finish_reason")

                if node == "primary_therapist" and finish_reason != "stop":
                    full_response += message_chunk.content
                    yield f"{message_chunk.content}"

                if node == "primary_therapist" and finish_reason == "stop":
                    suggested_prompts = await generate_suggested_prompts()
                    yield f'\n\n' + json.dumps({"suggested_prompts": suggested_prompts}) + '\n'

                    
            save_conversation(
                session_id=data.session_id,
                user_id=user.sub,
                prompt=data.prompt,
                response=full_response
            )

        return StreamingResponse(event_stream(), media_type="text/event-stream")
    
    except Exception as e:
        logger.error(f"Error in generate_ai_response_stream: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

