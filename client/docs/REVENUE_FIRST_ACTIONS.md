# Revenue First Actions

Generated: 2026-04-17

## Objective

Execute the minimum set of actions that increase revenue readiness fastest without deploying or enabling live billing.

## Priority Stack

1. Fastest revenue path: SaaS tier system + Apple Books funnels
2. Easiest shipping path: content packs and CTA routing artifacts
3. Highest leverage automation path: recurring queue + status-driven orchestration

## Action Set A: Fastest Revenue (Start Immediately)

1. Finalize tier entitlement matrix (`free`, `pro`, `elite`) and map all lock/unlock behavior.
2. Define test-mode checkout wiring placeholders for Pro/Elite actions.
3. Build Apple Books conversion path:
  - landing CTA blocks
  - source-tagged links
  - event placeholders for click/intent tracking

Primary agents:
- Revenue Agent
- Support: Product Agent, Content Agent

## Action Set B: Easiest Shipping (Low Dependency)

1. Generate campaign-ready Apple Books post bundles per title.
2. Produce upgrade prompt copy variants for dashboard locked states.
3. Prepare intelligence teaser copy for free users and premium prompts for paid tiers.

Primary agents:
- Content Agent
- Support: Revenue Agent

## Action Set C: Highest Leverage Automation

1. Keep top-5 execution artifacts pinned in `tasks/prioritized/`.
2. Run one orchestrator cycle per controlled interval to update:
  - `archaios-core/state/runtime-state.json`
  - `archaios-core/interfaces/dashboard-data.json`
3. Add weekly automation summary checkpoint for:
  - tier readiness
  - funnel readiness
  - conversion artifact completeness

Primary agents:
- Infra Agent
- Support: Revenue Agent, Product Agent

## 7-Day Revenue Targets (Prep Mode)

- SaaS tiers: complete internal readiness from gating through test-mode checkout specs.
- Apple Books: complete content + funnel routing packs for all books.
- Intelligence reports: complete SKU and access model definition.
- Bundles + music: complete offer definitions and conversion pathway drafts.

## No-Go Boundaries

- No live billing activation
- No deploys
- No DNS changes
- No secret changes

## Recommended Daily Command

```bash
LOOP_MAX_CYCLES=1 AUTO_PROCESS_KNOWLEDGE=true ORCHESTRATOR_ENABLED=true ./archaios-loop.sh start
```

