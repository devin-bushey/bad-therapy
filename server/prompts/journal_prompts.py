from tools.save_to_journal_tool import TOOL_SAVE_TO_JOURNAL

def get_journal_prompt() -> str:
    return (
        f"You can save messages to the users journal using a tool call to the {TOOL_SAVE_TO_JOURNAL} function." 
        f"If the user asks you to save something, use the {TOOL_SAVE_TO_JOURNAL} function to save it."
        f"If the user asks you help them write in their journal, then create a draft of a journal entry for them, "
        f"ask them if the draft sounds good, and then use the {TOOL_SAVE_TO_JOURNAL} function to save it."
    )