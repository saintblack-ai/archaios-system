# Archaios Phase II 90-Day Execution Plan

Generated: 2026-06-19

## North Star

Move Archaios from launch-gated infrastructure to a verified paid intelligence SaaS with:

- First paying customer.
- First $100.
- First $1,000.
- Path to $10,000 MRR.

## 0-7 Days: Revenue Gate Clearance

Goal: make paid checkout technically safe.

Critical outcomes:

- Confirm deployed Worker identity.
- Deploy correct Worker if needed.
- Verify Supabase schema and unique constraints.
- Configure Cloudflare Worker secrets.
- Configure GitHub Pages frontend env.
- Complete Stripe test checkout for Pro.
- Complete Stripe test checkout for Elite.
- Verify webhook sync to `subscriptions` and `profiles.tier`.
- Confirm dashboard unlocks after checkout.
- Publish privacy, terms, refund, and contact links.

Success criteria:

- One test user can upgrade to Pro and see Pro dashboard access.
- One test user can upgrade to Elite and see Elite dashboard access.
- Cancel/past_due/deleted webhook states downgrade or lock access correctly.

## Days 8-14: Private Paid Beta

Goal: land the first real paying customer.

Actions:

- Replace launch-gated copy with production-safe billing copy.
- Add clear “beta access” positioning.
- Add customer onboarding checklist.
- Add billing/support contact path.
- Create one high-converting offer:
  - Pro: `$49/month` full dashboard.
  - Elite: `$99/month` priority intelligence.
- Recruit 5-10 warm prospects manually.
- Offer a guided first-week setup call for early customers.

Milestone:

- First paying customer.

Proof:

- Stripe active subscription.
- Supabase `profiles.tier` aligned.
- Customer can access paid dashboard.

## Days 15-30: First $100

Goal: convert 2-3 paid subscribers.

Actions:

- Create a simple acquisition loop:
  - Daily intelligence teaser.
  - One clear CTA to Pro or Elite.
  - Lead capture for signed-out users.
  - Follow-up message within 24 hours.
- Launch Market Agent v1 to summarize lead and CTA activity.
- Launch Mission Agent v1 to create daily revenue actions.
- Add dashboard “what changed today” paid value section.
- Add cancellation/support instructions.
- Add customer feedback survey.

Milestone:

- First $100 MRR.

Math:

- 3 Pro users = `$147 MRR`.
- 1 Elite + 1 Pro = `$148 MRR`.

## Days 31-45: Productize The Promise

Goal: make paid access feel meaningfully better than free preview.

Actions:

- Separate all dashboard data into demo, free, Pro, and Elite states.
- Add real subscription state banner.
- Add real alert history.
- Add premium daily brief.
- Add Research Agent v1.
- Add Builder Agent draft output for paid tiers.
- Add Archivist Agent memory index for internal/operator use.
- Add weekly customer report PDF/markdown export.
- Add 3 landing-page proof points from actual beta usage.

Milestone:

- 5-10 active paid users.
- Churn blockers identified.

## Days 46-60: First $1,000

Goal: reach a repeatable sales motion.

Actions:

- Package Archaios as an operator intelligence membership.
- Run 3 acquisition experiments:
  - Founder/operator outreach.
  - Niche intelligence report lead magnet.
  - Content funnel around urgent market signals.
- Add referral offer or founder discount.
- Add billing portal.
- Add webhook idempotency.
- Add customer status/admin revenue dashboard.
- Create 10 high-value public teasers from Research/Market Agent output.

Milestone:

- First $1,000 MRR.

Math:

- 21 Pro users = `$1,029 MRR`.
- 11 Elite users = `$1,089 MRR`.
- Mixed target: 10 Pro + 6 Elite = `$1,084 MRR`.

## Days 61-75: Retention And Expansion

Goal: make subscribers stay and upgrade.

Actions:

- Add weekly Elite report.
- Add priority alert emails or dashboard notifications.
- Add customer-specific saved brief history.
- Add onboarding email sequence.
- Add “upgrade to Elite” moments inside Pro.
- Add Mission Agent daily plan for paid users.
- Add usage analytics by tier.
- Interview paying customers.
- Remove or archive stale legacy routes that confuse production.

Milestone:

- 80%+ first-month retention for early cohort.
- 20%+ Pro-to-Elite upgrade intent.

## Days 76-90: $10,000 MRR System Design

Goal: build the engine that can reach $10,000 MRR.

Actions:

- Decide hosting canonical path permanently:
  - GitHub Pages + Cloudflare Worker, or
  - Vercel + Cloudflare Worker/Next APIs.
- Add custom domain.
- Add public docs/help center.
- Add Stripe live-mode launch checklist.
- Add customer onboarding automation.
- Add support inbox process.
- Add enterprise/well-qualified lead path.
- Create 4 repeatable content/report products:
  - Weekly intelligence report.
  - Market opportunity brief.
  - Mission plan.
  - Builder output package.
- Build outbound list and weekly campaign rhythm.

Milestone:

- A clear path to $10,000 MRR.

Math:

- 205 Pro users = `$10,045 MRR`.
- 102 Elite users = `$10,098 MRR`.
- 100 Pro + 52 Elite = `$10,048 MRR`.
- Better path: introduce higher-ticket managed/enterprise plan once 10-20 self-serve customers validate demand.

## Weekly Operating Rhythm

Monday:

- Review revenue, churn, leads, blockers.
- Mission Agent creates weekly priority plan.

Tuesday:

- Research Agent creates one high-value report.
- Builder Agent creates landing/content assets.

Wednesday:

- Market Agent reviews CTA and conversion data.
- Adjust offer and outreach.

Thursday:

- Customer interviews and onboarding improvements.

Friday:

- Ship one product improvement.
- Publish one proof-driven teaser.
- Archive weekly lessons through Archivist Agent.

## Key Metrics

| Metric | Target By Day 30 | Target By Day 60 | Target By Day 90 |
|---|---:|---:|---:|
| Paying customers | 2-3 | 10-20 | 25-50 |
| MRR | `$100+` | `$1,000+` | `$2,500-$5,000+` with path to `$10,000` |
| Checkout success rate | 90%+ | 95%+ | 98%+ |
| Signup-to-paid conversion | 5%+ | 8%+ | 10%+ |
| First-month retention | 70%+ | 80%+ | 85%+ |
| Weekly qualified leads | 10 | 25 | 50 |

## Final 90-Day Priority

Do not overbuild the swarm before revenue works. The fastest path is:

1. Verify checkout.
2. Sell guided beta access.
3. Deliver one valuable daily/weekly intelligence outcome.
4. Use agents to improve research, market insight, and execution plans.
5. Convert proof into repeatable acquisition.
