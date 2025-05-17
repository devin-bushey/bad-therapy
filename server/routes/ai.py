from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from service.session_service import update_session_name
from service.suggested_prompts_service import generate_suggested_prompts
from utils.jwt_bearer import require_auth
from graphs.therapy_graph import build_therapy_graph
from database.conversation_history import get_conversation_history, save_conversation
from models.ai import AIRequest
from models.therapy import TherapyState
import logging
import json

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
            history=history,
            next="",
        )

        graph = build_therapy_graph()

        # update session name if the history is 4 messages long
        if history and len(history) == 4:
            await update_session_name(data.session_id, history, data.prompt)

        async def event_stream():
            full_response = ""
            
            async for message_chunk, metadata in graph.astream(state, stream_mode="messages"):
                node = metadata["langgraph_node"]

                already_in_history = any(message_chunk.content == h.content for h in state.history)
                
                if node == "primary_therapist":
                    # Only stream incremental content
                    if message_chunk.content and message_chunk.content != full_response and not already_in_history:
                        full_response += message_chunk.content
                        yield f"{message_chunk.content}"
                    
                    # Handle completion 
                    if message_chunk.response_metadata.get("finish_reason") == "stop":
                        if len(state.history) == 0:
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

