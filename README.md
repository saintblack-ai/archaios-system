# ARCHAIOS / QX Technology 2019

> **Proof-of-work overview:** ARCHAIOS / QX Technology 2019 is an independent AI SaaS and automation system that combines a client dashboard, subscription tiers, agent workflows, daily automation, deployment controls, and mobile/PWA surfaces.

## What I Built

This repository demonstrates a broader product-development effort around AI-assisted automation and digital systems. I worked across:

- SaaS product structure and tiered access
- Client dashboard and pricing flows
- Agent and automation development
- Daily automation services
- Stripe integration planning and gated activation
- Supabase-backed application infrastructure
- Cloudflare Worker deployment discipline
- Mobile/PWA support
- Runtime checks, linting, type validation, and deployment verification

## My Role

**Independent AI Automation Builder / Product Systems Designer**

I developed the project architecture, feature direction, workflow structure, agent concepts, UI/product requirements, testing approach, and deployment safeguards. I use AI-assisted development to accelerate research, implementation, debugging, and documentation while keeping production-changing actions explicitly controlled.

## Technology & Workflow

- JavaScript / TypeScript
- Cloudflare Workers
- Supabase
- Stripe integration
- PWA / mobile surfaces
- Agent-assisted workflows using OpenAI/Codex
- Automated verification and dry-run deployment checks

## Why This Project Matters

This project shows how I approach larger AI systems: connect product experience, automation, infrastructure, safety gates, and deployment verification into one maintainable workflow rather than treating AI as a standalone feature.

---

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
- Root cause found: `client/wrangler.jsonc` was a daily automation Worker config using the canonical API Worker name. It now uses `archaios-daily-automation`.

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

## Production routing discipline
Deploy the canonical API only from the repository root:

```bash
npm run deploy:backend
```

Do not deploy from `client/` for the canonical API; that config belongs to daily automation.
