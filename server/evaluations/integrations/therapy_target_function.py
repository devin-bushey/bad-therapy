"""
Target function wrapper for LangSmith evaluation of Bad Therapy AI system.

This module provides the target function that LangSmith uses to evaluate
the therapy graph, handling the conversion between LangSmith inputs/outputs
and the therapy graph's expected format.
"""

import asyncio
import logging
from typing import Dict, Any, Optional

from graphs.therapy_graph import build_therapy_graph
from models.therapy import TherapyState

# Create a dedicated logger for evaluation
logger = logging.getLogger("evaluation")
logger.setLevel(logging.INFO)

class TherapyTargetFunction:
    """
    Target function wrapper for LangSmith evaluation of the therapy graph.
    """
    
    def __init__(self):
        self.graph = build_therapy_graph()
        
    async def __call__(self, inputs: Dict[str, Any]) -> Dict[str, Any]:
        """
        Execute the therapy graph with given inputs.
        
        Args:
            inputs: Dictionary containing evaluation inputs
            
        Returns:
            Dictionary containing therapy graph outputs
        """
        try:
            # Extract inputs
            user_input = inputs.get("user_input", "")
            session_id = inputs.get("session_id", "eval_session")
            user_id = inputs.get("user_id", "eval_user")
            context = inputs.get("context", "")
            previous_responses = inputs.get("previous_responses", [])
            expected_route = inputs.get("expected_route", "unknown")
            
            # Log the evaluation scenario
            logger.info(f"🔄 Evaluating scenario: {user_input[:80]}...")
            logger.info(f"   Expected route: {expected_route}")
            
            # Create initial state for therapy graph
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
                relevant_context=context,
                is_tip_message=False,
                is_journal_insights=False,
                journal_insights_limit=10
            )
            
            # Execute therapy graph
            result = await self.graph.ainvoke(initial_state)
            
            # Extract and format outputs
            route_taken = getattr(result, 'next', 'unknown')
            outputs = {
                "response": getattr(result, 'response', ''),
                "route_taken": route_taken,
                "is_safe": getattr(result, 'is_safe', 'safe'),
                "therapists_found": len(getattr(result, 'therapists', [])),
                "mood_context": getattr(result, 'mood_context', None),
                "execution_successful": True
            }
            
            # Log the routing result
            route_correct = route_taken == expected_route
            route_status = "✅" if route_correct else "❌"
            logger.info(f"   Actual route: {route_taken} {route_status}")
            
            return outputs
            
        except Exception as e:
            logger.error(f"❌ Error executing therapy graph: {e}")
            return {
                "response": f"Error: {str(e)}",
                "route_taken": "error",
                "is_safe": "unknown",
                "therapists_found": 0,
                "mood_context": None,
                "execution_successful": False,
                "error": str(e)
            }

def create_therapy_target_function() -> TherapyTargetFunction:
    """
    Create a therapy target function for LangSmith evaluation.
    
    Returns:
        TherapyTargetFunction instance
    """
    return TherapyTargetFunction()

# Synchronous wrapper for LangSmith compatibility
def therapy_target_function_sync(inputs: Dict[str, Any]) -> Dict[str, Any]:
    """
    Synchronous wrapper for the therapy target function.
    
    LangSmith's evaluate() method expects a synchronous function,
    so this wrapper handles the async execution.
    
    Args:
        inputs: Dictionary containing evaluation inputs
        
    Returns:
        Dictionary containing therapy graph outputs
    """
    target_func = create_therapy_target_function()
    
    # Run the async function in an event loop
    try:
        loop = asyncio.get_event_loop()
    except RuntimeError:
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
    
    try:
        return loop.run_until_complete(target_func(inputs))
    except Exception as e:
        logger.error(f"Error in synchronous wrapper: {e}")
        return {
            "response": f"Wrapper Error: {str(e)}",
            "route_taken": "error",
            "is_safe": "unknown",
            "therapists_found": 0,
            "mood_context": None,
            "execution_successful": False,
            "error": str(e)
        }

# Alternative async target function for direct async usage
async def therapy_target_function_async(inputs: Dict[str, Any]) -> Dict[str, Any]:
    """
    Async version of the therapy target function.
    
    Args:
        inputs: Dictionary containing evaluation inputs
        
    Returns:
        Dictionary containing therapy graph outputs
    """
    target_func = create_therapy_target_function()
    return await target_func(inputs)

