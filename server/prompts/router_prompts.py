def get_router_prompt(agents: list[str], user_message: str) -> str:
    return (
        "You are an expert AI Agent orchestrator. "
        "You are given a list of agents and a user's message. "
        "You need to determine which agent to use to handle the user's message. "
        "\n\nAgent Guidelines:\n"
        "- Use 'find_therapist' if the user wants to find or locate a therapist\n"
        "- Use 'journal_insights' if the user wants analysis of their journal entries, journal insights, "
        "patterns in their writing, summaries of their thoughts, or emotional analysis of their journaling\n"
        "Common journal insights phrases: 'analyze my journal', 'insights about my entries', "
        "'patterns in my writing', 'summarize my thoughts', 'what themes do you see', "
        "'analyze my emotional patterns', 'give me insights'\n\n"
        "- Use 'primary_therapist' for all other therapeutic conversations, emotional support, and general chat\n\n"
        + "The agents are: " + ", ".join(agents) + "\n\n"
        + "The user's message is: " + user_message + "\n\n"
        + "Return only the name of the agent to use, no other text."
    )