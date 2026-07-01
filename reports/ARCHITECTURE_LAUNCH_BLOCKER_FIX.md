# Architecture Launch Blocker Fix

Generated: 2026-06-20

## Critical Blocker

The deployed Cloudflare Worker cannot yet be proven to be the canonical root `worker.js` runtime that implements authenticated Stripe checkout and Stripe webhooks. Launching self-service billing against an unverified Worker risks routing customers to a runtime without the required payment path.

## Source Fix

The canonical Worker now reports an explicit identity from `GET /api/health`:

```json
{
  "ok": true,
  "service": "archaios-saas-worker",
  "release": "2026-06-20-revenue-subscription-contract"
}
```

`wrangler.toml` defines the same release marker. This makes a post-deploy health response a deterministic proof that the intended Worker source is live.

## Verification Completed

- `node --check worker.js` passed.
- `node --test tests/revenue-readiness.test.mjs` passed: 2 tests, 0 failures.
- The test verifies the health identity and the required `subscriptions(user_id)` unique-index migration contract.
- `wrangler deploy --dry-run --name archaios-saas-worker` passed. Wrangler bundled the Worker and reported the expected `WORKER_RELEASE` binding without making a production change.

## Deployment Attempt

Deployment command:

```sh
wrangler deploy --name archaios-saas-worker
```

Result: blocked before deployment because the local Wrangler Cloudflare credential refresh returned `400 Bad Request` and Wrangler reported `Not logged in`.

No production Worker change was made during this attempt.

## Required Recovery And Release

1. Renew the Cloudflare CLI session with `wrangler login` or configure a valid `CLOUDFLARE_API_TOKEN` with Workers deployment permissions.
2. Run `wrangler whoami` and confirm the intended Cloudflare account.
3. Run `wrangler check --config wrangler.toml`.
4. Deploy from the repository root:

   ```sh
   wrangler deploy --name archaios-saas-worker
   ```

5. Verify the public endpoint:

   ```sh
   curl -sS https://archaios-saas-worker.quandrix357.workers.dev/api/health
   ```

6. Proceed to Stripe test checkout only after the response reports `service: archaios-saas-worker` and the stated release value.
