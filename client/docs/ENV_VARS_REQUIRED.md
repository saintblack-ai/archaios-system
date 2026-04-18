# Environment Variables Required

## Frontend

```text
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_BACKEND_URL=
VITE_ADMIN_EMAIL=
```

## Cloudflare Worker

```text
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PRICE_ID_PRO=
STRIPE_PRICE_ID_ELITE=
BACKEND_BASE_URL=
ADMIN_EMAIL=
CRON_SCHEDULE=
OPENAI_API_KEY=
RESEND_API_KEY=
DAILY_ALERT_TO=
```

## Optional Future

```text
CLOUDFLARE_ACCOUNT_ID=
VERCEL_PROJECT_ID=
VERCEL_ORG_ID=
POSTHOG_KEY=
PLAUSIBLE_DOMAIN=
```

## Security Rules

- Never expose service-role keys in frontend env vars.
- Never hardcode Stripe secret keys.
- Keep webhook secret only in the Worker environment.
- Use test mode before production.

