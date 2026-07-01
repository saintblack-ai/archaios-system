# Next.js Decision Report

Generated: 2026-05-30

Mode: documentation only. No moves, deletions, renames, archival, or workflow edits.

## Question

Is `app/` still required, and does root `package.json` still require Next.js?

## Findings

Root `package.json` still explicitly depends on Next.js:

```json
"next": "^15.2.3"
```

Root scripts still make Next.js the default root app runtime:

```json
"dev": "next dev",
"build": "next build",
"start": "next start"
```

Root Next files exist:

```text
app/
middleware.ts
next.config.js
tsconfig.json
```

`app/` is non-trivial:

```text
3306 lines across app/**/*.ts and app/**/*.tsx
```

It contains:

```text
app/admin/
app/agents/
app/api/
app/brief/
app/components/
app/dashboard/
app/lib/
app/login/
app/pricing/
app/scheduler/
app/signup/
```

`middleware.ts` imports Next/Supabase server helpers and protects:

```text
/dashboard/:path*
/admin/:path*
/api/ai
/api/brief
/api/system/:path*
/api/agents/:path*
/api/revenue
/api/logs
```

## Deployment Evidence

Current GitHub Pages workflows build the Vite client, not root Next:

```text
.github/workflows/deploy.yml
  working-directory: client
  run: npm run build

client/.github/workflows/deploy.yml
  run: npm run build
```

The root workflow clearly builds `client/`. The nested `client/.github/workflows/deploy.yml` is ambiguous in a root repository context because it does not set `working-directory: client`, but it lives under `client/.github`, suggesting it may have been copied from a standalone `client` repo.

Current project instructions say:

```text
Frontend repo: client/
Deploy frontend from client/ with the existing GitHub Pages workflow.
```

## Decision

`app/` is not required for the current GitHub Pages + Vite frontend deployment path.

Root `package.json` still requires Next.js because its default scripts and dependencies are still Next-based.

Classification:

```text
app/              NEEDS DECISION
middleware.ts     NEEDS DECISION
next.config.js    NEEDS DECISION
root package.json NEEDS MIGRATION if Vite client is the only production frontend
```

## Recommended Options

Option A: retain Next.js as a parallel experimental app.

- Keep `app/`, `middleware.ts`, `next.config.js`, and root Next scripts.
- Rename documentation role to "parallel Next app / experimental server-rendered dashboard."
- Do not use root `npm run build` as the production frontend build command.
- Use `npm run build:client` for production frontend validation.

Option B: retire Next.js in a future migration.

- Change root scripts so `npm run build` delegates to `npm --prefix client run build`.
- Remove or archive Next-specific source only after a separate approved migration.
- Remove Next dependencies only after verifying no root app/API route is needed.
- Update docs that reference Vercel/Next paths.

Option C: promote Next.js to production.

- This conflicts with the current `client/` Vite/GitHub Pages direction.
- Requires a separate deployment decision, environment variable audit, route validation, and Supabase/Stripe endpoint comparison.

## Recommendation

Choose Option A for now:

- Keep `app/` in place.
- Do not archive it yet.
- Treat it as a parallel experimental Next app.
- Keep production frontend ownership with `client/`.
- Keep canonical local runtime ownership with `client/archaios-core/`.

## Validation Performed

Safe checks completed:

```bash
npm run check:server
npm --prefix client run build
node --check worker.js
node --check agents/*.js
node --check client/archaios-core/agents/*.js
node --check client/src/agents/*.js
```

Root `npm run build` was not executed in this phase because it would produce Next build artifacts and the task requested documentation-only consolidation.
