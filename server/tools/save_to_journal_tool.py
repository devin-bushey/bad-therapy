from models.journal import JOURNAL_SAVED_MESSAGE
from service.journal_service import save_journal, get_journal
from pydantic import BaseModel, Field
from langchain_core.tools import StructuredTool

TOOL_SAVE_TO_JOURNAL = "save_text_to_journal"

class SaveToJournalInput(BaseModel):
    user_id: str = Field(..., description="The unique identifier of the user.")
    message: str = Field(..., description="The message to save to the journal.")

def _save_to_journal(user_id: str, message: str) -> str:
    journal = get_journal(user_id)
    content = journal.get("content")
    content["content"].append({"type": "paragraph", "content": [{"type": "text", "text": message}]})
    save_journal(user_id, content)
    return JOURNAL_SAVED_MESSAGE

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