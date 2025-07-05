"""
Factory for creating and managing evaluators.

This module provides a centralized factory for creating evaluators
with consistent configuration and easy registration of new evaluator types.
"""

from typing import Dict, Type, Optional, List, Any
from enum import Enum
import logging

from .base_evaluator import BaseEvaluator, EvaluationType

logger = logging.getLogger(__name__)

class EvaluatorRegistry:
    """
    Registry for managing available evaluator types.
    
    This class maintains a catalog of available evaluators and provides
    methods for registering new evaluator types and creating instances.
    """
    
    def __init__(self):
        self._evaluators: Dict[str, Type[BaseEvaluator]] = {}
        self._evaluator_configs: Dict[str, Dict[str, Any]] = {}
        
    def register(
        self,
        name: str,
        evaluator_class: Type[BaseEvaluator],
        config: Optional[Dict[str, Any]] = None
    ) -> None:
        """
        Register a new evaluator type.
        
        Args:
            name: Unique name for the evaluator
            evaluator_class: Class that implements BaseEvaluator
            config: Default configuration for the evaluator
        """
        if not issubclass(evaluator_class, BaseEvaluator):
            raise ValueError(f"Evaluator class must inherit from BaseEvaluator")
            
        self._evaluators[name] = evaluator_class
        self._evaluator_configs[name] = config or {}
        
        logger.info(f"Registered evaluator: {name}")
        
    def create(
        self,
        name: str,
        config: Optional[Dict[str, Any]] = None
    ) -> BaseEvaluator:
        """
        Create an evaluator instance by name.
        
        Args:
            name: Name of the evaluator to create
            config: Configuration overrides
            
        Returns:
            Configured evaluator instance
        """
        if name not in self._evaluators:
            raise ValueError(f"Unknown evaluator: {name}. Available: {list(self._evaluators.keys())}")
            
        evaluator_class = self._evaluators[name]
        default_config = self._evaluator_configs[name].copy()
        
        # Merge configs (provided config takes precedence)
        if config:
            default_config.update(config)
            
        return evaluator_class(**default_config)
        
    def list_evaluators(self) -> List[str]:
        """Get list of registered evaluator names."""
        return list(self._evaluators.keys())
        
    def get_evaluators_by_type(self, evaluation_type: EvaluationType) -> List[str]:
        """Get evaluators filtered by evaluation type."""
        result = []
        for name, evaluator_class in self._evaluators.items():
            # Create a temporary instance to check type
            # (This is a bit hacky but works with current architecture)
            try:
                config = self._evaluator_configs[name]
                if 'evaluation_type' in config and config['evaluation_type'] == evaluation_type:
                    result.append(name)
            except:
                pass
                
        return result
        
    def __contains__(self, name: str) -> bool:
        """Check if an evaluator is registered."""
        return name in self._evaluators
        
    def __len__(self) -> int:
        """Get number of registered evaluators."""
        return len(self._evaluators)

# Global registry instance
_registry = EvaluatorRegistry()

class EvaluatorFactory:
    """
    Factory class for creating and managing evaluators.
    
    This class provides a high-level interface for creating evaluators
    with standard configurations and batch creation capabilities.
    """
    
    def __init__(self, registry: Optional[EvaluatorRegistry] = None):
        self.registry = registry or _registry
        
    def create_evaluator(
        self,
        name: str,
        config: Optional[Dict[str, Any]] = None
    ) -> BaseEvaluator:
        """
        Create a single evaluator instance.
        
        Args:
            name: Name of the evaluator
            config: Configuration overrides
            
        Returns:
            Configured evaluator instance
        """
        return self.registry.create(name, config)
        
    def create_evaluator_suite(
        self,
        evaluation_type: Optional[EvaluationType] = None,
        evaluator_names: Optional[List[str]] = None,
        config: Optional[Dict[str, Any]] = None
    ) -> List[BaseEvaluator]:
        """
        Create a suite of evaluators.
        
        Args:
            evaluation_type: Filter by evaluation type
            evaluator_names: Specific evaluator names to include
            config: Common configuration for all evaluators
            
        Returns:
            List of configured evaluator instances
        """
        if evaluator_names:
            names = evaluator_names
        elif evaluation_type:
            names = self.registry.get_evaluators_by_type(evaluation_type)
        else:
            names = self.registry.list_evaluators()
            
        evaluators = []
        for name in names:
            try:
                evaluator = self.create_evaluator(name, config)
                evaluators.append(evaluator)
            except Exception as e:
                logger.error(f"Failed to create evaluator '{name}': {e}")
                
        return evaluators
        
    def create_safety_evaluators(
        self,
        config: Optional[Dict[str, Any]] = None
    ) -> List[BaseEvaluator]:
        """Create all safety evaluators."""
        return self.create_evaluator_suite(EvaluationType.SAFETY, config=config)
        
    def create_quality_evaluators(
        self,
        config: Optional[Dict[str, Any]] = None
    ) -> List[BaseEvaluator]:
        """Create all quality evaluators."""
        return self.create_evaluator_suite(EvaluationType.QUALITY, config=config)
        
    def create_performance_evaluators(
        self,
        config: Optional[Dict[str, Any]] = None
    ) -> List[BaseEvaluator]:
        """Create all performance evaluators."""
        return self.create_evaluator_suite(EvaluationType.PERFORMANCE, config=config)
        
    def list_available_evaluators(self) -> Dict[str, List[str]]:
        """Get a categorized list of available evaluators."""
        return {
            "safety": self.registry.get_evaluators_by_type(EvaluationType.SAFETY),
            "quality": self.registry.get_evaluators_by_type(EvaluationType.QUALITY),
            "performance": self.registry.get_evaluators_by_type(EvaluationType.PERFORMANCE),
            "all": self.registry.list_evaluators()
        }
        
    def register_evaluator(
        self,
        name: str,
        evaluator_class: Type[BaseEvaluator],
        config: Optional[Dict[str, Any]] = None
    ) -> None:
        """
        Register a new evaluator type.
        
        Args:
            name: Unique name for the evaluator
            evaluator_class: Class that implements BaseEvaluator
            config: Default configuration for the evaluator
        """
        self.registry.register(name, evaluator_class, config)

# Global factory instance
default_factory = EvaluatorFactory()

# Convenience functions using the global factory
def create_evaluator(name: str, config: Optional[Dict[str, Any]] = None) -> BaseEvaluator:
    """Create an evaluator using the global factory."""
    return default_factory.create_evaluator(name, config)

def create_evaluator_suite(
    evaluation_type: Optional[EvaluationType] = None,
    evaluator_names: Optional[List[str]] = None,
    config: Optional[Dict[str, Any]] = None
) -> List[BaseEvaluator]:
    """Create a suite of evaluators using the global factory."""
    return default_factory.create_evaluator_suite(evaluation_type, evaluator_names, config)

def register_evaluator(
    name: str,
    evaluator_class: Type[BaseEvaluator],
    config: Optional[Dict[str, Any]] = None
) -> None:
    """Register an evaluator using the global factory."""
    default_factory.register_evaluator(name, evaluator_class, config)

def list_available_evaluators() -> Dict[str, List[str]]:
    """List available evaluators using the global factory."""
    return default_factory.list_available_evaluators()