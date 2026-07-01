# DISASTER RECOVERY

Status: Phoenix Phase Zero
Last updated: 2026-06-18

Compliance note: Do not transact or collect regulated data until licensed.

## Recovery Principles

1. Health-check first.
2. Preserve evidence before mutation.
3. Do not expose secrets while recovering.
4. Prefer dry-run checks before writes.
5. Do not run revenue flows or collect regulated data until licensed.
6. Record every decision in the archive.

## Database Loss

Failure signals:

- Supabase URL DNS failure.
- `/auth/v1/health` unreachable.
- Worker routes returning Supabase HTTP errors.
- Auth sessions fail to resolve user.
- Lead/subscription writes fail.

Immediate safe actions:

- Run public health check: `curl https://<project-ref>.supabase.co/auth/v1/health`.
- Verify current project ref from env docs and vault.
- Check whether project is paused, deleted, or inaccessible.
- If reachable, export schema before modifying.
- If unreachable, classify as deleted/paused/unknown.

Recovery path after approval:

- Create/select replacement Supabase project.
- Apply minimum migration set from `docs/ARCHAIOS_MIGRATION_MANIFEST.md`.
- Verify expected runtime tables.
- Update GitHub and Cloudflare env/secrets.
- Redeploy and run safe smoke tests.

Critical data at risk:

- `auth.users`
- `public.profiles`
- `public.subscriptions`
- `public.leads`
- `public.alerts`
- `public.cta_events`
- `public.revenue_events`

## Worker Loss

Failure signals:

- `GET /api/health` fails.
- Workers.dev host unavailable.
- Cloudflare deployment missing.
- Worker secrets missing or invalid.

Immediate safe actions:

- Check Cloudflare dashboard.
- Verify `wrangler.toml` and `client/wrangler.jsonc`.
- Verify Worker name: `archaios-saas-worker`.
- Run local build/lint only if available.
- Do not mutate secrets until recovery window is approved.

Recovery path after approval:

- Restore Worker code from Git.
- Restore Worker secrets from vault.
- Deploy with `npx wrangler deploy --name archaios-saas-worker`.
- Run `scripts/phoenix-smoke-dry-run.sh`.

## GitHub Loss

Failure signals:

- Repository inaccessible.
- Actions unavailable.
- GitHub Pages deployment unavailable.
- Branch history missing.

Immediate safe actions:

- Preserve local workspace.
- Check remote URL: `https://github.com/saintblack-ai/archaios-system.git`.
- Confirm local branch and commit status.
- Export critical docs/migrations to archive storage.

Recovery path after approval:

- Restore repository from local clone or backup.
- Recreate GitHub Pages workflow.
- Recreate repository variables/secrets from vault.
- Re-run frontend build.

Critical assets:

- `.github/workflows/deploy.yml`
- `client/`
- `client/supabase/sql/`
- `docs/ARCHAIOS_PHOENIX_RUNBOOK.md`
- `docs/ARCHAIOS_MIGRATION_MANIFEST.md`
- `scripts/phoenix-smoke-dry-run.sh`

## Stripe Loss

Failure signals:

- Stripe dashboard inaccessible.
- Price IDs invalid.
- Checkout session creation fails.
- Webhook signatures fail unexpectedly.
- Subscription sync missing.

Immediate safe actions:

- Keep Stripe in test mode until licensed.
- Verify webhook route rejects unsigned payload.
- Confirm price ID names from vault.
- Do not create live payments before licensing approval.

Recovery path after approval:

- Recreate test products/prices.
- Recreate webhook endpoint to Worker.
- Store new webhook secret in vault and Worker secret.
- Run test-mode checkout only.
- Verify `public.subscriptions` sync.

## Domain Loss

Failure signals:

- GitHub Pages frontend unavailable.
- Workers.dev backend unavailable.
- Custom domain unavailable or DNS misconfigured.
- Vercel alias conflict.

Immediate safe actions:

- Use canonical fallback URLs:
  - Frontend: `https://saintblack-ai.github.io/ai-assassins-client/`
  - Worker: `https://archaios-saas-worker.quandrix357.workers.dev`
- Verify DNS ownership before making changes.
- Do not update payment/webhook live URLs until licensed.

Recovery path after approval:

- Restore DNS records.
- Reverify GitHub Pages or Vercel domain assignment.
- Reverify Cloudflare Worker route.
- Update `VITE_BACKEND_URL` only after backend URL is stable.
- Rebuild frontend after URL changes.

## Recovery Checklist

- [ ] Incident type identified.
- [ ] Evidence captured.
- [ ] Secrets protected.
- [ ] Compliance restriction confirmed.
- [ ] Recovery owner assigned.
- [ ] Rollback owner assigned.
- [ ] Safe smoke checks run.
- [ ] Mutation approved before any production change.
- [ ] Archive updated after recovery.
