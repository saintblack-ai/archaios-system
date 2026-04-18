# ARCHAIOS Dashboard Links

Generated: 2026-04-16

## Result

| Surface | URL | Status | Evidence |
|---|---|---|---|
| ARCHAIOS DASHBOARD | `https://saintblack-ai.github.io/ai-assassins-client/dashboard` | local-config fallback found | GitHub Actions healthcheck points at `https://saintblack-ai.github.io/ai-assassins-client/`; route `/dashboard` is configured in `vercel.json` and app router. |
| AI ASSASSINS CLIENT | `https://saintblack-ai.github.io/ai-assassins-client/` | local-config fallback found | `.github/workflows/deploy.yml` sets `FRONTEND_HEALTHCHECK_URL`. |
| PUBLIC MARKETING | `https://saintblack-ai.github.io/Ai-Assassins` | local-config fallback found | `Ai-Assassins` Worker config uses `PUBLIC_APP_URL=https://saintblack-ai.github.io/Ai-Assassins`; static folder also exists in `saintblack-ai.github.io/Ai-Assassins`. |

## Vercel Project Discovery

The current workspace is linked to a Vercel project locally:

- Project name: `ai-assassins-client`
- Project ID: `prj_O4pTRDr5EglSjPNzMVyOzF4icY7B`
- Org/team ID: `team_1X955N2NaejVA7KZC2thJ3ja`
- Evidence: `.vercel/project.json`

## Vercel Deployment URLs

Status: not found.

Reason:

- `vercel` CLI is not installed in this terminal environment.
- No Vercel deployment list or alias output could be fetched.
- Previous audit also found no `VERCEL_TOKEN` and no global Vercel auth config.

Missing command/output:

```bash
vercel project ls
vercel ls ai-assassins-client
vercel domains ls
```

## Custom Domains

Status: not found.

Reason:

- Cloudflare auth was not available in the terminal environment.
- Vercel CLI was not available.
- DNS aliases/custom domains could not be verified read-only.

## Backend / Worker Fallback URLs

| Service | URL | Status | Evidence |
|---|---|---|---|
| Current ARCHAIOS SaaS Worker | `https://archaios-saas-worker.quandrix357.workers.dev` | local-config fallback found | `src/lib/platform.js`, `wrangler.jsonc`, and workflow healthcheck. |
| Current ARCHAIOS SaaS Worker health | `https://archaios-saas-worker.quandrix357.workers.dev/api/health` | local-config fallback found | `.github/workflows/deploy.yml`. |
| Older AI Assassins Worker | `https://ai-assassins-worker.quandrix357.workers.dev` | local-doc fallback found | `Ai-Assassins` README examples. |

## Immediate Links To Check

- ARCHAIOS dashboard: `https://saintblack-ai.github.io/ai-assassins-client/dashboard`
- AI Assassins client: `https://saintblack-ai.github.io/ai-assassins-client/`
- Public marketing: `https://saintblack-ai.github.io/Ai-Assassins`
- Worker health: `https://archaios-saas-worker.quandrix357.workers.dev/api/health`

## Notes

- These are locally inferred from repo config, not live-verified deployment aliases.
- No deployment, DNS change, or external mutation was performed.

