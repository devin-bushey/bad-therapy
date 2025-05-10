import httpx
from fastapi import HTTPException
from core.config import get_settings
from database.conversation_history import save_conversation, get_conversation_history, update_session
from prompts.chat_prompts import get_session_name_prompt, get_system_prompt, get_disclaimer

settings = get_settings()

def build_messages(history: list[dict], prompt: str, is_first_message: bool = False) -> list[dict]:
    messages = [{"role": "system", "content": get_system_prompt(is_first_message)}]
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


    async def generate_response_stream(self, *, session_id: str, prompt: str, user_id: str):
        history = get_conversation_history(session_id=session_id, user_id=user_id)
        is_first_message = not history
        should_update_name = history and len(history) == 2
        messages = build_messages(history, prompt, is_first_message)
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
            combined = full_response.strip() + "\n\n" + disclaimer
            save_conversation(session_id=session_id, user_id=user_id, prompt=prompt, response=combined)
            yield "\n\n" + disclaimer
        else:
            save_conversation(session_id=session_id, user_id=user_id, prompt=prompt, response=full_response)
        if should_update_name:
            user1 = history[0]["prompt"] if len(history) > 0 else ""
            user2 = history[1]["prompt"] if len(history) > 1 else ""
            bot2 = history[1]["response"] if len(history) > 1 else ""
            bot3 = full_response.strip()
            session_name = await self._generate_session_name(user1, user2, bot2, bot3)
            update_session(session_id=session_id, name=session_name) 