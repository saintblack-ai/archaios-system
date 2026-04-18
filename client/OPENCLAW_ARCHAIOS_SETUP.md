# OpenClaw ARCHAIOS Setup

This setup keeps OpenClaw as a removable local worker layer for ARCHAIOS.

## Scope

- ARCHAIOS remains the main app and can keep using OpenAI exactly as it does now.
- OpenClaw is installed separately as a local worker CLI.
- No Anthropic or Claude provider was configured.
- No third-party skills were installed.
- The worker command layer lives under `~/openclaw-work`.

## System Changes Applied

1. Set npm global prefix to `~/.npm-global`
2. Added `~/.npm-global/bin` to `~/.zshrc`
3. Installed `openclaw` globally into `~/.npm-global`
4. Created OpenClaw profile `archaios-worker`
5. Created worker workspace `~/openclaw-work`

## Installed Versions

- Node.js: `v24.13.1`
- npm: `11.8.0`
- OpenClaw: `2026.4.14`

## Paths

- OpenClaw binary: `~/.npm-global/bin/openclaw`
- OpenClaw profile config: `~/.openclaw-archaios-worker/openclaw.json`
- Worker workspace: `~/openclaw-work`

## Folder Structure

```text
~/openclaw-work/
├── archaios-bridge/
│   ├── api-client.mjs
│   └── archaios-task.mjs
├── logs/
├── outputs/
├── scripts/
│   ├── archaios-task.sh
│   ├── code-assist.sh
│   ├── draft.sh
│   ├── log-work.sh
│   ├── openclaw-common.sh
│   ├── organize.sh
│   ├── research.sh
│   └── start-openclaw.sh
└── tasks/
```

## OpenClaw Configuration

The `archaios-worker` profile was hardened to:

- use workspace `~/openclaw-work`
- default model `openai/gpt-4o-mini`
- default skills `[]`
- global tool allowlist `[]`
- gateway tool allowlist `[]`
- gateway bind mode `loopback`
- gateway auth mode `token`
- logging redaction `tools`
- plugin allowlist constrained to the local worker path
- mDNS discovery disabled
- canvas host disabled

This means the worker scripts rely on one-shot model inference and fixed local scripts, not broad autonomous tool use.

## Safety Rules

- No file deletion commands were added.
- No unrestricted shell execution was enabled through OpenClaw tools.
- No web search or external fetch tools were enabled in the OpenClaw profile.
- All wrapper actions write logs into `~/openclaw-work/logs`.
- ARCHAIOS bridge calls only target `http://localhost:3000/api/ai/chat` by default.

## Important Limitation

This machine does not currently have Docker or Podman installed.

Because of that, true container-backed filesystem sandboxing is not active. OpenClaw is restricted operationally by:

- dedicated profile
- dedicated workspace
- empty tool allowlists
- fixed wrapper scripts

If you want true host-level filesystem isolation later, install Docker or Podman and then enable OpenClaw sandboxing against that backend.

## Runtime Notes

- OpenClaw onboarding created standard workspace bootstrap files such as `AGENTS.md`, `BOOTSTRAP.md`, and related metadata inside `~/openclaw-work`.
- OpenClaw also created a separate worker profile under `~/.openclaw-archaios-worker`.
- OpenClaw auto-added `memory-core` into the plugin allowlist during gateway startup, but the final gateway validation still came up with only `acpx` as the active runtime plugin.

## Environment

OpenClaw worker scripts expect:

```bash
export OPENAI_API_KEY="your_openai_api_key"
```

Optional overrides:

```bash
export OPENCLAW_MODEL="openai/gpt-4o-mini"
export ARCHAIOS_BASE_URL="http://localhost:3000"
export ARCHAIOS_CHAT_PATH="/api/ai/chat"
```

## Start OpenClaw

Open a new shell or reload zsh:

```bash
source ~/.zshrc
```

Start the local gateway in the foreground:

```bash
~/openclaw-work/scripts/start-openclaw.sh
```

## Worker Commands

Research files inside the worker workspace:

```bash
~/openclaw-work/scripts/research.sh ~/openclaw-work/tasks/notes.txt
```

Draft markdown content:

```bash
~/openclaw-work/scripts/draft.sh "Draft a short ARCHAIOS update for premium users."
```

Review code or get writing help for a workspace file:

```bash
~/openclaw-work/scripts/code-assist.sh ~/openclaw-work/tasks/example.js
```

Create a daily work log entry:

```bash
~/openclaw-work/scripts/log-work.sh "Reviewed outputs and queued follow-up tasks."
```

Preview file organization actions:

```bash
~/openclaw-work/scripts/organize.sh
```

Apply file organization:

