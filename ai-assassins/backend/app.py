import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

try:
    from openai import OpenAI
except ImportError:
    OpenAI = None


class ChatRequest(BaseModel):
    message: str


class ChatResponse(BaseModel):
    reply: str


app = FastAPI(title="AI Assassins Backend", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

api_key = os.getenv("OPENAI_API_KEY", "")
client = OpenAI(api_key=api_key) if OpenAI and api_key else None


@app.get("/health")
def health() -> dict:
    return {"status": "ok"}


@app.post("/api/chat", response_model=ChatResponse)
def chat(req: ChatRequest) -> ChatResponse:
    if client is None:
        return ChatResponse(reply="Backend not configured. Set OPENAI_API_KEY.")

    completion = client.responses.create(
        model=os.getenv("OPENAI_MODEL", "gpt-4o-mini"),
        input=[{"role": "user", "content": req.message}],
        max_output_tokens=256,
    )
    return ChatResponse(reply=completion.output_text)


# Placeholder for future real-time support (Socket.IO / websockets)
# This app is CORS-ready and structured for adding async event channels.
