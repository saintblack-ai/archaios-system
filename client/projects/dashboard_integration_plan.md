# Dashboard Integration Plan (Prep)

Generated: 2026-04-17

## Required Panels

1. System Status
2. Agent Activity
3. Revenue Tracking (placeholder)
4. Task Queue

## Local Data Sources

- `system_status.md`
- `agent_roles.md`
- `revenue/revenue_streams.md`
- `tasks/agent-task-queue.json`
- `knowledge/knowledge-index.json`

## Integration Approach

1. Add a read-only "ARCHAIOS Ingestion" module in dashboard routes.
2. Load local structured JSON/markdown summaries from backend worker endpoint.
3. Keep panel state resilient if ingestion files are missing.

## Constraints

- No deploy triggered in this phase.
- No DNS/billing/secrets changes.
- Dashboard updates should remain additive.
