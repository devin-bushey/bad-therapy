"""
Main evaluation integration class for Bad Therapy AI system.

This class integrates all evaluators with the therapy graph to provide
comprehensive evaluation of the AI system's performance across safety,
therapy quality, and system performance dimensions.
"""

import asyncio
import os
import logging
from typing import Dict, List, Any, Optional
from dataclasses import dataclass

# Load environment variables first
from dotenv import load_dotenv
load_dotenv()

# Verify required environment variables
required_env_vars = [
    'OPENAI_API_KEY',
    'SUPABASE_DB_URL',
    'SUPABASE_ANON_KEY',
    'SUPABASE_PASS',
    'SUPABASE_JWT_SECRET',
    'SUPABASE_SERVICE_ROLE_KEY',
    'LANGSMITH_API_KEY',
    'PG_CRYPTO_KEY',
    'AUTH0_DOMAIN',
    'AUTH0_AUDIENCE'
]

missing_vars = [var for var in required_env_vars if not os.getenv(var)]
if missing_vars:
    raise EnvironmentError(f"Missing required environment variables: {missing_vars}")

# Import LangSmith client
from langsmith import Client
from langsmith.schemas import Example, Run

# Now import the therapy graph and other modules
from graphs.therapy_graph import build_therapy_graph
from models.therapy import TherapyState
from .safety_evaluators import (
    crisis_evaluator,
    harmful_content_evaluator,
    referral_evaluator,
    safety_pass_fail_evaluator
)
from .therapy_quality_evaluators import (
    empathy_evaluator,
    clinical_evaluator,
    therapeutic_effectiveness_evaluator,
    boundary_evaluator
)
from .system_performance_evaluators import (
    router_evaluator,
    context_evaluator,
    relevance_evaluator,
    consistency_evaluator
)

@dataclass
class EvaluationResult:
    """Result of a single evaluation."""
    evaluator_name: str
    score: int
    reasoning: str
    raw_output: str

@dataclass
class ConversationEvaluation:
    """Complete evaluation results for a conversation."""
    user_input: str
    ai_response: str
    route_taken: str
    evaluation_results: List[EvaluationResult]
    overall_safety_score: float
    overall_quality_score: float
    overall_performance_score: float

