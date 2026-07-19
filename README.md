# ARCHAIOS / QX Technology 2019

## Purpose
A unified infrastructure for an AI-powered SaaS platform + content ecosystem:
- SaaS tiers: Free / Pro ($49) / Elite ($99)
- Dashboard + pricing flow
- Stripe test-mode wiring (live activation pending)
- automation + agent development (OpenClaw/Codex)

## Setup (local)
- Requires Node.js (same major version used to build)
- Run backend + frontend dev servers
- Do not commit `.env` files or any secrets

## Repository status
- Local frontend build: passing
- Local backend Worker dry-run: passing
- API contracts: passing
- PWA/iPhone install surface: present
- Agent readiness surface: present with degraded-safe public health
- Stripe: gated and inactive until explicit activation
- Supabase: gated and inactive unless configured with public browser env and activated Worker bindings
- Production blocker: the public canonical Worker hostname currently returns `archaios-daily-automation`; ARCHAIOS expects `archaios-core-api`

## Current Verification
Run the local verification matrix before promotion:

```bash
npm test
npm run lint
npm run typecheck
npm run check:runtime-contract
npm run build
npm run deploy:backend:dry-run
```

See `Architecture.md`, `Deployment.md`, `Agent.md`, and `Mobile.md` for the current operational status.
