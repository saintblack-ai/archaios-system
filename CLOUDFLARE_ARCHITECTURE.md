# CLOUDFLARE ARCHITECTURE

Date: 2026-07-06
Mode: audit and planning only

No deployments, DNS edits, secret changes, queue creation, storage creation, or public service exposure were performed.

## Current Infrastructure

This audit is based on repository evidence only. Cloudflare account-level inventory such as DNS zones, Pages projects, R2 buckets, KV namespaces, D1 databases, Queues, AI Gateway instances, Access policies, WAF rules, and stored secrets requires authenticated read-only Cloudflare access before it can be confirmed as live.

### Confirmed Local Cloudflare Assets

| Area | Current Evidence | Status |
| --- | --- | --- |
| Primary Worker | `wrangler.toml` declares `name = "archaios-saas-worker"` and `main = "worker.js"`. | Present locally |
| Client Worker config | `client/wrangler.jsonc` also declares `name = "archaios-saas-worker"` with `main = "worker/index.js"`. | Present locally, needs canonical decision |
| Scheduled agents Worker | `archaios-agents/wrangler.toml` declares `name = "archaios-agents"` and `main = "src/index.ts"`. | Present locally |
| Legacy daily trigger Worker | `Archaios OS/cloudflare_worker/wrangler.toml` declares `name = "archaios-daily-trigger"`. | Legacy / placeholder |
| Cron triggers | Root Worker has daily cron. Client Worker config has daily cron. `archaios-agents` has multiple scheduled triggers. | Present locally |
| Worker API routes | `worker.js` exposes health, pricing, subscription, alerts, Stripe, Archivist, platform dashboard, admin dashboard, and agent routes. | Present locally |
| Production backend URL | Docs/config reference `https://archaios-saas-worker.quandrix357.workers.dev`. | Configured locally |
| Frontend host | Docs identify GitHub Pages as canonical in `AGENTS.md`; later docs also discuss Vercel as a possible primary host. | Needs final host decision |

### Current Worker Inventory

#### `archaios-saas-worker`

Primary evidence:

- `wrangler.toml`
- `worker.js`
- `SYSTEM_ARCHITECTURE.md`
- `client/archaios-core/docs/worker-dependency-map.md`

Current responsibilities:

- Public health endpoint.
- Pricing payload.
- Supabase bearer-token validation.
- Subscription lookup.
- Alerts.
- Leads and CTA tracking.
- Stripe checkout.
- Stripe webhook processing.
- Stripe billing portal.
- Archivist / Black Vault item routes.
- Platform dashboard payload.
- Admin dashboard.
- Agent execution and logs.
- Scheduled automation.

Current external dependencies:

- Supabase REST/Auth.
- Stripe API and webhook verification.
- OpenAI API for generation/summaries.
- Browser frontend configured through `VITE_BACKEND_URL`.

Important finding:

There are two configs that declare the same Worker name:

- Root `wrangler.toml` points to `worker.js`.
- `client/wrangler.jsonc` points to `client/worker/index.js`.

Before any future deployment, designate one canonical Worker entrypoint and mark the other as archived, migrated, or development-only.

#### `archaios-agents`

Primary evidence:

- `archaios-agents/wrangler.toml`
- `archaios-agents/src/index.ts`

Current responsibilities:

- Scheduled agent runs.
- `/api/agents/status`.
- Writes agent logs to Supabase.
- Calls OpenAI directly.

Required environment/secrets from code:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `OPENAI_API_KEY`

Finding:

This Worker is a separate scheduled-agent runtime and should remain isolated from the customer-facing SaaS/API Worker unless a future architecture explicitly merges them.

#### `archaios-daily-trigger`

Primary evidence:

- `Archaios OS/cloudflare_worker/wrangler.toml`
- `Archaios OS/cloudflare_worker/worker.js`

Current responsibilities:

- Scheduled POST to `ARCHAIOS_ENDPOINT`.

Finding:

The configured endpoint is `https://example.com/api/archaios/daily`, which is a placeholder. Treat this Worker as legacy/non-production until replaced with a real internal route and protected by explicit release approval.

### Verification Matrix

| Cloudflare Area | Local Verification Result | Live Verification Status |
| --- | --- | --- |
| Workers | Multiple Worker configs found and reviewed. | Requires `wrangler` account read-only inventory. |
| DNS | Domain setup plan exists; no active zone records are declared locally. | Not verified. Needs zone/DNS read-only listing. |
| Pages | No Cloudflare Pages project config found. Frontend path is currently documented as GitHub Pages, with Vercel also discussed in later docs. | Not verified. |
| R2 | No R2 bucket bindings found in Wrangler configs. | Not verified. |
| KV | No KV namespace bindings found in Wrangler configs. | Not verified. |
| D1 | No D1 database bindings found in Wrangler configs. Current database is Supabase Postgres. | Not verified. |
| Queues | No Queue producer/consumer bindings found in Wrangler configs. | Not verified. |
| AI Gateway | No AI Gateway binding/config found. Existing code calls OpenAI directly. | Not verified. |
| Secrets | Required secrets are documented in config comments and code, but values are not present in repo. | Presence in Cloudflare not verified. |
| Environment Variables | Worker vars are present in `wrangler.toml` and `client/wrangler.jsonc`. | Live values not verified. |