```bash
~/openclaw-work/scripts/organize.sh --apply
```

Send a task into the local ARCHAIOS API bridge:

```bash
~/openclaw-work/scripts/archaios-task.sh "Summarize today's active operator priorities."
```

## ARCHAIOS Bridge

Bridge files:

- `~/openclaw-work/archaios-bridge/api-client.mjs`
- `~/openclaw-work/archaios-bridge/archaios-task.mjs`

Default behavior:

- POST to `http://localhost:3000/api/ai/chat`
- send JSON body `{ "message": "..." }`
- save the response into `~/openclaw-work/outputs`
- append an action log entry into `~/openclaw-work/logs`

If your local ARCHAIOS endpoint expects a different body shape, update only the bridge file and keep the main app untouched.

## Commands Used

```bash
npm view openclaw version
mkdir -p ~/.npm-global ~/.npm-global/bin
printf 'prefix=%s\n' "$HOME/.npm-global" > ~/.npmrc
printf '\n# OPENCLAW_NPM_GLOBAL_BIN\nexport PATH=\"$HOME/.npm-global/bin:$PATH\"\n' >> ~/.zshrc
npm install -g openclaw@latest
~/.npm-global/bin/openclaw --profile archaios-worker onboard --mode local --non-interactive --accept-risk --auth-choice skip --workspace ~/openclaw-work --skip-channels --skip-daemon --skip-health --skip-search --skip-skills --skip-ui --secret-input-mode ref --json
~/.npm-global/bin/openclaw --profile archaios-worker config set agents.defaults.model.primary '"openai/gpt-4o-mini"' --strict-json
~/.npm-global/bin/openclaw --profile archaios-worker config set agents.defaults.skills '[]' --strict-json
~/.npm-global/bin/openclaw --profile archaios-worker config set agents.defaults.sandbox.mode '"off"' --strict-json
~/.npm-global/bin/openclaw --profile archaios-worker config set tools.allow '[]' --strict-json
~/.npm-global/bin/openclaw --profile archaios-worker config set gateway.tools.allow '[]' --strict-json
~/.npm-global/bin/openclaw --profile archaios-worker config set logging.redactSensitive '"tools"' --strict-json
~/.npm-global/bin/openclaw --profile archaios-worker config set tools.profile '"minimal"' --strict-json
~/.npm-global/bin/openclaw --profile archaios-worker config set plugins.allow '["acpx","openai"]' --strict-json
~/.npm-global/bin/openclaw --profile archaios-worker config set discovery.mdns.mode '"off"' --strict-json
~/.npm-global/bin/openclaw --profile archaios-worker config set canvasHost.enabled 'false' --strict-json
~/.npm-global/bin/openclaw --profile archaios-worker config validate
```

## Validation Status

Validated successfully:

- `openclaw --version`
- profile onboarding for `archaios-worker`
- config validation
- local gateway health
- `log-work.sh`
- `organize.sh --apply`

Validated as safe failures:

- `research.sh` stops with `OPENAI_API_KEY is not set in the current shell.`
- `archaios-task.sh` reaches the bridge but fails because `http://localhost:3000/api/ai/chat` was not responding during validation

To finish full end-to-end validation later:

1. Export `OPENAI_API_KEY`
2. Start your local ARCHAIOS app on `http://localhost:3000`
3. Run:

```bash
~/openclaw-work/scripts/research.sh ~/openclaw-work/tasks/organized/txt/sample-note.txt
~/openclaw-work/scripts/draft.sh "Draft a test message from the OpenClaw worker."
~/openclaw-work/scripts/archaios-task.sh "Health check from OpenClaw worker"
```

## Troubleshooting

- `openclaw: command not found`
  - Run `source ~/.zshrc`
  - Or use the absolute path `~/.npm-global/bin/openclaw`

- `OPENAI_API_KEY is not set in the current shell`
  - Export `OPENAI_API_KEY` before running `research`, `draft`, or `code-assist`

- `Path outside workspace is not allowed`
  - Move the file into `~/openclaw-work/tasks` first

- `ARCHAIOS API request failed`
  - Confirm your app is running on `http://localhost:3000`
  - Confirm `/api/ai/chat` exists and accepts `{ "message": "..." }`

- `Docker/Podman sandbox not available`
  - That is expected on the current machine
  - The setup is still isolated operationally, but not container-sandboxed

- Need a clean rollback
  - Remove `~/openclaw-work`
  - Remove `~/.openclaw-archaios-worker`
  - Remove `~/.npm-global`
  - Remove the `OPENCLAW_NPM_GLOBAL_BIN` block from `~/.zshrc`
  - Remove `~/.npmrc` if you no longer want the user-local npm prefix
