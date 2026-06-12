# BUSINESS READINESS REPORT

Audit date: 2026-06-12
Prepared for: Saint Black / ARCHAIOS
Repository reviewed: `ai-assassins-client`
Mode: Phase 2 business launch preparation. No redesign, no live billing activation, no production secret changes.

## Executive Summary

AI Assassins / ARCHAIOS is past the idea stage. The repository contains a working Vite React customer app, public landing and pricing routes, Supabase browser auth wiring, tier-aware UI gates, Stripe Checkout and webhook code in the Cloudflare Worker, lead capture routes, CTA event tracking, operator/admin surfaces, and launch documentation.

The project is not yet ready for broad self-serve launch. The fastest path to revenue is a founder-led paid pilot using the existing Pro / Elite positioning while keeping live self-serve checkout gated until business formation, legal policies, Stripe verification, Supabase production checks, and webhook sync are proven.

## Scorecard

| Category | Score | Launch Meaning |
| --- | ---: | --- |
| Product readiness | 72 | Good MVP surface; needs sharper first-customer demo path |
| SaaS readiness | 66 | Subscription structure exists; operational SaaS proof still incomplete |
| Security | 58 | Good auth/secret separation patterns; needs RLS, CORS, logging, and prod review |
| Stripe readiness | 60 | Checkout/webhook code exists; test/live verification remains the blocker |
| Supabase readiness | 62 | Auth/client/server integration exists; schema/RLS/live sync must be verified |
| Customer onboarding | 56 | Sign-in and upgrade flow exists; onboarding content/support still thin |
| Marketing funnel | 68 | Landing/pricing/lead capture are present; acquisition system needs execution |
| Legal readiness | 34 | Placeholders exist; public policies/entity/bank/EIN still missing |
| Investor readiness | 61 | Strong technical narrative; needs traction, metrics, and cleaned operating story |

## Category Analysis

### Product Readiness

Current score: 72 / 100

Risks:
- The app has several surfaces, including dashboard, pricing, landing, operator, book growth, admin, and legacy dashboard flows, which can dilute the first-customer story.
- Some dashboard metrics and revenue projections are simulated or mock-backed, which is useful for demos but risky if not labeled clearly in sales.
- Daily intelligence value proposition needs a concrete sample briefing/demo package for a buyer to understand exactly what they get on day one.

Missing requirements:
- One canonical first-customer use case.
- A repeatable 10-minute demo script.
- A sample Pro daily intelligence brief and sample Elite priority intelligence report.
- Clear fulfillment promise for what is delivered every day/week.

Recommended fixes:
- Package a founder-led pilot around one buyer promise: "daily intelligence dashboard plus priority signal review."
- Create one sample Pro dashboard walkthrough and one Elite report PDF/screenshot set.
- Add a `docs/FIRST_CUSTOMER_DEMO.md` with demo steps, objection handling, and close script.
- Label mock/simulated metrics in any sales demo.

Estimated effort: 2-4 days.

### SaaS Readiness

Current score: 66 / 100

Risks:
- Free / Pro / Elite gating exists, but SaaS operations are not proven through real paid-user lifecycle testing.
- Multiple docs and code paths reference overlapping host/deployment responsibilities.
- There is no visible customer lifecycle checklist for signup, checkout, access recovery, cancellation, failed payment, and support escalation.

Missing requirements:
- End-to-end test of guest -> signup -> Pro checkout -> subscription sync -> billing portal.
- End-to-end test of guest -> signup -> Elite checkout -> priority feature unlock.
- Production route map that names the canonical frontend, backend Worker, and Supabase project.
- Customer lifecycle playbook.

Recommended fixes:
- Use `client/docs/GO_LIVE_CHECKLIST.md` as the gating checklist and make it operational, not just informational.
- Add a `docs/CUSTOMER_LIFECYCLE_RUNBOOK.md`.
- Freeze one canonical deployment path for the first paid pilot: `client/` frontend plus `archaios-saas-worker`.
- Do not add more product surfaces until the first paid user completes the lifecycle.

Estimated effort: 3-5 days.

### Security

Current score: 58 / 100

Risks:
- Supabase service-role usage lives in Worker code, which is appropriate, but production RLS and table policy verification is not proven in this environment.
- Worker CORS and public endpoints need a production review before paid traffic.
- Logs include operational webhook/debug paths; useful for testing, but production logging should avoid sensitive payload exposure.
- Admin access depends on configured admin email and must be verified before use.

Missing requirements:
- RLS policy audit for `profiles`, `subscriptions`, `leads`, `cta_events`, alerts, and webhook event logs.
- Production CORS allowlist decision.
- Rate limiting or abuse controls for lead capture and CTA endpoints.
- Security checklist for Stripe webhook logging and admin route access.

Recommended fixes:
- Add a `docs/SECURITY_LAUNCH_CHECKLIST.md` covering RLS, CORS, rate limits, webhook logging, admin access, secret storage, and rollback.
- Test signed-out users cannot start checkout and cannot read protected subscription data.
- Limit lead/CTA endpoints with basic request validation and rate policy before public traffic.
- Review Worker logs and remove noisy debug lines before live billing.

