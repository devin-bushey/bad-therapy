import httpx
from fastapi import HTTPException
from core.config import get_settings
from database.conversation_history import save_conversation, get_conversation_history, update_session
from prompts.chat_prompts import get_prompt_help, get_session_name_prompt, get_system_prompt, get_disclaimer
import json

settings = get_settings()

def build_messages(history: list[dict], prompt: str, is_first_message: bool = False, user_profile: dict | None = None) -> list[dict]:
    messages = [{"role": "system", "content": get_system_prompt(is_first_message, user_profile)}]
    for entry in reversed(history):
        messages.append({"role": "user", "content": entry["prompt"]})
        messages.append({"role": "assistant", "content": entry["response"]})
    messages.append({"role": "user", "content": prompt})
    return messages

class OpenAIService:
    def __init__(self):
        self.api_key = settings.OPENAI_API_KEY
        self.model = settings.OPENAI_MODEL
        self.max_tokens = settings.OPENAI_MAX_TOKENS
        self.timeout = settings.OPENAI_TIMEOUT

    async def _generate_session_name(self, user1: str, user2: str, bot2: str, bot3: str) -> str:
        url = "https://api.openai.com/v1/chat/completions"
        headers = {"Authorization": f"Bearer {self.api_key}", "Content-Type": "application/json"}
        prompt = (
            get_session_name_prompt() +
            f"\nFirst user message: {user1}\nSecond user message: {user2}\nSecond bot message: {bot2}\nThird bot message: {bot3}"
        )
        payload = {
            "model": self.model,
            "messages": [
                {"role": "system", "content": prompt}
            ],
            "max_tokens": 12,
            "temperature": 0.5
        }
        async with httpx.AsyncClient() as client:
            resp = await client.post(url, headers=headers, json=payload, timeout=self.timeout)
        if resp.status_code != 200:
            return "New Chat"
        return resp.json()["choices"][0]["message"]["content"].strip().replace("\n", " ")


    async def generate_response_stream(self, *, session_id: str, prompt: str, user_id: str, user_profile: dict | None = None):
        history = get_conversation_history(session_id=session_id, user_id=user_id)
        is_first_message = not history
        should_update_name = history and len(history) == 2
        messages = build_messages(history, prompt, is_first_message, user_profile)
        url = "https://api.openai.com/v1/chat/completions"
        headers = {"Authorization": f"Bearer {self.api_key}", "Content-Type": "application/json"}
        payload = {
            "model": self.model,
            "messages": messages,
            "max_tokens": self.max_tokens,
            "stream": True
        }
        full_response = ""
        async with httpx.AsyncClient() as client:
            async with client.stream("POST", url, headers=headers, json=payload, timeout=self.timeout) as resp:
                if resp.status_code != 200:
                    raise HTTPException(status_code=resp.status_code, detail=await resp.aread())
                async for line in resp.aiter_lines():
                    if not line or not line.startswith("data: "):
                        continue
                    data = line.removeprefix("data: ").strip()
                    if data == "[DONE]":
                        break
                    import json
                    delta = json.loads(data)["choices"][0]["delta"].get("content", "")
                    full_response += delta
                    yield delta
        if is_first_message:
            disclaimer = get_disclaimer()
            prompt_help = get_prompt_help() 
            combined = full_response.strip() + "\n\n" + disclaimer + "\n\n" + prompt_help
            save_conversation(session_id=session_id, user_id=user_id, prompt=prompt, response=combined)
            yield "\n\n" + disclaimer + "\n\n" + prompt_help
        else:
            save_conversation(session_id=session_id, user_id=user_id, prompt=prompt, response=full_response)
        if should_update_name:
            user1 = history[0]["prompt"] if len(history) > 0 else ""
            user2 = history[1]["prompt"] if len(history) > 1 else ""
            bot2 = history[1]["response"] if len(history) > 1 else ""
            bot3 = full_response.strip()
            session_name = await self._generate_session_name(user1, user2, bot2, bot3)
            update_session(session_id=session_id, name=session_name) 


    async def run_therapy_agent(self, *, user_message: str, emotional_state: str):
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

    async def generate_suggested_prompts(self) -> list[str]:
        url = "https://api.openai.com/v1/chat/completions"
        headers = {"Authorization": f"Bearer {self.api_key}", "Content-Type": "application/json"}
        prompt = (
            "You are a helpful therapy assistant. "
            "Generate 3 concise, friendly, and varied suggested prompts to help a user start a new therapy session. "
            "One of the prompts should be for someone who is brand new to therapy."
            "Return only a JSON array of strings, no explanations."
        )
        payload = {
            "model": "gpt-4.1-mini",
            "messages": [
                {"role": "system", "content": prompt}
            ],
            "max_tokens": 128,
            "temperature": 0.7
        }
        async with httpx.AsyncClient() as client:
            resp = await client.post(url, headers=headers, json=payload, timeout=self.timeout)
        if resp.status_code != 200:
            raise HTTPException(status_code=resp.status_code, detail=await resp.aread())
        content = resp.json()["choices"][0]["message"]["content"]
        try:
            prompts = json.loads(content)
            if not isinstance(prompts, list):
                raise ValueError
            return [str(p) for p in prompts]
        except Exception:
            raise HTTPException(status_code=500, detail="Failed to parse suggested prompts from LLM.")