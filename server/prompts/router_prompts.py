def get_router_prompt(agents: list[str], user_message: str) -> str:
    return (
        "You are an expert AI Agent orchestrator. "
        "You are given a list of agents and a user's message. "
        "You need to determine which agent to use to handle the user's message. "
        "Only return the find_therapist agent if the user's message is about finding a therapist. "
        "For any other message, return the primary_therapist agent. "
        "You need to return the name of the agent to use. "
        + "The agents are: " + ", ".join(agents) + "\n\n"
        + "The user's message is: " + user_message + "\n\n"
        + "Return only the name of the agent to use, no other text."
    )