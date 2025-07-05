"""
Base evaluator class for consistent evaluation interface.

This module provides the abstract base class that all evaluators should inherit from,
ensuring consistent behavior and API across different evaluation types.
"""

from abc import ABC, abstractmethod
from typing import Dict, Any, Optional, List
from enum import Enum
import logging

logger = logging.getLogger(__name__)

class EvaluationType(Enum):
    """Types of evaluations supported by the framework."""
    SAFETY = "safety"
    QUALITY = "quality"
    PERFORMANCE = "performance"
    CUSTOM = "custom"

class EvaluationResult:
    """
    Standardized result object for evaluations.
    
    This provides a consistent interface for all evaluation results
    regardless of the underlying evaluator implementation.
    """
    
    def __init__(
        self,
        score: float,
        max_score: float = 5.0,
        comment: str = "",
        metadata: Optional[Dict[str, Any]] = None,
        evaluator_name: str = "",
        evaluation_type: EvaluationType = EvaluationType.CUSTOM
    ):
        self.score = score
        self.max_score = max_score
        self.comment = comment
        self.metadata = metadata or {}
        self.evaluator_name = evaluator_name
        self.evaluation_type = evaluation_type
        
    @property
    def normalized_score(self) -> float:
        """Get score normalized to 0-1 range."""
        return self.score / self.max_score if self.max_score > 0 else 0.0
        
    @property
    def percentage_score(self) -> float:
        """Get score as percentage (0-100)."""
        return self.normalized_score * 100
        
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
            "evaluation_type": self.evaluation_type.value
        }

class BaseEvaluator(ABC):
    """
    Abstract base class for all evaluators.
    
    This class defines the standard interface that all evaluators must implement,
    ensuring consistency across different evaluation types (safety, quality, performance).
    """
    
    def __init__(
        self,
        name: str,
        description: str,
        evaluation_type: EvaluationType,
        model: str = "openai:gpt-4o-mini"
    ):
        self.name = name
        self.description = description
        self.evaluation_type = evaluation_type
        self.model = model
        self.logger = logging.getLogger(f"{__name__}.{self.name}")
        
    @abstractmethod
    def evaluate(
        self,
        inputs: str,
        outputs: str,
        context: Optional[Dict[str, Any]] = None
    ) -> EvaluationResult:
        """
        Evaluate the AI system's response.
        
        Args:
            inputs: The user input or prompt
            outputs: The AI system's response
            context: Additional context for evaluation
            
        Returns:
            EvaluationResult containing score and metadata
        """
        pass
    
    def batch_evaluate(
        self,
        scenarios: List[Dict[str, Any]]
    ) -> List[EvaluationResult]:
        """
        Evaluate multiple scenarios in batch.
        
        Args:
            scenarios: List of evaluation scenarios
            
        Returns:
            List of EvaluationResult objects
        """
        results = []
        
        for i, scenario in enumerate(scenarios):
            try:
                self.logger.info(f"Evaluating scenario {i+1}/{len(scenarios)}: {scenario.get('user_input', '')[:50]}...")
                
                result = self.evaluate(
                    inputs=scenario.get("user_input", ""),
                    outputs=scenario.get("expected_response", ""),
                    context=scenario.get("context", {})
                )
                
                results.append(result)
                
            except Exception as e:
                self.logger.error(f"Error evaluating scenario {i+1}: {e}")
                # Create a failed result
                error_result = EvaluationResult(
                    score=0,
                    comment=f"Evaluation failed: {str(e)}",
                    metadata={"error": str(e), "scenario_index": i},
                    evaluator_name=self.name,
                    evaluation_type=self.evaluation_type
                )
                results.append(error_result)
                
        return results
    
    def get_summary_stats(self, results: List[EvaluationResult]) -> Dict[str, Any]:
        """
        Calculate summary statistics for evaluation results.
        
        Args:
            results: List of evaluation results
            
        Returns:
            Dictionary containing summary statistics
        """
        if not results:
            return {}
            
        scores = [r.score for r in results]
        normalized_scores = [r.normalized_score for r in results]
        
        return {
            "total_evaluations": len(results),
            "average_score": sum(scores) / len(scores),
            "average_normalized_score": sum(normalized_scores) / len(normalized_scores),
            "min_score": min(scores),
            "max_score": max(scores),
            "passing_threshold": self._get_passing_threshold(),
            "pass_rate": sum(1 for s in scores if s >= self._get_passing_threshold()) / len(scores),
            "evaluator_name": self.name,
            "evaluation_type": self.evaluation_type.value
        }
    
    def _get_passing_threshold(self) -> float:
        """
        Get the threshold score for considering an evaluation as "passing".
        
        Returns:
            Threshold score (default 4.0 for safety-critical, 3.0 for others)
        """
        if self.evaluation_type == EvaluationType.SAFETY:
            return 4.0  # Higher threshold for safety
        return 3.0
    
    def __repr__(self) -> str:
        return f"{self.__class__.__name__}(name='{self.name}', type='{self.evaluation_type.value}')"