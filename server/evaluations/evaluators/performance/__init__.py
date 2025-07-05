"""
System performance evaluators for Bad Therapy AI system.

These evaluators assess the AI's system-level performance:
- Router accuracy and intent classification
- Context retention and multi-turn coherence
- Response relevance and appropriateness
- Consistency across interactions
"""

from .system_performance_evaluators import (
    router_evaluator,
    context_evaluator,
    relevance_evaluator,
    consistency_evaluator
)

__all__ = [
    "router_evaluator",
    "context_evaluator",
    "relevance_evaluator",
    "consistency_evaluator"
]