## Recommended Infrastructure

The future Cloudflare architecture should support ARCHAIOS OS, AI Assassins, Black Vault, Commander, Mission Synchronization, Apple App, Web Dashboard, offline-first synchronization, cross-device state, secure authentication, and Zero Trust.

### Recommended Cloudflare Product Map

| Capability | Recommended Cloudflare Service | Purpose |
| --- | --- | --- |
| Public API gateway | Workers | Single backend edge API for web/mobile sync and command routing. |
| Frontend hosting option | Pages | Optional future host for the Web Dashboard if GitHub Pages/Vercel is retired. |
| Long-lived object files | R2 | Black Vault exports, sprint report packages, encrypted attachments, local backup bundles. |
| Fast config/cache | KV | Feature flags, app metadata, provider status cards, non-sensitive sync cursors. |
| Relational sync metadata | D1 | Device registry, sync manifests, mission envelopes, audit log summaries. |
| Async mission processing | Queues | Command queue, sync jobs, indexing jobs, report generation jobs. |
| Per-user/device state | Durable Objects | Conflict coordination, live mission sessions, cross-device state locks. |
| AI routing governance | AI Gateway | Provider routing, cost tracking, caching, rate shaping, and future failover. |
| Semantic search | Vectorize | Future Black Vault / research / memory vector search after privacy review. |
| Device ingress | Workers + Access + optional Tunnel | Secure Mac Core Bridge and Apple device sync without exposing local networks. |
| Zero Trust | Cloudflare Access, WAF, Gateway, Turnstile | Protect admin routes, dashboards, APIs, device bridge, and operator tools. |

### Recommended Logical Architecture

```text
Apple App / Web Dashboard
  -> Cloudflare Access / WAF / rate limits
    -> ARCHAIOS Sync Worker
      -> Auth adapter
      -> Mission sync router
      -> Commander command router
      -> Black Vault metadata router
      -> Queue producer
      -> D1 sync metadata
      -> KV feature/config state
      -> R2 encrypted object storage
      -> Durable Object session coordinator
      -> AI Gateway adapter
        -> ChatGPT / Codex / OpenClaw / other future providers
```

### Recommended Service Separation

| Service | Role | Notes |
| --- | --- | --- |
| `archaios-api-worker` | Public API gateway for web dashboard, Apple app, auth-aware dashboard state, and billing callbacks. | Replace current naming ambiguity around `archaios-saas-worker`. |
| `archaios-sync-worker` | Offline-first synchronization endpoint for missions, Commander state, Black Vault metadata, and cross-device resume state. | May start as routes inside API Worker, then split later. |
| `archaios-queue-worker` | Queue consumer for indexing, summaries, report packaging, and sync reconciliation. | No direct public routes. |
| `archaios-agent-worker` | Scheduled and future AI orchestration. | Keep isolated from billing and public auth. |
| `archaios-vault-worker` | Signed upload/download flows for encrypted R2 objects. | Never expose raw bucket listing publicly. |

## Security Recommendations

### Immediate

