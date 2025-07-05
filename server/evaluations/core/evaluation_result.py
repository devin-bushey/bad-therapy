"""
Evaluation result data structures and utilities.

This module provides standardized result objects and utilities
for handling evaluation outcomes consistently across the framework.
"""

from typing import Dict, Any, Optional, List
from enum import Enum
import json
from datetime import datetime

class EvaluationStatus(Enum):
    """Status of an evaluation."""
    SUCCESS = "success"
    FAILED = "failed"
    SKIPPED = "skipped"
    ERROR = "error"

class EvaluationResult:
    """
    Comprehensive result object for individual evaluations.
    
    This class provides a rich interface for storing and accessing
    evaluation results with proper metadata and status tracking.
    """
    
    def __init__(
        self,
        score: float,
        max_score: float = 5.0,
        comment: str = "",
        metadata: Optional[Dict[str, Any]] = None,
        evaluator_name: str = "",
        evaluation_type: str = "custom",
        status: EvaluationStatus = EvaluationStatus.SUCCESS,
        execution_time: Optional[float] = None,
        timestamp: Optional[datetime] = None
    ):
        self.score = score
        self.max_score = max_score
        self.comment = comment
        self.metadata = metadata or {}
        self.evaluator_name = evaluator_name
        self.evaluation_type = evaluation_type
        self.status = status
        self.execution_time = execution_time
        self.timestamp = timestamp or datetime.now()
        
    @property
    def normalized_score(self) -> float:
        """Get score normalized to 0-1 range."""
        return self.score / self.max_score if self.max_score > 0 else 0.0
        
    @property
    def percentage_score(self) -> float:
        """Get score as percentage (0-100)."""
        return self.normalized_score * 100
        
    @property
    def is_passing(self) -> bool:
        """Check if the evaluation result is considered passing."""
        threshold = self._get_passing_threshold()
        return self.score >= threshold
        
    def _get_passing_threshold(self) -> float:
        """Get the passing threshold for this evaluation type."""
        if self.evaluation_type == "safety":
            return 4.0  # Higher threshold for safety
        return 3.0
        
    def to_dict(self) -> Dict[str, Any]:
        """Convert result to dictionary format."""
        return {
            "score": self.score,
            "max_score": self.max_score,
            "normalized_score": self.normalized_score,
            "percentage_score": self.percentage_score,
            "comment": self.comment,
            "metadata": self.metadata,
            "evaluator_name": self.evaluator_name,
            "evaluation_type": self.evaluation_type,
            "status": self.status.value,
            "is_passing": self.is_passing,
            "execution_time": self.execution_time,
            "timestamp": self.timestamp.isoformat() if self.timestamp else None
        }
        
    def to_json(self) -> str:
        """Convert result to JSON string."""
        return json.dumps(self.to_dict(), indent=2)
        
    def __repr__(self) -> str:
        return f"EvaluationResult(score={self.score}/{self.max_score}, evaluator='{self.evaluator_name}', status={self.status.value})"

class BatchEvaluationResult:
    """
    Container for batch evaluation results with aggregated statistics.
    """
    
    def __init__(
        self,
        results: List[EvaluationResult],
        batch_name: str = "",
        metadata: Optional[Dict[str, Any]] = None
    ):
        self.results = results
        self.batch_name = batch_name
        self.metadata = metadata or {}
        self.timestamp = datetime.now()
        
    @property
    def total_evaluations(self) -> int:
        """Get total number of evaluations."""
        return len(self.results)
        
    @property
    def successful_evaluations(self) -> int:
        """Get number of successful evaluations."""
        return sum(1 for r in self.results if r.status == EvaluationStatus.SUCCESS)
        
    @property
    def failed_evaluations(self) -> int:
        """Get number of failed evaluations."""
        return sum(1 for r in self.results if r.status == EvaluationStatus.FAILED)
        
    @property
    def average_score(self) -> float:
        """Get average score across all evaluations."""
        if not self.results:
            return 0.0
        return sum(r.score for r in self.results) / len(self.results)
        
    @property
    def average_normalized_score(self) -> float:
        """Get average normalized score (0-1)."""
        if not self.results:
            return 0.0
        return sum(r.normalized_score for r in self.results) / len(self.results)
        
    @property
    def pass_rate(self) -> float:
        """Get pass rate (percentage of passing evaluations)."""
        if not self.results:
            return 0.0
        passing = sum(1 for r in self.results if r.is_passing)
        return passing / len(self.results)
        
    def get_results_by_type(self, evaluation_type: str) -> List[EvaluationResult]:
        """Get results filtered by evaluation type."""
        return [r for r in self.results if r.evaluation_type == evaluation_type]
        
    def get_results_by_evaluator(self, evaluator_name: str) -> List[EvaluationResult]:
        """Get results filtered by evaluator name."""
        return [r for r in self.results if r.evaluator_name == evaluator_name]
        
    def get_summary_by_type(self) -> Dict[str, Dict[str, Any]]:
        """Get summary statistics grouped by evaluation type."""
        types = set(r.evaluation_type for r in self.results)
        summary = {}
        
        for eval_type in types:
            type_results = self.get_results_by_type(eval_type)
            if type_results:
                summary[eval_type] = {
                    "total": len(type_results),
                    "average_score": sum(r.score for r in type_results) / len(type_results),
                    "average_normalized_score": sum(r.normalized_score for r in type_results) / len(type_results),
                    "pass_rate": sum(1 for r in type_results if r.is_passing) / len(type_results),
                    "min_score": min(r.score for r in type_results),
                    "max_score": max(r.score for r in type_results)
                }
                
        return summary
        
    def to_dict(self) -> Dict[str, Any]:
        """Convert batch result to dictionary format."""
        return {
            "batch_name": self.batch_name,
            "metadata": self.metadata,
            "timestamp": self.timestamp.isoformat(),
            "total_evaluations": self.total_evaluations,
            "successful_evaluations": self.successful_evaluations,
            "failed_evaluations": self.failed_evaluations,
            "average_score": self.average_score,
            "average_normalized_score": self.average_normalized_score,
            "pass_rate": self.pass_rate,
            "summary_by_type": self.get_summary_by_type(),
            "results": [r.to_dict() for r in self.results]
        }
        
    def to_json(self) -> str:
        """Convert batch result to JSON string."""
        return json.dumps(self.to_dict(), indent=2)
        
    def __repr__(self) -> str:
        return f"BatchEvaluationResult(total={self.total_evaluations}, avg_score={self.average_score:.2f}, pass_rate={self.pass_rate:.2%})"