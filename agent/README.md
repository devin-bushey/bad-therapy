uv run fastapi dev --port 8088


Test:

curl -X POST http://localhost:8088/therapy \
  -H "Content-Type: application/json" \
  -d '{"message": "I have been feeling anxious lately.", "emotional_state": "anxious"}'
