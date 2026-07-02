# Operation Iron Gate Readiness Report

Generated: 2026-07-02T12:29:26.173Z
Operational Readiness Score: 61/100
Status: blocked

## Production Blockers

| Area | Finding | Evidence | Required Fix |
| --- | --- | --- | --- |
| github | Git worktree is not release-clean | 31 modified/untracked entries. | Classify, commit, archive, or explicitly discard all dirty worktree entries before production deployment. |
| cloudflare | Cloudflare Worker identity mismatch | HTTP 200; expected service archaios-saas-worker, got archaios-daily-automation. | Deploy the canonical revenue Worker with `npx wrangler deploy --name archaios-saas-worker` and verify /api/health identity. |
| supabase | Supabase auth health failed | HTTP 0: fetch failed. | Verify Supabase project status and configured project URL. |
| stripe | Stripe metrics are not connected | STRIPE_SECRET_KEY is not available to Iron Gate. | Run Iron Gate from an approved environment with read-only Stripe access or verify metrics through a controlled backend endpoint. |

## Warnings

| Area | Finding | Evidence | Required Fix |
| --- | --- | --- | --- |
| technical-debt | Duplicate Worker implementations exist | Both worker.js and client/worker/index.js exist. | Choose one canonical Worker implementation and retire or archive the non-canonical path. |
| security | Project Sentinel has actionable findings | 1 actionable finding(s). | Resolve Project Sentinel findings before production. |

## Already Complete

| Area | Finding | Evidence | Required Fix |
| --- | --- | --- | --- |
| subsystems | Required runtime files are present | 8 required files found. | No action required. |
| placeholders | No production-facing placeholder signals found | Scanned production-facing files are clear. | No action required. |
| security | Client dependency audit passes | npm audit found no moderate-or-higher client vulnerabilities. | No action required. |
| health-checks | Automated tests pass | Node test suite completed successfully. | No action required. |
| health-checks | Client production build passes | Vite build completed successfully. | No action required. |
| github | Live GitHub repository is reachable | saintblack-ai/archaios-system; default branch main. Latest runs reachable: yes. | No action required. |

## Deployment Checklist

### Prevents Production

- [ ] Git worktree is not release-clean: Classify, commit, archive, or explicitly discard all dirty worktree entries before production deployment.
- [ ] Cloudflare Worker identity mismatch: Deploy the canonical revenue Worker with `npx wrangler deploy --name archaios-saas-worker` and verify /api/health identity.
- [ ] Supabase auth health failed: Verify Supabase project status and configured project URL.
- [ ] Stripe metrics are not connected: Run Iron Gate from an approved environment with read-only Stripe access or verify metrics through a controlled backend endpoint.

### Complete

- [x] Required runtime files are present
- [x] No production-facing placeholder signals found
- [x] Client dependency audit passes
- [x] Automated tests pass
- [x] Client production build passes
- [x] Live GitHub repository is reachable

### Must Run Immediately Before Deploy

- [ ] Run Iron Gate with live credentials: `npm --prefix client run iron-gate -- --run-tests --run-build --run-security-audit`
- [ ] Confirm GitHub Actions pass on the release commit.
- [ ] Confirm Supabase subscription/profile smoke checks.
- [ ] Confirm Stripe test checkout and webhook subscription sync.
- [ ] Confirm Cloudflare Worker `/api/health` returns the intended service and release.
- [ ] Confirm no untracked temp files, raw exports, or generated caches are included in the release commit.
