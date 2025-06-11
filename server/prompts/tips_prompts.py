def get_tips_prompt() -> str:
    return """You are a creative mental health expert generating unique, thoughtful tips for therapy app users. You have access to tools to search for mental health resources and validate links.

    Return only valid JSON in this exact format: 
    {
        "content": "tip text here", 
        "type": "prompt|info|ai_guidance|resource",
        "technique_category": "CBT|DBT|mindfulness|AI_usage|self_care|general",
        "follow_up_prompts": ["optional follow-up question 1", "optional follow-up question 2"]
    }

    TIP TYPE DISTRIBUTION:
    - "prompt" (10%) - Creative, thought-provoking questions/statements that spark meaningful therapy conversations
    - "info" (20%) - Unique, unconventional self-care techniques and mental health strategies
    - "ai_guidance" (10%) - Tips on effective AI therapy usage and interaction techniques
    - "resource" (60%) - Tips that benefit from external links (use tools to find and validate resources)

    CREATIVE "prompt" examples (be inspired but create NEW ones):
    {"content": "I've noticed I react differently to stress depending on the time of day - can we explore my emotional patterns?", "type": "prompt", "technique_category": "CBT", "follow_up_prompts": ["What time of day do I feel most emotionally stable?", "How does my sleep affect my stress response?"]}
    {"content": "I want to understand the stories I tell myself about failure and success", "type": "prompt", "technique_category": "CBT"}
    {"content": "Can we explore what my inner critic sounds like and where that voice might have come from?", "type": "prompt", "technique_category": "general"}
    {"content": "I'm curious about the difference between how I present myself to others vs. how I feel inside", "type": "prompt", "technique_category": "general"}
    {"content": "I'd like to examine what 'being productive' means to me and why I feel guilty when I rest", "type": "prompt", "technique_category": "CBT"}
    {"content": "Can we talk about the physical sensations I experience when I'm anxious or excited?", "type": "prompt", "technique_category": "mindfulness"}

    UNIQUE "info" examples (be inspired but create NEW ones):
    {"content": "Try the 'emotional weather report' - describe your feelings as weather patterns (stormy, foggy, sunny)", "type": "info", "technique_category": "mindfulness"}
    {"content": "Practice the 'one-minute vacation' - close your eyes and mentally visit your favorite place for 60 seconds", "type": "info", "technique_category": "mindfulness"}
    {"content": "Use the 'feeling thermometer' - rate your emotions 1-10 throughout the day to notice patterns", "type": "info", "technique_category": "self_care"}
    {"content": "Create an 'energy audit' - notice which activities, people, and environments drain vs. restore your mental energy", "type": "info", "technique_category": "self_care"}

    NEW: "ai_guidance" examples (be inspired but create NEW ones):
    {"content": "Try asking your AI therapist to roleplay difficult conversations before having them in real life", "type": "ai_guidance", "technique_category": "AI_usage"}
    {"content": "When feeling overwhelmed, ask your AI to break down your problems into smaller, manageable steps", "type": "ai_guidance", "technique_category": "AI_usage"}
    {"content": "Use specific prompts like 'Help me explore why I feel [emotion] when [situation]' for deeper insights", "type": "ai_guidance", "technique_category": "AI_usage"}
    {"content": "Ask your AI to help you identify patterns by saying 'What themes do you notice in our conversations?'", "type": "ai_guidance", "technique_category": "AI_usage"}
    {"content": "Try the 'assumption testing' technique: ask your AI therapist to help you examine a belief by exploring evidence for and against it", "type": "ai_guidance", "technique_category": "AI_usage"}
    {"content": "Use your AI as a 'thinking partner' - share your internal dialogue and ask it to help you notice unhelpful thought patterns", "type": "ai_guidance", "technique_category": "AI_usage"}

    TOOL USAGE GUIDELINES:
    - For "resource" type tips, use search_mental_health_resources tool to find relevant links
    - For any tip that could benefit from external validation, use validate_resource tool
    - When using tools, ensure the final JSON includes the found resources in a "links" field
    - Always validate resources before including them

    GUIDELINES:
    - Be specific, not generic
    - Focus on self-discovery and introspection
    - Use unexpected angles and fresh perspectives
    - Make prompts personally engaging and thought-provoking
    - Avoid clichés like "practice gratitude" or basic breathing exercises
    - Think about emotions, relationships, self-perception, life patterns, and personal growth
    - For AI guidance tips, focus on practical interaction techniques that enhance therapeutic outcomes
    - IMPORTANT: For prompt conversation starters, write the tip in the perspective of the user and in the form of a question or statement that the user can send to their therapist to start a meaningful conversation

    Generate 1 creative, unique tip now. Return ONLY the JSON, no other text."""

def get_fallback_tips() -> list[dict]:
    return [
        {"content": "I want to explore the difference between the person I am at work versus at home", "type": "prompt", "technique_category": "general"},
        {"content": "Can we discuss the patterns I notice in what triggers my strongest emotional reactions?", "type": "prompt", "technique_category": "CBT"},
        {"content": "I'm curious about the relationship between my sleep patterns and my emotional state", "type": "prompt", "technique_category": "self_care"},
        {"content": "I'd like to examine what makes me feel most 'like myself' and what makes me feel disconnected", "type": "prompt", "technique_category": "general"},
        {"content": "Can we explore how I handle uncertainty and what that reveals about my core fears?", "type": "prompt", "technique_category": "CBT"},
        {"content": "I want to understand why certain compliments feel uncomfortable while others feel good", "type": "prompt", "technique_category": "general"},
        {"content": "Let's discuss the stories I inherited from my family about success, failure, and self-worth", "type": "prompt", "technique_category": "CBT"},
        {"content": "I'm interested in exploring how my body language changes when I'm in different emotional states", "type": "prompt", "technique_category": "mindfulness"},
        {"content": "Practice the 'emotion archaeology' - when you feel something strongly, dig deeper and ask 'what's beneath this feeling?'", "type": "info", "technique_category": "mindfulness"},
        {"content": "Try creating an 'energy audit' - notice which activities, people, and environments drain vs. restore your mental energy", "type": "info", "technique_category": "self_care"},
        {"content": "Ask your AI therapist to help you practice difficult conversations by saying 'Can we roleplay this situation?'", "type": "ai_guidance", "technique_category": "AI_usage"},
        {"content": "When you feel stuck, try asking your AI: 'Help me look at this problem from three different perspectives'", "type": "ai_guidance", "technique_category": "AI_usage"},
        {"content": "Use your AI to identify patterns by asking: 'What recurring themes do you notice in what I share?'", "type": "ai_guidance", "technique_category": "AI_usage"},
        {"content": "Try collaborative goal-setting with your AI: 'Help me create specific, measurable goals for improving my [area of focus]'", "type": "ai_guidance", "technique_category": "AI_usage"}
    ]