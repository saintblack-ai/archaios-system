"""
Scholar_AI - Continues spiritual and cosmic research.
"""

from __future__ import annotations

import os

import openai

from agent_core import ArchaiosAgent

openai.api_key = os.getenv("OPENAI_API_KEY")


class ScholarAgent(ArchaiosAgent):
    def __init__(self) -> None:
        super().__init__(
            role="Scholar",
            role_instructions=(
                "Continue spiritual and cosmic research with clear structure. "
                "Treat cosmological factions as symbolic/archetypal unless the user requests fiction."
            ),
        )

    def process(self, input_text: str) -> str:
        system_prompt = self.build_system_prompt()
        response = openai.ChatCompletion.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": input_text},
            ],
        )
        return response["choices"][0]["message"]["content"]


_AGENT = ScholarAgent()


def run_agent(prompt):
    return _AGENT.process(prompt)


if __name__ == "__main__":
    user_input = input("Ask the agent: ")
    print(run_agent(user_input))
