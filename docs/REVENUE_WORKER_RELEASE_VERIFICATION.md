# Revenue Worker Release Verification

## Purpose

This change makes deployment identity and the subscription upsert prerequisite observable before paid checkout is enabled.

## What Changed

- `GET /api/health` now returns `ok`, `service`, and `release`.
- The canonical Supabase migration chain now includes a unique `subscriptions(user_id)` index for Stripe webhook upserts.
- The migration fails safely when duplicate subscription rows exist. Resolve those rows manually before rerunning it.

## Release Procedure

1. Apply `client/supabase/sql/2026-06-20_subscription_upsert_contract.sql` in the production Supabase SQL editor.
2. Deploy the repository-root Worker:

   ```sh
   npx wrangler deploy --name archaios-saas-worker
   ```

3. Verify the deployed identity:

   ```sh
   curl -sS https://archaios-saas-worker.quandrix357.workers.dev/api/health
   ```

4. Confirm the response contains:

   ```json
   {
     "ok": true,
     "service": "archaios-saas-worker",
     "release": "2026-06-20-revenue-subscription-contract"
   }
   ```

5. Only then continue the Stripe Pro and Elite test checkout sequence from the revenue audit.

## Validation

Run:

```sh
node --test tests/revenue-readiness.test.mjs
npm run check:env
npm run build:client
```
