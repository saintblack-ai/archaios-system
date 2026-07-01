# ARCHAIOS COMMANDER BRIEF

Audit date: 2026-06-10
Prepared for: Colonel Saint Black
Role: Chief Operations Officer, ARCHAIOS ecosystem
Mode: Business readiness audit and launch preparation. No production code changes, deployments, payment activation, commits, pushes, or file movement.

## Command Finding

ARCHAIOS is technically substantial but commercially gated.

The infrastructure exists: AI Assassins SaaS, GitHub repositories, Cloudflare worker, Supabase schema/auth paths, Stripe checkout/webhook code, OpenClaw workspace, Codex-ready documentation, and multiple deployment surfaces. The launch blocker is not feature construction. The blocker is business readiness.

Live Stripe checkout should remain paused until LLC formation, EIN, banking, accounting, legal docs, IP ownership, and Stripe business verification are complete.

Launch Readiness Score: 61 / 100

Recommended posture: controlled pre-launch, founder-led pilot preparation only.

## Files Created

| File | Purpose |
| --- | --- |
| `BUSINESS_READINESS_REPORT.md` | COO-level readiness audit and risk assessment |
| `LAUNCH_CHECKLIST.md` | Business-first launch checklist |
| `LLC_PREPARATION_PACKET.md` | LLC filing preparation packet |
| `EIN_REQUIREMENTS.md` | IRS EIN data and sequencing requirements |
| `BUSINESS_BANKING_REQUIREMENTS.md` | Banking and accounting readiness packet |
| `STRIPE_BUSINESS_SETUP.md` | Stripe business verification and billing gate |
| `INTELLECTUAL_PROPERTY_INVENTORY.md` | Trademark/copyright/trade secret inventory |
| `ARCHAIOS_ASSET_REGISTER.md` | Master asset inventory |
| `ARCHAIOS_COMMANDER_BRIEF.md` | Final commander summary |

## Master Asset Inventory

### Repositories

| Repo/Workspace | Role | Business Status |
| --- | --- | --- |
| `archaios-system` | Mixed core workspace, worker, docs, SQL, legacy systems | Active but fragmented |
| `~/ARCHAIOS/ai-assassins-client` | Active customer-facing frontend | Primary revenue app candidate |
| `~/ARCHAIOS/archaios-core` | Self-declared core runtime | Needs remote/ownership decision |
| `~/openclaw-work` | Local OpenClaw worker workspace | Internal support only |
| `~/.openclaw/workspace` | OpenClaw report workspace | Internal support only |

### Domains and Deployment Surfaces

| Surface | Role | Status |
| --- | --- | --- |
| `https://saintblack-ai.github.io/ai-assassins-client/` | GitHub Pages frontend | Active/fallback |
| `https://ai-assassins-client.vercel.app` | Vercel frontend alias | Active per docs |
| `https://archaios-saas-worker.quandrix357.workers.dev` | Cloudflare Worker backend | Active health endpoint |
| `https://saintblack-ai.github.io/Ai-Assassins` | Static marketing surface | Active/reference |
| Branded custom domain | Customer trust/Stripe verification | Missing |

### APIs

Business-critical APIs found:

- `GET /api/health`
- `GET /api/pricing`
- `GET /api/platform/dashboard`
- `GET /api/subscription`
- `GET /api/alerts`
- `POST /api/leads`
- `POST /api/cta-click`
- `POST /api/stripe/checkout`
- `POST /api/stripe/create-checkout-session`
- `POST /api/stripe/webhook`
- `POST /api/stripe/customer-portal`
- `GET /api/admin/dashboard`

Internal/product APIs found:

- `/api/agents/*`
- `/api/marketing/*`
- `/api/internal/cron/*`
- Supabase edge functions: `agent-orchestrator`, `stripe-webhook`

### Stripe Integrations

| Integration | Evidence | Status |
| --- | --- | --- |
| Checkout Sessions | Worker/server/app routes | Implemented, paused |
| Webhook processing | Worker/server/Supabase function | Implemented, unverified live |
| Customer portal | Worker/server routes | Implemented, unverified live |
| Pro price | Docs target `$49/mo` | Not externally verified |
| Elite price | Docs target `$99/mo` | Not externally verified |
| Required events | Checkout/subscription/invoice failure handlers | Mostly implemented |

### Supabase Projects and Data

Detected Supabase project configuration in env files. Schema evidence includes:

- `profiles`
- `subscriptions`
- `alerts`
- `leads`
- `cta_events`
- `revenue_events`
- `agent_logs`
- scheduled job and metrics tables

Business status: implemented locally, but live customer onboarding and subscription sync still require verification.

### Cloudflare Assets

| Asset | Role | Status |
| --- | --- | --- |
| `archaios-saas-worker` | Main SaaS backend | Active |
| `archaios-agents` | Scheduled agent worker | Internal/not launch-critical |
| Worker secrets | OpenAI, Supabase, Stripe | Must verify before launch |
| Cron triggers | Automation | Configured |

### Revenue-Producing Systems

| System | Revenue Model | Status |
| --- | --- | --- |
| AI Assassins Pro | $49/mo subscription | Built, paused |
| AI Assassins Elite | $99/mo subscription | Built, paused |
| Premium intelligence reports | Digital product | Prep |
| Book Growth Command | Service/productized workflow | Prep |
| Consulting intelligence packs | Founder-led service revenue | Recommended first revenue |
| Saint Black media funnels | Campaign monetization | Prep/reference |

