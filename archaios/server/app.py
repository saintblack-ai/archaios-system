from __future__ import annotations

import os

from archaios.core.orchestrator import ArchaiosOrchestrator

try:
    from fastapi import FastAPI
    from pydantic import BaseModel
except ImportError as exc:
    raise RuntimeError("fastapi is required for archaios.server.app. Install with: pip install fastapi uvicorn") from exc

try:
    from openai import OpenAI
except ImportError:
    OpenAI = None


app = FastAPI()
archaios = ArchaiosOrchestrator()
_openai_api_key = os.getenv("OPENAI_API_KEY", "")
_client = OpenAI(api_key=_openai_api_key) if OpenAI and _openai_api_key else None


class Message(BaseModel):
    message: str


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok", "service": "archaios-server"}


@app.post("/ask")
async def ask_archaios(query: str) -> dict[str, str]:
    response = archaios.auto_route(query)
    return {"response": response}


@app.post("/api/send")
def send_message(msg: Message) -> dict[str, str]:
    if _client is None:
        return {"error": "OPENAI_API_KEY not configured or openai package missing."}

    try:
        completion = _client.responses.create(
            model="gpt-4o-mini",
            input=[
                {"role": "user", "content": msg.message},
            ],
            max_output_tokens=256,
        )
        answer = completion.output_text
        return {"reply": answer}
    except Exception as e:
        return {"error": str(e)}
