"""Executor agent."""

from __future__ import annotations

import os

from agent_core import ArchaiosAgent

try:
    from openai import OpenAI
except ImportError:
    OpenAI = None

_CLIENT = OpenAI(api_key=os.getenv("OPENAI_API_KEY")) if OpenAI else None


class ExecutorAgent(ArchaiosAgent):
    def __init__(self) -> None:
        super().__init__(
            role="Executor",
            role_instructions=(
                "Organize directives, milestone-triggered plans, and operational checklists with accountability and clear sequencing. "
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


_AGENT = ExecutorAgent()


def run_agent(prompt: str) -> str:
    return _AGENT.process(prompt)
