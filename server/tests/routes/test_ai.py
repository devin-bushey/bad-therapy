import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, AsyncMock, MagicMock
from main import app
from routes.ai import require_auth
import json

client = TestClient(app)

@pytest.fixture(autouse=True)
def override_auth():
    app.dependency_overrides.clear()
    app.dependency_overrides[require_auth] = lambda: MagicMock(sub='user1')
    yield
    app.dependency_overrides.clear()

@pytest.fixture
def mock_ai_request():
    return {
        "session_id": "sess1",
        "prompt": "Hello",
    }

def stream_to_str(response):
    return b"".join(response.iter_bytes()).decode()

def test_stream_success(mock_ai_request):
    with patch('routes.ai.get_conversation_history', return_value=[{"role": "user", "content": "Hi"}]), \
         patch('routes.ai.get_user_profile', return_value={}), \
         patch('routes.ai.convert_to_langchain_messages', return_value=[]), \
         patch('routes.ai.build_therapy_graph') as mock_graph, \
         patch('routes.ai.save_conversation') as mock_save:
        async def fake_astream(state, stream_mode):
            yield MagicMock(content='AI response', response_metadata={"finish_reason": "stop"}), {"langgraph_node": "primary_therapist"}
        mock_graph.return_value.astream = fake_astream
        response = client.post("/ai/generate-stream", json=mock_ai_request)
        assert response.status_code == 200
        assert "AI response" in stream_to_str(response)
        assert mock_save.called

def test_first_message_suggested_prompts(mock_ai_request):
    with patch('routes.ai.get_conversation_history', return_value=[]), \
         patch('routes.ai.get_user_profile', return_value={}), \
         patch('routes.ai.convert_to_langchain_messages', return_value=[]), \
         patch('routes.ai.generate_suggested_prompts', new_callable=AsyncMock, return_value=["Prompt1"]), \
         patch('routes.ai.build_therapy_graph') as mock_graph:
        async def fake_astream(state, stream_mode):
            yield MagicMock(content='AI response', response_metadata={"finish_reason": "stop"}), {"langgraph_node": "primary_therapist"}
        mock_graph.return_value.astream = fake_astream
        response = client.post("/ai/generate-stream", json=mock_ai_request)
        body = stream_to_str(response)
        # Extract the JSON object from the response body
        start = body.find('{')
        end = body.rfind('}') + 1
        if start != -1 and end != -1:
            try:
                data = json.loads(body[start:end].replace("'", '"'))
                assert "Prompt1" in data["suggested_prompts"]
            except Exception:
                assert False, f"Could not parse suggested_prompts JSON: {body}"
        else:
            assert False, f"No JSON object found in response: {body}"

def test_session_name_update_triggered(mock_ai_request):
    with patch('routes.ai.get_conversation_history', return_value=[1, 2]), \
         patch('routes.ai.get_user_profile', return_value={}), \
         patch('routes.ai.convert_to_langchain_messages', return_value=[]), \
         patch('routes.ai.build_therapy_graph') as mock_graph, \
         patch('routes.ai.update_session_name', new_callable=AsyncMock) as mock_update:
        async def fake_astream(state, stream_mode):
            yield MagicMock(content='AI response', response_metadata={"finish_reason": "stop"}), {"langgraph_node": "primary_therapist"}
        mock_graph.return_value.astream = fake_astream
        client.post("/ai/generate-stream", json=mock_ai_request)
        assert mock_update.called

def test_error_handling_returns_500(mock_ai_request):
    with patch('routes.ai.get_conversation_history', side_effect=Exception("fail")):
        response = client.post("/ai/generate-stream", json=mock_ai_request)
        assert response.status_code == 500
        assert response.json()["detail"] == "Internal server error"

def test_input_validation():
    response = client.post("/ai/generate-stream", json={})
    assert response.status_code == 422

def test_auth_required():
    app.dependency_overrides.clear()
    with patch('routes.ai.require_auth', side_effect=Exception("unauth")):
        response = client.post("/ai/generate-stream", json={"session_id": "sess1", "prompt": "hi"})
        assert response.status_code in (401, 403, 500)
    app.dependency_overrides[require_auth] = lambda: MagicMock(sub='user1')

def test_stream_ends_on_finish_reason(mock_ai_request):
    with patch('routes.ai.get_conversation_history', return_value=[{"role": "user", "content": "Hi"}]), \
         patch('routes.ai.get_user_profile', return_value={}), \
         patch('routes.ai.convert_to_langchain_messages', return_value=[]), \
         patch('routes.ai.build_therapy_graph') as mock_graph:
        async def fake_astream(state, stream_mode):
            yield MagicMock(content='AI response', response_metadata={"finish_reason": "stop"}), {"langgraph_node": "primary_therapist"}
            yield MagicMock(content='Should not appear', response_metadata={}), {"langgraph_node": "primary_therapist"}
        mock_graph.return_value.astream = fake_astream
        response = client.post("/ai/generate-stream", json=mock_ai_request)
        body = stream_to_str(response)
        assert "Should not appear" not in body 

def test_suggested_prompts_json_format(mock_ai_request):
    with patch('routes.ai.get_conversation_history', return_value=[]), \
         patch('routes.ai.get_user_profile', return_value={}), \
         patch('routes.ai.convert_to_langchain_messages', return_value=[]), \
         patch('routes.ai.generate_suggested_prompts', new_callable=AsyncMock, return_value=["Prompt1", 'Prompt2', 'Prompt3']), \
         patch('routes.ai.build_therapy_graph') as mock_graph:
        async def fake_astream(state, stream_mode):
            yield MagicMock(content='AI response', response_metadata={"finish_reason": "stop"}), {"langgraph_node": "primary_therapist"}
        mock_graph.return_value.astream = fake_astream
        response = client.post("/ai/generate-stream", json=mock_ai_request)
        body = stream_to_str(response)
        # Extract the JSON object from the response body
        start = body.find('{')
        end = body.rfind('}') + 1
        assert start != -1 and end != -1, f"No JSON object found in response: {body}"
        try:
            data = json.loads(body[start:end])
            assert "suggested_prompts" in data
            assert isinstance(data["suggested_prompts"], list)
            assert all(isinstance(p, str) for p in data["suggested_prompts"])
            assert data["suggested_prompts"] == ["Prompt1", "Prompt2", "Prompt3"]
        except Exception:
            assert False, f"Could not parse suggested_prompts JSON: {body}" 