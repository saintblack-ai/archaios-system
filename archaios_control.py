"""
ARCHAIOS control launcher for Scholar, Mentor, Author, and Executor agents.
"""

from __future__ import annotations

from archaios_orchestrator import ArchaiosOrchestrator

AGENTS = ("scholar", "mentor", "author", "executor")
ORCHESTRATOR = ArchaiosOrchestrator()


def run_agent(agent_key: str, user_prompt: str) -> None:
    if agent_key not in AGENTS:
        print(f"[ERROR] Agent '{agent_key}' not recognized.")
        return

    try:
        result = ORCHESTRATOR.route(agent_key, user_prompt)
        print(f"\n[{agent_key.upper()} RESPONSE]\n{result}")
    except Exception as exc:
        print(f"[ERROR] Failed to run '{agent_key}': {exc}")


def list_agents() -> None:
    print("Available agents:")
    for key in AGENTS:
        print(f"- {key}")


if __name__ == "__main__":
    print("ARCHAIOS AGENT CONTROLLER INITIATED")
    list_agents()

    agent = input("\nChoose an agent (scholar/mentor/author/executor): ").strip().lower()
    prompt = input(f"Enter prompt for {agent}: ").strip()

    if not prompt:
        print("[ERROR] Empty prompt.")
    else:
        run_agent(agent, prompt)