- Pick one canonical `archaios-saas-worker` entrypoint before any deploy.
- Retire or quarantine the legacy `archaios-daily-trigger` placeholder endpoint.
- Keep `SUPABASE_SERVICE_ROLE_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `OPENAI_API_KEY`, and future Cloudflare API tokens only in platform secret stores.
- Remove production URLs from default code paths where local-first or mock mode is expected.
- Keep the Apple app local-first and mock-only until explicit sync opt-in is designed.
- Ensure browser bundles never receive service-role keys, Stripe secrets, OpenAI keys, or Cloudflare API tokens.

### Authentication And Access

- Use Supabase Auth or a future dedicated identity provider for customer auth.
- Use Cloudflare Access for admin/operator routes.
- Require role checks for Commander, Black Vault, billing, and sync administration.
- Use Turnstile on public lead/checkout-intent surfaces if abuse appears.
- Protect cron/internal endpoints with short-lived tokens or signed requests.

### Zero Trust

- Put admin dashboards, deployment tooling, and future Mac Core Bridge behind Cloudflare Access.
- Use device posture checks for Founder/admin access.
- Keep Mac Core Bridge disabled by default; never expose LAN services directly.
- Prefer Cloudflare Tunnel for private connectivity only after a threat model and Access policy exist.
- Add WAF/rate-limit rules for auth, checkout, webhook, lead capture, sync, and command routes.

### Secrets And Environment Variables

- Maintain a secrets inventory by environment: local, preview, production.
- Use least-privilege Cloudflare API tokens for CI.
- Do not store Cloudflare API tokens in GitHub unless required for a controlled deployment workflow.
- Rotate any secret that was ever pasted into chat, logs, docs, or local sample files.
- Add a release gate that checks for missing required secrets without printing values.

### Data Protection

- Encrypt sensitive Black Vault payloads before R2 upload.
- Store only metadata and hashes in D1 where possible.
- Use signed URLs for R2 access with short expiration.
- Keep per-device sync logs append-only.
- Separate customer-facing data from Founder/private operational data.

## Scaling Strategy

### Phase 1: Stabilize Current Worker

- Canonicalize the Worker entrypoint.
- Confirm `/api/health` returns the expected service and release.
- Verify all required Worker secrets through read-only listing.
- Verify Stripe webhook events write to the correct Supabase tables.
- Keep Cloudflare-native storage disabled until the current SaaS Worker is stable.

### Phase 2: Add Sync Foundations

- Add D1 for sync manifests, device registry, mission envelopes, and audit summaries.
- Add KV for feature flags, provider status cards, sync cursors, and non-sensitive config.
- Add Queues for command processing, Black Vault indexing, and report packaging.
- Add Durable Objects only when live session coordination or conflict locks are required.

### Phase 3: Add Black Vault Storage

- Add R2 for encrypted vault exports, attachments, local backups, generated reports, and media bundles.
- Keep Supabase as the current business/auth database unless a formal migration is approved.
- Add object lifecycle policy and retention rules.

### Phase 4: Add AI Governance

- Route future provider calls through AI Gateway.
- Add provider-level feature flags.
- Track usage/cost by product area: Commander, Black Vault, Research, AI Assassins, Mission Sync.
- Keep local/offline fallback responses in the Apple app and Web Dashboard.

### Phase 5: Cross-Device State

- Add per-device state envelopes.
- Add sync conflict resolution strategy: latest-safe write for simple fields, merge logs for journals/prompts, manual review for Black Vault conflicts.
- Add append-only audit records for mission state transitions.
- Add export/import tools so offline-first remains possible even if cloud sync is disabled.

## Future Deployment Plan

This plan is intentionally non-executing. Do not run deploy commands until the operator approves a deployment window.

### Read-Only Verification First

Run only from an approved terminal with a read-only Cloudflare token or authenticated Wrangler session:

```sh
npx wrangler whoami
npx wrangler deployments list --name archaios-saas-worker
npx wrangler secret list --name archaios-saas-worker
npx wrangler domains list
```

Also verify through the Cloudflare dashboard or API:

- DNS zones and records.
- Workers and Routes.
- Pages projects.
- R2 buckets.
- KV namespaces.
- D1 databases.
- Queues.
- AI Gateway instances.
- Access applications and policies.
- WAF/rate-limit rules.
- Logpush/observability settings.

### Pre-Deployment Gates

- One canonical Worker entrypoint chosen.
- All required secrets present in Cloudflare, without exposing values.
- Frontend host decision finalized.
- CORS allowlist matches the selected frontend host.
- Stripe webhook endpoint matches the selected API host.
- Supabase project URL verified.
- Health endpoint returns the canonical service identity.
- No placeholder endpoints remain in deployable configs.
- Local-first Apple app sync remains disabled unless explicitly enabled behind feature flags.

### Controlled Future Rollout

1. Create a staging Worker with staging secrets and no production customer data.
2. Add D1/KV/Queue/R2 bindings in staging only.
3. Run dry-run/bundle checks.
4. Run staging health checks.
5. Test auth, sync, and queue flows with mock data.
6. Add Cloudflare Access for admin/staging routes.
7. Promote only after rollback instructions and audit logging are ready.

### Do Not Deploy Until

- Cloudflare identity mismatch reports are resolved.
- Supabase DNS/project health is verified.
- Stripe test checkout and webhook processing are verified.
- The old `archaios-daily-trigger` placeholder is retired or isolated.
- `archaios-saas-worker` has a single canonical source path.
- The Apple app sync contract is documented and feature-flagged.

## Recommended Next Actions

1. Decide whether root `worker.js` or `client/worker/index.js` is the canonical `archaios-saas-worker`.
2. Perform read-only Cloudflare account inventory with approved credentials.
3. Produce a DNS and route map for the final frontend/API host split.
4. Create a sync data contract for ARCHAIOS OS, Apple app, Web Dashboard, Commander, Black Vault, and Mission Synchronization.
5. Add staging-only D1/KV/Queue/R2 bindings after the sync contract is reviewed.
6. Design Zero Trust policy for Founder/admin access before exposing any new route.
