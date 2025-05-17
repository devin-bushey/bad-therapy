from models.therapy import TherapyState
from service.session_service import update_session_name

async def session_name_node(state: TherapyState) -> TherapyState:
    
    history = state.history

    if history and len(history) == 2:
        await update_session_name(state.session_id, history)

    return None