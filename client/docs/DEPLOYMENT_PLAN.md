# Deployment Plan

## Recommended Deployment Split

| Surface | Platform | Reason |
|---|---|---|
| `ai-assassins-client` React app | Vercel or Cloudflare Pages | Customer-facing dashboard and public frontend |
| `worker/index.js` API | Cloudflare Workers | Authenticated API, Stripe, Supabase service-role operations, alerts, brief pipeline |
| `Ai-Assassins/worker` | Cloudflare Workers | Candidate canonical daily intelligence backend |
| `saintblack-ai.github.io` | GitHub Pages or Vercel | Public marketing layer |
| `Archaios OS` | Local/private first | Internal operator control plane |

## Current Build Target

Use `ai-assassins-client` for immediate deployment because it already contains the current React dashboard, Stripe/Supabase client wiring, Worker backend, and Book Growth/Operator additions.

## Cloudflare Responsibilities

- Worker API.
- Stripe webhooks.
- Subscription sync.
- Daily cron triggers.
- Future durable queues / D1 / KV.

## Vercel Responsibilities

- React dashboard hosting if not using Cloudflare Pages.
- Preview deployments.
- Environment-scoped frontend variables.

## Go-Live Sequence

1. Confirm repo ownership and deployment target.
2. Clean dirty worktree and remove generated `node_modules` tracking noise.
3. Apply Supabase schema.
4. Configure Stripe test prices and webhook.
5. Configure Worker secrets/vars.
6. Deploy Worker to staging.
7. Deploy frontend to staging.
8. Run smoke tests.
9. Verify Pro/Elite unlocks.
10. Verify daily briefing pipeline.
11. Switch to production Stripe keys.
12. Run final launch checklist.

## Permission Boundary

Actual public deployment requires explicit approval.

