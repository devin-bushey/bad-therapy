"""
Test script for LangSmith integration with Bad Therapy AI system.

This script tests the LangSmith evaluation setup while respecting
privacy settings (LANGSMITH_HIDE_INPUTS=true, LANGSMITH_HIDE_OUTPUTS=true).
"""

import asyncio
import logging
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def test_langsmith_integration():
    """
    Test LangSmith integration with privacy settings.
    """
    try:
        # Import evaluation components
        from .langsmith_dataset_manager import LangSmithDatasetManager
        from .therapy_graph_evaluator import TherapyGraphEvaluator
        from .therapy_target_function import therapy_target_function_sync
        
        print("✅ Successfully imported LangSmith components")
        
        # Test dataset manager
        print("\n🔄 Testing LangSmith dataset manager...")
        dataset_manager = LangSmithDatasetManager()
        datasets = dataset_manager.list_datasets()
        print(f"✅ Connected to LangSmith, found {len(datasets)} existing datasets")
        
        # Test therapy graph evaluator with LangSmith
        print("\n🔄 Testing therapy graph evaluator with LangSmith...")
        evaluator = TherapyGraphEvaluator(use_langsmith=True)
        print("✅ Created TherapyGraphEvaluator with LangSmith enabled")
        
        # Test target function
        print("\n🔄 Testing therapy target function...")
        test_input = {
            "user_input": "I'm feeling anxious about a test scenario",
            "session_id": "test_session",
            "user_id": "test_user",
            "context": "",
            "previous_responses": []
        }
        
        # Test synchronous target function
        result = therapy_target_function_sync(test_input)
        print("✅ Target function executed successfully")
        print(f"   Response length: {len(result.get('response', ''))}")
        print(f"   Route taken: {result.get('route_taken', 'unknown')}")
        print(f"   Execution successful: {result.get('execution_successful', False)}")
        
        # Check privacy settings
        print("\n🔒 Checking privacy settings...")
        hide_inputs = os.getenv("LANGSMITH_HIDE_INPUTS", "false").lower() == "true"
        hide_outputs = os.getenv("LANGSMITH_HIDE_OUTPUTS", "false").lower() == "true"
        
        print(f"   LANGSMITH_HIDE_INPUTS: {hide_inputs}")
        print(f"   LANGSMITH_HIDE_OUTPUTS: {hide_outputs}")
        
        if hide_inputs and hide_outputs:
            print("✅ Privacy settings are properly configured")
        else:
            print("⚠️  Privacy settings may not be configured for healthcare compliance")
        
        print("\n🎉 LangSmith integration test completed successfully!")
        return True
        
    except Exception as e:
        print(f"\n❌ LangSmith integration test failed: {e}")
        logger.error(f"Test error: {e}", exc_info=True)
        return False

def test_basic_imports():
    """
    Test basic imports without async functionality.
    """
    try:
        print("🔄 Testing basic imports...")
        
        # Test LangSmith client
        from langsmith import Client
        client = Client()
        print("✅ LangSmith client imported and initialized")
        
        # Test OpenEvals
        from openevals.llm import create_llm_as_judge
        print("✅ OpenEvals imported successfully")
        
        # Test dotenv
        from dotenv import load_dotenv
        load_dotenv()
        print("✅ Environment variables loaded")
        
        # Check required environment variables
        required_vars = ["OPENAI_API_KEY", "LANGSMITH_API_KEY"]
        missing_vars = [var for var in required_vars if not os.getenv(var)]
        
        if missing_vars:
            print(f"⚠️  Missing environment variables: {missing_vars}")
        else:
            print("✅ All required environment variables are present")
        
        return True
        
    except Exception as e:
        print(f"❌ Basic imports test failed: {e}")
        logger.error(f"Import error: {e}", exc_info=True)
        return False

async def main():
    """
    Main test function.
    """
    print("🧪 Starting LangSmith Integration Tests")
    print("=" * 50)
    
    # Test basic imports first
    basic_success = test_basic_imports()
    
    if basic_success:
        print("\n" + "=" * 50)
        # Test full integration
        integration_success = await test_langsmith_integration()
        
        print("\n" + "=" * 50)
        if integration_success:
            print("🎉 All tests passed! LangSmith integration is ready.")
        else:
            print("❌ Integration tests failed. Check the logs above.")
    else:
        print("❌ Basic import tests failed. Check your environment setup.")

if __name__ == "__main__":
    # Run basic tests (synchronous)
    test_basic_imports()
    
    # Run full tests (asynchronous)
    print("\n" + "=" * 50)
    print("Running full integration tests...")
    asyncio.run(main())