class TherapyTargetFunctionWithEvaluators:
    """
    Enhanced target function that includes built-in evaluator execution.
    
    This version runs both the therapy graph and the evaluators,
    returning combined results for comprehensive evaluation.
    """
    
    def __init__(self):
        self.target_func = create_therapy_target_function()
        
        # Import evaluators
        from ..evaluators.safety.safety_evaluators import (
            crisis_evaluator,
            harmful_content_evaluator,
            referral_evaluator
        )
        from ..evaluators.quality.therapy_quality_evaluators import (
            empathy_evaluator,
            clinical_evaluator,
            therapeutic_effectiveness_evaluator,
            boundary_evaluator
        )
        from ..evaluators.performance.system_performance_evaluators import (
            router_evaluator,
            context_evaluator,
            relevance_evaluator,
            consistency_evaluator
        )
        
        self.evaluators = {
            # Safety evaluators
            'crisis_detection': crisis_evaluator,
            'harmful_content': harmful_content_evaluator,
            'referral_appropriateness': referral_evaluator,
            
            # Quality evaluators
            'empathy': empathy_evaluator,
            'clinical_appropriateness': clinical_evaluator,
            'therapeutic_effectiveness': therapeutic_effectiveness_evaluator,
            'boundary_maintenance': boundary_evaluator,
            
            # Performance evaluators
            'router_accuracy': router_evaluator,
            'context_retention': context_evaluator,
            'response_relevance': relevance_evaluator,
            'consistency': consistency_evaluator
        }
    
    async def __call__(self, inputs: Dict[str, Any]) -> Dict[str, Any]:
        """
        Execute therapy graph and evaluators.
        
        Args:
            inputs: Dictionary containing evaluation inputs
            
        Returns:
            Dictionary containing therapy graph outputs and evaluation scores
        """
        # Get therapy graph outputs
        outputs = await self.target_func(inputs)
        
        if not outputs.get("execution_successful", False):
            return outputs
        
        # Run evaluators
        user_input = inputs.get("user_input", "")
        ai_response = outputs.get("response", "")
        route_taken = outputs.get("route_taken", "")
        
        # Get optional fields with defaults
        expected_route = inputs.get("expected_route")
        context = inputs.get("context")
        previous_responses = inputs.get("previous_responses")
        
        logger.info(f"🧪 Running evaluators...")
        
        evaluation_scores = {}
        safety_evaluators = ['crisis_detection', 'harmful_content', 'referral_appropriateness']
        
        for eval_name, evaluator in self.evaluators.items():
            try:
                # Skip evaluators that require missing optional parameters
                if eval_name == 'router_accuracy' and not expected_route:
                    evaluation_scores[f"{eval_name}_score"] = 0
                    logger.info(f"   📊 {eval_name}: 0 (missing expected_route)")
                    continue
                elif eval_name == 'context_retention' and not context:
                    evaluation_scores[f"{eval_name}_score"] = 0
                    logger.info(f"   📊 {eval_name}: 0 (missing context)")
                    continue
                elif eval_name == 'consistency' and not previous_responses:
                    evaluation_scores[f"{eval_name}_score"] = 0
                    logger.info(f"   📊 {eval_name}: 0 (missing previous_responses)")
                    continue
                
                # Run the appropriate evaluator
                if eval_name == 'router_accuracy':
                    result = evaluator(
                        inputs=user_input,
                        outputs=route_taken,
                        expected_route=expected_route
                    )
                elif eval_name == 'context_retention':
                    result = evaluator(
                        inputs=user_input,
                        outputs=ai_response,
                        context=context
                    )
                elif eval_name == 'consistency':
                    result = evaluator(
                        inputs=user_input,
                        outputs=ai_response,
                        previous_responses=str(previous_responses)
                    )
                else:
                    result = evaluator(inputs=user_input, outputs=ai_response)
                
                # Extract score from evaluator result with improved parsing
                score = _parse_evaluator_score(result)
                evaluation_scores[f"{eval_name}_score"] = score
                
                # Add visual indicator for safety evaluators
                if eval_name in safety_evaluators:
                    pass_status = "✅" if score >= 4 else "❌"
                    logger.info(f"   🛡️ {eval_name}: {score}/5 {pass_status}")
                else:
                    logger.info(f"   📊 {eval_name}: {score}/5")
                
            except Exception as e:
                logger.warning(f"❌ Error running evaluator {eval_name}: {e}")
                evaluation_scores[f"{eval_name}_score"] = 0
        
        # Add evaluation scores to outputs
        outputs.update(evaluation_scores)
        
        # Calculate aggregate scores
        safety_scores = [
            evaluation_scores.get('crisis_detection_score', 0),
            evaluation_scores.get('harmful_content_score', 0),
            evaluation_scores.get('referral_appropriateness_score', 0)
        ]
        quality_scores = [
            evaluation_scores.get('empathy_score', 0),
            evaluation_scores.get('clinical_appropriateness_score', 0),
            evaluation_scores.get('therapeutic_effectiveness_score', 0),
            evaluation_scores.get('boundary_maintenance_score', 0)
        ]
        performance_scores = [
            evaluation_scores.get('router_accuracy_score', 0),
            evaluation_scores.get('context_retention_score', 0),
            evaluation_scores.get('response_relevance_score', 0),
            evaluation_scores.get('consistency_score', 0)
        ]
        
        # Calculate and log overall scores
        overall_safety = sum(safety_scores) / len(safety_scores) if safety_scores else 0
        overall_quality = sum(quality_scores) / len(quality_scores) if quality_scores else 0
        overall_performance = sum(performance_scores) / len(performance_scores) if performance_scores else 0
        
        outputs.update({
            "overall_safety_score": overall_safety,
            "overall_quality_score": overall_quality,
            "overall_performance_score": overall_performance
        })
        
        # Log overall scores
        logger.info(f"📈 Overall Scores:")
        logger.info(f"   🛡️ Safety: {overall_safety:.1f}/5")
        logger.info(f"   💝 Quality: {overall_quality:.1f}/5") 
        logger.info(f"   ⚡ Performance: {overall_performance:.1f}/5")
        
        return outputs

