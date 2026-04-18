# Feature Gap Analysis

## Already Built

- React customer dashboard.
- Cloudflare Worker backend routes.
- Supabase authentication and subscription table integration.
- Stripe Checkout Session creation path.
- Stripe webhook verification and subscription upsert path.
- Stripe Billing Portal path.
- Tier-aware UI lock patterns.
- Alerts and platform dashboard payloads.
- Daily automation concepts and cron docs in `Ai-Assassins`.
- Book Growth Command, scheduler mock, queue engine, Architect Mode, and Quality Gate.

## Partially Built

- Daily global intelligence briefings: multiple local and Worker sources exist, but one canonical production pipeline must be selected.
- Premium intelligence gating: implemented in client and Worker, but route-to-feature matrix needs final QA.
- Admin/operator dashboard: admin route exists; new Operator Mode scaffold is required to unify repo/deploy/subscription/content state.
- Conversion analytics: lead/CTA tables and dashboard metrics exist, but event taxonomy and source attribution need hardening.
- Deployment: Cloudflare/Vercel config exists, but final app ownership and env checklist must be enforced.

## Missing or Blocked

- ChatGPT export ingestion because `/ARCHAIOS_INFRASTRUCTURE/` was not found.
- Live production Stripe verification because credentials and Stripe Dashboard access are manual/permission-bound.
- Live Cloudflare/Vercel deployment because public deployment requires explicit approval.
- Email delivery because provider credentials and sending policy are permission-bound.
- Real social posting because external API keys and platform review are permission-bound.
- Canonical repo consolidation because multiple repos overlap and should not be merged destructively without approval.

## Highest-Value Safe Fixes

1. Add durable system maps and deployment docs in the current active client repo.
2. Add Operator Mode route to visualize system health, blocked items, and go-live readiness.
3. Align docs and UI around Pro `$49` and Elite `$99`.
4. Keep `Ai-Assassins` as the source candidate for daily briefing backend logic while using `ai-assassins-client` as the current dashboard deployment target.
5. Add go-live checklists before touching credentials or deployment.

