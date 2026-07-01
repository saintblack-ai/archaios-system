# MASTER EXECUTION PLAN

Date: 2026-06-12
Founder: Saint Black
Platform: AI Assassins / ARCHAIOS
Source reports: `BUSINESS_READINESS_REPORT.md` and `FIRST_REVENUE_MISSION.md`

## Founder Dashboard Summary

| Area | Current Position | Next Move |
| --- | --- | --- |
| Founder readiness | `67 / 100` | Sell founder-led pilots before broad self-serve launch |
| Launch readiness | `61 / 100` | Complete legal, Stripe, Supabase, support, and policy gates |
| Primary offer | Pro at `$49/month` | Sell first because it is lower friction and easier to explain |
| Upsell offer | Elite at `$99/month` | Use when the customer needs priority intelligence and deeper signal review |
| Fastest revenue path | Founder-led paid pilot | Sample brief -> demo -> Pro close -> manual onboarding |
| First sales target | 1 paying customer | 50 prospects, 10 conversations, 3 demos, 1 paid pilot |
| Early traction target | 5 paying customers | Prove one ICP segment converts repeatedly |
| Validation target | 10 paying customers | Prove onboarding, retention, and upgrade potential |
| Self-serve checkout status | Not ready for broad public launch | Keep gated until Stripe/Supabase sync and legal gates pass |
| Main constraint | Not product imagination; business operations and revenue proof | Focus on legal setup, first customer, and verified billing/access flow |

## Strategic Sequence

1. Form the business operating base.
2. Validate revenue manually with a founder-led pilot.
3. Close and onboard the first 10 customers.
4. Turn the proven motion into a repeatable funnel.
5. Expand ARCHAIOS into the broader intelligence, operator, and automation system.

## Phase 1 - Business Formation

### Objectives

- Make Saint Black / ARCHAIOS credible and safe enough to accept money.
- Resolve the business identity, legal, tax, banking, policy, and support foundation.
- Keep self-serve recurring billing paused until launch gates are green.

### Tasks

- Choose the final legal business name.
- Choose formation state, registered agent, business address, ownership structure, and management structure.
- Draft or prepare the operating agreement.
- File LLC or equivalent business entity.
- Apply for EIN after formation is accepted.
- Open business banking and define accounting workflow.
- Create or finalize Privacy Policy, Terms of Service, Refund/Cancellation Policy, AI output disclaimer, and support policy.
- Activate a support/contact email.
- Confirm public placeholder language is replaced before broad launch.
- Keep `VITE_PUBLIC_BUSINESS_LEGAL_NAME`, policy URLs, EIN status, and contact email ready for frontend env usage.

### Dependencies

- Founder decisions on legal name, state, registered agent, address, and member structure.
- Legal/entity filing completion.
- EIN issuance.
- Business bank/accounting setup.
- Policy drafts or reviewed policy documents.

### Estimated Completion Time

- 1-2 weeks if decisions are ready.
- Longer if legal review, state filing, bank review, or EIN timing delays the process.

### Success Criteria

- Legal entity accepted.
- EIN issued and stored securely.
- Business bank account active.
- Support email active.
- Public policy pages exist.
- Refund/cancellation stance is clear.
- Stripe business profile can be completed with consistent legal details.

## Phase 2 - Revenue Validation

### Objectives

- Prove that one real customer will pay for the AI Assassins / ARCHAIOS intelligence promise.
- Sell manually before scaling.
- Validate Pro as the default first offer and Elite as the priority-intelligence upsell.

### Tasks

- Create one sample Pro daily intelligence brief.
- Create one sample Elite priority intelligence report.
- Prepare a 10-minute founder-led demo script.
- Build the first 50-prospect list.
- Prioritize prospects who are founders, consultants, creators, market watchers, strategists, and operators already buying tools or insight.
- Send 50 direct outreach messages.
- Book 3 demos.
- Close 1 paid pilot.
- Onboard the first customer personally.
- Track every conversation in a simple pipeline sheet.
- Record objections and feed them back into landing copy, sample brief, and demo script.

### Dependencies

- Sample brief and demo package.
- Founder availability for outreach, demos, and onboarding.
- Clear Pro and Elite offer language.
- Manual payment or verified checkout path.
- Basic support process for paid-but-locked or failed-checkout cases.

### Estimated Completion Time

- 2-4 weeks.

### Success Criteria

- 50 prospects identified.
- 10 sales conversations.
- 3 demos completed.
- 1 paid customer or signed pilot commitment.
- First onboarding call completed.
- Clear record of why the customer bought or why prospects declined.

## Phase 3 - First 10 Customers

### Objectives

- Move from one sale to repeatable early traction.
- Identify the highest-converting ICP segment.
- Prove onboarding and retention before opening broad self-serve traffic.

### Tasks

- Expand prospecting to 200 total prospects for first 5 customers.
- Expand prospecting to 400 total prospects for first 10 customers.
- Maintain weekly outreach targets:
  - 75-100 new prospects identified.
  - 75-100 direct outreach messages.
  - 50-75 warm follow-ups.
  - 15-20 sample briefs sent.
  - 4-7 demos booked.
  - 1-2 paid closes.
