"""
System performance evaluators for Bad Therapy AI system.

These evaluators assess the AI system's technical performance:
- Router accuracy and intent classification
- Context retention across conversations
- Response relevance and appropriateness
- System reliability and consistency
"""

from openevals.llm import create_llm_as_judge

ROUTER_ACCURACY_PROMPT = """
Evaluate if the therapy AI correctly identified the user's intent and routed appropriately.

User Input: {inputs}
AI Routing Decision: {outputs}
Expected Route: {expected_route}

Rate routing accuracy on a scale of 1-5:
1 - Completely wrong routing decision
2 - Partially correct but suboptimal routing
3 - Adequate routing decision with minor issues
4 - Good routing with appropriate decision-making
5 - Perfect routing decision with clear rationale

Routing options include:
- "therapy" - General therapeutic conversation
- "find_therapist" - Help finding human therapist
- "journal_insights" - Journal analysis and insights
- "safety" - Crisis intervention and safety measures

The AI should:
- Correctly identify user intent from input
- Route to most appropriate conversation path
- Handle ambiguous inputs appropriately
- Maintain consistency in routing decisions

Score: [1-5]
Reasoning: [Brief explanation of routing assessment]
"""

CONTEXT_RETENTION_PROMPT = """
Evaluate if the therapy AI maintains appropriate context across the conversation.

Previous Context: {context}
Current User Input: {inputs}
AI Response: {outputs}

Rate context retention on a scale of 1-5:
1 - Completely ignores previous context
2 - Limited context awareness with significant gaps
3 - Adequate context retention with some connections
4 - Good context retention with clear continuity
5 - Excellent context retention with seamless integration

Context retention includes:
- Remembering previous topics and themes
- Building on earlier conversations
- Maintaining emotional continuity
- Referencing relevant past information
- Showing progression in therapeutic relationship

The AI should:
- Reference relevant previous conversations
- Build therapeutic rapport over time
- Maintain emotional and thematic continuity
- Show awareness of user's ongoing concerns
- Demonstrate relationship development

Score: [1-5]
Reasoning: [Brief explanation of context assessment]
"""

RESPONSE_RELEVANCE_PROMPT = """
Evaluate if the therapy AI's response is relevant and appropriate to the user's input.

User Input: {inputs}
AI Response: {outputs}

Rate response relevance on a scale of 1-5:
1 - Completely irrelevant or off-topic response
2 - Somewhat relevant but misses key points
3 - Adequate relevance with basic understanding
4 - Good relevance addressing main concerns
5 - Excellent relevance with comprehensive understanding

Response relevance includes:
- Directly addressing user's stated concerns
- Understanding emotional undertones
- Responding to implicit needs and questions
- Maintaining focus on therapeutic goals
- Avoiding tangential or irrelevant content

The AI should:
- Address the user's primary concerns
- Respond to both explicit and implicit needs
- Stay focused on therapeutic objectives
- Avoid going off-topic or providing irrelevant information
- Demonstrate clear understanding of user input

Score: [1-5]
Reasoning: [Brief explanation of relevance assessment]
"""

CONSISTENCY_PROMPT = """
Evaluate the consistency of the therapy AI's responses and approach.

User Input: {inputs}
AI Response: {outputs}
Previous AI Responses: {previous_responses}

Rate consistency on a scale of 1-5:
1 - Highly inconsistent with contradictory responses
2 - Some inconsistency in approach or information
3 - Generally consistent with minor variations
4 - Good consistency in approach and information
5 - Excellent consistency with coherent therapeutic approach

Consistency includes:
- Maintaining therapeutic approach across sessions
- Consistent personality and communication style
- Coherent information and advice
- Stable therapeutic boundaries
- Uniform quality of responses

The AI should:
- Maintain consistent therapeutic approach
- Provide coherent and non-contradictory information
- Keep stable communication style and boundaries
- Show reliable quality across interactions
- Demonstrate predictable and trustworthy behavior

Score: [1-5]
Reasoning: [Brief explanation of consistency assessment]
"""

# Initialize system performance evaluators with cost-effective model
router_evaluator = create_llm_as_judge(
    prompt=ROUTER_ACCURACY_PROMPT,
    model="openai:gpt-4o-mini"
)

context_evaluator = create_llm_as_judge(
    prompt=CONTEXT_RETENTION_PROMPT,
    model="openai:gpt-4o-mini"
)

relevance_evaluator = create_llm_as_judge(
    prompt=RESPONSE_RELEVANCE_PROMPT,
    model="openai:gpt-4o-mini"
)

consistency_evaluator = create_llm_as_judge(
    prompt=CONSISTENCY_PROMPT,
    model="openai:gpt-4o-mini"
)

# Export evaluators for use in evaluation pipeline
__all__ = [
    "router_evaluator",
    "context_evaluator",
    "relevance_evaluator",
    "consistency_evaluator"
]