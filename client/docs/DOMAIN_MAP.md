# ARCHAIOS Domain Map

Generated: 2026-04-16

External DNS and deployment status were not verified because required Cloudflare and Vercel authentication was unavailable.

## Locally Inferred Domains And URLs

| Domain or URL | Platform | Repo/Source | Purpose | Verification |
|---|---|---|---|---|
| `https://saintblack-ai.github.io/ai-assassins-client/` | GitHub Pages | `ai-assassins-client` | Current frontend healthcheck URL in workflow | Local config only |
| `https://saintblack-ai.github.io/Ai-Assassins` | GitHub Pages | `Ai-Assassins` / `saintblack-ai.github.io` | Static AI Assassins public app URL in Worker config | Local config only |
| `https://archaios-saas-worker.quandrix357.workers.dev` | Cloudflare Workers | `ai-assassins-client` | Current Worker backend default URL | Local config only |
| `https://ai-assassins-worker.quandrix357.workers.dev` | Cloudflare Workers | `Ai-Assassins` | Older/parallel Worker examples and docs | Local docs only |
| `https://example.com/api/archaios/daily` | Placeholder | `Archaios OS` | Placeholder Cloudflare worker trigger endpoint | Not production-ready |

## Intended Platform Ownership

| Layer | Recommended Owner | Current Evidence |
|---|---|---|
| Public landing and pricing | `ai-assassins-client` or `saintblack-ai.github.io` | Current repo now has landing/pricing routes; saintblack repo has static marketing pages |
| Authenticated customer dashboard | `ai-assassins-client` | Supabase auth, Stripe checkout, tier-aware dashboard present |
| Daily briefing API | `Ai-Assassins` Worker or migrated Worker code in current repo | Mature briefing Worker exists in `Ai-Assassins`; current repo has platform dashboard Worker |
| Stripe webhook processing | Current Worker, if canonical | `worker/index.js` has webhook logic |
| Operator/admin layer | `ai-assassins-client` `/operator` plus `Archaios OS` | Local operator UI and Python control-plane both exist |
| Remote daily trigger | `Archaios OS/cloudflare_worker` | Placeholder endpoint must be replaced |

## DNS Verification Not Completed

Required to complete:

- Cloudflare zone listing for ARCHAIOS/Saint Black domains.
- DNS record listing for A/CNAME records pointing at Vercel, GitHub Pages, or Workers.
- Cloudflare security/WAF/log availability check.
- Vercel project listing and latest deployment URL check.

## Next Actions

- Authenticate Cloudflare and rerun DNS discovery.
- Authenticate Vercel and rerun deployment discovery.
- Pick one canonical public domain for the revenue funnel.
- Map `/`, `/pricing`, `/dashboard`, `/operator`, and Worker API routes to production URLs.

