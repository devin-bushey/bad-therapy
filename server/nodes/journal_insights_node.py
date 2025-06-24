from langchain_openai import ChatOpenAI
from core.config import get_settings
from models.therapy import TherapyState
from langchain_core.messages import AIMessage, SystemMessage, HumanMessage
from prompts.journal_prompts import get_journal_insights_prompt
from service.journal_entries_service import get_journal_entries_for_insights_service
import logging

logger = logging.getLogger(__name__)
settings = get_settings()

# Use streaming model for journal insights
llm = ChatOpenAI(
    model=settings.OPENAI_MODEL, 
    temperature=0.7,
    streaming=True
)

def journal_insights_node(state: TherapyState) -> TherapyState:
    """Generate AI insights from user's journal entries and stream the response."""
    try:
        # Get recent journal entries (default to 10 most recent)
        limit = state.journal_insights_limit if hasattr(state, 'journal_insights_limit') else 10
        entries = get_journal_entries_for_insights_service(state.user_id, limit)
        
        if not entries:
            # If no journal entries, provide encouragement to start journaling
            no_entries_message = (
                "I notice you haven't written any journal entries yet. Journaling can be a powerful tool for "
                "self-reflection and understanding your emotional patterns. Would you like some guidance on "
                "how to get started with journaling, or would you prefer to talk about something else today?"
            )
            ai_message = AIMessage(content=no_entries_message)
            return {"history": state.history + [ai_message]}
        
        # Prepare the journal content for analysis
        journal_content = ""
        for i, entry in enumerate(entries, 1):
            journal_content += f"Entry {i} ({entry['created_at'][:10]}):\n"
            if entry['title'] and entry['title'] != 'Untitled Entry':
                journal_content += f"Title: {entry['title']}\n"
            # Extract text content from TipTap JSON if it's a dict
            content = entry['content']
            if isinstance(content, dict):
                # Simple extraction of text from TipTap content
                text_content = extract_text_from_tiptap(content)
                journal_content += f"Content: {text_content}\n\n"
            else:
                journal_content += f"Content: {content}\n\n"
        
        # Generate insights using the streaming LLM
        system_prompt = get_journal_insights_prompt()
        user_prompt = (
            f"Here are the user's recent journal entries:\n\n{journal_content}\n\n"
            f"Please provide thoughtful insights about their emotional patterns, growth, and any themes you notice. "
            f"Speak directly to them as their therapist, offering both observations and gentle guidance."
        )
        
        # Stream the response
        response = llm.stream([
            SystemMessage(content=system_prompt),
            HumanMessage(content=user_prompt)
        ])
        
        # Collect the full response for history
        full_content = ""
        for chunk in response:
            if chunk.content:
                full_content += chunk.content
        
        ai_message = AIMessage(content=full_content)
        logger.info(f"Generated journal insights for user {state.user_id} from {len(entries)} entries")
        
        return {"history": state.history + [ai_message]}
        
    except Exception as e:
        logger.error(f"Error in journal_insights_node: {str(e)}")
        error_message = (
            "I'm sorry, I encountered an issue while analyzing your journal entries. "
            "Please try again, or feel free to tell me about your recent thoughts and feelings directly."
        )
        ai_message = AIMessage(content=error_message)
        return {"history": state.history + [ai_message]}

def extract_text_from_tiptap(content):
    """Extract plain text from TipTap JSON content structure."""
    if not isinstance(content, dict):
        return str(content)
    
    def extract_from_node(node):
        text = ""
        if isinstance(node, dict):
            if node.get("type") == "text":
                text += node.get("text", "")
            elif "content" in node and isinstance(node["content"], list):
                for child in node["content"]:
                    text += extract_from_node(child)
            elif "text" in node:
                text += node["text"]
        return text
    
    try:
        if "content" in content and isinstance(content["content"], list):
            full_text = ""
            for node in content["content"]:
                full_text += extract_from_node(node)
            return full_text.strip()
        else:
            return extract_from_node(content).strip()
    except Exception:
        return str(content)