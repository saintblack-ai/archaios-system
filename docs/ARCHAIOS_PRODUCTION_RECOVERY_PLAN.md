# Archaios Production Recovery Plan

**Date:** 2026-06-20  
**Scope:** Restore the Vercel-hosted Next.js application. No values or secrets are included in this document.

## Connected Supabase Project

| Item | Identified configuration |
| --- | --- |
| Supabase project reference | `pedymtymubpirhaikymj` |
| Project URL | `https://pedymtymubpirhaikymj.supabase.co` |
| Public anonymous key | Present locally as `VITE_SUPABASE_ANON_KEY` in `client/.env.production`; do not copy it into source control or this document. |
| Public anonymous key destination for Vercel | Enter that same existing public anonymous key as `NEXT_PUBLIC_SUPABASE_ANON_KEY` in the Vercel Production environment. |

The project URL is consistently configured in `client/.env`, `client/.env.production`, `client/.env.development`, and `server/.env`. This gives a single, unambiguous Supabase project for the recovery.

## Deployment Location

| Deployment | Location currently expected to use the variables |
| --- | --- |
| Next.js application | Vercel team `saintblack-ai` -> project **`archaios-core`** (project ID `prj_7dYRs7hxblJU1HnkyTqUcA66T2Kv`) -> Production. The production alias is `https://archaios-system.vercel.app`. |
| Canonical Vite frontend | GitHub Pages workflow for `client/`; it uses `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`, not the Next.js `NEXT_PUBLIC_` names. |
| Backend | Cloudflare Worker `archaios-saas-worker`; it uses Worker-side `SUPABASE_*` configuration, not Vercel variables. |

## Confirmed Missing Vercel Production Variables

A name-only query of the Vercel project's environment configuration returned no configured entries. The immediate missing variables are:

| Variable name | Required now | Source in the codebase | Purpose |
| --- | --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | `app/lib/supabaseBrowser.ts`, `app/lib/supabaseServer.ts`, `middleware.ts` | Creates browser, server, and middleware Supabase clients. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | `app/lib/supabaseBrowser.ts`, `app/lib/supabaseServer.ts`, `middleware.ts` | Authenticates public Supabase client requests. |

These two names must be set exactly. `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` do not satisfy the Next.js deployment because Next.js only reads the `NEXT_PUBLIC_` names in this application.

## Required Before Launching Restricted Features

Do not block the route recovery on these additional settings, but configure them before enabling their related production feature:

| Variable name | Required for | Source location |
| --- | --- | --- |
| `SUPABASE_SERVICE_ROLE_KEY` | Protected data operations, admin checks, subscription persistence, and status APIs. Server-only. | `app/lib/supabaseAdmin.ts`, `app/api/system/status/route.ts` |
| `STRIPE_SECRET_KEY` | Checkout and webhook API routes. Server-only. | `app/lib/stripe.ts` |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook verification. Server-only. | `app/api/stripe/webhook/route.ts` |
| `STRIPE_PRICE_PRO` | Pro checkout. | `app/lib/stripeTier.ts` |
| `STRIPE_PRICE_ELITE` | Elite checkout. | `app/lib/stripeTier.ts` |
| `OPENAI_API_KEY` | The Next.js AI route. Server-only. | `app/api/ai/route.ts` |
| `WORKER_BASE_URL` | Explicit Cloudflare Worker integration. | `app/lib/workerClient.ts` |

Do not place `SUPABASE_SERVICE_ROLE_KEY`, Stripe secrets, `OPENAI_API_KEY`, or Worker tokens in any `NEXT_PUBLIC_` variable.

## Exact Vercel Procedure

1. Open the Vercel dashboard and select the `saintblack-ai` team.
2. Open project **`archaios-core`**, not the separate Vite project.
3. Navigate to **Settings -> Environment Variables**.
4. Select **Add New** and create `NEXT_PUBLIC_SUPABASE_URL`.
5. Enter the existing Archaios Supabase project URL shown above, select the **Production** environment, and save.
6. Select **Add New** and create `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
7. Enter the existing public anonymous key from the secure local deployment source identified above, select the **Production** environment, and save.
8. Navigate to **Deployments**, select the current production deployment or current `main` commit, and choose **Redeploy** with the **Production** target.
9. Wait for deployment state `Ready`, then confirm that `archaios-system.vercel.app` points to the new deployment.

No billing, domain, DNS, or Cloudflare change is part of this procedure.

## Dashboard Recovery Procedure

1. Set the two immediate variables and redeploy as described above.
2. Open `/dashboard` while signed out. It must redirect to login or return an intentional authorization response; it must not return `500` or `MIDDLEWARE_INVOCATION_FAILED`.
3. Sign in with an authorized test account using `/login`.
4. Open `/dashboard` again and confirm the session is recognized and dashboard data renders.
5. Inspect Vercel Production runtime logs. There must be no new missing-Supabase-variable, invalid-project-URL, or middleware initialization errors.
6. If the signed-in dashboard still fails, add the server-only `SUPABASE_SERVICE_ROLE_KEY`, redeploy, then check Supabase RLS policies and the Worker bearer-token configuration. Do not expose that service-role key in browser code.

## Route Testing Checklist

Run only after the replacement production deployment is `Ready`:

- [ ] `GET https://archaios-system.vercel.app/` returns `200` and no Supabase initialization exception.
- [ ] `GET https://archaios-system.vercel.app/login` returns `200` and the sign-in form renders.
- [ ] `GET https://archaios-system.vercel.app/pricing` returns `200` and pricing cards render.
- [ ] Signed-out `GET https://archaios-system.vercel.app/dashboard` does not return `500`.
- [ ] Authorized sign-in succeeds against `pedymtymubpirhaikymj`.
- [ ] Signed-in `/dashboard` renders without a Supabase or middleware error.
- [ ] Vercel Production runtime logs contain no new Supabase initialization errors.

## Current Verification and Readiness

Before the Vercel changes are made, production verification is:

| Route | Current result |
| --- | --- |
| `/login` | `200 OK` |
| `/pricing` | `200 OK` |
| `/dashboard` | `500 Internal Server Error` (`MIDDLEWARE_INVOCATION_FAILED`) |

After the two immediate variables are configured, redeployed, and the checklist passes, the application-route launch readiness estimate is **85%**. Overall paid-customer launch readiness remains **72%** until Stripe, Worker, subscription persistence, and authenticated checkout are verified end to end.
