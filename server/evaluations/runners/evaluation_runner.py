"""
Automated evaluation runner for Bad Therapy AI system.

This script provides automation for running comprehensive evaluations
across different scenarios and generating detailed reports.
"""

import asyncio
import json
import logging
import os
import sys
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Any, Optional

# Load environment variables first
from dotenv import load_dotenv
load_dotenv()

# Handle imports based on execution context
try:
    # Try relative imports first (when run as module)
    from ..integrations.therapy_graph_evaluator import TherapyGraphEvaluator
    from ..datasets.langsmith_dataset_manager import LangSmithDatasetManager, setup_evaluation_datasets
    from ..datasets.test_datasets import (
        get_all_scenarios,
        get_scenarios_by_type,
        get_scenarios_by_priority,
        get_scenarios_by_focus,
        SAFETY_CRITICAL_SCENARIOS,
        THERAPY_QUALITY_SCENARIOS,
        SYSTEM_PERFORMANCE_SCENARIOS
    )
except ImportError:
    # If relative imports fail, try absolute imports (when run directly)
    server_dir = Path(__file__).parent.parent
    sys.path.insert(0, str(server_dir))
    
    from evaluations.integrations.therapy_graph_evaluator import TherapyGraphEvaluator
    from evaluations.datasets.langsmith_dataset_manager import LangSmithDatasetManager, setup_evaluation_datasets
    from evaluations.datasets.test_datasets import (
        get_all_scenarios,
        get_scenarios_by_type,
        get_scenarios_by_priority,
        get_scenarios_by_focus,
        SAFETY_CRITICAL_SCENARIOS,
        THERAPY_QUALITY_SCENARIOS,
        SYSTEM_PERFORMANCE_SCENARIOS
    )

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Suppress noisy HTTP logs
logging.getLogger("httpx").setLevel(logging.WARNING)
logging.getLogger("urllib3").setLevel(logging.WARNING)
logging.getLogger("openai").setLevel(logging.WARNING)

# Set up dedicated evaluation logger
eval_logger = logging.getLogger("evaluation")
eval_logger.setLevel(logging.INFO)

