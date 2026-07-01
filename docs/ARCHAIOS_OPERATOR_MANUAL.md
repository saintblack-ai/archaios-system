# Archaios Operator Manual

**Operator:** Saint Black  
**Purpose:** Keep the existing stack reliable, revenue-observable, and recoverable with small, repeatable routines.

## Daily Operations

1. Check GitHub `main`, open PRs, failed Actions, and uncommitted local work. Do not deploy from a dirty workspace.
2. Check the canonical Worker health endpoint. Confirm `ok: true`, `service: archaios-saas-worker`, and the expected release value. A `200` alone is insufficient.
3. Check the customer frontend, login, pricing, signed-out dashboard, and the most recent Vercel runtime errors.
4. Review Supabase project availability, auth error rate, and failed database requests. Record any DNS, authentication, or RLS error before changing configuration.
5. Review Stripe test/live mode intentionally: new subscriptions, failed payments, refunds, disputes, and webhook failures. Do not perform live-mode actions without an approved operating decision.
6. Record one short SITREP in Notion: status, revenue numbers, incidents, decisions, and the next one action.
7. Add new research, mission logs, and key decisions to the Black Vault source folder before they remain only in a chat, browser tab, or memory.

## Weekly Operations

1. Run the focused verification suite: `npm run check:env`, `npm run build:client`, `node --test tests/revenue-readiness.test.mjs`, and `node --test tests/archivist-agent.test.mjs` when their working-tree changes are intentionally included.
2. Review the Vercel deployment list and runtime logs. Keep the last known good deployment ID and commit in Notion.
3. Verify GitHub Pages workflow status and inspect the published site from an unauthenticated browser session.
4. Compare Worker source identity with live `/api/health`. If identity differs, stop revenue work and recover deployment alignment.
5. Confirm Supabase backup/export completion, migration history, row-level-security posture, and subscription uniqueness contract.
6. Reconcile Stripe subscriptions against `public.subscriptions` using a controlled test-mode check until live mode is formally enabled.
7. Export Notion decisions and Black Vault indexes to a versioned, non-Notion format.
8. Review open tasks against revenue impact. Close stale work rather than carrying it indefinitely.

## Monthly Operations

1. Perform a restoration drill: clone the repository into a temporary directory, build the frontend, inspect the migration manifest, and verify a restored documentation package opens without Notion.
2. Create an encrypted archive snapshot containing Git history, docs, SQL migrations, Black Vault index, essential creative metadata, and a checksums manifest. Store one copy outside iCloud and one copy offsite.
3. Rotate or review high-risk credentials according to account policy; update the secret inventory without recording secret values.
4. Review Stripe balance, payouts, disputes, churn, refunds, and revenue by plan. Reconcile with Supabase subscription records.
5. Review access: GitHub administrators, Vercel members, Cloudflare members, Supabase administrators, Stripe administrators, and Notion sharing.
6. Update the successor contact list, asset register, and recovery instructions when any account, repository, or ownership record changes.

## Revenue Monitoring

| Metric | Daily view | Weekly decision |
| --- | --- | --- |
| Unique pricing visitors | Analytics or page logs | Is traffic growing from a named channel? |
| Signup conversion | Signups divided by pricing visitors | Is onboarding or the offer the bottleneck? |
| Checkout starts | Stripe/Worker events | Is authenticated checkout reachable? |
| Paid conversions | Active paid subscriptions | Did a test or production checkout persist correctly? |
| MRR | Active subscription value | Are Pro and Elite revenue reconciled with Stripe? |
| Failed payments and churn | Stripe events | Is customer follow-up required? |
| Lead response time | Lead queue | Was every qualified lead answered within one business day? |

Never invent metrics. If the event source is not verified, mark the metric `unavailable` and prioritize restoring the source.

## Backup Procedure

1. Export Git repository history with `git bundle` or a full mirror clone; include untracked preservation files only after deliberate review.
2. Export Supabase schema, migrations, authenticated data, and storage inventory through approved Supabase tooling. Keep data exports encrypted.
3. Export Stripe product, price, customer, subscription, invoice, dispute, and payout reports where permitted. Do not put customer exports in Git.
4. Export Notion databases and pages to Markdown/PDF plus an attachment manifest.
5. Create SHA-256 checksums for every archive and store the manifest beside the archive.
6. Maintain at least three copies: working copy, independent cloud copy, and offline/offsite copy. Test restoration quarterly.

## Incident Rule

When a critical route, payment flow, or data connection fails: capture the exact error, timestamp, deployment ID, and recent change first; then use `ARCHAIOS_DISASTER_RECOVERY.md`. Do not change multiple platforms at once.
