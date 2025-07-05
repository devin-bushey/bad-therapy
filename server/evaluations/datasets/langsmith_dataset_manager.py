"""
LangSmith dataset manager for Bad Therapy AI evaluations.

This module handles creation and management of LangSmith evaluation datasets,
converting synthetic test scenarios into LangSmith-compatible format.
"""

import json
import logging
from typing import Dict, List, Any, Optional
from datetime import datetime

from langsmith import Client
from langsmith.schemas import Example, Dataset

from .test_datasets import (
    get_all_scenarios,
    get_scenarios_by_type,
    get_scenarios_by_priority,
    SAFETY_CRITICAL_SCENARIOS,
    THERAPY_QUALITY_SCENARIOS,
    SYSTEM_PERFORMANCE_SCENARIOS
)

logger = logging.getLogger(__name__)

class LangSmithDatasetManager:
    """
    Manages LangSmith evaluation datasets for Bad Therapy AI system.
    """
    
    def __init__(self, project_name: Optional[str] = None):
        self.client = Client()
        self.project_name = project_name or "bad-therapy-evaluations"
        
    def create_dataset_from_scenarios(
        self,
        scenarios: List[Dict[str, Any]],
        dataset_name: str,
        description: str = ""
    ) -> Dataset:
        """
        Create a LangSmith dataset from evaluation scenarios.
        
        Args:
            scenarios: List of evaluation scenarios
            dataset_name: Name for the dataset
            description: Description of the dataset
            
        Returns:
            Created LangSmith dataset
        """
        logger.info(f"Creating LangSmith dataset: {dataset_name}")
        
        # Check if dataset already exists
        try:
            existing_dataset = self.client.read_dataset(dataset_name=dataset_name)
            logger.info(f"Dataset '{dataset_name}' already exists, updating...")
            
            # Delete existing examples
            examples = list(self.client.list_examples(dataset_id=existing_dataset.id))
            for example in examples:
                self.client.delete_example(example.id)
            
            dataset = existing_dataset
        except Exception:
            # Create new dataset
            dataset = self.client.create_dataset(
                dataset_name=dataset_name,
                description=description
            )
            logger.info(f"Created new dataset: {dataset_name}")
        
        # Convert scenarios to LangSmith examples
        examples = []
        for i, scenario in enumerate(scenarios):
            example_data = self._scenario_to_example(scenario, i)
            example = self.client.create_example(
                dataset_id=dataset.id,
                inputs=example_data["inputs"],
                outputs=example_data["outputs"],
                metadata=example_data["metadata"]
            )
            examples.append(example)
        
        logger.info(f"Added {len(examples)} examples to dataset '{dataset_name}'")
        return dataset
    
    def _scenario_to_example(self, scenario: Dict[str, Any], index: int) -> Dict[str, Any]:
        """
        Convert evaluation scenario to LangSmith example format.
        
        Args:
            scenario: Evaluation scenario
            index: Index of the scenario
            
        Returns:
            LangSmith example data
        """
        # Input for the evaluation
        inputs = {
            "user_input": scenario["user_input"],
            "session_id": f"eval_session_{index}",
            "user_id": f"eval_user_{index}",
            "context": scenario.get("context", ""),
            "previous_responses": scenario.get("previous_responses", []),
            "expected_route": scenario.get("expected_route")
        }
        
        # Expected outputs (if available)
        outputs = {}
        if "expected_route" in scenario:
            outputs["expected_route"] = scenario["expected_route"]
        
        # Metadata for filtering and analysis
        metadata = {
            "scenario_type": scenario.get("scenario_type", "unknown"),
            "priority": scenario.get("priority", "medium"),
            "evaluation_focus": scenario.get("evaluation_focus", []),
            "created_at": datetime.now().isoformat()
        }
        
        return {
            "inputs": inputs,
            "outputs": outputs,
            "metadata": metadata
        }
    
    def create_all_evaluation_datasets(self) -> Dict[str, Dataset]:
        """
        Create all standard evaluation datasets.
        
        Returns:
            Dictionary mapping dataset names to Dataset objects
        """
        datasets = {}
        
        # Full evaluation dataset
        datasets["full_evaluation"] = self.create_dataset_from_scenarios(
            scenarios=get_all_scenarios(),
            dataset_name="bad-therapy-full-evaluation",
            description="Complete evaluation dataset for Bad Therapy AI system including safety, quality, and performance scenarios"
        )
        
        # Safety-critical dataset
        datasets["safety_critical"] = self.create_dataset_from_scenarios(
            scenarios=SAFETY_CRITICAL_SCENARIOS,
            dataset_name="bad-therapy-safety-critical",
            description="Safety-critical evaluation scenarios for crisis detection and harmful content prevention"
        )
        
        # Therapy quality dataset
        datasets["therapy_quality"] = self.create_dataset_from_scenarios(
            scenarios=THERAPY_QUALITY_SCENARIOS,
            dataset_name="bad-therapy-quality",
            description="Therapy quality evaluation scenarios for empathy, clinical appropriateness, and effectiveness"
        )
        
        # System performance dataset
        datasets["system_performance"] = self.create_dataset_from_scenarios(
            scenarios=SYSTEM_PERFORMANCE_SCENARIOS,
            dataset_name="bad-therapy-performance",
            description="System performance evaluation scenarios for routing accuracy and consistency"
        )
        
        return datasets
    
    def get_dataset(self, dataset_name: str) -> Optional[Dataset]:
        """
        Get existing LangSmith dataset by name.
        
        Args:
            dataset_name: Name of the dataset
            
        Returns:
            Dataset object if found, None otherwise
        """
        try:
            return self.client.read_dataset(dataset_name=dataset_name)
        except Exception as e:
            logger.warning(f"Dataset '{dataset_name}' not found: {e}")
            return None
    
    def list_datasets(self) -> List[Dataset]:
        """
        List all datasets in the project.
        
        Returns:
            List of Dataset objects
        """
        try:
            return list(self.client.list_datasets())
        except Exception as e:
            logger.error(f"Error listing datasets: {e}")
            return []
    
    def delete_dataset(self, dataset_name: str) -> bool:
        """
        Delete a dataset by name.
        
        Args:
            dataset_name: Name of the dataset to delete
            
        Returns:
            True if successful, False otherwise
        """
        try:
            dataset = self.get_dataset(dataset_name)
            if dataset:
                self.client.delete_dataset(dataset_id=dataset.id)
                logger.info(f"Deleted dataset: {dataset_name}")
                return True
            else:
                logger.warning(f"Dataset '{dataset_name}' not found")
                return False
        except Exception as e:
            logger.error(f"Error deleting dataset '{dataset_name}': {e}")
            return False
    
    def update_dataset_scenarios(
        self,
        dataset_name: str,
        scenarios: List[Dict[str, Any]]
    ) -> Optional[Dataset]:
        """
        Update an existing dataset with new scenarios.
        
        Args:
            dataset_name: Name of the dataset to update
            scenarios: New scenarios to add/replace
            
        Returns:
            Updated Dataset object if successful, None otherwise
        """
        try:
            dataset = self.get_dataset(dataset_name)
            if not dataset:
                logger.error(f"Dataset '{dataset_name}' not found")
                return None
            
            # Delete existing examples
            examples = list(self.client.list_examples(dataset_id=dataset.id))
            for example in examples:
                self.client.delete_example(example.id)
            
            # Add new examples
            for i, scenario in enumerate(scenarios):
                example_data = self._scenario_to_example(scenario, i)
                self.client.create_example(
                    dataset_id=dataset.id,
                    inputs=example_data["inputs"],
                    outputs=example_data["outputs"],
                    metadata=example_data["metadata"]
                )
            
            logger.info(f"Updated dataset '{dataset_name}' with {len(scenarios)} scenarios")
            return dataset
            
        except Exception as e:
            logger.error(f"Error updating dataset '{dataset_name}': {e}")
            return None
    
    def export_dataset_to_json(self, dataset_name: str, output_path: str) -> bool:
        """
        Export a dataset to JSON file for backup or analysis.
        
        Args:
            dataset_name: Name of the dataset to export
            output_path: Path to save the JSON file
            
        Returns:
            True if successful, False otherwise
        """
        try:
            dataset = self.get_dataset(dataset_name)
            if not dataset:
                logger.error(f"Dataset '{dataset_name}' not found")
                return False
            
            examples = list(self.client.list_examples(dataset_id=dataset.id))
            
            export_data = {
                "dataset_name": dataset_name,
                "description": dataset.description,
                "created_at": dataset.created_at.isoformat() if dataset.created_at else None,
                "example_count": len(examples),
                "examples": [
                    {
                        "inputs": example.inputs,
                        "outputs": example.outputs,
                        "metadata": example.metadata
                    }
                    for example in examples
                ]
            }
            
            with open(output_path, 'w') as f:
                json.dump(export_data, f, indent=2)
            
            logger.info(f"Exported dataset '{dataset_name}' to {output_path}")
            return True
            
        except Exception as e:
            logger.error(f"Error exporting dataset '{dataset_name}': {e}")
            return False

# Convenience functions for common operations
def setup_evaluation_datasets() -> Dict[str, Dataset]:
    """
    Set up all standard evaluation datasets in LangSmith.
    
    Returns:
        Dictionary mapping dataset names to Dataset objects
    """
    manager = LangSmithDatasetManager()
    return manager.create_all_evaluation_datasets()

def get_evaluation_dataset(dataset_name: str) -> Optional[Dataset]:
    """
    Get an evaluation dataset by name.
    
    Args:
        dataset_name: Name of the dataset
        
    Returns:
        Dataset object if found, None otherwise
    """
    manager = LangSmithDatasetManager()
    return manager.get_dataset(dataset_name)