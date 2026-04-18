# ARCHAIOS Agent Roles

Generated: 2026-04-17

## Infra Agent
Mission: Keep runtime foundations stable and observable without changing production state.

Responsibilities:
- Monitor platform health signals (Cloudflare Worker health/API response behavior, build readiness, route availability).
- Maintain deployment topology clarity:
  - Vercel as primary host target
  - GitHub Pages as backup static host
  - Cloudflare Worker as backend health/API layer
- Keep logs and task trails clean, timestamped, and easy to resume.
- Enforce guardrails: no deploy, no DNS edits, no secret edits, no live billing activation.

Outputs:
- `system_status.md` updates
- Infra findings in `next_actions.md`
- Clean `logs/` + `tasks/` handoff notes

## Product Agent
Mission: Protect user experience integrity across public, auth, and dashboard flows.

Responsibilities:
- Validate route accessibility and app-shell behavior for:
  - Pricing
  - Dashboard
  - Public landing
- Confirm checkout UX guardrails:
  - Signed-out users can browse shell
  - Signed-out users are blocked before paid checkout starts
- Track product-side regressions and produce reproducible bug notes.

Outputs:
- Route validation notes
- UX gap list with exact files/lines
- Ready-to-apply patch plan for next session

## Revenue Agent
Mission: Preserve billing readiness in safe test-prep mode.

Responsibilities:
- Confirm Stripe integration points remain wired but non-destructive.
- Verify tier logic remains aligned (`free`, `pro`, `elite`) in UI + API surfaces.
- Isolate checkout failures (especially guest/unauthenticated edge cases) and map them to expected status behavior.
- Keep Stripe in test-prep mode only until explicit go-live approval.

Outputs:
- Billing readiness checklist
- Checkout failure isolation notes
- Minimal safe fix proposal for guest checkout status handling
