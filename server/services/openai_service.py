import httpx
from fastapi import HTTPException
from core.config import get_settings
from database.conversation_history import save_conversation, get_conversation_history

settings = get_settings()

class OpenAIService:
    def __init__(self):
        self.api_key = settings.OPENAI_API_KEY
        self.model = settings.OPENAI_MODEL
        self.max_tokens = settings.OPENAI_MAX_TOKENS
        self.timeout = settings.OPENAI_TIMEOUT

    async def generate_response(self, prompt: str) -> str:
        # Get recent conversation history
        history = get_conversation_history()
        
        # Build messages array with system message and conversation history
        messages = [{"role": "system", "content": "You are a helpful assistant."}]
        
        # Add conversation history in chronological order
        for entry in reversed(history):
            messages.append({"role": "user", "content": entry["prompt"]})
            messages.append({"role": "assistant", "content": entry["response"]})
        
        # Add current prompt
        messages.append({"role": "user", "content": prompt})

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
        save_conversation(prompt, response)
        return response 