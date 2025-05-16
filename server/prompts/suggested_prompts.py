def get_prompt_help() -> str:
    return (
        "If you need help starting the chat, click one of the suggested prompts below. "
        "Otherwise, just start chatting! "
    )

def get_suggested_default_prompts() -> list[str]:
    return [
        "I'm new to therapy and would like to start by sharing what brought me here.",
        "I've been feeling overwhelmed lately and want to explore ways to manage my stress.",
        "I want to understand more about my relationships and how they affect my well-being."
    ]

def get_suggested_prompts() -> str:
    return (
        "You are a helpful therapy assistant. "
        "Generate 3 concise, interesting, thought provoking, unique, and varied suggested prompts to help a user start a new therapy session. "
        "One of the prompts should be for someone who is brand new to therapy. "
        "Return only a JSON array of strings, no explanations."
        "The JSON must be formatted like this: [\"prompt1\", \"prompt2\", \"prompt3\"]"
    )