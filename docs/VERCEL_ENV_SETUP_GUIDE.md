# Vercel Environment Setup Guide

**Purpose:** Restore the Archaios Next.js production application without exposing or inventing configuration values.

## Exact Vercel Location

1. Open the Vercel dashboard for the `saintblack-ai` team.
2. Select the **`archaios-core`** project. Its project ID is `prj_7dYRs7hxblJU1HnkyTqUcA66T2Kv`; its live production alias is `archaios-system.vercel.app`.
3. Open **Settings**.
4. Open **Environment Variables**.
5. For each variable below, use **Add New** (or edit the existing entry), select the **Production** target, and save it.

This is the Vercel location for the immediate recovery. Do not make these entries in the `ai-assassins-client` Vite project unless its separate Vite deployment also needs them.

## Immediate Recovery Variables

Add the following two variables to **`archaios-core` -> Settings -> Environment Variables -> Production**:

| Variable | Required action | Why |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Enter the existing public Supabase project URL. | Required by server-side Supabase initialization, middleware, and browser authentication. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Enter the existing public Supabase anonymous key. | Required by server-side Supabase initialization, middleware, and browser authentication. |

`NEXT_PUBLIC_` values are delivered to browser bundles by Next.js. They must be genuine public Supabase configuration values, but they are not a place for a service-role key or a Stripe secret.

## Production Variables Required Before Feature Activation

Configure these in the same project and **Production** target before turning on the corresponding feature. Keep server-only credentials out of any `NEXT_PUBLIC_` variable.

| Feature | Required variables |
| --- | --- |
| Protected data, subscription state, and admin system APIs | `SUPABASE_SERVICE_ROLE_KEY` |
| Stripe checkout | `STRIPE_SECRET_KEY`, `STRIPE_PRICE_PRO`, `STRIPE_PRICE_ELITE` |
| Stripe webhooks | `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `SUPABASE_SERVICE_ROLE_KEY` |
| Next.js AI route | `OPENAI_API_KEY` |
| Explicit Worker integration | `WORKER_BASE_URL`; add `WORKER_AUTH_TOKEN` only when the target Worker route requires it |
| Legacy checkout-session route | `NEXT_PUBLIC_SITE_URL` |

The full cross-platform inventory, including Worker and GitHub Pages configuration, is in [PRODUCTION_ENVIRONMENT_AUDIT.md](../reports/PRODUCTION_ENVIRONMENT_AUDIT.md).

## Redeploy Required

Vercel environment-variable changes apply to new deployments. After saving the two immediate-recovery variables:

1. Open **Deployments** in the `archaios-core` project.
2. Open the current production deployment or deploy the current `main` branch again.
3. Use **Redeploy** and confirm the target is **Production**.
4. Wait for the deployment to reach `Ready`.
5. Confirm the production alias still points to that deployment.

Do not change billing, DNS, or domains as part of this recovery.

## Verification Steps

Run these checks after the new production deployment is ready:

| Check | URL or action | Expected behavior |
| --- | --- | --- |
| Home | `https://archaios-system.vercel.app/` | `200 OK`; the page renders instead of returning the missing-Supabase-variable error. |
| Login page | `https://archaios-system.vercel.app/login` | `200 OK`; sign-in form loads. Submit only with an authorized test account. |
| Pricing page | `https://archaios-system.vercel.app/pricing` | `200 OK`; plans render. No payment test is implied by this check. |
| Dashboard, signed out | `https://archaios-system.vercel.app/dashboard` | Redirect to login or an intentional access response; never a middleware `500`. |
| Dashboard, signed in | Sign in with an authorized test account, then open `/dashboard`. | Dashboard renders for permitted users and Supabase session reads succeed. |
| Supabase connection | Complete a test sign-in and inspect Vercel runtime logs. | No `Missing Supabase env vars` or invalid-project-URL errors; authentication callback/session requests complete successfully. |
| Runtime logs | Vercel **Logs** for `archaios-core`, Production. | No new Supabase initialization or middleware exceptions. |

## Current Baseline

Before configuration, verified production behavior is:

- `/login`: `200 OK`
- `/pricing`: `200 OK`
- `/dashboard`: `500 Internal Server Error` with `MIDDLEWARE_INVOCATION_FAILED`
- `/`: `500 Internal Server Error` with missing Supabase environment-variable errors in Vercel runtime logs

The public pages can render because they are pre-rendered. The dashboard and home route require Supabase initialization, which is why the missing configuration becomes a production outage there.

## Expected Recovery Result

Once both immediate-recovery variables are correctly configured and a new deployment is verified, Vercel application-route readiness is estimated at **85%**. Paid-customer readiness is still **72%** until the independent Stripe, Cloudflare Worker, subscription persistence, and authenticated checkout checks pass.

No values are included in this guide. Do not paste secrets into issue comments, pull requests, repository files, or browser-exposed `NEXT_PUBLIC_` variables.
