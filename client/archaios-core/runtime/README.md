# ARCHAIOS Runtime Layer

Defines executable runtime contracts for each core agent:

- role and mission
- intake rules
- output destinations
- allowed/blocked actions

## OMEGA Agent Network

`agent-network.json` is the canonical ARCHAIOS OMEGA contract for the ten core agents:

- Archivist
- Researcher
- Strategist
- Engineer
- Writer
- Security
- Analyst
- Automation
- Vision
- Commander

Each agent declares its role, tools, permissions, memory surfaces, task queue, logging obligations, and evaluation metrics. `runtime-health.mjs` validates the contract and builds a deterministic operating snapshot for dashboards, tests, and future API routes.
