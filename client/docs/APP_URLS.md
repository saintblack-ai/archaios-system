# ARCHAIOS App URLs

Generated: 2026-04-16

## Primary URLs

| App | URL | Found? | Source |
|---|---|---:|---|
| ARCHAIOS DASHBOARD | `https://saintblack-ai.github.io/ai-assassins-client/dashboard` | yes, inferred | GitHub Pages healthcheck plus app route. |
| AI ASSASSINS CLIENT | `https://saintblack-ai.github.io/ai-assassins-client/` | yes, inferred | `.github/workflows/deploy.yml`. |
| PUBLIC MARKETING | `https://saintblack-ai.github.io/Ai-Assassins` | yes, inferred | Worker `PUBLIC_APP_URL` and static folder. |
| Pricing page | `https://saintblack-ai.github.io/ai-assassins-client/pricing` | yes, inferred | App route exists locally. |
| Public landing page | `https://saintblack-ai.github.io/ai-assassins-client/landing` | yes, inferred | App route exists locally. |
| Operator mode | `https://saintblack-ai.github.io/ai-assassins-client/operator` | yes, inferred | App route exists locally. |
| Book Growth Command | `https://saintblack-ai.github.io/ai-assassins-client/book-growth` | yes, inferred | App route exists locally. |

## API / Worker URLs

| Service | URL | Found? | Source |
|---|---|---:|---|
| ARCHAIOS SaaS Worker | `https://archaios-saas-worker.quandrix357.workers.dev` | yes, inferred | `src/lib/platform.js`, `wrangler.jsonc`. |
| Health check | `https://archaios-saas-worker.quandrix357.workers.dev/api/health` | yes, inferred | `.github/workflows/deploy.yml`. |
| Admin dashboard API | `https://archaios-saas-worker.quandrix357.workers.dev/api/admin/dashboard` | yes, inferred | `src/pages/Dashboard.jsx`. |
| Platform dashboard API | `https://archaios-saas-worker.quandrix357.workers.dev/api/platform/dashboard` | yes, inferred | local API client. |
| AI Assassins legacy Worker | `https://ai-assassins-worker.quandrix357.workers.dev` | yes, inferred | `Ai-Assassins` README examples. |

## Vercel Project URL Status

| Project | Fallback vercel.app URL | Custom Domain | Status |
|---|---|---|---|
| `ai-assassins-client` | not found | not found | Local project link exists, but Vercel CLI/auth is unavailable. |
| `Ai-Assassins` | not found | not found | No Vercel project evidence found locally. |
| `saintblack-ai.github.io` | not found | not found | No Vercel project evidence found locally. |

## Missing Command / Output

The following read-only outputs are needed to confirm Vercel deployment URLs and custom domains:

```bash
vercel ls ai-assassins-client
vercel inspect <deployment-url>
vercel domains ls
```

The following read-only outputs are needed to confirm Cloudflare custom DNS:

```bash
wrangler whoami
wrangler domains list
```

Or equivalent Cloudflare API zone/DNS listing with a read-only token.

## Final Readout

- ARCHAIOS DASHBOARD: `https://saintblack-ai.github.io/ai-assassins-client/dashboard`
- AI ASSASSINS CLIENT: `https://saintblack-ai.github.io/ai-assassins-client/`
- PUBLIC MARKETING: `https://saintblack-ai.github.io/Ai-Assassins`

## Verification Limits

- URLs above are from local repository config and routes.
- Vercel deployment URLs were not found because `vercel` CLI is missing.
- Custom domains were not found because Vercel and Cloudflare deployment/DNS listings could not be queried.
- No deployment or DNS changes were performed.