class EvaluationRunner:
    """
    Automated evaluation runner for comprehensive testing.
    """
    
    def __init__(self, output_dir: Optional[str] = None):
        self.evaluator = TherapyGraphEvaluator()
        self.output_dir = Path(output_dir or "evaluation_results")
        self.output_dir.mkdir(exist_ok=True)
        
    async def run_full_evaluation(self) -> Dict[str, Any]:
        """
        Run complete evaluation across all scenarios.
        
        Returns:
            Complete evaluation report
        """
        logger.info("Starting full evaluation suite...")
        
        # Get all scenarios
        all_scenarios = get_all_scenarios()
        logger.info(f"Running {len(all_scenarios)} evaluation scenarios")
        
        # Run evaluations
        start_time = datetime.now()
        evaluations = await self.evaluator.evaluate_batch(all_scenarios)
        end_time = datetime.now()
        
        # Generate report
        report = self.evaluator.generate_report(evaluations)
        report["metadata"] = {
            "total_scenarios": len(all_scenarios),
            "evaluation_time": str(end_time - start_time),
            "timestamp": datetime.now().isoformat(),
            "evaluator_version": "1.0.0"
        }
        
        # Save report
        await self._save_report(report, "full_evaluation")
        
        logger.info("Full evaluation completed successfully")
        return report
    
    async def run_safety_evaluation(self) -> Dict[str, Any]:
        """
        Run safety-focused evaluation.
        
        Returns:
            Safety evaluation report
        """
        logger.info("Starting safety evaluation...")
        
        # Get safety scenarios
        safety_scenarios = SAFETY_CRITICAL_SCENARIOS
        logger.info(f"Running {len(safety_scenarios)} safety scenarios")
        
        # Run evaluations
        start_time = datetime.now()
        evaluations = await self.evaluator.evaluate_batch(safety_scenarios)
        end_time = datetime.now()
        
        # Generate report
        report = self.evaluator.generate_report(evaluations)
        report["metadata"] = {
            "evaluation_type": "safety",
            "total_scenarios": len(safety_scenarios),
            "evaluation_time": str(end_time - start_time),
            "timestamp": datetime.now().isoformat()
        }
        
        # Save report
        await self._save_report(report, "safety_evaluation")
        
        logger.info("Safety evaluation completed successfully")
        return report
    
    async def run_therapy_quality_evaluation(self) -> Dict[str, Any]:
        """
        Run therapy quality evaluation.
        
        Returns:
            Therapy quality evaluation report
        """
        logger.info("Starting therapy quality evaluation...")
        
        # Get therapy quality scenarios
        quality_scenarios = THERAPY_QUALITY_SCENARIOS
        logger.info(f"Running {len(quality_scenarios)} therapy quality scenarios")
        
        # Run evaluations
        start_time = datetime.now()
        evaluations = await self.evaluator.evaluate_batch(quality_scenarios)
        end_time = datetime.now()
        
        # Generate report
        report = self.evaluator.generate_report(evaluations)
        report["metadata"] = {
            "evaluation_type": "therapy_quality",
            "total_scenarios": len(quality_scenarios),
            "evaluation_time": str(end_time - start_time),
            "timestamp": datetime.now().isoformat()
        }
        
        # Save report
        await self._save_report(report, "therapy_quality_evaluation")
        
        logger.info("Therapy quality evaluation completed successfully")
        return report
    
    async def run_system_performance_evaluation(self) -> Dict[str, Any]:
        """
        Run system performance evaluation.
        
        Returns:
            System performance evaluation report
        """
        logger.info("Starting system performance evaluation...")
        
        # Get system performance scenarios
        performance_scenarios = SYSTEM_PERFORMANCE_SCENARIOS
        logger.info(f"Running {len(performance_scenarios)} system performance scenarios")
        
        # Run evaluations
        start_time = datetime.now()
        evaluations = await self.evaluator.evaluate_batch(performance_scenarios)
        end_time = datetime.now()
        
        # Generate report
        report = self.evaluator.generate_report(evaluations)
        report["metadata"] = {
            "evaluation_type": "system_performance",
            "total_scenarios": len(performance_scenarios),
            "evaluation_time": str(end_time - start_time),
            "timestamp": datetime.now().isoformat()
        }
        
        # Save report
        await self._save_report(report, "system_performance_evaluation")
        
        logger.info("System performance evaluation completed successfully")
        return report
    
    async def run_custom_evaluation(
        self,
        scenarios: List[Dict[str, Any]],
        evaluation_name: str = "custom"
    ) -> Dict[str, Any]:
        """
        Run evaluation with custom scenarios.
        
        Args:
            scenarios: List of custom scenarios to evaluate
            evaluation_name: Name for the evaluation
            
        Returns:
            Custom evaluation report
        """
        logger.info(f"Starting custom evaluation: {evaluation_name}")
        logger.info(f"Running {len(scenarios)} custom scenarios")
        
        # Run evaluations
        start_time = datetime.now()
        evaluations = await self.evaluator.evaluate_batch(scenarios)
        end_time = datetime.now()
        
        # Generate report
        report = self.evaluator.generate_report(evaluations)
        report["metadata"] = {
            "evaluation_type": "custom",
            "evaluation_name": evaluation_name,
            "total_scenarios": len(scenarios),
            "evaluation_time": str(end_time - start_time),
            "timestamp": datetime.now().isoformat()
        }
        
        # Save report
        await self._save_report(report, f"custom_{evaluation_name}")
        
        logger.info(f"Custom evaluation '{evaluation_name}' completed successfully")
        return report
    
    async def run_regression_test(self, baseline_report_path: str) -> Dict[str, Any]:
        """
        Run regression testing against a baseline report.
        
        Args:
            baseline_report_path: Path to baseline evaluation report
            
        Returns:
            Regression test report
        """
        logger.info("Starting regression testing...")
        
        # Load baseline report
        try:
            with open(baseline_report_path, 'r') as f:
                baseline_report = json.load(f)
        except FileNotFoundError:
            logger.error(f"Baseline report not found: {baseline_report_path}")
            raise
        
        # Run current evaluation
        current_report = await self.run_full_evaluation()
        
        # Compare reports
        regression_results = self._compare_reports(baseline_report, current_report)
        
        # Save regression report
        await self._save_report(regression_results, "regression_test")
        
        logger.info("Regression testing completed successfully")
        return regression_results
    
    def _compare_reports(self, baseline: Dict[str, Any], current: Dict[str, Any]) -> Dict[str, Any]:
        """
        Compare two evaluation reports for regression testing.
        
        Args:
            baseline: Baseline evaluation report
            current: Current evaluation report
            
        Returns:
            Regression comparison report
        """
        baseline_summary = baseline.get("summary", {})
        current_summary = current.get("summary", {})
        
        # Calculate score differences
        safety_diff = current_summary.get("average_safety_score", 0) - baseline_summary.get("average_safety_score", 0)
        quality_diff = current_summary.get("average_quality_score", 0) - baseline_summary.get("average_quality_score", 0)
        performance_diff = current_summary.get("average_performance_score", 0) - baseline_summary.get("average_performance_score", 0)
        
        # Determine regression status
        regression_threshold = -0.1  # 10% decrease is considered regression
        
        regressions = []
        if safety_diff < regression_threshold:
            regressions.append(f"Safety score decreased by {abs(safety_diff):.2f}")
        if quality_diff < regression_threshold:
            regressions.append(f"Quality score decreased by {abs(quality_diff):.2f}")
        if performance_diff < regression_threshold:
            regressions.append(f"Performance score decreased by {abs(performance_diff):.2f}")
        
        return {
            "regression_detected": len(regressions) > 0,
            "regressions": regressions,
            "score_changes": {
                "safety_change": safety_diff,
                "quality_change": quality_diff,
                "performance_change": performance_diff
            },
            "baseline_scores": {
                "safety": baseline_summary.get("average_safety_score", 0),
                "quality": baseline_summary.get("average_quality_score", 0),
                "performance": baseline_summary.get("average_performance_score", 0)
            },
            "current_scores": {
                "safety": current_summary.get("average_safety_score", 0),
                "quality": current_summary.get("average_quality_score", 0),
                "performance": current_summary.get("average_performance_score", 0)
            },
            "timestamp": datetime.now().isoformat()
        }
    
    async def _save_report(self, report: Dict[str, Any], filename: str) -> None:
        """
        Save evaluation report to file.
        
        Args:
            report: Evaluation report to save
            filename: Base filename for the report
        """
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        report_path = self.output_dir / f"{filename}_{timestamp}.json"
        
        with open(report_path, 'w') as f:
            json.dump(report, f, indent=2)
        
        logger.info(f"Report saved to: {report_path}")
    
    def print_summary(self, report: Dict[str, Any]) -> None:
        """
        Print a summary of evaluation results.
        
        Args:
            report: Evaluation report to summarize
        """
        summary = report.get("summary", {})
        
        print("\n" + "="*60)
        print("EVALUATION SUMMARY")
        print("="*60)
        print(f"Total Evaluations: {summary.get('total_evaluations', 0)}")
        print(f"Safety Score: {summary.get('average_safety_score', 0):.2f}/5.0")
        print(f"Quality Score: {summary.get('average_quality_score', 0):.2f}/5.0")
        print(f"Performance Score: {summary.get('average_performance_score', 0):.2f}/5.0")
        
        if "evaluator_breakdown" in report:
            print("\nEvaluator Breakdown:")
            for evaluator, score in report["evaluator_breakdown"].items():
                print(f"  {evaluator}: {score:.2f}/5.0")
        
        print("="*60)
    
    def setup_langsmith_datasets(self) -> Dict[str, Any]:
        """
        Set up LangSmith evaluation datasets.
        
        Returns:
            Dictionary containing dataset creation results
        """
        logger.info("Setting up LangSmith evaluation datasets...")
        
        try:
            dataset_manager = LangSmithDatasetManager()
            datasets = dataset_manager.create_all_evaluation_datasets()
            
            result = {
                "success": True,
                "datasets_created": len(datasets),
                "datasets": {
                    name: {
                        "id": str(dataset.id),
                        "name": dataset.name,
                        "description": dataset.description
                    } for name, dataset in datasets.items()
                }
            }
            
            logger.info(f"Successfully created {len(datasets)} LangSmith datasets")
            return result
            
        except Exception as e:
            logger.error(f"Error setting up LangSmith datasets: {e}")
            return {
                "success": False,
                "error": str(e)
            }
    
    def run_langsmith_evaluation(
        self,
        dataset_name: str,
        experiment_name: Optional[str] = None,
        experiment_description: str = ""
    ) -> Dict[str, Any]:
        """
        Run evaluation using LangSmith experiments.
        
        Args:
            dataset_name: Name of the LangSmith dataset
            experiment_name: Name for the experiment
            experiment_description: Description of the experiment
            
        Returns:
            Dictionary containing experiment results
        """
        logger.info(f"🚀 Starting LangSmith evaluation on dataset: {dataset_name}")
        
        try:
            result = self.evaluator.run_langsmith_evaluation(
                dataset_name=dataset_name,
                experiment_name=experiment_name,
                experiment_description=experiment_description
            )
            
            if "error" not in result:
                logger.info(f"✅ LangSmith evaluation completed successfully!")
                logger.info(f"📊 Total examples evaluated: {result.get('total_examples', 'N/A')}")
                logger.info(f"🔗 View results: {result.get('experiment_url', 'N/A')}")
            else:
                logger.error(f"❌ Evaluation failed: {result.get('error', 'Unknown error')}")
            
            return result
            
        except Exception as e:
            logger.error(f"❌ Error running LangSmith evaluation: {e}")
            return {
                "error": str(e),
                "dataset_name": dataset_name
            }
    
    def run_langsmith_batch_evaluation(
        self,
        datasets: Optional[List[str]] = None,
        experiment_prefix: str = "therapy_batch_eval"
    ) -> Dict[str, Any]:
        """
        Run batch evaluation across multiple LangSmith datasets.
        
        Args:
            datasets: List of dataset names (uses all standard datasets if None)
            experiment_prefix: Prefix for experiment names
            
        Returns:
            Dictionary containing batch evaluation results
        """
        if datasets is None:
            datasets = [
                "bad-therapy-full-evaluation",
                "bad-therapy-safety-critical", 
                "bad-therapy-quality",
                "bad-therapy-performance"
            ]
        
        logger.info(f"Running LangSmith batch evaluation on {len(datasets)} datasets")
        
        try:
            result = self.evaluator.run_langsmith_batch_evaluation(
                datasets=datasets,
                experiment_prefix=experiment_prefix
            )
            
            successful_experiments = [
                exp for exp in result["experiments"].values()
                if "error" not in exp
            ]
            
            logger.info(f"Batch evaluation completed: {len(successful_experiments)}/{len(datasets)} successful")
            
            return result
            
        except Exception as e:
            logger.error(f"Error running LangSmith batch evaluation: {e}")
            return {
                "error": str(e),
                "datasets": datasets
            }
    
    def get_langsmith_experiment_results(self, experiment_name: str) -> Dict[str, Any]:
        """
        Get results from a LangSmith experiment.
        
        Args:
            experiment_name: Name of the experiment
            
        Returns:
            Dictionary containing experiment results
        """
        logger.info(f"Retrieving LangSmith experiment results: {experiment_name}")
        
        try:
            result = self.evaluator.get_langsmith_experiment_results(experiment_name)
            
            if "error" not in result:
                logger.info(f"Successfully retrieved results for experiment: {experiment_name}")
            
            return result
            
        except Exception as e:
            logger.error(f"Error retrieving experiment results: {e}")
            return {
                "error": str(e),
                "experiment_name": experiment_name
            }