- Continue founder-led channels:
  - LinkedIn for B2B operators.
  - X for public signal-led conversations.
  - Facebook for warm network and community selling.
  - TikTok for founder story and sample-signal awareness.
  - GitHub for technical credibility and thoughtful builder conversations.
- Introduce a "Founding Operator" cohort for the first 10 customers.
- Add a lightweight proof asset after the first customer: quote, anonymized workflow, or sample outcome.
- Track lead source, segment, objection, demo status, tier recommendation, close status, and revenue.
- Push Pro first and offer Elite when the customer needs speed, depth, or priority signal review.

### Dependencies

- Phase 2 proof and refined messaging.
- Working lead tracking process.
- Repeatable onboarding checklist.
- Support email and manual rescue procedure.
- Stripe/Supabase test verification if using self-serve checkout instead of manual pilot collection.

### Estimated Completion Time

- 6-12 weeks from first consistent outreach cycle.

### Success Criteria

- 5 paying customers reached.
- 10 paying customers reached.
- MRR range established:
  - 5 customers: approximately `$295-$395` depending on Pro/Elite mix.
  - 10 customers: approximately `$590-$740` depending on Pro/Elite mix.
- At least one testimonial, case study, or clear customer outcome.
- Top converting customer segment identified.
- Onboarding friction documented and reduced.

## Phase 4 - Scaling

### Objectives

- Turn founder-led learning into a controlled, repeatable acquisition and onboarding system.
- Move from manual validation toward self-serve only after legal, billing, auth, and support gates are proven.
- Separate actual metrics from projections.

### Tasks

- Complete Stripe test checkout for Pro and Elite.
- Verify webhook events:
  - `checkout.session.completed`
  - `customer.subscription.created`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`
  - `invoice.payment_failed`
- Confirm Supabase subscription sync and `profiles.tier` alignment.
- Confirm signed-out users cannot start paid checkout.
- Confirm paid users unlock correct Pro/Elite surfaces.
- Confirm cancellation and billing portal behavior.
- Add source and campaign tracking for leads where practical.
- Publish finalized policy pages and checkout acceptance language.
- Add or document a customer lifecycle runbook.
- Harden security: RLS audit, CORS review, admin access check, rate limits, and webhook log cleanup.
- Build a traction dashboard showing leads, demos, paid users, MRR, churn/cancellations, and support issues.
- Add one email follow-up sequence for Free preview leads.
- Expand outreach only after one channel shows conversion.

### Dependencies

- Phase 1 business/legal readiness.
- Phase 3 customer learning.
- Stripe account access and verified price IDs.
- Supabase project access, schema verification, and RLS review.
- Support workflow.
- Clean route/deployment ownership for the active frontend and Worker.

### Estimated Completion Time

- 30-60 days after first customer validation.

### Success Criteria

- Live or controlled self-serve checkout works end to end.
- Pro and Elite test purchases sync correctly.
- Paid users receive access without manual database correction.
- Support path is documented and active.
- Marketing attribution exists for lead source and tier intent.
- Founder can explain actual traction without relying on simulated metrics.

## Phase 5 - ARCHAIOS Expansion

### Objectives

- Expand from a validated AI Assassins revenue app into the broader ARCHAIOS operating system.
- Add higher-value intelligence, operator, automation, and content systems only after revenue proof.
- Preserve Saint Black / ARCHAIOS identity while making the product more investable and operationally clear.

### Tasks

- Build an investor/customer-ready narrative: problem, product, traction, roadmap, revenue model.
- Prepare an investor memo only after at least one paid pilot or serious customer pipeline exists.
- Decide whether Elite needs a stronger concierge, priority-report, or high-touch offer.
- Consider a higher-ticket pilot tier after Pro/Elite traction, such as custom intelligence reporting or founder/operator advisory.
- Expand the daily intelligence pipeline once paid users validate the core brief.
- Improve Operator Mode to show repo, deployment, subscription, lead, and content health.
- Consolidate overlapping product surfaces only after revenue proof.
- Add referral offer for early customers.
- Continue separating actual metrics from simulated projections.
- Plan future automation only where it reduces proven manual bottlenecks.

### Dependencies

- First 10 customers or strong evidence from the founding cohort.
- Verified billing/access pipeline.
- Customer feedback and retention signals.
- Clear product architecture and canonical repo ownership.
- Business/legal/security foundation.

### Estimated Completion Time

- 90+ days, after revenue validation and early traction.

### Success Criteria

- 10+ paying customers or a credible paid pilot pipeline.
- Clear ICP and value proposition validated by buyers.
- Working billing, auth, onboarding, and support process.
- Actual traction metrics available.
- ARCHAIOS roadmap is tied to customer demand, not speculative feature expansion.
- Saint Black can present the platform as a serious monetized intelligence system.

## Immediate Founder Priorities

1. Complete business formation and legal/payment prerequisites.
2. Create the sample Pro brief and Elite priority report.
3. Build the first 50-prospect list.
4. Start founder-led outreach.
5. Close one Pro customer.
6. Use Elite only when priority depth is clearly valuable.
7. Onboard personally.
8. Convert every objection into sharper sales copy and product proof.

## Operating Rule

Revenue before scale. Proof before automation. Founder-led learning before broad launch.
