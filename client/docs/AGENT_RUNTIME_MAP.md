# Agent Runtime Map

Generated: 2026-04-17

## Runtime Definitions

| Agent | Runtime Definition | Status File | Output Destination |
| --- | --- | --- | --- |
| Infra Agent | `archaios-core/runtime/agents/infra-agent.json` | `archaios-core/state/agents/infra-agent.json` | `projects/infra-agent` |
| Product Agent | `archaios-core/runtime/agents/product-agent.json` | `archaios-core/state/agents/product-agent.json` | `projects/product-agent` |
| Revenue Agent | `archaios-core/runtime/agents/revenue-agent.json` | `archaios-core/state/agents/revenue-agent.json` | `projects/revenue-agent` |
| Content Agent | `archaios-core/runtime/agents/content-agent.json` | `archaios-core/state/agents/content-agent.json` | `projects/content-agent` |
| Research Agent | `archaios-core/runtime/agents/research-agent.json` | `archaios-core/state/agents/research-agent.json` | `projects/research-agent` |

## Allowed/Blocked Model

- Allowed actions are defined per agent in each runtime definition.
- Blocked actions are globally consistent:
  - deploy
  - dns-change
  - secret-mutation
  - billing activation (unless explicitly approved)