Estimated effort: 4-7 days.

### Stripe Readiness

Current score: 60 / 100

Risks:
- Checkout creation, billing portal, webhook verification, event handling, subscription upsert, and profile tier sync exist in `client/worker/index.js`, but Stripe products, price IDs, webhook endpoint, and live/test event delivery are not externally verified.
- Some docs use older env naming patterns; launch env must match the Worker code.
- Customers could pay and remain locked if webhook sync or metadata mapping fails.

Missing requirements:
- Confirm Pro price is `$49/month`.
- Confirm Elite price is `$99/month`.
- Configure test webhook endpoint for `POST /api/stripe/webhook`.
- Complete Pro and Elite test checkout with real Supabase users.
- Verify `checkout.session.completed`, `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`, and `invoice.payment_failed`.

Recommended fixes:
- Create a Stripe test-mode launch sheet with product IDs, price IDs, webhook secret, and event test evidence.
- Run two full test purchases and record screenshots/log IDs.
- Add a manual rescue path for "paid but locked" users.
- Keep live billing disabled until the test webhook updates Supabase and `profiles.tier` reliably.

Estimated effort: 2-4 days after Stripe account access is ready.

### Supabase Readiness

Current score: 62 / 100

Risks:
- Frontend auth uses `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`, and Worker routes verify bearer tokens, but production auth settings and RLS were not verified.
- Subscription records and profile tier alignment depend on schema and service-role configuration.
- Email confirmation flow and pending checkout retry are present, but need real project testing.

Missing requirements:
- Confirm production Supabase URL and anon key in frontend env.
- Confirm service-role secret in Worker.
- Apply/verify migrations for profiles, subscriptions, leads, CTA events, alerts, and webhook logs.
- Verify auth redirect URLs for the public frontend host.
- Verify email confirmation, sign-in, sign-out, password reset, and pending checkout retry.

Recommended fixes:
- Run a Supabase auth smoke test with a real test user.
- Create a signed-in Free test account, then upgrade it through Stripe test mode.
- Add a schema/RLS evidence table to the launch checklist.
- Confirm `profiles.tier` stays aligned with active subscription state.

Estimated effort: 3-5 days after Supabase project access is available.

### Customer Onboarding

Current score: 56 / 100

Risks:
- Users can see the dashboard shell and pricing flow, but the post-purchase experience is not packaged as a guided onboarding.
- Support path, welcome email, paid access explanation, refund/cancellation procedure, and failed-payment path are placeholders.
- The first customer may need hand-holding, which is fine, but that workflow is not yet documented.

Missing requirements:
- Welcome email for Free, Pro, and Elite.
- "What happens after checkout" page or dashboard panel.
- Support email and response-time expectation.
- Failed checkout and paid-but-locked support script.
- Cancellation/refund explanation.

Recommended fixes:
- Add a visible "After you upgrade" section to pricing or docs.
- Create `docs/FIRST_CUSTOMER_ONBOARDING.md` with email templates and manual support actions.
- For the first customer, offer a founder-led onboarding call instead of relying on pure self-serve.
- Make Pro the default first sale; use Elite only when the customer wants priority review.

Estimated effort: 2-3 days.

### Marketing Funnel

Current score: 68 / 100

Risks:
- Landing, pricing, lead capture, and CTA tracking exist, but the repo does not prove a live acquisition loop.
- Funnel copy is strong enough for a first pass, but it still needs a specific audience and outbound list.
- Lead capture stores prospects only if backend Supabase configuration is live.

Missing requirements:
- Defined ideal customer profile for the first 10 prospects.
- Founder-led outreach list.
- One lead magnet or sample briefing.
- Follow-up sequence for Free preview leads.
- Conversion event taxonomy for source, campaign, tier intent, and close status.

Recommended fixes:
- Build a 50-prospect list and sell manually before paid ads.
- Create one "ARCHAIOS Daily Signal Sample" asset and use it as the lead magnet.
- Add `utm_source`, `utm_campaign`, and requested tier context to lead capture when practical.
- Track first-customer pipeline manually in a simple sheet until volume exists.

Estimated effort: 3-6 days.

### Legal Readiness

Current score: 34 / 100

Risks:
- Business legal name, EIN/tax setup, policies, refund terms, and support contact remain placeholders.
- Live recurring billing before entity/bank/policy setup creates avoidable tax, payout, chargeback, and trust risk.
- AI/intelligence products need clear disclaimers about informational use and no financial/legal/security guarantees.

Missing requirements:
- Business legal name.
- EIN / tax setup.
- Privacy Policy.
- Terms of Service.
- Refund/Cancellation Policy.
- Contact/support email.
- AI output and intelligence disclaimer.
- Business bank and accounting workflow.

Recommended fixes:
- Keep self-serve billing gated until legal/entity basics are done.
- Publish placeholder policy pages as drafts internally, then replace with final reviewed versions.
- Add checkout acceptance language once policies are live.
- For founder-led pilot, use a written pilot agreement or invoice terms before recurring self-serve billing.

