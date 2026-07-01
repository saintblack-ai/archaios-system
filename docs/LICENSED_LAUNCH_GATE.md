# LICENSED_LAUNCH_GATE

Status: closed until licensing approval
Last updated: 2026-06-18

Compliance note: Do not transact or collect regulated data until licensed.

## Gate Rule

Production launch is blocked until every checklist item below is complete and recorded.

## Legal And Compliance

- [ ] Business/license approval recorded.
- [ ] Compliance approval recorded.
- [ ] Privacy policy approved.
- [ ] Terms of service approved.
- [ ] Refund policy approved.
- [ ] Regulated data handling policy approved.

## Secrets And Access

- [ ] Approved vault is active.
- [ ] Supabase access confirmed.
- [ ] Cloudflare access confirmed.
- [ ] GitHub Actions secret management access confirmed.
- [ ] Stripe test-mode access confirmed.
- [ ] Vercel access confirmed or Vercel marked non-production.
- [ ] No secrets are stored in chat, docs, Git history, screenshots, or browser env.

## Supabase

- [ ] Project is approved.
- [ ] Project URL is recorded.
- [ ] Anon key is stored in vault.
- [ ] Service-role key is stored in vault.
- [ ] Service-role key decodes as `service_role`.
- [ ] `auth.users` profile trigger is verified.
- [ ] Required runtime tables exist.
- [ ] RLS policies are reviewed.

## Migrations

- [ ] Minimum migration set applied.
- [ ] Legacy/root migration conflicts resolved.
- [ ] Optional migrations deferred or explicitly approved.
- [ ] Migration results archived.
- [ ] Rollback notes archived.

## Worker

- [ ] Cloudflare Worker secrets set.
- [ ] Worker deployed.
- [ ] `GET /api/health` passes.
- [ ] `GET /api/pricing` passes.
- [ ] Unsigned webhook rejection passes.
- [ ] No live revenue test has been run before approval.

## Frontend

- [ ] GitHub Pages env configured.
- [ ] Frontend deployed.
- [ ] Browser Supabase auth initializes.
- [ ] Signed-out users cannot start paid checkout.
- [ ] Dashboard free/pro/elite gate display reviewed.

## Stripe Test Mode

- [ ] Stripe test secret configured.
- [ ] Stripe webhook test secret configured.
- [ ] Pro test price id configured.
- [ ] Elite test price id configured.
- [ ] Test checkout completes.
- [ ] Test webhook updates `public.subscriptions`.
- [ ] Paid dashboard unlock verified with test user.

## Final Launch Decision

- [ ] First-dollar readiness report archived.
- [ ] Operator signs go/no-go.
- [ ] Production launch time recorded.
- [ ] Monitoring owner assigned.
- [ ] Incident rollback owner assigned.
