import httpx
from fastapi import HTTPException
from core.config import get_settings
from database.conversation_history import save_conversation, get_conversation_history
from prompts.chat_prompts import get_system_prompt, get_disclaimer

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

    async def generate_response(self, *, session_id: str, prompt: str) -> str:
        history = get_conversation_history(session_id=session_id)
        is_first_message = not history
        messages = build_messages(history, prompt, is_first_message)
        url = "https://api.openai.com/v1/chat/completions"
        headers = {"Authorization": f"Bearer {self.api_key}", "Content-Type": "application/json"}
        payload = {
            "model": self.model,
            "messages": messages,
            "max_tokens": self.max_tokens
        }
        async with httpx.AsyncClient() as client:
            resp = await client.post(url, headers=headers, json=payload, timeout=self.timeout)
        if resp.status_code != 200:
            raise HTTPException(status_code=resp.status_code, detail=resp.text)
        response = resp.json()["choices"][0]["message"]["content"].strip()
        save_conversation(session_id=session_id, prompt=prompt, response=response)
        return response

    async def generate_response_stream(self, *, session_id: str, prompt: str):
        history = get_conversation_history(session_id=session_id)
        is_first_message = not history
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
            save_conversation(session_id=session_id, prompt=prompt, response=combined)
            yield "\n\n" + disclaimer
        else:
            save_conversation(session_id=session_id, prompt=prompt, response=full_response) 