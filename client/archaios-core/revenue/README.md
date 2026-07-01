# ARCHAIOS Runtime Revenue

Ownership: `client/archaios-core/revenue/` is reserved for runtime-local revenue contracts, simulations, and monetization readiness outputs.

Current source of truth:

- Revenue artifacts: `client/revenue/`
- Stripe frontend adapter: `client/src/agents/stripeAgent.js`
- Platform API adapter: `client/src/lib/platform.js`
- Backend checkout/webhook runtime: root `worker.js`

Rule: this folder should not activate billing, mutate Stripe configuration, or store secrets.
