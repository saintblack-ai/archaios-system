# ARCHAIOS 90-Day Execution Roadmap

Generated: 2026-05-31

## Mission

Move ARCHAIOS and AI-Assassins through the next 90 days with one operating frame:

```text
Fix -> Launch -> First Revenue -> Scale
```

This roadmap is documentation-only. It does not authorize code changes, deployment, infrastructure changes, environment variable updates, payment activation, or public launch activity by itself.

## Confirmed Direction

- Keep `archaios-core`.
- Keep `archaios-dashboard`.
- Keep `AI-Assassins`.
- Keep `saintblack-ai.github.io` as the brand site.
- Merge or archive `ai-assassins-client`.
- Treat `AI-Assassins` as the canonical public product.

## Operating Assumptions

- AI-Assassins is the public paid intelligence product.
- ARCHAIOS is the internal operating system and command backbone.
- Saint Black OS is the broader brand, content, growth, and creative-intelligence layer.
- Paid launch tiers remain:
  - Pro: `$49/month`
  - Elite: `$99/month`
- The first revenue target is not scale; it is proof that strangers or warm-network users will pay for the product.
- Legal, tax, and banking steps should be confirmed with a qualified professional before final filing decisions.

## Source Notes

- IRS guidance says an LLC or other legal entity should be formed with the state before applying for an EIN, and EINs are free through the IRS.
- IRS EIN applications require a responsible party and are limited to one EIN per responsible party per day.
- SBA guidance says a business bank account is typically opened after receiving a federal EIN and helps separate business and personal funds.
- Stripe account activation requires business, product, ownership, identity, website, and payout/bank information.

References:
- IRS EIN: https://www.irs.gov/businesses/small-businesses-self-employed/employer-id-numbers
- IRS online EIN: https://www.irs.gov/businesses/small-businesses-self-employed/apply-for-an-employer-identification-number-ein-online
- SBA business bank account: https://www.sba.gov/business-guide/launch-your-business/open-business-bank-account
- SBA federal and state tax IDs: https://www.sba.gov/starting-business/filing-paying-taxes/obtain-your-federal-business-tax-id
- Stripe account activation: https://docs.stripe.com/get-started/account/activate

## 7-Day Roadmap: Fix

### Objective

Create the clean launch foundation: one product story, one canonical technical path, one business formation queue, and one pilot offer.

### Day 1: Decision Lock

- Confirm the legal business name candidate for the LLC.
- Confirm formation state.
- Confirm registered agent option.
- Confirm owner/member structure.
- Confirm public product name:
  - Product: `AI-Assassins`
  - Brand layer: `Saint Black AI`
  - Internal OS: `ARCHAIOS`
- Confirm whether `ai-assassins-client` will be merged into the canonical product or archived after extraction.

### Day 2: LLC Formation Prep

- Search state business registry for name availability.
- Check domain and social handle consistency for the selected business name and public product.
- Draft the formation profile:
  - Legal name
  - Principal office address
  - Registered agent
  - Member/manager structure
  - Business purpose
- Draft the operating agreement outline.
- Create a business records folder for:
  - Articles/Certificate of Organization
  - Operating agreement
  - EIN confirmation
  - Bank documents
  - Stripe verification documents
  - Licenses, if required

### Day 3: Product Canonicalization

- Write a one-page canonical product brief:
  - Who AI-Assassins serves
  - What daily intelligence it delivers
  - What Free, Pro, and Elite users receive
  - Why someone should pay now
- Freeze launch offer:
  - Free: sample or delayed intelligence, email capture, dashboard preview
  - Pro: full daily briefing, premium panels, saved history
  - Elite: priority feed, deeper analysis, elite reports, urgency alerts
- Freeze first pilot promise:
  - 7-day private intelligence pilot
  - 10 to 25 invited users
  - Goal: 3 to 5 paid conversions

### Day 4: Dashboard Priority Lock

- Identify the minimum launch dashboard:
  - Auth shell
  - Free dashboard preview
  - Pro locked/unlocked state
  - Elite locked/unlocked state
  - Daily briefing panel
  - Subscription status panel
  - Upgrade CTA
  - Operator-only health panel
- Mark all non-launch features as post-pilot.
- Define the dashboard acceptance test:
  - Signed-out users can view the shell.
  - Signed-out users cannot start paid checkout.
  - Signed-in Free users see upgrade paths.
  - Paid users see correct tier state.

### Day 5: Stripe Activation Prep

