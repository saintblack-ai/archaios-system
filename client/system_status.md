# ARCHAIOS System Status

Generated: 2026-04-17T20:54:22Z (autonomous loop)

## Scope Guardrails

- No deployment executed.
- No DNS changes made.
- No secret values modified.
- No billing activation performed.

## Infrastructure Validation

### Vercel Primary

- https://ai-assassins-client.vercel.app -> 200
- https://ai-assassins-client.vercel.app/landing -> 200
- https://ai-assassins-client.vercel.app/pricing -> 200
- https://ai-assassins-client.vercel.app/dashboard -> 200
- https://ai-assassins-client.vercel.app/operator -> 200

Status: pass

### GitHub Pages Backup

- https://saintblack-ai.github.io/ai-assassins-client/ -> 200
- https://saintblack-ai.github.io/ai-assassins-client/landing -> 200
- https://saintblack-ai.github.io/ai-assassins-client/pricing -> 200
- https://saintblack-ai.github.io/ai-assassins-client/dashboard -> 200
- https://saintblack-ai.github.io/ai-assassins-client/operator -> 200

Status: pass

### Cloudflare Worker Health

- https://archaios-saas-worker.quandrix357.workers.dev/api/health -> 200

Status: pass

## Monetization Readiness (No Activation)

- Tier tests: pass
- Build check: skipped
- Stripe wrapper file: present

## Host Role Split

- Vercel: primary app host.
- GitHub Pages: static backup shell.
- Cloudflare Worker: backend/API/health.
