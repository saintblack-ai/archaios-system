# Access Control Logic (Free / Pro / Elite)

## Source of Truth
- User tier resolved from authenticated session + subscription record.
- Fallback tier when unauthenticated: `free`.

## Entitlement Rules
- `free`
  - Allow: landing, pricing, limited dashboard preview
  - Deny: premium agents, advanced analytics, priority signals
  - Behavior: show lock-state + upgrade CTA

- `pro`
  - Allow: full dashboard actions, premium agents, full intelligence brief
  - Deny: Elite-only priority stream/depth analytics
  - Behavior: show selective Elite upsell prompts

- `elite`
  - Allow: all Pro capabilities plus priority intelligence and full analytics depth
  - Deny: none in current scope

## Route/UI Enforcement
- Server:
  - Validate user session
  - Resolve tier
  - Filter premium payloads by entitlement
- Client:
  - Render gated modules by resolved tier
  - Display clear locked-state messaging and upgrade paths

## Failure/Edge Handling
- Missing subscription data:
  - Default to safest tier (`free`) and show recovery prompt.
- Webhook delay:
  - Poll `/api/subscription` until tier update lands.
- Invalid tier values:
  - Coerce to `free` and log warning.
