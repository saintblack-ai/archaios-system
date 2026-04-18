# First Execution Queue

Generated: 2026-04-17

## Ranking Method

- Revenue value (1-10): expected monetization impact.
- Infrastructure readiness (1-10): how buildable now with current local stack.
- Speed to launch (1-10): time-to-usable local release candidate.
- Composite score: `0.45*Revenue + 0.35*Readiness + 0.20*Speed`.

## Queue (Top 5)

| Rank | System | Revenue | Readiness | Speed | Composite | Primary Agent | Support Agent | Queue Action |
| --- | --- | ---: | ---: | ---: | ---: | --- | --- | --- |
| 1 | SaaS tier system (Free/Pro/Elite) | 10 | 8 | 8 | 9.0 | Revenue Agent | Product Agent | finalize entitlement matrix + locked state mappings |
| 2 | Apple Books funnels | 9 | 9 | 8 | 8.8 | Content Agent | Revenue Agent | build offer pages + CTA routing + source tagging |
| 3 | Intelligence report products | 8 | 7 | 7 | 7.4 | Product Agent | Revenue Agent | package daily/weekly report SKUs + access tiers |
| 4 | Digital bundle products | 8 | 7 | 6 | 7.2 | Revenue Agent | Content Agent | define bundle catalog + tier alignment + upsell copy |
| 5 | Saint Black music funnels | 7 | 7 | 6 | 6.8 | Content Agent | Revenue Agent | build campaign cadence + pre-checkout funnel path |

## Immediate Sequence (No Deploy, No Billing Activation)

1. Create SaaS entitlement JSON for guest/free/pro/elite and map dashboard lock states.
2. Create Apple Books funnel templates with source-aware links and conversion event placeholders.
3. Define intelligence report product schema (free teaser, pro full, elite priority).
4. Define digital bundle matrix mapped to tier visibility.
5. Create music funnel campaign packs and conversion handoff docs.

## Routing Targets

- Tier system work: `projects/revenue-agent/` + `projects/product-agent/`
- Funnel content work: `projects/content-agent/`
- Queue/state tracking: `tasks/prioritized/`, `tasks/queue/`, `tasks/in_progress/`

## Constraint Guardrails

- Billing remains prep-only.
- No DNS, no deploy, no secret changes.
- All artifacts stay local and reversible.

