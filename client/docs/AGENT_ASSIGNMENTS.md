# Agent Assignments

Generated: 2026-04-17

## Assignment Model

- Each launch path has:
  - one primary agent accountable for execution artifacts
  - one support agent accountable for dependency support
- Infra Agent and Research Agent remain cross-cutting support where needed.

## Top 5 Assignments

| System | Primary Agent | Support Agent | Primary Scope | Support Scope |
| --- | --- | --- | --- | --- |
| SaaS tier system (Free/Pro/Elite) | Revenue Agent | Product Agent | entitlement logic, offer ladder, upgrade flow mapping | UI lock states, route behavior, dashboard tier presentation |
| Apple Books funnels | Content Agent | Revenue Agent | campaign copy, CTA routing, source-tag content packs | funnel stage logic, offer hierarchy, conversion scoring assumptions |
| Intelligence report products | Product Agent | Revenue Agent | product packaging model, access workflow, operator controls | monetization fit, tier placement, value ladder mapping |
| Digital bundle products | Revenue Agent | Content Agent | bundle catalog, pricing structure prep, cross-sell logic | bundle messaging, launch copy, audience framing |
| Saint Black music funnels | Content Agent | Revenue Agent | music campaign system, release-content pipeline | funnel economics, offer sequencing, upgrade tie-ins |

## Cross-Cutting Support Assignments

- Infra Agent:
  - monitor route health for launch-prep pages
  - ensure queue/state/log pipeline stability
  - flag broken dependencies in orchestration output
- Research Agent:
  - maintain audience/theme clusters for copy and offer targeting
  - feed updated insight tags to Product/Revenue/Content agents

## Queue-to-Agent Mapping

- `tasks/prioritized/`
  - SaaS tier system
  - Apple Books funnel
- `tasks/queue/`
  - Intelligence report products
  - Digital bundle products
  - Saint Black music funnels
- `tasks/in_progress/`
  - populated per orchestrator cycle

## Execution Boundaries

- Allowed:
  - local build prep
  - structure/routing/content artifacts
  - test-mode checkout preparation
- Blocked:
  - live billing activation
  - deployment changes
  - DNS changes
  - secret mutation

