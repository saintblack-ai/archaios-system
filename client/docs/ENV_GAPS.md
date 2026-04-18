# ARCHAIOS Environment Gaps

Generated: 2026-04-16

No secret values were printed or inspected. This file records missing environment names and local config gaps only.

## Credential Boundary

The external audit stopped because required service credentials were missing or incomplete.

## Local Auth Presence

| Service | CLI Present | Local Config Present | Env Token Present | Status |
|---|---:|---:|---:|---|
| GitHub | Yes: `gh` | Yes: `~/.config/gh` | No `GITHUB_TOKEN` / `GH_TOKEN` | Partial |
| Vercel | No | No `~/.vercel` | No `VERCEL_TOKEN` | Missing |
| Cloudflare | Yes: `wrangler` | No `~/.wrangler` | No `CLOUDFLARE_API_TOKEN` / `CF_API_TOKEN` | Missing |
| Supabase | Yes: `supabase` | No `~/.supabase` | No `SUPABASE_ACCESS_TOKEN` | Missing |
| Stripe | Yes: `stripe` | Yes: `~/.config/stripe` | No `STRIPE_API_KEY` / `STRIPE_SECRET_KEY` | Partial |

## ai-assassins-client Required Environment

Frontend:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_BACKEND_URL`
- `VITE_ADMIN_EMAIL`
- Optional/current feature env:
  - `VITE_NEWS_API_KEY`
  - `VITE_ALPHA_VANTAGE_API_KEY`
  - `VITE_ALERT_WEBHOOK_URL`
  - `VITE_ALERT_WEBHOOK_TOKEN`
  - `VITE_ACLED_API_URL`
  - `VITE_ACLED_API_KEY`
  - `VITE_ACLED_EMAIL`

Worker:

- `ADMIN_EMAIL`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_PRICE_PRO` or normalized `STRIPE_PRICE_ID_PRO`
- `STRIPE_PRICE_ELITE` or normalized `STRIPE_PRICE_ID_ELITE`
- Optional:
  - `CRON_AUTH_TOKEN`

GitHub Actions:

- Variables:
  - `VITE_SUPABASE_URL`
  - `VITE_BACKEND_URL`
  - `VITE_ADMIN_EMAIL`
- Secrets:
  - `VITE_SUPABASE_ANON_KEY`

## Ai-Assassins Required Environment

Worker secrets:

- `OPENAI_API_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `RESEND_API_KEY`
- `DAILY_ALERT_TO`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- Optional/other docs:
  - `REVENUECAT_WEBHOOK_SECRET`
  - `AUTH_BEARER_TOKEN`
  - `ADMIN_TOKEN`
  - `BRIEF_BEARER_TOKEN`

Worker vars:

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `STRIPE_PRICE_ID_PRO`
- `STRIPE_PRICE_ID_ELITE`
- `FREE_BRIEFS_PER_DAY`
- `OPENAI_MODEL`
- `ALLOWED_ORIGINS`
- `PUBLIC_APP_URL`

GitHub Actions secrets:

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`
- Mobile signing secrets if app-store builds are used.

## saintblack-ai.github.io Required Environment

Detected Next-style code references:

- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_PRICE_PRO`
- `STRIPE_PRICE_ELITE`
- `STRIPE_PRICE_ENTERPRISE`
- `WORKER_AUTH_TOKEN`
- `ALLOW_STRIPE_LIVE_CREATE`

Static AI Assassins subfolder references:

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- Browser-local fallback keys:
  - `AIA_SUPABASE_URL`
  - `AIA_SUPABASE_ANON_KEY`

## Archaios OS Required Environment

- `ARCHAIOS_ENDPOINT`
- `ARCHAIOS_TOKEN`
- `GITHUB_REPO_URL`
- Optional dashboard PR links:
  - `PR_LINK_*`

## Next Actions

- Add read-only service auth locally, then rerun audit.
- Normalize Stripe price env naming across repos.
- Decide which repo owns each deployment environment.
- Create one `.env.example` per canonical repo with only required production variables.
- Avoid committing real secret values.

