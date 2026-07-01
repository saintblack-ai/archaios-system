# Worker Modernization Plan

Generated: 2026-05-30

Mode: planning only. `worker.js` was not changed.

## Current Worker Dependency

`worker.js` directly imports root backend agent prompt modules:

```js
import { intelligenceAgent, getIntelligenceTopics, buildIntelligencePrompt } from "./agents/intelligence_agent.js";
import { contentAgent, buildContentPrompt } from "./agents/content_agent.js";
import { marketingAgent, buildMarketingPrompt } from "./agents/marketing_agent.js";
import { revenueAgent, buildRevenuePrompt } from "./agents/revenue_agent.js";
import { buildDistributionPrompt } from "./agents/distribution_agent.js";
import { buildFeedbackPrompt } from "./agents/feedback_agent.js";
import { buildOptimizationPrompt } from "./agents/optimization_agent.js";
import { PRICING_TIERS } from "./shared/pricing.js";
```

Therefore:

```text
agents/ = ACTIVE PRODUCTION
```

## Current Worker Graph

```text
wrangler.toml
  -> main = "worker.js"
    -> agents/intelligence_agent.js
    -> agents/content_agent.js
    -> agents/marketing_agent.js
    -> agents/revenue_agent.js
    -> agents/distribution_agent.js
    -> agents/feedback_agent.js
    -> agents/optimization_agent.js
    -> shared/pricing.js
    -> Cloudflare env bindings
    -> OpenAI
    -> Supabase
    -> Stripe
```

## Current Backend Agent Types

Root `agents/` modules are not executable local scripts. They are backend prompt/metadata modules:

| File | Exports | Worker role |
| --- | --- | --- |
| `agents/intelligence_agent.js` | `intelligenceAgent`, `getIntelligenceTopics`, `buildIntelligencePrompt` | Intelligence report generation. |
| `agents/content_agent.js` | `contentAgent`, `buildContentPrompt` | Content draft generation. |
| `agents/marketing_agent.js` | `marketingAgent`, `buildMarketingPrompt` | Marketing queue/schedule generation. |
| `agents/revenue_agent.js` | `revenueAgent`, `buildRevenuePrompt` | Revenue conversion asset generation. |
| `agents/distribution_agent.js` | `distributionAgent`, `buildDistributionPrompt` | Distribution scheduling notes. |
| `agents/feedback_agent.js` | `feedbackAgent`, `buildFeedbackPrompt` | Performance feedback summaries. |
| `agents/optimization_agent.js` | `optimizationAgent`, `buildOptimizationPrompt` | Optimization profile recommendations. |

## Modernization Options

### Option A: Keep root `agents/` as backend Worker agents

Pros:

- Lowest risk.
- No `worker.js` import changes.
- Clear separation: root backend prompt modules vs `client/archaios-core/` local runtime executable agents.

Cons:

- Root `agents/` remains outside canonical local runtime.
- Requires documentation clarity to avoid accidental archival.

Recommendation: use this for the next execution phase.

### Option B: Create a backend-specific canonical path

Potential path:

```text
worker/agents/
```

or:

```text
server/agents/
```

Pros:

- Separates backend Worker prompt modules from root clutter.

Cons:

- Requires `worker.js` import changes.
- Requires Wrangler bundle validation.
- Requires docs and smoke tests.

Recommendation: defer.

### Option C: Import Worker prompt modules from `client/archaios-core/`

Pros:

- Superficially unifies all agents under canonical runtime.

Cons:

- Bad fit today. `client/archaios-core/agents/*.js` are executable scripts that write files using Node `fs`, not Worker-safe prompt modules.
- Cloudflare Workers cannot use Node file writes the same way.
- Would mix local runtime concerns with production Worker constraints.

Recommendation: do not do this.

## Planned Execution Phase If Option A

Files changed:

```text
client/archaios-core/docs/*
client/docs/ARCHAIOS_INFRASTRUCTURE_MAP.md
client/docs/AGENT_RUNTIME_MAP.md
client/docs/AGENT_SEPARATION_MAP.md
client/docs/REPO_ROLES.md
```

No Worker code changes.

Goal:

- Document root `agents/` as backend Worker prompt modules.
- Document `client/archaios-core/agents/` as local runtime executable agents.
- Document `client/src/agents/` as frontend adapters.

## Planned Execution Phase If Option B

Files that would change:

```text
worker.js
agents/*.js
worker/agents/*.js or server/agents/*.js
docs referring to root agents/
scripts/smoke-test-worker.sh only if paths/routes change
```

Validation required:

```bash
node --check worker.js
npx wrangler deploy --dry-run --name archaios-saas-worker
curl -fsS https://archaios-saas-worker.quandrix357.workers.dev/api/health
curl -fsS https://archaios-saas-worker.quandrix357.workers.dev/api/agents/status
```

## Stop/Go

GO:

- Keep root `agents/` active.
- Document it as backend Worker dependency.

NO-GO:

- Do not point `worker.js` at `client/archaios-core/agents/`.
- Do not archive root `agents/`.
- Do not change Worker imports until a dedicated Worker modernization phase.
