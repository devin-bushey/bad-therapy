from prompts.chat_prompts import get_user_profile

def get_find_therapist_prompt(user_profile: dict | None = None) -> str:
    return (
        "Please search for a clinical counselor, psychologist, or psychiatrist. "
        "The user is looking for a therapist that is a good fit for them. "
        "Do not give generic responses. Find specific therapists that are a good fit for the user. "
        "If the user did not specify a location, search for therapists in British Columbia, Canada"
        "Find real people, not companies."
        + get_user_profile(user_profile) + "\n\n"
    )