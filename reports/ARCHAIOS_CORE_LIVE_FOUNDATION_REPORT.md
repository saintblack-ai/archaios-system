# ARCHAIOS CORE LIVE FOUNDATION REPORT

Verified: 2026-06-20

## What Is Live

- Vercel project `archaios-core` is deployed from `saintblack-ai/archaios-system` `main` at commit `f1b7c1382eb10b9121edf605a6c657fddbc4a3a9`.
- The latest `archaios-core` production deployment is `READY` and its build completed successfully.
- `archaios-system.vercel.app` and `archaioscore.vercel.app` both resolve to that deployment.
- Vercel project `ai-assassins-client` also has a `READY` production deployment.
- The canonical Cloudflare Worker source, Supabase migration work, revenue deployment contract, and ARCHIVIST MVP exist locally. Cloudflare has no custom domain configured in this verification.
- Notion remains the appropriate second-brain destination for this report and the linked operating documents.

## What Is Working

- On the Vercel Next.js deployment, `/pricing` and `/login` return HTTP 200 on both supplied hostnames.
- The latest Vercel build compiled Next.js successfully and produced the expected application and API routes.
- The Vite client build, Worker syntax checks, ARCHIVIST/revenue tests, environment check, and Worker dry-run passed in the local workspace.
- ARCHIVIST MVP code supports authenticated research save, search, tags, and AI summary persistence. Its database migration and operator documentation are ready for review.

## What Still Blocks Launch

1. **Vercel application runtime failure:** `/` and `/dashboard` return HTTP 500. Runtime logs identify missing `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
2. **Cloudflare deployment identity remains unproven in production:** the canonical Worker has not been deployed and verified because the local Wrangler Cloudflare session is invalid.
3. **Revenue is not ready for self-service launch:** Stripe price/secret configuration, Supabase production migration application, test checkout, webhook delivery, and entitlement sync remain unverified.
4. **ARCHIVIST is not yet live:** its code is present locally but does not yet have a focused GitHub PR, deployed Worker release, or applied Supabase migration.
5. **Hostname ownership is unclear:** `archaioscore.vercel.app` resolves to the production deployment but is absent from Vercel's recorded alias list for `archaios-core`.

## Next 3 Actions

1. **Restore the Vercel foundation.** Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` to `archaios-core` production environment variables, redeploy from `main`, and verify `/`, `/dashboard`, `/login`, and `/pricing`.
2. **Make the revenue Worker provable.** Review and merge [PR #15](https://github.com/saintblack-ai/archaios-system/pull/15), renew Cloudflare deployment authentication, apply the subscription migration, deploy `archaios-saas-worker`, and verify public `/api/health` identity before any billing activation.
3. **Publish ARCHIVIST as its own release.** Create a focused PR containing only the ARCHIVIST Worker routes, shared validation, Supabase migration, tests, and documentation. After review, apply the migration and deploy only after the canonical Worker release process is restored.

## Revenue Readiness

Status: **not ready for paid customer launch**.

The application has pricing routes and subscription code, but there is no production proof of a complete Free-to-Pro or Free-to-Elite lifecycle. Do not change billing configuration during this mission. Required later proof is:

- Worker health identity is canonical.
- Stripe secret, webhook secret, and Pro/Elite price IDs are configured server-side.
- `subscriptions(user_id)` unique constraint is applied.
- Stripe test checkout completes.
- Required webhook events update `subscriptions` and `profiles.tier`.
- The dashboard recognizes the resulting entitlement.

## Archivist Agent Status

Status: **implemented locally, not released**.

The MVP uses the existing Cloudflare Worker, Supabase bearer authentication, Supabase Postgres, and OpenAI integration. It has:

- `POST /api/archivist/items` to store research with normalized tags.
- `GET /api/archivist/items` to search the authenticated user's records.
- `PATCH /api/archivist/items/:id` to update tags.
- `POST /api/archivist/items/:id/summarize` to generate and retain a summary.

The next release must include `client/supabase/sql/2026-06-20_archivist_mvp.sql` and [ARCHIVIST_AGENT_MVP.md](../docs/ARCHIVIST_AGENT_MVP.md).

## Cloudflare And Domain Status

Status: **no custom domain configured; no change made**.

The current Worker should remain on its `workers.dev` endpoint until the Vercel app is healthy, the Worker is deployed, and a domain is intentionally available. The future plan is to use `api.<domain>` as a Cloudflare Worker custom domain while leaving the web application on a Vercel hostname. See [CLOUDFLARE_DOMAIN_SETUP_PLAN.md](../docs/CLOUDFLARE_DOMAIN_SETUP_PLAN.md).

## GitHub Pull Request Triage

| PR Group | Recommendation | Reason |
| --- | --- | --- |
| [#15 Revenue subscription deployment contract](https://github.com/saintblack-ai/archaios-system/pull/15) | Merge after focused review | It establishes the migration and release identity needed before revenue verification. |
| ARCHIVIST MVP | Create focused draft PR, then merge after review | The code is local and tested, but not yet reviewable or deployable from GitHub. |
| [#12 GitHub Pages SPA fallback](https://github.com/saintblack-ai/archaios-system/pull/12) | Review and merge after confirming no workflow conflict | It supports the canonical GitHub Pages client path but does not fix the Vercel outage. |
| Dependency PRs #1-7 and #9-11 | Wait | Major React/Vite/plugin upgrades and CI action updates are not launch-critical. Test them in a dedicated maintenance window. |

No open GitHub issues were returned during this verification.
