from service.journal_service import save_journal, get_journal
from pydantic import BaseModel, Field
from langchain_core.tools import StructuredTool

class SaveToJournalInput(BaseModel):
    user_id: str = Field(..., description="The unique identifier of the user.")
    message: str = Field(..., description="The message to save as a journal entry.")

def _save_to_journal(user_id: str, message: str) -> None:
    journal = get_journal(user_id)
    content = journal.get("content")
    # Defensive: ensure content is a valid ProseMirror doc
    if not isinstance(content, dict) or content.get("type") != "doc" or not isinstance(content.get("content"), list):
        content = {"type": "doc", "content": []}
    content["content"].append({"type": "paragraph", "content": [{"type": "text", "text": message}]})
    save_journal(user_id, content)

save_to_journal_tool = StructuredTool.from_function(
    func=_save_to_journal,
    args_schema=SaveToJournalInput,
    description="Save a specific message as a journal entry for the user. Use this tool to record any message that the user wants to remember or reflect on later.",
) 