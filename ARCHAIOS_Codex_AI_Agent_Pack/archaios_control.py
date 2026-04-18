"""
ARCHAIOS_AGENT_SYSTEM v1.0
Unified Command Core for Project Eternal Quandrix
"""

import os
import importlib

AGENT_DIR = os.path.dirname(os.path.abspath(__file__))

AGENTS = {
    "scholar": "Scholar_AI.agent",
    "mentor": "Mentor_AI.agent",
    "author": "Author_AI.agent",
    "executor": "Executor_AI.agent"
}

def run_agent(agent_key, user_prompt):
    if agent_key not in AGENTS:
        print(f"[ERROR] Agent '{agent_key}' not recognized.")
        return
    try:
        agent_module = importlib.import_module(AGENTS[agent_key])
        result = agent_module.run_agent(user_prompt)
        print(f"\n[{agent_key.upper()} AI RESPONSE]:\n{result}")
    except Exception as e:
        print(f"[ERROR] Failed to run {agent_key} agent: {e}")

def list_agents():
    print("Available AI Legacy Agents:")
    for key in AGENTS:
        print(f"- {key}")

if __name__ == "__main__":
    print("🧠 ARCHAIOS AGENT CONTROLLER INITIATED")
    list_agents()
    agent = input("\nChoose an agent to activate: ").strip().lower()
    task = input(f"Enter prompt for {agent}: ")
    run_agent(agent, task)