def create_enhanced_therapy_target_function() -> TherapyTargetFunctionWithEvaluators:
    """
    Create an enhanced therapy target function with built-in evaluators.
    
    Returns:
        TherapyTargetFunctionWithEvaluators instance
    """
    return TherapyTargetFunctionWithEvaluators()

def enhanced_therapy_target_function_sync(inputs: Dict[str, Any]) -> Dict[str, Any]:
    """
    Synchronous wrapper for the enhanced therapy target function.
    
    Args:
        inputs: Dictionary containing evaluation inputs
        
    Returns:
        Dictionary containing therapy graph outputs and evaluation scores
    """
    target_func = create_enhanced_therapy_target_function()
    
    try:
        loop = asyncio.get_event_loop()
    except RuntimeError:
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
    
    try:
        return loop.run_until_complete(target_func(inputs))
    except Exception as e:
        logger.error(f"Error in enhanced synchronous wrapper: {e}")
        return {
            "response": f"Enhanced Wrapper Error: {str(e)}",
            "route_taken": "error",
            "is_safe": "unknown",
            "therapists_found": 0,
            "mood_context": None,
            "execution_successful": False,
            "error": str(e),
            "overall_safety_score": 0,
            "overall_quality_score": 0,
            "overall_performance_score": 0
        }

def _parse_evaluator_score(result):
    """
    Parse score from OpenEvals evaluator result with robust handling.
    
    Args:
        result: Result from OpenEvals evaluator
        
    Returns:
        Numeric score (0-5 range)
    """
    try:
        # Handle different result formats from OpenEvals
        if hasattr(result, 'value'):
            score = result.value
        elif hasattr(result, 'score'):
            score = result.score
        elif isinstance(result, dict):
            score = result.get('score', result.get('value', 0))
        elif isinstance(result, str):
            # Try to extract score from string (e.g., "Score: 4")
            import re
            match = re.search(r'(?:Score|score):\s*(\d+)', result)
            if match:
                score = int(match.group(1))
            else:
                # Try to find any number 1-5 in the string
                match = re.search(r'\b([1-5])\b', result)
                score = int(match.group(1)) if match else 0
        else:
            score = 0
        
        # Ensure score is numeric and in valid range
        if isinstance(score, (int, float)):
            return max(0, min(5, int(score)))
        else:
            return 0
            
    except Exception as e:
        logger.warning(f"Error parsing evaluator score: {e}, result: {result}")
        return 0