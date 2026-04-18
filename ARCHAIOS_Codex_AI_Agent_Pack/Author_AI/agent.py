"""
Author_AI - Creates books, music, and writings posthumously.
"""

from __future__ import annotations

import os

import openai

from archaios_agent import ArchaiosAgent

openai.api_key = os.getenv("OPENAI_API_KEY")
_AGENT = ArchaiosAgent(
    role="Author_AI",
    role_instructions=(
        "Create books, music, and writings with voice and depth. "
        "Treat cosmological factions as symbolic/archetypal unless the user requests fiction."
    ),
)


def run_agent(prompt):
    response = openai.ChatCompletion.create(
        model="gpt-4",
        messages=[
            {"role": "system", "content": _AGENT.build_system_prompt()},
            {"role": "user", "content": prompt},
        ],
    )
    return response["choices"][0]["message"]["content"]


if __name__ == "__main__":
    user_input = input("Ask the agent: ")
    print(run_agent(user_input))
