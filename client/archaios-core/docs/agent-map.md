# ARCHAIOS Agent Map

Canonical agent runtime root: `client/archaios-core/`

## Core Agents

| Agent | Manifest | Script | State | Output | Role |
| --- | --- | --- | --- | --- | --- |
| Content Agent | `runtime/agents/content-agent.json` | `agents/content-agent.js` | `state/agents/content-agent.json` | `client/projects/content-agent/` | Campaign-ready content and copy packs. |
| Infra Agent | `runtime/agents/infra-agent.json` | `agents/infra-agent.js` | `state/agents/infra-agent.json` | `client/projects/infra-agent/` | Route, runtime, and service health. |
| Product Agent | `runtime/agents/product-agent.json` | `agents/product-agent.js` | `state/agents/product-agent.json` | `client/projects/product-agent/` | Dashboard product and workflow quality. |
| Research Agent | `runtime/agents/research-agent.json` | `agents/research-agent.js` | `state/agents/research-agent.json` | `client/projects/research-agent/` | Knowledge extraction and clustering. |
| Revenue Agent | `runtime/agents/revenue-agent.json` | `agents/revenue-agent.js` | `state/agents/revenue-agent.json` | `client/projects/revenue-agent/` | Monetization prep without billing activation. |

## Shared Agent Contract

Each core agent manifest should define:

- `key`
- `name`
- `mission`
- `taskIntakeRules`
- `outputDestination`
- `statusFile`
- `allowedActions`
- `blockedActions`

Each executable agent should:

- run under Node from `client/`
- accept task text from CLI arguments
- write an append-only log under `client/logs/`
- write last-run output under `client/projects/<agent-key>/last-run.json`
- avoid deploy, DNS, billing, or secret mutation unless explicitly authorized in a future contract

## Dependency Map

| Agent | Runtime Dependencies | External Dependencies | Risk |
| --- | --- | --- | --- |
| Content Agent | `fs`, `path`, `client/logs`, `client/projects/content-agent` | None | Low |
| Infra Agent | `fs`, `path`, `client/logs`, `client/projects/infra-agent` | None | Low |
| Product Agent | `fs`, `path`, `client/logs`, `client/projects/product-agent` | None | Low |
| Research Agent | `fs`, `path`, `client/logs`, `client/projects/research-agent` | None | Low |
| Revenue Agent | `fs`, `path`, `client/logs`, `client/projects/revenue-agent` | None | Medium because revenue work can be confused with live billing. Manifest blocks live billing. |

## Non-Canonical Agent Paths

These paths exist but should not be treated as the canonical ARCHAIOS runtime:

```text
agents/
client/agents/
client/src/agents/
app/agents/
archaios/agents/
Archaios OS/agents/
ARCHAIOS_Codex_AI_Agent_Pack/
Author_AI/
Executor_AI/
Mentor_AI/
Scholar_AI/
```

Migration recommendation:

- Keep `client/src/agents/` as frontend adapters/helpers.
- Keep `archaios-agents/` as a Cloudflare scheduled-agent worker, separate from local runtime.
- Treat `agents/`, `archaios/agents/`, `Archaios OS/agents/`, `ARCHAIOS_Codex_AI_Agent_Pack/`, and root role-agent folders as legacy/reference until separately migrated.
