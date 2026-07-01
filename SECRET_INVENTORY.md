# SECRET INVENTORY

Status: Phoenix Phase Zero
Last updated: 2026-06-18

Compliance note: Do not transact or collect regulated data until licensed.

## Handling Policy

- Never paste keys in chat, docs, screenshots, issues, PR comments, or terminal transcripts.
- Store keys only in an approved vault and platform secret stores.
- Local `.env` files are for development only and must remain ignored by Git.
- Browser variables may only contain public-safe values.
- Rotate any key that appears in Git history, chat, logs, docs, screenshots, or an unapproved machine.

## Required Secrets And Variables

| Name | Type | Source Platform | Runtime Storage | Rotation Frequency | Notes |
| --- | --- | --- | --- | --- | --- |
| `VITE_BACKEND_URL` | public variable | Cloudflare Worker URL | GitHub variable, optional Vercel env | On backend URL change | Browser points to public Worker. |
| `VITE_SUPABASE_URL` | public variable | Supabase project settings | GitHub variable, optional Vercel env | On Supabase project replacement | Browser auth URL. |
| `VITE_SUPABASE_ANON_KEY` | public anon key | Supabase API settings | GitHub secret, optional Vercel encrypted env, vault | Project replacement or quarterly review | Browser-safe but still controlled. |
| `SUPABASE_URL` | server variable/secret | Supabase project settings | Cloudflare Worker secret or var, vault | On Supabase project replacement | Worker database URL. |
| `SUPABASE_SERVICE_ROLE_KEY` | high-risk secret | Supabase API settings | Cloudflare Worker secret, vault | On exposure, staff change, project replacement, quarterly review | Must decode as `service_role`; never browser-exposed. |
| `SUPABASE_ACCESS_TOKEN` | operator secret | Supabase account | Vault, local operator shell only | On operator change or task completion | Used for Supabase CLI/API; not runtime. |
| `CLOUDFLARE_API_TOKEN` | operator secret | Cloudflare | Vault, local operator shell or CI secret | On operator change or task completion | Use least privilege for Workers secret/deploy operations. |
| `STRIPE_SECRET_KEY` | high-risk secret | Stripe dashboard | Cloudflare Worker secret, vault | On exposure, mode change, staff change | Test mode only until licensed. |
| `STRIPE_WEBHOOK_SECRET` | high-risk secret | Stripe webhook endpoint | Cloudflare Worker secret, vault | On endpoint recreation or exposure | Verifies webhook signatures. |
| `STRIPE_PRICE_PRO` | identifier/secret-like | Stripe product catalog | Cloudflare Worker secret, vault | On pricing/product change | Test price id until licensed. |
| `STRIPE_PRICE_ELITE` | identifier/secret-like | Stripe product catalog | Cloudflare Worker secret, vault | On pricing/product change | Test price id until licensed. |
| `ADMIN_EMAIL` | operational secret-ish | Operator decision | Cloudflare Worker secret/var, optional frontend variable if public | On admin ownership change | Avoid personal exposure where possible. |
| `CRON_AUTH_TOKEN` | optional secret | Operator-generated | Cloudflare Worker secret, vault | Quarterly or on exposure | Protects internal cron calls if enabled. |
| `OPENAI_API_KEY` | optional secret | OpenAI platform | Cloudflare Worker secret or server-only env, vault | On exposure or staff change | Only if AI routes are active. |
| `VITE_STRIPE_PUBLISHABLE_KEY` | public key | Stripe dashboard | GitHub/Vercel browser env | On Stripe account/mode change | Public key, test mode until licensed. |
| `WORKER_AUTH_TOKEN` | optional secret | Operator-generated | Vault/local only | Quarterly or on exposure | Legacy/protected route token if used. |

## Storage Locations

Approved:

- Vault: final source of truth.
- GitHub Actions secrets/variables: frontend build-time public config and anon key only.
- Cloudflare Worker secrets: server-only runtime secrets.
- Vercel encrypted env: only if Vercel is retained.
- Local `.env`: development only.

Forbidden:

- Chat.
- Markdown docs with real values.
- Git commits.
- Browser-exposed env for server secrets.
- Screenshots.
- Terminal transcripts saved to docs.

## Rotation Plan

Immediate rotation required if:

- Secret was pasted into chat.
- Secret was committed.
- Secret appeared in logs.
- Secret was sent to the wrong platform.
- Operator access changes.
- Supabase project is replaced.
- Stripe mode changes from test to live.

Scheduled rotation:

- Supabase anon key: quarterly or project replacement.
- Supabase service-role key: quarterly, on access change, or project replacement.
- Cloudflare API token: quarterly or per recovery window.
- Stripe test secret: quarterly or on staff/access change.
- Stripe webhook secret: on endpoint recreation or quarterly.
- Admin/cron tokens: quarterly.

## Verification Without Disclosure

Supabase JWT role check:

```bash
node -e 'const token=process.env.SUPABASE_SERVICE_ROLE_KEY; const payload=JSON.parse(Buffer.from(token.split(".")[1],"base64url").toString("utf8")); console.log(payload.role)'
```

Expected service-role output:

```text
service_role
```

Do not print full tokens.
