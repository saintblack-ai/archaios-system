# Vercel Production Verification

Verified: 2026-06-20

## Projects And Deployments

| Project | Framework | Latest production deployment | Commit | Status |
| --- | --- | --- | --- | --- |
| `archaios-core` | Next.js | `dpl_3p6sWWMqdtuJmYaeTej5N8LPNiFL` | `f1b7c1382eb10b9121edf605a6c657fddbc4a3a9` on `main` | Build `READY`; runtime is degraded |
| `ai-assassins-client` | Vite | `dpl_4ew1nvdethXnpWjgRJa3ErSBZ6Zf` | `33f86437a7a252c6d199cc9d07dee5131381f64c` on `main` | `READY` |

The `archaios-core` production deployment built successfully on Vercel. The build created the expected Next.js routes, including `/`, `/pricing`, `/login`, `/dashboard`, Stripe API routes, and Supabase-backed API routes.

## Public Route Results

| Hostname | Route | Result | Verified behavior |
| --- | --- | ---:| --- |
| `archaioscore.vercel.app` | `/` | 500 | Runtime failure |
| `archaioscore.vercel.app` | `/pricing` | 200 | Public pricing page serves |
| `archaioscore.vercel.app` | `/login` | 200 | Login page serves |
| `archaios-system.vercel.app` | `/` | 500 | Runtime failure |
| `archaios-system.vercel.app` | `/pricing` | 200 | Public pricing page serves |
| `archaios-system.vercel.app` | `/login` | 200 | Login page serves |
| `archaios-system.vercel.app` | `/dashboard` | 500 | Runtime failure |

Both hostnames resolve to the same `archaios-core` deployment. Vercel's recorded aliases list `archaios-system.vercel.app`; `archaioscore.vercel.app` resolves successfully but is not listed in the project or deployment alias inventory. Treat that hostname mapping as needing a Vercel-domain audit.

## Verified Runtime Failure

Vercel production runtime logs for `GET /` report:

```text
Missing Supabase env vars: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
```

This originates from `app/lib/supabaseServer.ts`. The homepage is dynamic and calls Supabase auth, so it cannot render without those two variables.

## Environment Variables To Verify In Vercel

Do not place values in source control. Verify only that the following names exist in the `Production` environment for the `archaios-core` project:

| Variable | Needed For | Status From Verification |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Homepage, browser auth, middleware | Missing at runtime |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Homepage, browser auth, middleware | Missing at runtime |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-side subscription, admin, and webhook operations | Must be verified before protected/API use |
| `STRIPE_SECRET_KEY` | Checkout and billing portal | Must be verified before billing use |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook verification | Must be verified before billing use |
| `STRIPE_PRICE_PRO` | Pro checkout | Must be verified before billing use |
| `STRIPE_PRICE_ELITE` | Elite checkout | Must be verified before billing use |
| `OPENAI_API_KEY` | AI routes | Must be verified before AI use |
| `ADMIN_EMAIL` | Admin authorization | Must be verified before admin use |

No secret values were read or recorded during this verification.

## Required Recovery Verification

1. Set the two missing public Supabase variables in the Vercel production environment.
2. Redeploy `archaios-core` from `main`.
3. Recheck `/`, `/login`, `/pricing`, and `/dashboard`.
4. Confirm runtime logs no longer contain `Missing Supabase env vars`.
5. Audit why `archaioscore.vercel.app` resolves but is absent from the project's listed aliases; do not remove or reassign either hostname until that is understood.
