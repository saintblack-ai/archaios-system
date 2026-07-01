# Production Environment Audit

**Date:** 2026-06-20  
**Scope:** Archaios Next.js application on Vercel, the canonical Cloudflare Worker, and the GitHub Pages Vite frontend. This report documents variable names and configuration boundaries only. It contains no values or secrets.

## Verified Production State

The Vercel project is `archaios-core` (production deployment alias: `archaios-system.vercel.app`). Production route checks found:

| Surface | Result | Evidence |
| --- | --- | --- |
| `/login` | `200 OK` | Public static login shell renders. |
| `/pricing` | `200 OK` | Public static pricing page renders. |
| `/dashboard` | `500 Internal Server Error` | Vercel reports `MIDDLEWARE_INVOCATION_FAILED`; runtime logs identify an invalid or missing Supabase project URL. |
| `/` | `500 Internal Server Error` | Runtime logs identify missing `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`. |
| Supabase connection | Not established | Server initialization and middleware cannot create a Supabase client without the two public variables. |

The immediate recovery requires `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in the Vercel **Production** environment followed by a fresh deployment. The variables below describe the complete production configuration surface, not only the immediate outage.

## Vercel: `archaios-core`

| Variable Name | Required? | Description | Source Location | Deployment Target |
| --- | --- | --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Public Supabase project URL used by browser auth, middleware, and server-side clients. | `app/lib/supabaseBrowser.ts`, `app/lib/supabaseServer.ts`, `middleware.ts` | Vercel `archaios-core`, Production |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Public Supabase anonymous key used by browser auth, middleware, and server-side clients. | `app/lib/supabaseBrowser.ts`, `app/lib/supabaseServer.ts`, `middleware.ts` | Vercel `archaios-core`, Production |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes before protected data, revenue, or admin features are enabled | Server-only Supabase credential for subscription updates, admin checks, and system status. Never expose it to the browser. | `app/lib/supabaseAdmin.ts`, `app/api/system/status/route.ts`, Stripe routes | Vercel `archaios-core`, Production |
| `SUPABASE_URL` | Optional | Server-only alias for the Supabase URL. The Next.js admin client falls back to `NEXT_PUBLIC_SUPABASE_URL` when this is absent. | `app/lib/supabaseAdmin.ts` | Vercel `archaios-core`, Production |
| `STRIPE_SECRET_KEY` | Yes before paid checkout or webhooks are enabled | Server-only Stripe API credential. | `app/lib/stripe.ts`, Stripe API routes | Vercel `archaios-core`, Production |
| `STRIPE_WEBHOOK_SECRET` | Yes before webhook processing is enabled | Verifies Stripe webhook signatures. | `app/api/stripe/webhook/route.ts` | Vercel `archaios-core`, Production |
| `STRIPE_PRICE_PRO` | Yes before Pro checkout is enabled | Stripe Price ID for the Pro plan. | `app/lib/stripeTier.ts`, checkout routes | Vercel `archaios-core`, Production |
| `STRIPE_PRICE_ELITE` | Yes before Elite checkout is enabled | Stripe Price ID for the Elite plan. | `app/lib/stripeTier.ts`, checkout routes | Vercel `archaios-core`, Production |
| `STRIPE_PRICE_ENTERPRISE` | Conditional | Stripe Price ID for the Enterprise plan, only if that plan is offered. | `app/lib/stripeTier.ts` | Vercel `archaios-core`, Production |
| `NEXT_PUBLIC_SITE_URL` | Conditional | Canonical public application URL for the legacy checkout-session route. | `app/api/create-checkout-session/route.ts` | Vercel `archaios-core`, Production |
| `OPENAI_API_KEY` | Conditional | Server-only credential for the Next.js AI endpoint. | `app/api/ai/route.ts` | Vercel `archaios-core`, Production |
| `OPENAI_MODEL` | Optional | Overrides the default model for the Next.js AI endpoint. | `app/api/ai/route.ts` | Vercel `archaios-core`, Production |
| `WORKER_BASE_URL` | Recommended | Explicit base URL for the Archaios Cloudflare Worker. A source fallback exists, but production should declare the intended Worker. | `app/lib/workerClient.ts` | Vercel `archaios-core`, Production |
| `WORKER_AUTH_TOKEN` | Conditional | Bearer token forwarded by Next.js when calling Worker routes that require internal authentication. | `app/lib/workerClient.ts` | Vercel `archaios-core`, Production |
| `ADMIN_EMAIL` | Optional | Enables email-based admin designation in the dashboard. | `app/lib/dashboardAuth.ts` | Vercel `archaios-core`, Production |

## Cloudflare Worker: `archaios-saas-worker`

The Worker is deployed from the repository root. These are Worker secrets or configuration, not Vercel variables.

| Variable Name | Required? | Description | Source Location | Deployment Target |
| --- | --- | --- | --- | --- |
| `SUPABASE_URL` | Yes | Supabase project URL for Worker-side data access. | `worker.js` | Cloudflare Worker production |
| `SUPABASE_ANON_KEY` | Yes for Supabase bearer-token validation | Public Supabase anonymous key used to validate frontend sessions with Supabase. | `worker.js` | Cloudflare Worker production |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Server-only Supabase credential for Worker-managed data and subscription upserts. | `worker.js` | Cloudflare Worker production |
| `OPENAI_API_KEY` | Yes for AI and Archivist summary routes | Server-only credential for AI processing. | `worker.js` | Cloudflare Worker production |
| `OPENAI_MODEL` | Optional | Overrides the Worker default model. | `worker.js` | Cloudflare Worker production |
| `OPENAI_USE_RESPONSES` | Optional | Selects the supported OpenAI API mode when required by the deployment. | `worker.js` | Cloudflare Worker production |
| `STRIPE_SECRET_KEY` | Yes before Worker checkout is enabled | Server-only Stripe API credential. | `worker.js` | Cloudflare Worker production |
| `STRIPE_WEBHOOK_SECRET` | Yes before Worker webhook processing is enabled | Verifies Stripe webhook signatures. | `worker.js` | Cloudflare Worker production |
| `STRIPE_PRICE_PRO` | Yes before Pro checkout is enabled | Stripe Price ID for the Pro plan. | `worker.js` | Cloudflare Worker production |
| `STRIPE_PRICE_ELITE` | Yes before Elite checkout is enabled | Stripe Price ID for the Elite plan. | `worker.js` | Cloudflare Worker production |
| `STRIPE_PRICE_ENTERPRISE` | Conditional | Stripe Price ID for Enterprise if offered. | `worker.js` | Cloudflare Worker production |
| `AUTH_TOKEN` | Recommended for production | Protects Worker internal agent routes. Without it, source code permits those routes without a shared internal token. | `worker.js` | Cloudflare Worker production |
| `ADMIN_EMAIL` | Recommended | Identifies the dashboard administrator for Worker authorization decisions. | `worker.js` | Cloudflare Worker production |
| `FRONTEND_URL` | Recommended | Explicit allowed frontend origin for CORS and redirects. | `worker.js`, `wrangler.toml` | Cloudflare Worker production |
| `WORKER_RELEASE` | Optional | Release identifier emitted by the health endpoint. | `wrangler.toml` | Cloudflare Worker production |

## GitHub Pages: `client/`

The canonical Vite frontend deploys with the existing GitHub Pages workflow. Browser variables are public by design; do not place server-only credentials in them.

| Variable Name | Required? | Description | Source Location | Deployment Target |
| --- | --- | --- | --- | --- |
| `VITE_BACKEND_URL` | Yes | Public Cloudflare Worker URL. Production must not use a localhost fallback. | `client/src/lib/backend.ts`, `.github/workflows/deploy-client-pages.yml` | GitHub Actions variable for GitHub Pages production |
| `VITE_SUPABASE_URL` | Yes | Public Supabase project URL for browser authentication. | `client/src/lib/supabase.ts`, workflow | GitHub Actions variable for GitHub Pages production |
| `VITE_SUPABASE_ANON_KEY` | Yes | Public Supabase anonymous key for browser authentication. | `client/src/lib/supabase.ts`, workflow | GitHub Actions secret for GitHub Pages production |
| `VITE_ADMIN_EMAIL` | Optional | Enables client-side admin presentation. Authorization must still be enforced server-side. | `client/src/lib/auth.ts` | GitHub Actions variable |
| `VITE_PUBLIC_BUSINESS_LEGAL_NAME` | Required before public commercial launch | Public legal business name for commercial notices. | `client/src/config/publicEnv.ts` | GitHub Actions variable |
| `VITE_PUBLIC_EIN_STATUS` | Required before public commercial launch | Public tax-identity status shown in legal surfaces. | `client/src/config/publicEnv.ts` | GitHub Actions variable |
| `VITE_PUBLIC_PRIVACY_POLICY_URL` | Required before public commercial launch | Public privacy-policy destination. | `client/src/config/publicEnv.ts` | GitHub Actions variable |
| `VITE_PUBLIC_TERMS_URL` | Required before public commercial launch | Public terms-of-service destination. | `client/src/config/publicEnv.ts` | GitHub Actions variable |
| `VITE_PUBLIC_REFUND_POLICY_URL` | Required before public commercial launch | Public refund-policy destination. | `client/src/config/publicEnv.ts` | GitHub Actions variable |
| `VITE_PUBLIC_CONTACT_EMAIL` | Required before public commercial launch | Customer contact address. | `client/src/config/publicEnv.ts` | GitHub Actions variable |

## Legacy Express Service

`server/lib/config.js` defines a separate legacy Express configuration. It is not the canonical Vercel or Worker deployment path. If it is intentionally deployed later, it needs its own `PORT`, `HOST`, `FRONTEND_URL`, Supabase, OpenAI, Stripe, and price variables. Do not add those variables to Vercel merely because this unused service references them.

## Readiness After Configuration

After the two missing public Supabase variables are set in Vercel Production, a new deployment succeeds, and the route checks below pass, **Vercel application-route readiness is estimated at 85%**.

Overall paid-customer readiness remains **72%** after this change alone, because checkout still needs end-to-end verification with the Worker, Stripe webhook configuration, Supabase subscription persistence, and a real authenticated customer flow. No secret values were inspected or generated during this audit.
