# Go-Live Checklist

## Repository

- [ ] Decide canonical production repo responsibilities.
- [ ] Clean generated files and unrelated dirty worktree changes.
- [ ] Confirm `npm run build` passes.
- [ ] Confirm Worker syntax/build passes.
- [ ] Confirm docs reflect Pro `$49` and Elite `$99`.

## Supabase

- [ ] Apply schema.
- [ ] Confirm RLS policies.
- [ ] Confirm auth redirect URLs.
- [ ] Confirm subscription upsert with service role.

## Stripe

- [ ] Create Pro test price at `$49/month`.
- [ ] Create Elite test price at `$99/month`.
- [ ] Configure webhook in test mode.
- [ ] Complete Pro checkout test.
- [ ] Complete Elite checkout test.
- [ ] Verify customer portal.
- [ ] Verify cancellation state.

## Cloudflare

- [ ] Set Worker vars.
- [ ] Set Worker secrets.
- [ ] Deploy staging Worker.
- [ ] Verify `/api/health`.
- [ ] Verify `/api/subscription`.
- [ ] Verify `/api/stripe/checkout`.
- [ ] Verify `/api/platform/dashboard`.
- [ ] Verify cron configuration.

## Frontend

- [ ] Set frontend env vars.
- [ ] Deploy staging app.
- [ ] Test Free dashboard.
- [ ] Test Pro dashboard.
- [ ] Test Elite dashboard.
- [ ] Test Book Growth route.
- [ ] Test Operator route.

## Launch

- [ ] Switch Stripe to production keys only after test pass.
- [ ] Confirm webhook endpoint in live mode.
- [ ] Verify backup and rollback plan.
- [ ] Publish public landing layer.
- [ ] Monitor logs for 24 hours.

