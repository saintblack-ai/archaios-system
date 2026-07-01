# PHOENIX EXECUTION CHECKLIST

Status: Phase Zero launch-day plan
Last updated: 2026-06-18

Compliance note: Do not transact or collect regulated data until licensed.

## Phase Zero Rule

This checklist is for launch-day sequencing only. Do not execute production steps until licensing/compliance approval is recorded.

## Launch-Day Sequence

### 0. Legal Gate

- [ ] Business/license approval recorded.
- [ ] Compliance approval recorded.
- [ ] Vault approved.
- [ ] Operator roles assigned.
- [ ] Go/no-go owner assigned.
- [ ] Rollback owner assigned.

### 1. Access Gate

- [ ] Supabase access confirmed.
- [ ] Cloudflare access confirmed.
- [ ] GitHub secret management access confirmed.
- [ ] Vercel access confirmed or Vercel declared non-production.
- [ ] Stripe test-mode access confirmed.
- [ ] Local CLI versions checked.

### 2. Final Preflight

- [ ] Original Supabase project health checked.
- [ ] If original project is reachable, export schema before replacement.
- [ ] `docs/ARCHAIOS_MIGRATION_MANIFEST.md` reviewed.
- [ ] Legacy SQL conflicts resolved/deferred.
- [ ] `docs/LICENSED_LAUNCH_GATE.md` reviewed.
- [ ] `docs/PRE_LICENSE_STATUS.md` updated.

### 3. Supabase Project

- [ ] Create/select approved Supabase project.
- [ ] Record project URL in vault.
- [ ] Record anon key in vault.
- [ ] Record service-role key in vault.
- [ ] Verify service-role key role is `service_role`.
- [ ] Configure auth redirect URLs.

### 4. Migrations

- [ ] Apply `client/supabase/sql/2026-04-14_production_core_tables.sql`.
- [ ] Apply `client/supabase/sql/2026-04-25_profiles_tier_alignment.sql`.
- [ ] Apply `client/supabase/sql/2026-03-31_backend_cron_tables.sql`.
- [ ] Apply `client/supabase/sql/2026-03-30_production_scheduled_jobs.sql`.
- [ ] Apply `client/supabase/sql/2026-06-17_archaios_command_center_v1.sql`.
- [ ] Confirm expected runtime tables exist.
- [ ] Confirm `auth.users` profile trigger exists.
- [ ] Confirm RLS policies exist.

### 5. GitHub Frontend Env

- [ ] Set `VITE_BACKEND_URL`.
- [ ] Set `VITE_SUPABASE_URL`.
- [ ] Set `VITE_SUPABASE_ANON_KEY`.
- [ ] Confirm no server secrets are in frontend env.

### 6. Cloudflare Worker Secrets

- [ ] Set `SUPABASE_URL`.
- [ ] Set `SUPABASE_SERVICE_ROLE_KEY`.
- [ ] Set `STRIPE_SECRET_KEY` test-mode only.
- [ ] Set `STRIPE_WEBHOOK_SECRET` test-mode only.
- [ ] Set `STRIPE_PRICE_PRO` test price.
- [ ] Set `STRIPE_PRICE_ELITE` test price.
- [ ] Set `ADMIN_EMAIL` if required.
- [ ] Confirm Worker vars table names match migrations.

### 7. Optional Vercel Alignment

- [ ] Decide whether Vercel is production, preview, or inactive.
- [ ] If active, set `VITE_BACKEND_URL`.
- [ ] If active, set `VITE_SUPABASE_URL`.
- [ ] If active, set `VITE_SUPABASE_ANON_KEY`.
- [ ] Confirm no service-role key in Vite env.

### 8. Redeploy

- [ ] Deploy Worker.
- [ ] Run safe smoke checks.
- [ ] Deploy frontend.
- [ ] Confirm frontend loads.

### 9. Verification

- [ ] `GET /api/health` passes.
- [ ] `GET /api/pricing` passes.
- [ ] Unsigned webhook is rejected.
- [ ] Browser auth initializes.
- [ ] Signed-out checkout is blocked.
- [ ] Test user can sign in.
- [ ] `GET /api/subscription` works for test user.
- [ ] Test-mode lead handling approved and verified.
- [ ] Stripe test-mode checkout completes only after approval.
- [ ] Stripe webhook updates `public.subscriptions`.
- [ ] Paid dashboard unlock verified with test user only.

### 10. Archive

- [ ] Project ref recorded.
- [ ] Migration results recorded.
- [ ] Worker deploy ID recorded.
- [ ] Frontend deploy run recorded.
- [ ] Smoke test output recorded without secrets.
- [ ] Go/no-go result recorded.

## Abort Conditions

- [ ] Real payment attempted before approval.
- [ ] Real lead submitted before approval.
- [ ] Regulated data collected before approval.
- [ ] Secret appears in logs/docs/chat.
- [ ] Migration fails on auth/profile/subscription tables.
- [ ] Worker deploy fails.
- [ ] Frontend points to wrong backend.
- [ ] Webhook signature enforcement fails.

If any abort condition occurs, stop execution and move to `DISASTER_RECOVERY.md`.
