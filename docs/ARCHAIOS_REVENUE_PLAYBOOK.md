# Archaios Revenue Playbook

**Existing offer only:** AI Assassins Pro and Elite subscriptions. This playbook does not create products, tiers, or features.

## Non-Negotiable Gate

Do not solicit paid checkout until all of the following are verified: customer frontend route, Supabase auth, correct Worker identity, Stripe test checkout, webhook delivery, `subscriptions` persistence, and a cancel/refund contact path. A ready deployment without these proofs is not revenue-ready.

## First User Plan

1. Select one tightly defined ideal user from the existing target audience and identify a concrete existing pain the current dashboard already addresses.
2. Send a short personal invitation to use the existing product with a specific outcome and a 20-minute feedback session.
3. Observe onboarding from a fresh account. Record every failure, confusion, and missing proof; repair only blockers to the existing journey.
4. Ask for one written outcome statement if value is demonstrated. Do not count interest as usage.

## First Signup Plan

1. Use the existing public landing and pricing route with one clear call to sign up.
2. Drive a small, named source of traffic: personal network, existing audience, or one direct outreach list. Track source manually if analytics is unavailable.
3. Confirm the signup reaches Supabase and the user can access the signed-in dashboard.
4. Reply to every qualified signup within one business day and capture the user problem in the research queue.

## First Paying Customer Plan

1. Confirm all revenue gates with a controlled test-mode transaction.
2. Make a direct, time-bounded offer for the existing Pro or Elite plan to the first qualified active user.
3. Use the existing authenticated checkout only. Never manually grant a paid tier without an auditable Stripe and Supabase record.
4. After successful payment, verify: Stripe subscription active, webhook delivered, `profiles.tier` aligned, dashboard access granted, receipt/contact path available.
5. Conduct a seven-day value check-in and document retention risk or demonstrated value.

## Roadmap To 10 Customers

| Objective | Operating action | Proof |
| --- | --- | --- |
| 1 paid customer | Direct founder sale after verified checkout | Stripe subscription and Supabase tier agree. |
| 3 paid customers | Repeat the one outreach message to a small qualified cohort | Three distinct active subscriptions. |
| 5 paid customers | Standardize onboarding notes and first-week check-in | Activation checklist completes for each customer. |
| 10 paid customers | Preserve the channel that produces qualified signups and stop non-producing outreach | Monthly recurring revenue reconciles to Stripe. |

At this stage, focus on response time, activation, retention, and payment reliability. Do not broaden the offer or build a marketing machine before ten real customers provide evidence.

## Roadmap To 100 Customers

1. Prove retention for the initial cohort and document the reason customers stay in their own words.
2. Make onboarding and support repeatable from existing workflows; measure time-to-value and support volume.
3. Run one distribution channel at a time and retain only channels with demonstrable customer acquisition economics.
4. Add operational capacity only when customer support, billing, or reliability data proves it is required.
5. Review security, backups, incident response, terms, privacy, refunds, and support response before increasing paid traffic.

## Revenue Scoreboard

| Metric | First customer | 10 customers | 100 customers |
| --- | --- | --- | --- |
| Active paid subscriptions | 1 | 10 | 100 |
| MRR | Actual Stripe total | Actual Stripe total | Actual Stripe total |
| Signup to paid conversion | Baseline | Improve with evidence | Monitor by acquisition source |
| Activation | One defined completed action | Cohort completion rate | Cohort trend |
| Retention | Day-7 feedback | Monthly retention | Cohort retention |
| Payment failures | Zero unresolved | Reviewed weekly | Operationally owned |

No MRR target should be reported until Stripe data, subscription state, and customer count reconcile.
