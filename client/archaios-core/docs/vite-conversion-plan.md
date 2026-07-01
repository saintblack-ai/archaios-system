# Vite Conversion Plan

Generated: 2026-05-30

Mode: planning only. Root `package.json` scripts were not changed.

## Current Build Ownership

Production frontend instructions identify:

```text
client/
```

as the frontend repo/source.

Current Vite frontend:

```text
client/package.json
client/vite.config.js
client/src/
client/.env.production
client/.github/workflows/deploy.yml
```

Current root Next app:

```text
package.json
next.config.js
middleware.ts
app/
tsconfig.json
lib/
```

## Root package.json Findings

Root `package.json` still requires Next.js:

```json
"next": "^15.2.3"
```

Root scripts still use Next:

```json
"dev": "next dev",
"build": "next build",
"start": "next start"
```

Root helper scripts also exist:

```json
"dev:client": "npm --prefix client run dev",
"build:client": "npm --prefix client run build",
"check:server": "npm --prefix server run check"
```

## Decision Point

Question: should root `package.json` keep Next.js or convert fully to Vite/client?

Recommendation: do not convert immediately. Keep Next as a parallel experimental app until the operator explicitly retires it.

Reason:

- `app/` contains real code, not just a stub.
- `middleware.ts` protects routes and APIs.
- Root `lib/` and `app/lib/` include Supabase/Stripe helpers.
- Some docs mention Vercel routes.
- Removing or changing root scripts would be a behavior change outside this planning phase.

## Option A: Keep Next in root as experimental

Classification:

```text
app/ = NEEDS MIGRATION / experimental
root package.json Next scripts = NEEDS MIGRATION
client/ = ACTIVE PRODUCTION frontend
```

Execution changes:

- Documentation only.
- Make all launch docs use `npm --prefix client run build` or `npm run build:client`.
- Avoid using root `npm run build` as the frontend production check.

Risk: low.

## Option B: Convert root package scripts to client/Vite

Potential future root script plan:

```json
"dev": "npm --prefix client run dev",
"build": "npm --prefix client run build",
"start": "npm --prefix client run preview",
"dev:next": "next dev",
"build:next": "next build",
"start:next": "next start"
```

Files that would change:

```text
package.json
package-lock.json
README.md
AGENTS.md
client/docs/BUILD_HEALTH.md
client/docs/GO_LIVE_CHECKLIST.md
client/docs/REPO_ROLES.md
client/docs/INFRA_DISCOVERY.md
```

Risk: medium.

Reason:

- It changes developer muscle memory.
- Any automation calling root `npm run build` would switch from Next to Vite.

## Option C: Retire Next app later

Potential future candidates:

```text
app/
middleware.ts
next.config.js
lib/
```

Do not execute until:

- GitHub/Vercel deployment ownership is confirmed.
- No production route depends on `app/api/*`.
- Supabase/Stripe helpers in `app/lib/*` are either migrated or declared obsolete.
- `npm run build:client` is the only required frontend build.

## App Retirement Assessment

`app/` can probably be retired later if the production target remains:

```text
client/ Vite + GitHub Pages + Cloudflare Worker
```

But it cannot be retired now because:

- Root scripts still point to Next.
- `app/` has substantial app/API code.
- `middleware.ts` is tied to Next behavior.
- Vercel docs mention active direct routes.

## Stop/Go

GO:

- Keep `client/` as production frontend.
- Keep root Next as experimental until decision.
- Update future docs to use `npm --prefix client run build` for Vite validation.

NO-GO:

- Do not change root scripts yet.
- Do not remove Next dependencies yet.
- Do not retire `app/` yet.
