from prompts.chat_prompts import get_user_profile

def get_find_therapist_prompt(user_profile: dict | None = None) -> str:
    return (
        "Please search for a clinical counselor, psychologist, or psychiatrist. "
        "The user is looking for a therapist that is a good fit for them. "
        "Do not give generic responses. Find specific therapists that are a good fit for the user. "
        "If the user did not specify a location, search for therapists in Victoria, BC, Canada"
        "For each therapist, only include a 'website' field if you can find a valid, working website link. "
        "Do not hallucinate and make up your own website links, only use the links that you find. "
        "If you cannot find a valid website, omit the 'website' field for that therapist. "
        "Do not use psychologytoday.com links, they are not valid. "
        + get_user_profile(user_profile) + "\n\n"
    )