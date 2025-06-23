from models.journal_entries import JournalEntryCreate
from service.journal_entries_service import create_journal_entry_service
from pydantic import BaseModel, Field
from langchain_core.tools import StructuredTool
import re

TOOL_SAVE_TO_JOURNAL = "save_text_to_journal"
JOURNAL_SAVED_MESSAGE_TEMPLATE = "Journal entry saved! Click to view it. {{\"entry_id\": \"{entry_id}\"}}"

class SaveToJournalInput(BaseModel):
    user_id: str = Field(..., description="The unique identifier of the user.")
    message: str = Field(..., description="The message to save to the journal.")

def _generate_title_from_message(message: str) -> str:
    """Generate a title from the message content, limiting to 50 characters."""
    # Remove extra whitespace and newlines
    clean_message = re.sub(r'\s+', ' ', message.strip())
    
    # Extract first sentence or first 50 characters
    sentences = re.split(r'[.!?]+', clean_message)
    first_sentence = sentences[0].strip() if sentences else clean_message
    
    # Limit to 50 characters for title
    if len(first_sentence) <= 50:
        return first_sentence
    else:
        return first_sentence[:47] + "..."

def _convert_to_tiptap_format(message: str) -> dict:
    """Convert plain text message to TipTap JSON format."""
    return {
        "type": "doc",
        "content": [
            {
                "type": "paragraph",
                "content": [
                    {
                        "type": "text",
                        "text": message
                    }
                ]
            }
        ]
    }

def _save_to_journal(user_id: str, message: str) -> str:
    """Save message as a new journal entry using the journal entries service."""
    try:
        # Generate title from message content
        title = _generate_title_from_message(message)
        
        # Convert message to TipTap format
        content = _convert_to_tiptap_format(message)
        
        # Create journal entry
        entry_data = JournalEntryCreate(title=title, content=content)
        created_entry = create_journal_entry_service(user_id, entry_data)
        
        # Return message with entry ID for clickable link
        entry_id = created_entry.get('id')
        if entry_id:
            return JOURNAL_SAVED_MESSAGE_TEMPLATE.format(entry_id=entry_id)
        else:
            return "Journal entry saved! You can view it in your journal."
    except Exception as e:
        print(f"Error saving journal entry: {e}")
        return "Sorry, I couldn't save that to your journal. Please try again."

save_to_journal_tool = StructuredTool.from_function(
    func=_save_to_journal,
    args_schema=SaveToJournalInput,
    name=TOOL_SAVE_TO_JOURNAL,
    description=(
        "Save a message to the user's journal. "
        "Use this tool whenever the user says things like: "
        "'save', 'save this', 'remember this', 'record this', 'add to my journal', "
        "'write this down', 'save this to my journal', or 'log this reflection'. "
        "This tool requires a user_id and the message to save."
    ),

) 