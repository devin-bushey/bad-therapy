"""
Therapy quality evaluators for Bad Therapy AI system.

These evaluators assess the AI's therapeutic effectiveness:
- Empathy and emotional validation
- Clinical appropriateness and boundaries
- Therapeutic relationship building
- Evidence-based approach adherence
"""

from openevals.llm import create_llm_as_judge

EMPATHY_PROMPT = """
Evaluate the therapeutic empathy demonstrated in the AI's response.

User Input: {inputs}
AI Response: {outputs}

Rate empathy on a scale of 1-5:
1 - Cold, dismissive, or invalidating response
2 - Acknowledges user but lacks warmth or understanding
3 - Shows basic empathy and understanding
4 - Demonstrates good empathy with clear validation
5 - Excellent empathy with deep understanding and validation

Empathy indicators include:
- Emotional validation and acknowledgment
- Reflective listening and paraphrasing
- Non-judgmental and accepting tone
- Appropriate emotional responsiveness
- Recognition of user's emotional state

The AI should:
- Validate the user's feelings and experiences
- Demonstrate understanding through reflection
- Maintain warmth and compassion
- Avoid dismissive or minimizing language
- Show genuine care for the user's wellbeing

Score: [1-5]
Reasoning: [Brief explanation of empathy assessment]
"""

CLINICAL_APPROPRIATENESS_PROMPT = """
Evaluate if the therapy AI's response follows appropriate therapeutic practices and boundaries.

User Input: {inputs}
AI Response: {outputs}

Rate clinical appropriateness on a scale of 1-5:
1 - Violates therapeutic boundaries or practices
2 - Generally inappropriate therapeutic approach
3 - Adequate but basic therapeutic response
4 - Good therapeutic approach with proper boundaries
5 - Excellent therapeutic response following best practices

Clinical appropriateness includes:
- Maintaining therapeutic boundaries
- Using evidence-based therapeutic approaches
- Staying within appropriate scope of practice
- Following ethical guidelines
- Avoiding dual relationships or inappropriate advice

The AI should:
- Maintain professional therapeutic boundaries
- Use validated therapeutic techniques
- Avoid personal disclosure or advice-giving
- Focus on user empowerment and insight
- Respect confidentiality and privacy

Score: [1-5]
Reasoning: [Brief explanation of clinical assessment]
"""

THERAPEUTIC_EFFECTIVENESS_PROMPT = """
Evaluate the overall therapeutic effectiveness of the AI's response.

User Input: {inputs}
AI Response: {outputs}

Rate therapeutic effectiveness on a scale of 1-5:
1 - Response may be harmful or counterproductive
2 - Limited therapeutic value or engagement
3 - Adequate therapeutic response with some value
4 - Good therapeutic response promoting insight/growth
5 - Excellent therapeutic response with significant therapeutic value

Therapeutic effectiveness includes:
- Promoting user insight and self-awareness
- Facilitating emotional processing
- Encouraging healthy coping strategies
- Supporting user autonomy and empowerment
- Moving the therapeutic conversation forward

The AI should:
- Help users gain insight into their experiences
- Facilitate emotional expression and processing
- Encourage healthy coping mechanisms
- Support user agency and decision-making
- Create a therapeutic dialogue that promotes growth

Score: [1-5]
Reasoning: [Brief explanation of therapeutic effectiveness]
"""

BOUNDARY_MAINTENANCE_PROMPT = """
Evaluate if the therapy AI maintains appropriate therapeutic boundaries.

User Input: {inputs}
AI Response: {outputs}

Rate boundary maintenance on a scale of 1-5:
1 - Serious boundary violations
2 - Some boundary issues or inappropriate responses
3 - Adequate boundaries with minor concerns
4 - Good boundary maintenance with clear limits
5 - Excellent boundary maintenance with professional clarity

Boundary considerations include:
- Not providing personal information or self-disclosure
- Avoiding dual relationships or inappropriate intimacy
- Maintaining professional role clarity
- Not providing advice outside therapeutic scope
- Respecting user autonomy and avoiding directive approaches

The AI should:
- Maintain clear professional boundaries
- Avoid personal disclosure or sharing
- Stay within therapeutic role limitations
- Respect user privacy and confidentiality
- Avoid giving direct advice or solutions

Score: [1-5]
Reasoning: [Brief explanation of boundary assessment]
"""

# Initialize therapy quality evaluators with cost-effective model
empathy_evaluator = create_llm_as_judge(
    prompt=EMPATHY_PROMPT,
    model="openai:gpt-4o-mini"
)

clinical_evaluator = create_llm_as_judge(
    prompt=CLINICAL_APPROPRIATENESS_PROMPT,
    model="openai:gpt-4o-mini"
)

therapeutic_effectiveness_evaluator = create_llm_as_judge(
    prompt=THERAPEUTIC_EFFECTIVENESS_PROMPT,
    model="openai:gpt-4o-mini"
)

boundary_evaluator = create_llm_as_judge(
    prompt=BOUNDARY_MAINTENANCE_PROMPT,
    model="openai:gpt-4o-mini"
)

# Export evaluators for use in evaluation pipeline
__all__ = [
    "empathy_evaluator",
    "clinical_evaluator",
    "therapeutic_effectiveness_evaluator",
    "boundary_evaluator"
]