class TherapyGraphEvaluator:
    """
    Main evaluator class that runs the therapy graph through comprehensive evaluations.
    """
    
    def __init__(self, use_langsmith: bool = True):
        self.graph = build_therapy_graph()
        self.use_langsmith = use_langsmith
        self.langsmith_client = Client() if use_langsmith else None
        
        self.safety_evaluators = {
            'crisis_detection': crisis_evaluator,
            'harmful_content': harmful_content_evaluator,
            'referral_appropriateness': referral_evaluator
        }
        self.quality_evaluators = {
            'empathy': empathy_evaluator,
            'clinical_appropriateness': clinical_evaluator,
            'therapeutic_effectiveness': therapeutic_effectiveness_evaluator,
            'boundary_maintenance': boundary_evaluator
        }
        self.performance_evaluators = {
            'router_accuracy': router_evaluator,
            'context_retention': context_evaluator,
            'response_relevance': relevance_evaluator,
            'consistency': consistency_evaluator
        }
    
    async def evaluate_conversation(
        self,
        user_input: str,
        expected_route: Optional[str] = None,
        context: Optional[str] = None,
        previous_responses: Optional[List[str]] = None,
        session_id: str = "eval_session",
        user_id: str = "eval_user"
    ) -> ConversationEvaluation:
        """
        Evaluate a single conversation through the therapy graph.
        
        Args:
            user_input: The user's input to evaluate
            expected_route: Expected routing decision (for router evaluation)
            context: Previous conversation context
            previous_responses: List of previous AI responses
            session_id: Session identifier for evaluation
            user_id: User identifier for evaluation
            
        Returns:
            ConversationEvaluation with comprehensive results
        """
        # Run the input through the therapy graph
        initial_state = TherapyState(
            session_id=session_id,
            user_id=user_id,
            prompt=user_input,
            history=[],
            next="",
            is_safe="safe",
            therapists=[],
            therapists_summary="",
            current_mood=None,
            mood_context=None,
            relevant_context=context or "",
            is_tip_message=False,
            is_journal_insights=False,
            journal_insights_limit=10
        )
        
        try:
            result = await self.graph.ainvoke(initial_state)
            ai_response = result.get('response', '')
            route_taken = result.get('next', 'unknown')
            
        except Exception as e:
            # Handle graph execution errors
            ai_response = f"Error: {str(e)}"
            route_taken = "error"
        
        # Run all evaluations
        evaluation_results = []
        
        # Safety evaluations
        for eval_name, evaluator in self.safety_evaluators.items():
            try:
                result = evaluator(inputs=user_input, outputs=ai_response)
                evaluation_results.append(self._parse_evaluation_result(eval_name, result))
            except Exception as e:
                evaluation_results.append(EvaluationResult(
                    evaluator_name=eval_name,
                    score=0,
                    reasoning=f"Evaluation error: {str(e)}",
                    raw_output=str(e)
                ))
        
        # Quality evaluations
        for eval_name, evaluator in self.quality_evaluators.items():
            try:
                result = evaluator(inputs=user_input, outputs=ai_response)
                evaluation_results.append(self._parse_evaluation_result(eval_name, result))
            except Exception as e:
                evaluation_results.append(EvaluationResult(
                    evaluator_name=eval_name,
                    score=0,
                    reasoning=f"Evaluation error: {str(e)}",
                    raw_output=str(e)
                ))
        
        # Performance evaluations
        for eval_name, evaluator in self.performance_evaluators.items():
            try:
                if eval_name == 'router_accuracy' and expected_route:
                    result = evaluator(
                        inputs=user_input,
                        outputs=route_taken,
                        expected_route=expected_route
                    )
                elif eval_name == 'context_retention' and context:
                    result = evaluator(
                        inputs=user_input,
                        outputs=ai_response,
                        context=context
                    )
                elif eval_name == 'consistency' and previous_responses:
                    result = evaluator(
                        inputs=user_input,
                        outputs=ai_response,
                        previous_responses=str(previous_responses)
                    )
                else:
                    result = evaluator(inputs=user_input, outputs=ai_response)
                
                evaluation_results.append(self._parse_evaluation_result(eval_name, result))
            except Exception as e:
                evaluation_results.append(EvaluationResult(
                    evaluator_name=eval_name,
                    score=0,
                    reasoning=f"Evaluation error: {str(e)}",
                    raw_output=str(e)
                ))
        
        # Calculate overall scores
        safety_scores = [r.score for r in evaluation_results if r.evaluator_name in self.safety_evaluators]
        quality_scores = [r.score for r in evaluation_results if r.evaluator_name in self.quality_evaluators]
        performance_scores = [r.score for r in evaluation_results if r.evaluator_name in self.performance_evaluators]
        
        overall_safety_score = sum(safety_scores) / len(safety_scores) if safety_scores else 0
        overall_quality_score = sum(quality_scores) / len(quality_scores) if quality_scores else 0
        overall_performance_score = sum(performance_scores) / len(performance_scores) if performance_scores else 0
        
        return ConversationEvaluation(
            user_input=user_input,
            ai_response=ai_response,
            route_taken=route_taken,
            evaluation_results=evaluation_results,
            overall_safety_score=overall_safety_score,
            overall_quality_score=overall_quality_score,
            overall_performance_score=overall_performance_score
        )
    
    def _parse_evaluation_result(self, evaluator_name: str, raw_result: Any) -> EvaluationResult:
        """
        Parse raw evaluation result into structured format.
        
        Args:
            evaluator_name: Name of the evaluator
            raw_result: Raw result from evaluator
            
        Returns:
            Structured EvaluationResult
        """
        try:
            # Handle different result formats from OpenEvals
            if hasattr(raw_result, 'value'):
                score = raw_result.value
            elif isinstance(raw_result, dict):
                score = raw_result.get('score', 0)
            else:
                score = 0
            
            # Extract reasoning if available
            reasoning = ""
            if hasattr(raw_result, 'reasoning'):
                reasoning = raw_result.reasoning
            elif isinstance(raw_result, dict):
                reasoning = raw_result.get('reasoning', '')
            
            return EvaluationResult(
                evaluator_name=evaluator_name,
                score=int(score) if isinstance(score, (int, float)) else 0,
                reasoning=reasoning,
                raw_output=str(raw_result)
            )
        except Exception as e:
            return EvaluationResult(
                evaluator_name=evaluator_name,
                score=0,
                reasoning=f"Parse error: {str(e)}",
                raw_output=str(raw_result)
            )
    
    async def evaluate_batch(
        self,
        conversations: List[Dict[str, Any]]
    ) -> List[ConversationEvaluation]:
        """
        Evaluate multiple conversations in batch.
        
        Args:
            conversations: List of conversation dictionaries with 'user_input' and optional parameters
            
        Returns:
            List of ConversationEvaluation results
        """
        tasks = []
        for conv in conversations:
            task = self.evaluate_conversation(
                user_input=conv['user_input'],
                expected_route=conv.get('expected_route'),
                context=conv.get('context'),
                previous_responses=conv.get('previous_responses'),
                session_id=conv.get('session_id', 'eval_session'),
                user_id=conv.get('user_id', 'eval_user')
            )
            tasks.append(task)
        
        return await asyncio.gather(*tasks)
    
    def generate_report(self, evaluations: List[ConversationEvaluation]) -> Dict[str, Any]:
        """
        Generate a comprehensive evaluation report.
        
        Args:
            evaluations: List of evaluation results
            
        Returns:
            Dictionary containing evaluation report
        """
        if not evaluations:
            return {"error": "No evaluations provided"}
        
        # Calculate aggregate scores
        safety_scores = [e.overall_safety_score for e in evaluations]
        quality_scores = [e.overall_quality_score for e in evaluations]
        performance_scores = [e.overall_performance_score for e in evaluations]
        
        # Calculate individual evaluator averages
        evaluator_averages = {}
        for evaluation in evaluations:
            for result in evaluation.evaluation_results:
                if result.evaluator_name not in evaluator_averages:
                    evaluator_averages[result.evaluator_name] = []
                evaluator_averages[result.evaluator_name].append(result.score)
        
        for evaluator, scores in evaluator_averages.items():
            evaluator_averages[evaluator] = sum(scores) / len(scores)
        
        return {
            "summary": {
                "total_evaluations": len(evaluations),
                "average_safety_score": sum(safety_scores) / len(safety_scores),
                "average_quality_score": sum(quality_scores) / len(quality_scores),
                "average_performance_score": sum(performance_scores) / len(performance_scores)
            },
            "evaluator_breakdown": evaluator_averages,
            "detailed_results": [
                {
                    "user_input": e.user_input,
                    "ai_response": e.ai_response,
                    "route_taken": e.route_taken,
                    "safety_score": e.overall_safety_score,
                    "quality_score": e.overall_quality_score,
                    "performance_score": e.overall_performance_score,
                    "individual_scores": {
                        r.evaluator_name: r.score for r in e.evaluation_results
                    }
                }
                for e in evaluations
            ]
        }
    
    def run_langsmith_evaluation(
        self,
        dataset_name: str,
        experiment_name: Optional[str] = None,
        experiment_description: str = "",
        use_enhanced_target: bool = True
    ) -> Dict[str, Any]:
        """
        Run evaluation using LangSmith's client.evaluate() method.
        
        Args:
            dataset_name: Name of the LangSmith dataset to evaluate against
            experiment_name: Name for the experiment (auto-generated if None)
            experiment_description: Description of the experiment
            use_enhanced_target: Whether to use the enhanced target function with built-in evaluators
            
        Returns:
            Dictionary containing experiment results and metadata
        """
        if not self.use_langsmith or not self.langsmith_client:
            raise ValueError("LangSmith integration not enabled")
        
        # Import target functions
        if use_enhanced_target:
            from .therapy_target_function import enhanced_therapy_target_function_sync
            target_function = enhanced_therapy_target_function_sync
        else:
            from .therapy_target_function import therapy_target_function_sync
            target_function = therapy_target_function_sync
        
        # Generate experiment name if not provided
        if not experiment_name:
            from datetime import datetime
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            experiment_name = f"therapy_eval_{timestamp}"
        
        try:
            # Get dataset
            dataset = self.langsmith_client.read_dataset(dataset_name=dataset_name)
            
            # Prepare evaluators for LangSmith
            langsmith_evaluators = []
            
            # Always add the safety pass/fail evaluator (works with enhanced target)
            langsmith_evaluators.append(safety_pass_fail_evaluator)
            
            if not use_enhanced_target:
                # If not using enhanced target, we need to provide evaluators separately
                # Create simple evaluators that extract scores from the target function output
                def create_score_extractor(metric_name: str):
                    def score_extractor(run: Run, example: Example) -> Dict[str, Any]:
                        outputs = run.outputs or {}
                        score = outputs.get(f"{metric_name}_score", 0)
                        return {"key": metric_name, "score": score}
                    return score_extractor
                
                # Add score extractors for each evaluator
                for evaluator_name in self.safety_evaluators.keys():
                    langsmith_evaluators.append(create_score_extractor(evaluator_name))
                for evaluator_name in self.quality_evaluators.keys():
                    langsmith_evaluators.append(create_score_extractor(evaluator_name))
                for evaluator_name in self.performance_evaluators.keys():
                    langsmith_evaluators.append(create_score_extractor(evaluator_name))
            
            # Run evaluation
            experiment_results = self.langsmith_client.evaluate(
                target_function,
                data=dataset_name,
                evaluators=langsmith_evaluators,
                experiment_prefix=experiment_name,
                description=experiment_description,
                max_concurrency=3  # Limit concurrency to avoid API rate limits
            )
            
            # Extract results
            results_summary = {
                "experiment_name": experiment_results.experiment_name,
                "experiment_url": f"https://smith.langchain.com/datasets/{dataset.id}/experiments/{experiment_results.experiment_name}",
                "dataset_name": dataset_name,
                "dataset_id": str(dataset.id),
                "total_examples": len(list(self.langsmith_client.list_examples(dataset_id=dataset.id))),
                "use_enhanced_target": use_enhanced_target,
                "experiment_description": experiment_description
            }
            
            return results_summary
            
        except Exception as e:
            logging.error(f"Error running LangSmith evaluation: {e}")
            return {
                "error": str(e),
                "experiment_name": experiment_name,
                "dataset_name": dataset_name
            }
    
    def run_langsmith_batch_evaluation(
        self,
        datasets: List[str],
        experiment_prefix: str = "therapy_batch_eval",
        experiment_description: str = "Batch evaluation across multiple datasets"
    ) -> Dict[str, Any]:
        """
        Run evaluation across multiple datasets in LangSmith.
        
        Args:
            datasets: List of dataset names to evaluate against
            experiment_prefix: Prefix for experiment names
            experiment_description: Description for the experiments
            
        Returns:
            Dictionary containing results from all experiments
        """
        if not self.use_langsmith or not self.langsmith_client:
            raise ValueError("LangSmith integration not enabled")
        
        from datetime import datetime
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        
        batch_results = {
            "batch_id": f"{experiment_prefix}_{timestamp}",
            "timestamp": timestamp,
            "datasets_evaluated": len(datasets),
            "experiments": {}
        }
        
        for dataset_name in datasets:
            try:
                experiment_name = f"{experiment_prefix}_{dataset_name}_{timestamp}"
                
                result = self.run_langsmith_evaluation(
                    dataset_name=dataset_name,
                    experiment_name=experiment_name,
                    experiment_description=f"{experiment_description} - Dataset: {dataset_name}",
                    use_enhanced_target=True
                )
                
                batch_results["experiments"][dataset_name] = result
                
            except Exception as e:
                logging.error(f"Error evaluating dataset {dataset_name}: {e}")
                batch_results["experiments"][dataset_name] = {
                    "error": str(e),
                    "dataset_name": dataset_name
                }
        
        return batch_results
    
    def get_langsmith_experiment_results(self, experiment_name: str) -> Dict[str, Any]:
        """
        Retrieve results from a LangSmith experiment.
        
        Args:
            experiment_name: Name of the experiment
            
        Returns:
            Dictionary containing experiment results and analysis
        """
        if not self.use_langsmith or not self.langsmith_client:
            raise ValueError("LangSmith integration not enabled")
        
        try:
            # Get experiment runs
            runs = list(self.langsmith_client.list_runs(
                project_name=os.getenv("LANGSMITH_PROJECT"),
                execution_order=1,
                filter=f'eq(name, "{experiment_name}")'
            ))
            
            if not runs:
                return {"error": f"No runs found for experiment: {experiment_name}"}
            
            # Analyze results
            total_runs = len(runs)
            successful_runs = [r for r in runs if r.status == "success"]
            failed_runs = [r for r in runs if r.status == "error"]
            
            # Extract scores from successful runs
            scores = {}
            for run in successful_runs:
                if run.outputs:
                    for key, value in run.outputs.items():
                        if key.endswith("_score") or key.startswith("overall_"):
                            if key not in scores:
                                scores[key] = []
                            if isinstance(value, (int, float)):
                                scores[key].append(value)
            
            # Calculate averages
            average_scores = {}
            for score_name, values in scores.items():
                if values:
                    average_scores[score_name] = sum(values) / len(values)
            
            return {
                "experiment_name": experiment_name,
                "total_runs": total_runs,
                "successful_runs": len(successful_runs),
                "failed_runs": len(failed_runs),
                "success_rate": len(successful_runs) / total_runs if total_runs > 0 else 0,
                "average_scores": average_scores,
                "individual_scores": scores
            }
            
        except Exception as e:
            logging.error(f"Error retrieving experiment results: {e}")
            return {"error": str(e), "experiment_name": experiment_name}