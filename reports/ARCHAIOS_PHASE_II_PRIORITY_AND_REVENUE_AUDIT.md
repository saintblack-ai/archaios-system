# Archaios Phase II Priority Matrix And Revenue Readiness Audit

Generated: 2026-06-19

## Revenue Readiness Verdict

Can Archaios accept customers today?

No, not safely as a self-serve paid SaaS.

Archaios can accept controlled beta testers and collect leads today. It should not accept paid customers until checkout, webhook sync, subscription gating, and legal/policy readiness are verified in production or Stripe test mode against the deployed Worker.

Estimated completion:

- Product shell: 80%
- Frontend build/deploy: 85%
- Backend API: 75%
- Auth: 70%
- Billing code: 70%
- Billing verification: 35%
- Database readiness: 65%
- Legal/business readiness: 35%
- Customer-ready overall: 72%

## Critical Tasks

| Task | Why It Matters | Exact Next Step |
|---|---|---|
| Reconcile deployed Worker with local `worker.js` | Public health response does not match local Worker health behavior | Deploy root Worker or confirm the deployed Worker contains checkout/webhook code |
| Verify Stripe test checkout for Pro | First paid tier must create a valid subscription | Run signed-in Free -> Pro checkout with test price and confirm Stripe session URL |
| Verify Stripe test checkout for Elite | Second paid tier must work separately | Run signed-in Free -> Elite checkout with test price and confirm Stripe session URL |
| Verify webhook signature and events | Access depends on subscription lifecycle sync | Use Stripe CLI/test webhook to send all required events to `/api/stripe/webhook` |
| Verify Supabase `subscriptions(user_id)` unique constraint | Worker uses `on_conflict=user_id` | Apply/verify unique index before webhook testing |
| Verify `profiles.tier` alignment | UI gating depends on tier state | Confirm active subscription updates `profiles.tier` to `pro` or `elite` |
| Remove or reframe launch-gated billing copy | Current UI says checkout is not ready | Replace with production policy copy only after tests pass |
| Confirm GitHub Pages env vars | Frontend must not fall back incorrectly | Ensure GitHub Actions vars/secrets include `VITE_BACKEND_URL`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` |
| Confirm Worker secrets | Checkout and AI fail without secrets | Set Cloudflare secrets for Supabase, Stripe, OpenAI, auth token, and admin email |
| Add legal links | Paid SaaS needs clear terms | Publish privacy, terms, refund, contact URLs and wire them into UI |

## Important Tasks

| Task | Why It Matters | Exact Next Step |
|---|---|---|
| Add billing portal route | Customers need self-service cancellation/update | Implement and test Stripe customer portal |
| Add webhook idempotency table | Prevent duplicate processing | Store Stripe event IDs and skip repeats |
| Separate demo metrics from real metrics | Avoid misleading customers | Label projected/demo revenue and use real Supabase metrics for production |
| Add end-to-end smoke test script | Prevent silent launch regressions | Script health, pricing, auth, checkout, subscription, dashboard |
| Clean deployment docs | Current docs disagree on GitHub Pages vs Vercel | Mark GitHub Pages canonical or formally switch to Vercel |
| Root Next app decision | It currently overlaps with Vite/Worker stack | Archive, fix, or designate as future docs/admin app |
| Improve CORS policy | Public Worker returned wildcard CORS | Restrict production origins intentionally |
| Add subscription status UI | Customers need clear billing state | Show active/trialing/past_due/canceled and current period end |
| Add admin revenue dashboard validation | Needed for first revenue tracking | Use real Stripe/Supabase counts only |
| Document Supabase migration order | Avoid schema drift | Create one canonical production schema checklist |

## Optional Tasks

| Task | Value |
|---|---|
| Add Vercel custom domain if Vercel remains active | Cleaner URL and future Next app option |
| Add polished docs site using Geistdocs/Fumadocs | Good for customer docs, not required for first dollar |
| Add richer onboarding sequence | Improves activation after payment |
| Add analytics provider | Useful after checkout works |
| Add customer feedback widget | Useful for beta learning |
| Add social posting credentials | Important for marketing automation, not required for SaaS checkout |
| Add mobile UI polish pass | Helpful before paid traffic |

## Future Tasks

| Task | Strategic Value |
|---|---|
| Consolidate legacy Python agents into Worker or queue runtime | Reduces operational sprawl |
| Build agent orchestration dashboard | Turns backend capability into customer-facing value |
| Add organization/team accounts | Enables higher-ticket B2B plans |
| Add usage metering | Supports usage-based expansion |
| Add enterprise tier | Larger contracts after first traction |
| Add Vercel/Next documentation portal | Better docs, changelog, and AI-searchable help |
| Add data warehouse/reporting layer | Needed for serious MRR analytics |

## What Is Missing For Customer Revenue

Minimum missing items:

1. Confirm production Worker identity.
2. Install/verify Stripe Worker secrets.
3. Install/verify Stripe price IDs for `pro` and `elite`.
4. Install/verify Supabase Worker secrets.
5. Apply/verify canonical Supabase schema and unique constraints.
6. Run successful test checkout.
7. Run successful webhook subscription sync.
8. Confirm dashboard unlocks paid features after sync.
9. Publish terms/privacy/refund/contact pages.
10. Replace launch-gated copy with production-safe billing language.

## Exact Next Steps

Day 0 checklist:

1. Run `curl -i https://archaios-saas-worker.quandrix357.workers.dev/api/health` and confirm returned service identity.
2. Deploy root Worker with `npx wrangler deploy --name archaios-saas-worker` if the live Worker is stale or wrong.
3. In Supabase SQL editor, verify:
   - `profiles.tier` exists.
   - `subscriptions.tier/status/current_period_end/stripe_customer_id/stripe_subscription_id` exist.
   - `subscriptions(user_id)` has a unique index.
   - `subscriptions(stripe_subscription_id)` has a unique index.
4. In Cloudflare, set:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `SUPABASE_ANON_KEY`
   - `STRIPE_SECRET_KEY`
   - `STRIPE_WEBHOOK_SECRET`
   - `STRIPE_PRICE_PRO`
   - `STRIPE_PRICE_ELITE`
   - `OPENAI_API_KEY`
   - `AUTH_TOKEN`
   - `ADMIN_EMAIL`
5. In GitHub Actions, set:
   - `VITE_BACKEND_URL`
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
6. Create a test Supabase user.
7. Start Pro checkout from the live pricing page.
8. Complete Stripe test payment.
9. Confirm webhook event reaches Worker.
10. Confirm `subscriptions` and `profiles.tier` update.
11. Reload dashboard and confirm paid gates unlock.
12. Repeat for Elite.

## Revenue Milestone Path

| Milestone | Required Offer | Required Proof |
|---|---|---|
| First paying customer | Pro at $49/month | One completed checkout and active subscription |
| First $100 | Two Pro customers or one Elite plus lead conversion | Stripe MRR >= $100 |
| First $1,000 | 21 Pro customers, 11 Elite customers, or mixed | Repeatable acquisition channel and low churn |
| First $10,000 MRR | About 205 Pro, 102 Elite, or mixed higher-ticket plans | Scalable acquisition, onboarding, retention, support |

## Launch Decision

Recommended posture:

- Start with private paid beta after successful Stripe test-mode checkout.
- Keep traffic low until webhook/idempotency/legal are complete.
- Do not send broad public traffic while UI still says “coming soon” or “launch-gated.”
