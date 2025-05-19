from models.journal import JOURNAL_SAVED_MESSAGE
from service.journal_service import save_journal, get_journal
from pydantic import BaseModel, Field
from langchain_core.tools import StructuredTool

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
    description="Save a message to the users journal. Use this tool whenever the user asks to save, record, or remember a message, reflection, or conversation. ",
) 