Estimated effort: 1-2 weeks depending on formation/legal review.

### Investor Readiness

Current score: 61 / 100

Risks:
- The technical story is ambitious and visually credible, but investor readiness requires traction, clean metrics, and a crisp market wedge.
- Mock/simulated metrics can weaken investor trust if mixed with actual usage.
- Repo/workspace fragmentation makes the operating story harder to explain.

Missing requirements:
- One-page investor summary.
- Product demo link or screenshots.
- Actual usage metrics: leads, activations, conversion, paid users, MRR.
- First-customer case study or signed LOI.
- Clean product architecture diagram and go-to-market plan.

Recommended fixes:
- Prioritize one paying customer over broad feature expansion.
- Create an investor memo only after one pilot sale or serious sales pipeline exists.
- Separate "actual" vs "projected" metrics in all dashboards.
- Prepare a traction dashboard showing leads, demos booked, pilots, paid accounts, and MRR.

Estimated effort: 5-10 days after first customer outreach begins.

## First Paying Customer Priority Stack

1. Sell Pro manually first: `$49/month` full dashboard is easier to explain and lower friction than Elite.
2. Use Elite as an upsell for customers who ask for faster/deeper priority intelligence.
3. Create one sample daily brief and one sample priority report.
4. Reach out to 50 targeted prospects with a founder-led pilot offer.
5. Onboard the first customer personally, then backfill automation from the actual support friction.
6. Keep live self-serve checkout gated until Stripe/Supabase sync is verified.
7. Track every lead and conversation manually even if the app lead tracking is also live.

## 30-Day Launch Roadmap

Goal: close or prepare to close the first paying customer without overbuilding.

Week 1:
- Finalize the first-customer offer: Pro at `$49/month`; Elite at `$99/month` for priority intelligence.
- Create sample Pro dashboard screenshots and one sample daily intelligence brief.
- Create one sample Elite priority intelligence report.
- Write `FIRST_CUSTOMER_DEMO.md` and `FIRST_CUSTOMER_ONBOARDING.md`.
- Confirm frontend build and public route map.

Week 2:
- Complete business basics needed for credible selling: legal name decision, contact email, draft policies, refund/cancellation stance.
- Verify Supabase auth with one real test user.
- Verify lead capture and CTA storage in Supabase.
- Configure Stripe test products/prices and webhook endpoint.

Week 3:
- Run Pro test checkout end to end.
- Run Elite test checkout end to end.
- Confirm subscription sync, billing portal, cancellation, and paid feature unlocks.
- Prepare support script for failed checkout and paid-but-locked account.

Week 4:
- Build a list of 50 prospects.
- Send founder-led outreach with the sample brief.
- Book 5-10 demos.
- Offer a limited paid pilot with manual onboarding.
- Close the first paying customer or collect written buying objections to refine the offer.

## 60-Day Launch Roadmap

Goal: turn the first paid pilot into repeatable revenue.

Days 31-45:
- Convert first customer feedback into a tighter onboarding flow.
- Publish finalized Privacy Policy, Terms of Service, Refund Policy, and AI disclaimer.
- Complete business bank/accounting readiness if not already done.
- Add customer lifecycle runbook and support SOP.
- Create one case study or anonymized pilot outcome.

Days 46-60:
- Expand outreach to 150 total prospects.
- Add simple CRM tracking for lead source, demo status, tier intent, close status, and objections.
- Improve lead capture attribution with campaign/source fields.
- Add one email follow-up sequence for Free preview leads.
- Move from manual pilot sale to controlled self-serve checkout only after webhook sync is proven.

## 90-Day Launch Roadmap

Goal: establish a credible monetized platform with early traction.

Days 61-75:
- Target 5-10 paying customers or pilots.
- Measure activation: signed-in users, checkout starts, paid conversions, churn/cancel reasons.
- Create a traction dashboard with actual leads, demos, paid users, MRR, and support tickets.
- Harden security: RLS audit, CORS review, rate limits, admin access check, webhook log cleanup.

Days 76-90:
- Prepare investor/customer-ready narrative: problem, product, traction, roadmap, revenue model.
- Decide whether Elite needs more concierge value or stronger priority-report packaging.
- Create referral offer for first customers.
- Prepare launch announcement only after payment, onboarding, support, and cancellation flows are verified.
- Review whether to keep, archive, or consolidate overlapping repo surfaces after revenue proof.

## Final Founder Readiness Score

Founder Readiness Score for Saint Black and ARCHAIOS: 67 / 100

Interpretation:
- Strong vision, strong technical base, and enough product surface to sell a first customer.
- Not yet ready for broad automated launch because legal, Stripe, Supabase, support, and operational proof are not complete.
- Best next move: founder-led paid pilot, not full public self-serve launch.

## Immediate Next Actions

1. Create the sample Pro daily brief and Elite priority report.
2. Build the first 50-prospect list.
3. Verify Stripe test checkout and Supabase subscription sync.
4. Publish or finalize legal/support placeholders.
5. Sell one founder-led pilot before adding new product features.
