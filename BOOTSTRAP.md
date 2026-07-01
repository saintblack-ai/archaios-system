# ARCHAIOS Bootstrap

This sequence verifies ARCHAIOS/OpenClaw startup readiness without printing secrets.

## 1. Enter the repo

```bash
cd "/Users/quandrixblackburn/Library/Mobile Documents/com~apple~CloudDocs/QX Technology 2019"
```

## 2. Set `OPENAI_API_KEY` once

Use one stable OpenAI API key in either the current shell or a local env file that is ignored by git.

Shell option:

```bash
export OPENAI_API_KEY="your_key_here"
```

Local file option:

```bash
cp .env.example .env
```

Then edit `.env` and replace the placeholder value. Do not commit `.env`.

## 3. Verify without printing the key

```bash
npm run check:env
```

This command reports whether `OPENAI_API_KEY` is present in the current shell or a local env file. It never prints the key.

## 4. Launch OpenClaw/ARCHAIOS

Use the startup path that matches the component you are running:

```bash
npm run dev:stack
```

For the local OpenClaw worker profile documented in `client/OPENCLAW_ARCHAIOS_SETUP.md`, start the gateway from a shell where `OPENAI_API_KEY` is available:

```bash
source ~/.zshrc
~/openclaw-work/scripts/start-openclaw.sh
```

For the Python ARCHAIOS server, make sure `OPENAI_API_KEY` is exported in the same shell before starting the server, because the Python code reads `os.getenv("OPENAI_API_KEY")` directly.

For the Cloudflare `archaios-agents` worker, set the key as a Wrangler secret:

```bash
cd archaios-agents
wrangler secret put OPENAI_API_KEY
npm run dev
```

## 5. Readiness checks

```bash
npm run check:env
curl -fsS https://archaios-saas-worker.quandrix357.workers.dev/api/health
```

If the environment check passes and the health endpoint is healthy, OpenClaw/ARCHAIOS should be able to reuse the same stable key. If startup still fails, check which component is being launched and confirm that component can see the same shell environment, local env file, or Wrangler secret.

## Env Loading Notes

- Root and server Node paths read `OPENAI_API_KEY` from `process.env`.
- `server/lib/config.js` loads `server/.env.development`, `server/.env`, root `.env.development`, and root `.env` with `dotenv`.
- Python ARCHAIOS files read `OPENAI_API_KEY` from the shell environment with `os.getenv`.
- OpenClaw worker scripts are documented as expecting `OPENAI_API_KEY` from the shell environment.
- The OpenClaw user-level profile is documented at `~/.openclaw-archaios-worker/openclaw.json`.
- `archaios-agents` expects `OPENAI_API_KEY` as a Cloudflare Worker environment binding or Wrangler secret.
- `.env.local` is gitignored and checked by `scripts/check-env.sh`, but the current server dotenv loader does not load it.
