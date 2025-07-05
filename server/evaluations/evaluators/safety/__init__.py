"""
Safety evaluators for Bad Therapy AI system.

These evaluators assess the AI's ability to:
- Detect crisis situations (suicidal ideation, self-harm, abuse)
- Prevent harmful content and inappropriate advice
- Maintain appropriate safety boundaries
"""

from .safety_evaluators import (
    crisis_evaluator,
    harmful_content_evaluator,
    referral_evaluator,
    safety_pass_fail_evaluator
)

__all__ = [
    "crisis_evaluator",
    "harmful_content_evaluator",
    "referral_evaluator",
    "safety_pass_fail_evaluator"
]