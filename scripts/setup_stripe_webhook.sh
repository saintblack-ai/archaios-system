#!/usr/bin/env bash
set -euo pipefail

WORKER_NAME="archaios-saas-worker"

if [[ ! -f "wrangler.toml" ]]; then
  echo "Error: wrangler.toml not found in current directory: $(pwd)" >&2
  echo "Run this script from the folder that contains wrangler.toml." >&2
  exit 1
fi

if ! command -v npx >/dev/null 2>&1; then
  echo "Error: npx is not installed or not in PATH." >&2
  exit 1
fi

if ! grep -Eq '^[[:space:]]*name[[:space:]]*=[[:space:]]*"archaios-saas-worker"' wrangler.toml; then
  echo "Error: wrangler.toml does not declare name = \"archaios-saas-worker\"." >&2
  exit 1
fi

echo "Detected worker name: $WORKER_NAME"

echo
echo "Set STRIPE_SECRET_KEY (you will be prompted securely by Wrangler):"
npx wrangler secret put STRIPE_SECRET_KEY --name "$WORKER_NAME"

echo
echo "Set STRIPE_WEBHOOK_SECRET (you will be prompted securely by Wrangler):"
npx wrangler secret put STRIPE_WEBHOOK_SECRET --name "$WORKER_NAME"

echo
echo "Deploying worker..."
DEPLOY_OUTPUT="$(npx wrangler deploy --name "$WORKER_NAME" 2>&1)"
echo "$DEPLOY_OUTPUT"

WORKER_BASE_URL="$(printf '%s\n' "$DEPLOY_OUTPUT" | grep -Eo 'https://[a-zA-Z0-9.-]+\.workers\.dev' | head -n1 || true)"

if [[ -z "$WORKER_BASE_URL" ]]; then
  echo "Warning: Could not parse worker URL from deploy output." >&2
  echo "If needed, check Cloudflare dashboard or re-run deploy to confirm URL." >&2
  WORKER_BASE_URL="https://${WORKER_NAME}.<your-subdomain>.workers.dev"
fi

echo
echo "Worker base URL: $WORKER_BASE_URL"
echo "Put this in Stripe endpoint URL: ${WORKER_BASE_URL}/api/stripe/webhook"
