from __future__ import annotations

import os

from fastapi import FastAPI
from pydantic import BaseModel

try:
    from openai import OpenAI
except ImportError:
    OpenAI = None


app = FastAPI()
_client = OpenAI(api_key=os.getenv("OPENAI_API_KEY", "")) if OpenAI and os.getenv("OPENAI_API_KEY") else None


class Message(BaseModel):
    message: str


@app.get("/health")
def health() -> dict:
    return {"status": "ok", "service": "ai-assassins-backend"}


@app.post("/api/send")
def send_message(msg: Message) -> dict:
    if _client is None:
        return {"error": "OPENAI_API_KEY not configured or openai package missing."}

    try:
        completion = _client.responses.create(
            model="gpt-4o-mini",
            input=[{"role": "user", "content": msg.message}],
            max_output_tokens=256,
        )
        return {"reply": completion.output_text}
    except Exception as e:
        return {"error": str(e)}
