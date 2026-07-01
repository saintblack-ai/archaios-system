# LAUNCH CHECKLIST

Audit date: 2026-06-12
Launch mode: Business-first launch preparation
Live billing status: Paused

## Current Launch Positioning

- Brand identity: Saint Black / AI Assassins / ARCHAIOS
- Free: limited preview with delayed sample signals and restricted execution
- Pro: `$49/month` full dashboard for daily intelligence, alerts, and execution workflows
- Elite: `$99/month` priority intelligence with deeper reports and high-urgency signal review
- Public notice: `Coming soon / Business onboarding in progress`
- Self-serve billing: do not promote until legal, tax, policy, Stripe, Supabase, and webhook checks pass

## Launch Placeholder Register

Replace every placeholder below before public paid launch.

| Placeholder | Current Value | Required Before Launch |
| --- | --- | --- |
| Business legal name | Pending LLC/legal formation | Final legal entity name |
| EIN / tax setup | Pending after business formation | EIN confirmation letter and tax profile |
| Privacy Policy | Placeholder URL required | Published privacy policy URL |
| Terms of Service | Placeholder URL required | Published terms URL |
| Refund Policy | Placeholder URL required | Published refund/cancellation URL |
| Contact email | Support email pending | Active support/contact inbox |

Recommended frontend env placeholders:

```bash
VITE_PUBLIC_BUSINESS_LEGAL_NAME=
VITE_PUBLIC_EIN_STATUS=pending
VITE_PUBLIC_PRIVACY_POLICY_URL=
VITE_PUBLIC_TERMS_URL=
VITE_PUBLIC_REFUND_POLICY_URL=
VITE_PUBLIC_CONTACT_EMAIL=
```

Recommended Worker/backend launch env:

```bash
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PRICE_PRO=
STRIPE_PRICE_ELITE=
```

Recommended frontend production env:

```bash
VITE_BACKEND_URL=https://archaios-saas-worker.quandrix357.workers.dev
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_STRIPE_PRO_PRICE_ID=
VITE_STRIPE_ELITE_PRICE_ID=
```

## Phase 1: Business Formation

| Item | Status | Owner | Evidence Needed |
| --- | --- | --- | --- |
| Choose LLC legal name | Needed | Founder | Name candidate and state search |
| Choose formation state | Needed | Founder | State decision |
| Choose registered agent | Needed | Founder | Agent name/address |
| Choose business address | Needed | Founder | Mailing/principal office |
| Choose member structure | Needed | Founder | Member list and percentages |
| Decide manager-managed vs member-managed | Needed | Founder | Operating structure |
| Draft operating agreement | Needed | Founder/legal | Signed agreement |
| File LLC | Not started/unknown | Founder | State acceptance |
| Save formation documents | Needed | Founder | Articles/certificate |

## Phase 2: Tax Identity

| Item | Status | Evidence Needed |
| --- | --- | --- |
| Identify responsible party | Needed | Responsible party name and TIN on hand |
| Prepare EIN data | Needed | Completed EIN worksheet |
| Apply for EIN after LLC approval | Waiting | IRS EIN confirmation letter |
| Store EIN letter securely | Waiting | PDF/print confirmation |
| Create business tax calendar | Needed | Federal/state due dates |

## Phase 3: Banking and Accounting

| Item | Status | Evidence Needed |
| --- | --- | --- |
| Select bank or fintech bank | Needed | Institution selected |
| Prepare bank packet | Needed | Formation docs, EIN, operating agreement, ID |
| Open business checking account | Waiting | Account active |
| Open business savings account | Optional | Account active |
| Apply for business credit card | Optional | Card active |
| Choose accounting tool | Needed | QuickBooks/Wave/Xero/spreadsheet selected |
| Create chart of accounts | Needed | SaaS revenue, consulting revenue, software, ads, fees |
| Create receipt storage workflow | Needed | Folder/tool policy |

## Phase 4: Legal and Policy

| Item | Status | Evidence Needed |
| --- | --- | --- |
| Terms of Service | Missing | Published URL |
| Privacy Policy | Missing | Published URL |
| Refund/Cancellation Policy | Missing | Published URL |
| AI Output Disclaimer | Missing | Published URL |
| Support Policy | Missing | Support email and SLA |
| Data handling statement | Missing | Published URL |
| Customer onboarding terms | Missing | Signup/checkout acceptance language |
| Contractor/IP assignment template | Missing | Template prepared |

## Phase 5: IP Protection

| Item | Status | Evidence Needed |
| --- | --- | --- |
| Brand inventory | Prepared in `INTELLECTUAL_PROPERTY_INVENTORY.md` | Complete asset list |
| Trademark clearance for ARCHAIOS | Needed | USPTO search notes |
| Trademark clearance for AI Assassins | Needed | USPTO search notes |
| Logo/source file inventory | Needed | Asset folder |
| Copyright asset register | Needed | Code/docs/content/media ownership list |
| Domain ownership inventory | Needed | Registrar and renewal dates |
| Trade secret handling | Needed | Access control policy |

## Phase 6: Stripe Setup

| Item | Status | Evidence Needed |
| --- | --- | --- |
| Business entity exists | Waiting | LLC accepted |
| EIN exists | Waiting | EIN letter |
| Bank account exists | Waiting | Routing/account attached |
| Stripe business profile filled | Waiting | Dashboard complete |
| Public business website available | Partial | URL with policies |
| Pro product configured | Unverified | Product ID and price ID |
| Elite product configured | Unverified | Product ID and price ID |
| Webhook configured | Unverified | Endpoint and signing secret |
| Test checkout verified | Not complete | Test payment and access sync |
| Live checkout enabled | Paused | Explicit go-live approval |

## Phase 7: Customer Acquisition

| Item | Status | Evidence Needed |
| --- | --- | --- |
| Define ICP | Needed | Target customer notes |
| Define first offer | Partial | Pro/Elite plus pilot offer |
| Draft 30-day outreach list | Needed | 50 to 100 prospects |
| Prepare founder-led demo script | Needed | Script and screenshots |
| Prepare onboarding email | Needed | Email sequence |
| Prepare support inbox | Needed | Support email active |
| Define cancellation workflow | Needed | Manual support procedure |
| Define failed-payment workflow | Needed | Stripe dunning/customer support policy |

## Launch Gate

Do not collect recurring revenue until all `Required` gates are green:

| Gate | Required | Current |
| --- | --- | --- |
| LLC accepted | Yes | Not verified |
| EIN issued | Yes | Not verified |
| Business bank account | Yes | Not verified |
| Stripe verified | Yes | Not verified |
| Public policies | Yes | Missing |
| Test checkout passes | Yes | Not complete |
| Webhook tier sync passes | Yes | Not complete |
| Customer support path | Yes | Missing |
| Production frontend `VITE_BACKEND_URL` set to public Worker | Yes | Example updated; deployment env must be verified |
| Signed-out checkout blocked before Stripe redirect | Yes | Implemented in UI; test before launch |
| Lead capture storage and CTA tracking verified | Yes | Code wired; backend must be verified |
| Supabase auth confirmation retry verified | Yes | Code wired; test in project settings |

## Launch Readiness Score

Current score: 61 / 100

Minimum score recommended for live self-serve checkout: 85 / 100

Minimum score recommended for founder-led paid pilot: 75 / 100
