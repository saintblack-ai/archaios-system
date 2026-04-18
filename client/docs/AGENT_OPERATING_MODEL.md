# Agent Operating Model

Generated: 2026-04-17

## Agent Set

| Agent | Mission | Primary Inputs | Primary Outputs |
| --- | --- | --- | --- |
| Infra Agent | Keep infrastructure healthy and route-consistent | system status, logs, route checks | infra health reports, route fix tasks |
| Product Agent | Improve dashboard product quality and UX clarity | project index, feature backlog, task queue | product specs, UI/UX task cards |
| Revenue Agent | Prepare and optimize monetization paths | pricing docs, revenue maps, funnel plans | revenue experiments, funnel updates, Stripe prep tasks |
| Content Agent | Produce reusable content operations | knowledge buckets, campaign plans, music/book themes | content packs, promo briefs, messaging variants |
| Research Agent | Analyze and cluster knowledge corpus | raw exports, knowledge index, spiritual/strategy archives | research digests, cluster maps, unresolved-question queue |

## Bucket-to-Agent Assignment

| Project Bucket | Responsible Agents | Notes |
| --- | --- | --- |
| AI / SaaS / Dashboard | Infra, Product, Revenue | Core platform operations and tier UX |
| Books / Publishing | Content, Revenue, Research | Book funnels and publication intelligence |
| Music / Saint Black | Content, Revenue, Research | Campaign and brand/media execution |
| Game / OS / Saint Black systems | Product, Research, Infra | System design and interactive platform planning |
| Crypto / finance | Revenue, Research | Hold queue until explicit activation approval |
| Spiritual research / archives | Research, Content | Archive integrity and synthesis output |
| Automation / agent systems | Infra, Product, Research | Loop reliability and orchestration scaling |

## Operating Rules

1. No deploy, DNS, billing, or secret changes unless explicitly authorized.
2. Preserve raw export source material untouched in `raw_exports/`.
3. Write all derivative artifacts to `knowledge/`, `projects/`, `revenue/`, `docs/`, or `processed_exports/`.
4. Use task queue (`tasks/agent-task-queue.json`) as execution contract for loop cycles.
5. Escalate uncertain routing into `processed_exports/review/` instead of destructive edits.