# CLI interface for running evaluations
async def main():
    """
    Main CLI interface for running evaluations.
    """
    import argparse
    
    parser = argparse.ArgumentParser(description="Run Bad Therapy AI evaluations")
    parser.add_argument(
        "--type",
        choices=["full", "safety", "quality", "performance", "langsmith-setup", "langsmith-eval", "langsmith-batch"],
        default="full",
        help="Type of evaluation to run"
    )
    parser.add_argument(
        "--output-dir",
        default="evaluation_results",
        help="Directory to save evaluation results"
    )
    parser.add_argument(
        "--baseline",
        help="Path to baseline report for regression testing"
    )
    parser.add_argument(
        "--langsmith-dataset",
        help="LangSmith dataset name for evaluation"
    )
    parser.add_argument(
        "--experiment-name",
        help="Name for LangSmith experiment"
    )
    parser.add_argument(
        "--experiment-description",
        default="",
        help="Description for LangSmith experiment"
    )
    
    args = parser.parse_args()
    
    # Create evaluation runner
    runner = EvaluationRunner(output_dir=args.output_dir)
    
    # Run specified evaluation
    if args.type == "langsmith-setup":
        # Set up LangSmith datasets
        report = runner.setup_langsmith_datasets()
        print("\nLangSmith Dataset Setup Results:")
        print(json.dumps(report, indent=2))
        
    elif args.type == "langsmith-eval":
        # Run LangSmith evaluation
        if not args.langsmith_dataset:
            print("Error: --langsmith-dataset is required for langsmith-eval")
            return
        
        report = runner.run_langsmith_evaluation(
            dataset_name=args.langsmith_dataset,
            experiment_name=args.experiment_name,
            experiment_description=args.experiment_description
        )
        print("\nLangSmith Evaluation Results:")
        print(json.dumps(report, indent=2))
        
    elif args.type == "langsmith-batch":
        # Run LangSmith batch evaluation
        report = runner.run_langsmith_batch_evaluation(
            experiment_prefix=args.experiment_name or "therapy_batch_eval"
        )
        print("\nLangSmith Batch Evaluation Results:")
        print(json.dumps(report, indent=2))
        
    elif args.baseline:
        report = await runner.run_regression_test(args.baseline)
        runner.print_summary(report)
        
    elif args.type == "full":
        report = await runner.run_full_evaluation()
        runner.print_summary(report)
        
    elif args.type == "safety":
        report = await runner.run_safety_evaluation()
        runner.print_summary(report)
        
    elif args.type == "quality":
        report = await runner.run_therapy_quality_evaluation()
        runner.print_summary(report)
        
    elif args.type == "performance":
        report = await runner.run_system_performance_evaluation()
        runner.print_summary(report)

if __name__ == "__main__":
    asyncio.run(main())