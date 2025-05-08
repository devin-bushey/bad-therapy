from therapy_agents import build_therapy_graph
from langchain_core.messages import HumanMessage
from dotenv import load_dotenv
from fastapi import FastAPI, Request

load_dotenv()

app = FastAPI(
    title="Bad Therapy Agent API",
    port=8088,
)
graph = build_therapy_graph()

@app.post("/therapy")
async def run_therapy(request: Request):
    data = await request.json()
    user_message = data.get("message", "")
    emotional_state = data.get("emotional_state", "neutral")
    initial_state = {
        "messages": [HumanMessage(content=user_message)],
        "emotional_state": emotional_state,
        "therapeutic_approach": "",
        "safety_level": "safe",
        "session_notes": "",
        "next": "safety_check"
    }
    result = graph.invoke(initial_state)
    return {
        "safety_level": result["safety_level"],
        "therapeutic_approach": result["therapeutic_approach"],
        "session_notes": result["session_notes"],
        "conversation": [
            {"type": m.type, "content": m.content} for m in result["messages"]
        ]
    }
