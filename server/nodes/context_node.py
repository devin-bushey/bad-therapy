from langchain_openai import ChatOpenAI
from core.config import get_settings
from models.therapy import TherapyState
from database.conversation_history import get_relevant_context
from langchain_core.messages import SystemMessage, HumanMessage

settings = get_settings()
context_llm = ChatOpenAI(
    model="gpt-4o-mini",  # Use cheaper model for context summarization
    temperature=0.3
)

def context_node(state: TherapyState) -> TherapyState:
    """
    Retrieve and summarize relevant conversation history for the current prompt.
    Only processes context for primary_therapist route.
    """
    # Only retrieve context for primary therapist conversations
    if state.next != "primary_therapist":
        return {}
    
    # Skip context retrieval for first messages, tips, and journal insights
    if (not state.history or len(state.history) == 0) or state.is_tip_message or state.is_journal_insights:
        return {}
    
    try:
        # Get relevant past conversations
        raw_context = get_relevant_context(state.user_id, state.prompt, top_k=3)
        
        # If no relevant context found, continue without it
        if not raw_context or raw_context.strip() == "":
            return {}
        
        # Use LLM to summarize and optimize the context
        system_prompt = SystemMessage(content=(
            "You are a context summarizer for a therapy AI assistant named Arlo. "
            "Your job is to analyze relevant past conversations and create a concise summary "
            "that will help Arlo provide better therapeutic support in the current conversation.\n\n"
            "Guidelines:\n"
            "- Focus on recurring themes, patterns, and important insights from past sessions\n"
            "- Highlight relevant emotional states, coping strategies, and progress made\n"
            "- Keep the summary concise but informative (2-4 sentences)\n"
            "- Frame it as helpful context, not as direct advice\n"
            "- Maintain confidentiality and therapeutic tone"
        ))
        
        human_prompt = HumanMessage(content=(
            f"Current user message: {state.prompt}\n\n"
            f"Relevant past conversations:\n{raw_context}\n\n"
            "Please provide a concise summary of the relevant context that would help "
            "in responding to the current message."
        ))
        
        response = context_llm.invoke([system_prompt, human_prompt])
        summarized_context = response.content.strip()
        
        return {"relevant_context": summarized_context}
        
    except Exception as e:
        print(f"Error in context_node: {e}")
        # Continue without context if there's an error
        return {}