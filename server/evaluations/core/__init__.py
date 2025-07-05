"""
Core evaluation framework for Bad Therapy AI system.

This module provides the foundational classes and abstractions
for building consistent and extensible evaluators.
"""

from .base_evaluator import BaseEvaluator, EvaluationType
from .evaluator_factory import EvaluatorFactory
from .evaluation_result import EvaluationResult, BatchEvaluationResult, EvaluationStatus

__all__ = [
    "BaseEvaluator",
    "EvaluationType",
    "EvaluatorFactory", 
    "EvaluationResult",
    "BatchEvaluationResult",
    "EvaluationStatus"
]