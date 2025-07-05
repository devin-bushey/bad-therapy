"""
Evaluation framework for Bad Therapy AI system.

This module provides comprehensive evaluation tools for:
- Safety assessment (crisis detection, harmful content)
- Therapy quality (empathy, clinical appropriateness)
- System performance (routing accuracy, context retention)

The framework is organized into several modules:
- core: Base classes and abstractions
- evaluators: Specific evaluator implementations
- datasets: Test datasets and LangSmith integration
- runners: Evaluation automation and reporting
- integrations: External system integrations
- utils: Debug and test utilities

Public API:
- Use runners.EvaluationRunner for automated evaluation
- Use integrations.TherapyGraphEvaluator for graph-based evaluation
- Use core.EvaluatorFactory for creating custom evaluators
- Use datasets for accessing test scenarios
"""

# Import main public API components
from .core import (
    BaseEvaluator,
    EvaluatorFactory,
    EvaluationResult,
    EvaluationType
)

from .runners import EvaluationRunner
from .integrations import TherapyGraphEvaluator

# Import evaluator instances for convenience
from .evaluators import (
    # Safety evaluators
    crisis_evaluator,
    harmful_content_evaluator,
    referral_evaluator,
    safety_pass_fail_evaluator,
    
    # Quality evaluators
    empathy_evaluator,
    clinical_evaluator,
    therapeutic_effectiveness_evaluator,
    boundary_evaluator,
    
    # Performance evaluators
    router_evaluator,
    context_evaluator,
    relevance_evaluator,
    consistency_evaluator
)

# Import dataset utilities
from .datasets import (
    get_all_scenarios,
    get_scenarios_by_type,
    SAFETY_CRITICAL_SCENARIOS,
    THERAPY_QUALITY_SCENARIOS,
    SYSTEM_PERFORMANCE_SCENARIOS,
    LangSmithDatasetManager
)

# Define public API
__all__ = [
    # Core framework components
    "BaseEvaluator",
    "EvaluatorFactory",
    "EvaluationResult",
    "EvaluationType",
    
    # Main evaluation classes
    "EvaluationRunner",
    "TherapyGraphEvaluator",
    
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
    "consistency_evaluator",
    
    # Dataset utilities
    "get_all_scenarios",
    "get_scenarios_by_type",
    "SAFETY_CRITICAL_SCENARIOS",
    "THERAPY_QUALITY_SCENARIOS",
    "SYSTEM_PERFORMANCE_SCENARIOS",
    "LangSmithDatasetManager"
]

# Version info
__version__ = "1.0.0"
__author__ = "Bad Therapy AI Team"
__description__ = "Comprehensive evaluation framework for Bad Therapy AI system"