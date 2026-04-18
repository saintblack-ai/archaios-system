# ARCHAIOS Infrastructure Map

Generated: 2026-04-17

## Operating Layers

| Layer | Path | Purpose | Write Mode |
| --- | --- | --- | --- |
| Core runtime | `archaios-core/` | Core agent execution scaffolding and runtime subfolders | controlled |
| Knowledge | `knowledge/` | Classified intelligence and research summaries from exports | generated |
| Projects | `projects/` | Product/project grouping and stack planning | generated/manual |
| Revenue | `revenue/` | Monetization models, funnel prep, pricing structure | generated/manual |
| Agents | `agents/` | Runtime agent scripts and role modules | manual/generated |
| Logs | `logs/` | Loop, status, error, and verification logs | append-only |
| Tasks | `tasks/` | Task queues, plans, and execution cards | generated/manual |
| Docs | `docs/` | Infrastructure maps, reports, runbooks | manual/generated |
| Intake | `inbox/` | New inbound exports before routing | manual |
| Raw exports | `raw_exports/` | Untouched extracted exports (source of truth) | read-only |
| Processed exports | `processed_exports/` | Indexed/cleaned derivatives and review bundles | generated |

## Current Export Routing

- Source zip: `.../Archaios Infrastructure/exports/Archaios export.zip`
- Extracted set: `ARCHAIOS_INFRASTRUCTURE/inbox/chatgpt_export_2026-04-16`
- Raw pointer: `raw_exports/chatgpt_export_2026-04-16` (symlink)
- Processed indexes: `processed_exports/indexes/*`
- Knowledge snapshots: `processed_exports/knowledge_snapshots/*`

## System Constraints

- No deployments triggered by organization phase.
- No DNS or billing changes.
- No secret mutation.
- No destructive changes to original export material.
