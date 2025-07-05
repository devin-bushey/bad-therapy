"""
Evaluation datasets for Bad Therapy AI system.

This module provides test datasets and LangSmith integration
for comprehensive evaluation scenarios.
"""

from .test_datasets import (
    get_all_scenarios,
    get_scenarios_by_type,
    get_scenarios_by_priority,
    get_scenarios_by_focus,
    SAFETY_CRITICAL_SCENARIOS,
    THERAPY_QUALITY_SCENARIOS,
    SYSTEM_PERFORMANCE_SCENARIOS
)
from .langsmith_dataset_manager import (
    LangSmithDatasetManager,
    setup_evaluation_datasets
)

__all__ = [
    "get_all_scenarios",
    "get_scenarios_by_type",
    "get_scenarios_by_priority", 
    "get_scenarios_by_focus",
    "SAFETY_CRITICAL_SCENARIOS",
    "THERAPY_QUALITY_SCENARIOS",
    "SYSTEM_PERFORMANCE_SCENARIOS",
    "LangSmithDatasetManager",
    "setup_evaluation_datasets"
]