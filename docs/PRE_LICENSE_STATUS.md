# Archaios Phoenix Pre-License Status

Status: pre-license safe prep
Last updated: 2026-06-18

Compliance note: Do not transact or collect regulated data until licensed.

## What Is Ready

- Phoenix recovery runbook exists: `docs/ARCHAIOS_PHOENIX_RUNBOOK.md`.
- Master migration manifest exists: `docs/ARCHAIOS_MIGRATION_MANIFEST.md`.
- Dry-run smoke script exists: `scripts/phoenix-smoke-dry-run.sh`.
- Expected runtime tables are identified:
  - `auth.users`
  - `public.profiles`
  - `public.subscriptions`
  - `public.leads`
  - `public.alerts`
  - `public.cta_events`
  - `public.revenue_events`
- Minimum migration order is documented.
- Migration conflict groups are identified.
- GitHub Pages workflow has production env validation guardrails.
- Worker public health/pricing smoke tests are defined.
- Webhook signature enforcement check is defined as a safe test.
- Paid dashboard unlock logic can be dry-run with stub subscription states.

## What Is Blocked

- Production Supabase replacement project creation.
- Real lead capture.
- Real Stripe checkout.
- Real dashboard paid unlock based on payment.
- Production Worker secret mutation.
- Production frontend redeploy for monetized launch.
- Any regulated data collection.
- Any live revenue test.

## Credentials Needed Later

Store these only in the approved vault and platform secret stores. Never paste them in chat.

- Supabase dashboard access or `SUPABASE_ACCESS_TOKEN`.
- Supabase replacement project URL.
- Supabase anon key.
- Supabase service-role key verified as `service_role`.
- `CLOUDFLARE_API_TOKEN` or authenticated Wrangler access.
- GitHub Actions secret/variable management access.
- Vercel project access if Vercel remains linked.
- Stripe test-mode secret key.
- Stripe webhook secret.
- Stripe Pro and Elite test price ids.
- Approved admin email.

## What Must Not Be Done Until Licensed

- Do not create a production Supabase replacement project.
- Do not collect payments.
- Do not run live revenue tests.
- Do not submit real customer leads.
- Do not collect regulated personal, financial, health, or sensitive data.
- Do not advertise paid access as live.
- Do not enable production checkout.
- Do not run Stripe live mode.
- Do not claim paid dashboard unlock is production-ready.
- Do not store secrets outside the vault or platform secret stores.

## Safe Work Allowed

- Documentation.
- Architecture hardening.
- Migration planning.
- Security and secrets reviews.
- SOPs and runbooks.
- Dry-run scripts.
- Local-only unit tests with stub data.
- Public health and pricing endpoint checks.
- Unsigned webhook rejection checks.
- Review of GitHub, Cloudflare, Vercel, and Supabase configuration without revealing secrets.

## Remaining Blockers

- Business/license approval.
- Vault location approval.
- Supabase project authorization.
- Cloudflare API access.
- GitHub secret/variable setup.
- Stripe test-mode verification plan.
- Final choice of GitHub Pages vs Vercel as the public frontend path.
- Final migration conflict decision for legacy root `sql/` files.

## Next Action After Business License Arrives

1. Record license/compliance approval.
2. Approve the Phoenix replacement window.
3. Confirm vault and operator access.
4. Create or select the authorized Supabase project.
5. Apply the minimum migration set from `docs/ARCHAIOS_MIGRATION_MANIFEST.md`.
6. Set GitHub, Cloudflare, and optional Vercel env values.
7. Redeploy Worker.
8. Redeploy frontend.
9. Run safe smoke tests.
10. Run Stripe test-mode checkout only after explicit launch approval.

## LICENSED_LAUNCH_GATE

All items must be checked before production revenue or regulated data collection.

- [ ] Business/license approval recorded.
- [ ] Compliance approval recorded.
- [ ] Vault approved and accessible.
- [ ] Supabase project approved.
- [ ] Supabase anon key stored in vault and platform env.
- [ ] Supabase service-role key verified as `service_role` and stored server-side only.
- [ ] Minimum migrations applied successfully.
- [ ] Migration conflict groups reviewed and resolved.
- [ ] GitHub Pages env variables/secrets configured.
- [ ] Cloudflare Worker secrets configured.
- [ ] Vercel env configured or Vercel declared non-production.
- [ ] Worker redeployed successfully.
- [ ] Frontend redeployed successfully.
- [ ] `GET /api/health` passes.
- [ ] `GET /api/pricing` passes.
- [ ] Unsigned webhook is rejected.
- [ ] Test-mode lead handling is approved and verified.
- [ ] Stripe test-mode checkout completes.
- [ ] Stripe webhook updates `public.subscriptions`.
- [ ] Paid dashboard unlock is verified with test user only.
- [ ] No live mode Stripe keys are enabled.
- [ ] No real customer payment has been collected before final approval.
- [ ] No regulated data collection is active before final approval.
- [ ] Final go/no-go decision is recorded.
