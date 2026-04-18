"""Mentor agent."""

from __future__ import annotations

import os

from agent_core import ArchaiosAgent

try:
    from openai import OpenAI
except ImportError:
    OpenAI = None

_CLIENT = OpenAI(api_key=os.getenv("OPENAI_API_KEY")) if OpenAI else None


class MentorAgent(ArchaiosAgent):
    def __init__(self) -> None:
        super().__init__(
            role="Mentor",
            role_instructions=(
                "Offer emotional, spiritual, and life guidance with empathy, clarity, and practical next steps. "
                "Treat cosmological factions as symbolic/archetypal unless the user requests fiction."
            ),
        )

    def process(self, input_text: str) -> str:
        if _CLIENT is None:
            raise RuntimeError("openai package is required. Install with: pip install openai")

        resp = _CLIENT.responses.create(
            model="gpt-4.1",
            input=[
                {"role": "system", "content": self.build_system_prompt()},
                {"role": "user", "content": input_text},
            ],
        )
        return resp.output_text


_AGENT = MentorAgent()


def run_agent(prompt: str) -> str:
    return _AGENT.process(prompt)