- Prepare Stripe account activation packet:
  - Legal business name
  - EIN placeholder until issued
  - Business address
  - Website URL
  - Product description
  - Owner identity details
  - Bank account placeholder until opened
  - Customer support email
  - Refund/cancellation policy draft
- Confirm Stripe products to create after business setup:
  - AI-Assassins Pro: `$49/month`
  - AI-Assassins Elite: `$99/month`
- Confirm required webhook events:
  - `checkout.session.completed`
  - `customer.subscription.created`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`
  - `invoice.payment_failed`

### Day 6: Pilot List and Sales Assets

- Build the first pilot prospect list:
  - 25 warm contacts
  - 25 niche operators, creators, founders, or investors
  - 10 strategic collaborators
- Draft pilot invite message.
- Draft follow-up message.
- Draft onboarding email.
- Draft cancellation/refund policy language.
- Draft a short public landing page narrative for `saintblack-ai.github.io`.

### Day 7: Go/No-Go Review

- Confirm LLC filing readiness.
- Confirm EIN readiness.
- Confirm bank account document readiness.
- Confirm Stripe activation readiness.
- Confirm pilot offer and list.
- Confirm the engineering backlog for launch.
- Stop anything that does not support:
  - legal identity
  - payment readiness
  - pilot launch
  - first revenue

### 7-Day Revenue Milestone

- Revenue target: `$0`.
- Success target: 10 qualified pilot invitees ready to contact, one complete payment activation packet, and one launch dashboard scope.

## 30-Day Roadmap: Launch

### Objective

Form the business, activate payment infrastructure, launch the private AI-Assassins pilot, and convert first paid users.

### Week 1: Business Formation

- File LLC with selected state.
- Save approved formation documents.
- Finalize operating agreement.
- Apply for EIN through IRS after state formation is accepted.
- Save EIN confirmation letter.
- Review state tax registration requirements.
- Create business records log.

### EIN Sequence

1. Wait until LLC formation is approved by the state.
2. Gather responsible party details.
3. Apply through the IRS EIN system.
4. Save the EIN confirmation immediately.
5. Update internal business records.
6. Use the EIN for banking and Stripe activation.

### Week 2: Banking and Stripe

- Open a business checking account.
- Deposit initial operating funds.
- Connect business bank account to Stripe.
- Complete Stripe account activation.
- Create or verify Stripe products and prices:
  - Pro: `$49/month`
  - Elite: `$99/month`
- Configure test webhook endpoint.
- Run test-mode checkout for Pro.
- Run test-mode checkout for Elite.
- Confirm subscription state sync.

### Business Bank Account Sequence

1. Gather formation documents.
2. Gather EIN confirmation.
3. Gather operating agreement.
4. Gather owner identification.
5. Select bank or fintech account.
6. Open business checking.
7. Confirm routing/account details.
8. Connect to Stripe.
9. Keep business and personal funds separated from day one.

### Stripe Activation Sequence

1. Complete business profile.
2. Add legal entity details.
3. Add owner/representative identity details.
4. Add public website and product description.
5. Add support email and customer-facing business name.
6. Add business bank account.
7. Create Pro and Elite recurring prices.
8. Configure webhook endpoint.
9. Validate test checkout and webhook events.
10. Switch to live mode only after written go-live approval.

### Week 3: Private Pilot Launch

- Invite first 10 to 25 users.
- Onboard users manually if needed.
- Deliver daily intelligence briefings on a reliable cadence.
- Track:
  - Activation rate
  - Daily active readers
  - Upgrade clicks
  - Paid conversions
  - Cancellation objections
  - Most-requested categories
- Keep the pilot small enough that quality stays high.

### AI-Assassins Pilot Launch Sequence

1. Publish private landing or invite-only access path.
2. Send pilot invites.
3. Confirm user account creation.
4. Deliver first daily briefing.
5. Ask for one concrete use case from each pilot user.
6. Offer Pro/Elite conversion after value is demonstrated.
7. Run checkout only after auth and Stripe validation are confirmed.
8. Follow up personally with every pilot user.

### Week 4: First Revenue Conversion

- Convert 3 to 5 pilot users to paid Pro or Elite.
- Validate paid access in the dashboard.
- Confirm webhook subscription sync.
- Confirm cancellation/downgrade handling.
- Publish a small public waitlist or early-access CTA.
- Write the first revenue postmortem:
  - What sold
  - What confused people
  - What users wanted next
  - What must be fixed before broader launch

### ARCHAIOS Dashboard Development Priorities

- Tier-aware dashboard shell.
- Daily briefing panel.
- Subscription status and entitlement state.
- Operator health overview.
- Read-only deployment and API health checks.
- Revenue status panel.
- Pilot user feedback tracker.

### Saint Black OS Priorities

- Brand narrative for AI-Assassins.
- Public trust layer:
  - About
  - Contact
  - Support
  - Terms/refund policy
  - Privacy policy path
- Content rhythm:
  - 3 short intelligence posts per week
  - 1 weekly product update
  - 1 weekly founder/operator note

### 30-Day Revenue Milestone

- Target: `$147-$495 MRR`.
- Path:
  - 3 Pro users = `$147 MRR`
  - 5 Pro users = `$245 MRR`
  - 3 Elite users = `$297 MRR`
  - Mixed first target = `$300-$500 MRR`

## 60-Day Roadmap: First Revenue

### Objective

Turn the private pilot into a repeatable sales and delivery system with stable billing, dashboard access, and weekly growth rhythm.

### Weeks 5-6: Product Hardening

- Fix the top 5 pilot issues.
- Make the daily briefing more consistent.
- Improve dashboard empty states and upgrade prompts.
- Add visible tier value differences.
- Tighten auth and checkout failure handling.
- Confirm production monitoring:
  - Health endpoint
  - Stripe webhook logs
  - Supabase subscription records
  - Dashboard errors

### Weeks 7-8: Revenue System

- Move from manual invite-only pilot to controlled public early access.
- Create a repeatable sales funnel:
  - Brand site CTA
  - Pricing page
  - Free account
  - Pro/Elite upgrade
  - Onboarding email
  - 7-day follow-up
- Create weekly conversion review:
  - Visitors
  - Signups
  - Activated users
  - Paid users
  - MRR
  - Churn/cancellations
- Package one premium report as an Elite conversion asset.

### ARCHAIOS Dashboard Development Priorities

- Add revenue metrics:
  - MRR
  - Paid users
  - Free users
  - Conversion rate
  - Failed payments
- Add pipeline visibility:
  - Briefing generated
  - Briefing reviewed
  - Briefing published
  - Delivery confirmed
- Add operator task queue:
  - Billing tasks
  - Content tasks
  - Support tasks
  - Launch blockers
- Add read-only GitHub/Cloudflare/Supabase status only where safe and approved.

### Saint Black OS Priorities

- Build public credibility through consistent signals:
  - Weekly intelligence recap
  - AI-Assassins product notes
  - Operator lessons learned
  - Founder voice
- Build content-to-product loops:
  - Every public post points to a sample intelligence briefing or waitlist.
  - Every briefing includes a reason to upgrade.
  - Every Elite asset creates a reason to stay subscribed.

### 60-Day Revenue Milestone

- Target: `$1,000-$2,500 MRR`.
- Suggested mix:
  - 15 Pro users = `$735 MRR`
  - 20 Pro users = `$980 MRR`
  - 10 Pro + 10 Elite = `$1,480 MRR`
  - 20 Pro + 15 Elite = `$2,465 MRR`

## 90-Day Roadmap: Scale

### Objective

Move from founder-led pilot to a repeatable operating cadence with stable revenue, clearer segmentation, and scalable intelligence delivery.

### Weeks 9-10: Controlled Public Launch

- Open AI-Assassins to public signups.
- Keep messaging focused on one core promise:
  - Daily intelligence for operators who need signal, urgency, and synthesis.
- Launch public pricing.
- Publish customer-facing support path.
- Publish product status expectations.
- Add weekly product changelog.
- Start collecting testimonials or anonymized use cases.

### Weeks 11-12: Scale Preparation

- Identify the top converting segment:
  - Founders
  - Creators
  - Investors
  - Local operators
  - Researchers
  - Content teams
- Build one segment-specific landing page.
- Build one segment-specific briefing template.
- Build one Elite report format.
- Add retention workflows:
  - First-week success email
  - Pro usage nudge
  - Elite report preview
  - Failed-payment recovery
  - Cancellation feedback

### ARCHAIOS Dashboard Development Priorities

- Make ARCHAIOS the internal command center:
  - Revenue health
  - System health
  - Content pipeline
  - Pilot/customer feedback
  - Launch blockers
  - Agent/task queue
- Keep operator actions approval-first.
- Separate public product telemetry from internal control surfaces.
- Prepare role separation:
  - Public user
  - Paid member
  - Operator
  - Admin

### Saint Black OS Priorities

- Turn Saint Black into the trust and distribution layer:
  - Brand site as canonical public front door.
  - AI-Assassins as canonical paid product.
  - ARCHAIOS as internal command system.
  - Content cadence as acquisition engine.
- Build repeatable publishing:
  - Monday: weekly intelligence theme
  - Wednesday: product/use-case post
  - Friday: recap and CTA
  - Sunday: operator planning note

### 90-Day Revenue Milestone

- Base target: `$3,000 MRR`.
- Strong target: `$5,000 MRR`.
- Stretch target: `$10,000 MRR`.

Suggested paths:

| MRR Target | Customer Mix |
| --- | --- |
| `$3,000` | 40 Pro + 10 Elite = `$2,950` |
| `$5,000` | 60 Pro + 21 Elite = `$5,019` |
| `$10,000` | 105 Pro + 49 Elite = `$9,996` |

## Highest-Risk Blockers

| Risk | Why It Matters | Mitigation |
| --- | --- | --- |
| LLC/EIN delay | Blocks clean banking and Stripe activation. | Prepare documents before filing; apply for EIN immediately after state approval. |
| Bank account mismatch | Stripe payouts and verification can stall if names/addresses do not match. | Keep legal name, EIN, bank, and Stripe details consistent. |
| Stripe verification delay | Blocks live payment processing. | Prepare website, support, refund policy, owner ID, and bank details before activation. |
| Subscription sync failure | Users may pay without receiving access. | Validate checkout, webhook, Supabase subscription state, and tier gating before live launch. |
| Unclear canonical repo/product | Splits effort across ARCHAIOS, dashboard, client, and AI-Assassins. | Keep AI-Assassins public, ARCHAIOS internal, Saint Black public brand. |
| Dashboard overbuild | Delays revenue while polishing nonessential features. | Build only the launch dashboard until first revenue is proven. |
| Weak pilot offer | Users may like the idea but not pay. | Sell a specific 7-day intelligence outcome, not a vague AI platform. |
| Manual delivery overload | Founder-led fulfillment can break consistency. | Keep pilot small; automate only after the daily format is proven. |
| Legal/policy gaps | Public payments require basic trust artifacts. | Publish support, privacy, terms/refund, cancellation, and product description before live payments. |
| No weekly operating rhythm | Momentum can scatter across too many surfaces. | Use the weekly schedule below as the default execution loop. |

## Recommended Weekly Schedule

### Monday: Command and Revenue

- Review MRR, paid users, free users, churn, and failed payments.
- Review top launch blockers.
- Pick three outcomes for the week.
- Update ARCHAIOS operator board.

### Tuesday: Product and Dashboard

- Fix checkout, auth, gating, dashboard, and briefing issues.
- Review user feedback.
- Ship only launch-critical improvements.

### Wednesday: Intelligence and Content

- Produce or refine the weekly intelligence asset.
- Publish one Saint Black or AI-Assassins content piece.
- Convert one insight into a Pro/Elite value proof.

### Thursday: Sales and Pilot

- Contact prospects.
- Follow up with pilot users.
- Ask for conversion, objection, or referral.
- Update CRM/prospect tracker.

### Friday: Systems and Finance

- Review Stripe, bank, subscription records, and support requests.
- Reconcile payments and access states.
- Document operational lessons.
- Prepare next week's highest-leverage fixes.

### Saturday: Deep Build Block

- Work on one substantial dashboard, automation, or product improvement.
- Avoid context switching.
- End with a written status note.

### Sunday: Reset and Strategy

- Review the week.
- Cut low-value tasks.
- Plan the next 7 days.
- Write the next operator directive.

## Execution Rules

- Revenue work outranks speculative architecture until `$3,000 MRR`.
- Live billing changes require explicit approval.
- Production secret changes require explicit approval.
- Public deployment requires explicit approval.
- Merge/archive work should follow the canonical product decision:
  - AI-Assassins: public product
  - Saint Black site: public brand
  - ARCHAIOS: internal OS
  - `ai-assassins-client`: merge useful pieces or archive
- Every week must produce at least one of:
  - More payment readiness
  - More pilot users
  - More paid conversions
  - More dashboard reliability
  - More public trust

## Definition of Done at Day 90

- LLC formed and records organized.
- EIN obtained and stored.
- Business bank account active.
- Stripe activated and processing live payments.
- AI-Assassins publicly available as the canonical paid product.
- ARCHAIOS dashboard usable as an internal command center.
- Saint Black site functioning as the brand and acquisition layer.
- First repeatable revenue loop operating weekly.
- Minimum `$3,000 MRR` target attempted with documented conversion data.
- Next 90-day roadmap based on real customer behavior, not assumptions.