## Critical Business Risks

1. No verified LLC, EIN, or business bank account.
2. Stripe business verification cannot be safely completed until legal and banking identity are ready.
3. Public legal documents are missing: Terms, Privacy, Refund/Cancellation, AI disclaimer, support policy.
4. Stripe products, prices, webhook, and subscription sync are not verified end to end.
5. Multiple production candidates and legacy paths create source-of-truth risk.
6. IP ownership is not yet assigned to a legal entity.
7. No confirmed branded custom domain for trust, support, and Stripe verification posture.

## Missing Before LLC Registration

- Formation state.
- Legal name and backup names.
- Registered agent.
- Principal office and mailing address.
- Member ownership and management structure.
- Operating agreement.
- Business purpose and NAICS candidate.
- Brand/name search.

## Missing Before Business Bank Account

- Approved LLC formation document.
- EIN confirmation letter.
- Operating agreement.
- Owner ID and ownership details.
- Business address, email, and phone.
- Initial deposit source.
- Accounting system and chart of accounts.

## Missing Before Stripe Business Verification

- Legal LLC name.
- EIN.
- Business bank account.
- Owner/representative identity details.
- Public website with offer, pricing, policies, support contact.
- Statement descriptor.
- Product/service description.
- Pro and Elite product/price IDs.
- Webhook endpoint and signing secret.

## Missing Before Customer Onboarding

- Terms of Service.
- Privacy Policy.
- Refund/Cancellation Policy.
- AI disclaimer.
- Support email and manual escalation process.
- Onboarding email sequence.
- Failed payment and cancellation handling.
- Manual access recovery procedure.

## Missing Before Revenue Collection

- LLC accepted.
- EIN issued.
- Business bank active.
- Stripe verified.
- Public legal pages live.
- Test checkout completed.
- Webhook writes subscription state.
- `profiles.tier` aligns with active access.
- Accounting ledger ready.

## 30-Day Launch Plan

### Week 1: Formation Packet and Legal Foundation

Primary objective: make the business formable.

Actions:

- Choose formation state.
- Choose LLC legal name and backup names.
- Decide whether `ARCHAIOS`, `AI Assassins`, and `Saint Black AI` are entity names, DBAs, or product marks.
- Select registered agent.
- Decide principal office and mailing address.
- Decide single-member or multi-member structure.
- Draft operating agreement.
- Draft Terms, Privacy, Refund/Cancellation, AI disclaimer, and support policy.
- Start trademark clearance notes for ARCHAIOS and AI Assassins.

Success condition:

- LLC filing packet is ready and legal docs are in draft form.

### Week 2: LLC Filing, EIN, Banking Prep

Primary objective: obtain business identity.

Actions:

- File LLC.
- Save state acceptance documents.
- Apply for EIN after LLC approval.
- Save EIN confirmation securely outside repo.
- Select bank.
- Prepare bank packet.
- Choose accounting tool.
- Create chart of accounts.
- Create receipt storage and reconciliation workflow.

Success condition:

- LLC and EIN are complete or pending with documented blockers.

### Week 3: Banking, Stripe, Policies

Primary objective: prepare revenue rails without live self-serve launch.

Actions:

- Open business checking account.
- Connect accounting tool to bank if appropriate.
- Finalize public legal pages.
- Configure Stripe business profile with LLC/EIN/bank data.
- Create/verify Pro and Elite products and monthly prices.
- Confirm webhook endpoint and signing secret.
- Standardize Stripe env naming before activation.
- Keep checkout in test mode.

Success condition:

- Stripe is business-verified or pending clear document requests.

### Week 4: Pilot Revenue and Controlled Launch

Primary objective: collect first revenue safely through controlled onboarding.

Actions:

- Run authenticated test checkout.
- Verify signed webhook updates Supabase `subscriptions`.
- Verify `profiles.tier` aligns with active access.
- Verify cancellation and failed-payment handling.
- Prepare 50 to 100 prospect list.
- Launch founder-led pilot offer.
- Use manual onboarding for first customers.
- Track revenue, support issues, refunds, and conversion notes weekly.

Success condition:

- One paid pilot/customer path works cleanly before broader public self-serve checkout.

## Primary Focus

For the next 30 days, focus only on:

1. Business formation.
2. Banking and accounting.
3. Public legal readiness.
4. Stripe verification.
5. First controlled recurring revenue.

Do not expand product scope until the business gate is complete.

## External Source Notes

- IRS EIN online application is free, requires responsible party data, and should follow state formation for LLCs: https://www.irs.gov/businesses/small-businesses-self-employed/get-an-employer-identification-number
- IRS responsible party must be a real controlling person, not a nominee: https://www.irs.gov/businesses/small-businesses-self-employed/responsible-parties-and-nominees
- SBA business banking commonly requires EIN, formation documents, ownership agreements, and licenses where applicable: https://www.sba.gov/business-guide/launch-your-business/open-business-bank-account
- Stripe verification can require business, representative, beneficial owner, tax ID, ID, address, and payout information: https://docs.stripe.com/connect/identity-verification
- USPTO IP categories clarify trademark, patent, and copyright coverage: https://www.uspto.gov/trademarks/basics/trademark-patent-copyright

## Commander Decision

Hold live Stripe checkout.

Proceed with LLC formation packet, EIN preparation, business banking, legal documentation, Stripe verification, and founder-led pilot revenue only.
