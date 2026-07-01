# Cloudflare Custom Domain Setup Plan

Status: planning only. No domain purchase, DNS change, or Cloudflare configuration change was made.

## Goal

When an existing or newly acquired domain is available, expose the canonical `archaios-saas-worker` through a dedicated API hostname such as `api.<domain>` while keeping the Vercel application on its own app hostname.

Recommended future hostname split:

| Hostname | Service |
| --- | --- |
| `app.<domain>` or `<domain>` | Vercel `archaios-core` application |
| `api.<domain>` | Cloudflare `archaios-saas-worker` |

This separates the browser application from the billing, ARCHIVIST, and API runtime.

## Preconditions

1. A domain is available and intentionally assigned to Archaios.
2. The domain's Cloudflare zone is active under the intended Cloudflare account.
3. The canonical Worker is deployed and its `/api/health` endpoint reports `archaios-saas-worker` and the expected release.
4. Supabase, Stripe, and OpenAI Worker secrets have been verified without exposing their values.
5. No existing CNAME record occupies the intended `api.<domain>` hostname.

Cloudflare custom domains require an active zone and an existing Worker. A custom domain makes the Worker the origin for every path at that exact hostname. [Cloudflare custom domain documentation](https://developers.cloudflare.com/workers/configuration/routing/custom-domains/)

## Future Implementation Steps

1. Choose the final public application hostname and the API hostname. Reserve `api.<domain>` for the Worker.
2. Add the domain to Cloudflare and wait until the zone is active. Do not alter the Vercel hostnames until the Vercel application is healthy.
3. Confirm `api.<domain>` has no conflicting CNAME record. Cloudflare cannot create a Worker custom domain on a hostname with an existing CNAME.
4. In the Cloudflare Worker dashboard, open `archaios-saas-worker` then select **Settings > Domains & Routes > Add > Custom Domain**.
5. Add `api.<domain>`. Cloudflare creates the needed DNS record and certificate for the Worker custom domain.
6. Update the root Worker configuration only after approval, for example:

   ```toml
   [[routes]]
   pattern = "api.<domain>"
   custom_domain = true
   ```

7. Deploy the Worker and verify:

   ```sh
   curl -sS https://api.<domain>/api/health
   curl -sS https://api.<domain>/api/pricing
   ```

8. Update the frontend's production backend configuration to `https://api.<domain>` only after health and pricing verification pass.
9. Update the Worker CORS allowlist and `FRONTEND_URL` to the final Vercel application hostname. Verify browser auth, checkout initiation, and ARCHIVIST API calls.
10. Update Stripe's webhook endpoint to `https://api.<domain>/api/stripe/webhook` only after the new Worker hostname is verified. Send Stripe test events and confirm subscription sync.
11. Keep the existing `workers.dev` endpoint available during the cutover. Roll back the frontend backend URL if production health or webhook tests fail.

## Validation Checklist

- TLS certificate is active for `api.<domain>`.
- `/api/health` identifies the canonical Worker release.
- `/api/pricing` returns `free`, `pro`, and `elite`.
- Browser requests from the final app hostname pass CORS.
- Supabase bearer auth succeeds.
- Stripe test checkout and all required webhook events succeed.
- ARCHIVIST save, search, tag, and summarize routes succeed after its migration is applied.

## Deliberate Non-Actions

- Do not buy a domain as part of this plan.
- Do not create, delete, or modify DNS records until a domain decision is approved.
- Do not point a public app hostname at the Worker. The Worker is the API origin, not the Vercel frontend origin.
