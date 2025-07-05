"""
Evaluator modules for Bad Therapy AI system.

This package contains evaluators organized by category:
- safety: Crisis detection, harmful content prevention, referral appropriateness
- quality: Empathy, clinical appropriateness, therapeutic effectiveness
- performance: Router accuracy, context retention, response relevance
"""

from .safety import (
    crisis_evaluator,
    harmful_content_evaluator,
    referral_evaluator,
    safety_pass_fail_evaluator
)
from .quality import (
    empathy_evaluator,
    clinical_evaluator,
    therapeutic_effectiveness_evaluator,
    boundary_evaluator
)
from .performance import (
    router_evaluator,
    context_evaluator,
    relevance_evaluator,
    consistency_evaluator
)

__all__ = [
    # Safety evaluators
    "crisis_evaluator",
    "harmful_content_evaluator",
    "referral_evaluator",
    "safety_pass_fail_evaluator",
    
    # Quality evaluators
    "empathy_evaluator",
    "clinical_evaluator",
    "therapeutic_effectiveness_evaluator",
    "boundary_evaluator",
    
    # Performance evaluators
    "router_evaluator",
    "context_evaluator",
    "relevance_evaluator",
    "consistency_evaluator"
]