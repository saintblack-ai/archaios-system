# Worker Dependency Map

Generated: 2026-05-30

Mode: documentation only. No files moved, deleted, renamed, archived, or workflow-edited.

Canonical runtime lens: `client/archaios-core/`

## Worker Entry

Production Cloudflare Worker entry:

```text
worker.js
wrangler.toml
```

`wrangler.toml` declares:

```toml
main = "worker.js"
```

## Direct Worker Imports

`worker.js` imports only root `agents/` plus shared pricing:

```text
worker.js
  -> agents/intelligence_agent.js
  -> agents/content_agent.js
  -> agents/marketing_agent.js
  -> agents/revenue_agent.js
  -> agents/distribution_agent.js
  -> agents/feedback_agent.js
  -> agents/optimization_agent.js
  -> shared/pricing.js
```

There are no direct imports from `worker.js` to:

```text
client/agents/
client/src/agents/
client/archaios-core/agents/
```

## Worker Agent Usage

Directly registered in `AGENTS`:

| Imported module | Runtime object/function | Worker usage | Classification |
| --- | --- | --- | --- |
| `agents/intelligence_agent.js` | `intelligenceAgent`, `getIntelligenceTopics`, `buildIntelligencePrompt` | `/api/agents/intelligence`, scheduled/core run dispatch | ACTIVE PRODUCTION |
| `agents/content_agent.js` | `contentAgent`, `buildContentPrompt` | `/api/agents/content`, self-improving content flow | ACTIVE PRODUCTION |
| `agents/marketing_agent.js` | `marketingAgent`, `buildMarketingPrompt` | `/api/agents/marketing`, autonomous marketing flow | ACTIVE PRODUCTION |
| `agents/revenue_agent.js` | `revenueAgent`, `buildRevenuePrompt` | `/api/agents/revenue`, revenue agent flow | ACTIVE PRODUCTION |

Imported but used as helper prompt builders:

| Imported module | Runtime function | Worker usage | Classification |
| --- | --- | --- | --- |
| `agents/distribution_agent.js` | `buildDistributionPrompt` | distribution scheduling notes | ACTIVE PRODUCTION |
| `agents/feedback_agent.js` | `buildFeedbackPrompt` | feedback metric snapshot | ACTIVE PRODUCTION |
| `agents/optimization_agent.js` | `buildOptimizationPrompt` | optimization profile generation | ACTIVE PRODUCTION |

## Worker Runtime Routes

Agent and runtime-related routes in `worker.js`:

```text
GET  /api/agents/status
POST /api/agents/intelligence
POST /api/agents/content
POST /api/agents/marketing
POST /api/agents/revenue
POST /api/agents/market-intel
GET  /api/agents/logs
POST /api/agents/run
```

Other production routes include:

```text
GET  /api/health
GET  /api/pricing
GET  /api/subscription
POST /api/stripe/checkout
POST /api/stripe/webhook
GET  /api/platform/dashboard
GET  /api/admin/dashboard
POST /api/leads
POST /api/cta-click
```

## Dependency Graph

```text
Cloudflare Worker deployment
  -> wrangler.toml
    -> worker.js
      -> shared/pricing.js
      -> agents/intelligence_agent.js
        -> prompt text only
      -> agents/content_agent.js
        -> prompt text only
      -> agents/marketing_agent.js
        -> prompt text only
      -> agents/revenue_agent.js
        -> prompt text only
      -> agents/distribution_agent.js
        -> prompt text only
      -> agents/feedback_agent.js
        -> prompt text only
      -> agents/optimization_agent.js
        -> prompt text only
      -> Cloudflare env bindings
        -> OPENAI_API_KEY
        -> SUPABASE_URL
        -> SUPABASE_SERVICE_ROLE_KEY
        -> SUPABASE_ANON_KEY optional
        -> STRIPE_SECRET_KEY
        -> STRIPE_WEBHOOK_SECRET
        -> STRIPE_PRICE_PRO
        -> STRIPE_PRICE_ELITE
        -> AUTH_TOKEN optional
      -> external APIs
        -> OpenAI
        -> Supabase REST/Auth
        -> Stripe Checkout/Webhook
```

## Key Conclusion

Root `agents/` is still an active production dependency because `worker.js` imports it directly. It is not safe to archive or remove until the Worker is migrated to import from a canonical backend agent location or until those modules are intentionally duplicated inside `client/archaios-core` with an updated Worker bundle strategy.

`client/archaios-core/agents/` is canonical for local ARCHAIOS runtime orchestration, but it is not currently used by `worker.js`.
