#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
WORKER_NAME="archaios-saas-worker"
cd "$ROOT_DIR"

echo "== ARCHAIOS deploy checklist =="

if [[ -f "pnpm-lock.yaml" ]]; then
  echo "Installing dependencies with pnpm..."
  pnpm install
elif [[ -f "package-lock.json" || -f "package.json" ]]; then
  echo "Installing dependencies with npm..."
  npm install
else
  echo "No package manager lockfile found in $ROOT_DIR. Skipping install step."
fi

echo "\nSet required Cloudflare Worker secrets (interactive prompts):"
npx wrangler secret put SUPABASE_URL --name "$WORKER_NAME"
npx wrangler secret put SUPABASE_SERVICE_ROLE_KEY --name "$WORKER_NAME"
npx wrangler secret put OPENAI_API_KEY --name "$WORKER_NAME"
npx wrangler secret put STRIPE_SECRET_KEY --name "$WORKER_NAME"
npx wrangler secret put STRIPE_WEBHOOK_SECRET --name "$WORKER_NAME"

read -r -p "Set optional AUTH_TOKEN secret now? [y/N]: " SET_AUTH
if [[ "${SET_AUTH,,}" == "y" ]]; then
  npx wrangler secret put AUTH_TOKEN --name "$WORKER_NAME"
fi

echo "\nDeploying worker..."
DEPLOY_OUTPUT="$(npx wrangler deploy --name "$WORKER_NAME" 2>&1)"
echo "$DEPLOY_OUTPUT"

WORKER_BASE_URL="$(printf '%s\n' "$DEPLOY_OUTPUT" | grep -Eo 'https://[a-zA-Z0-9.-]+\.workers\.dev' | head -n1 || true)"
if [[ -z "$WORKER_BASE_URL" ]]; then
  WORKER_BASE_URL="https://${WORKER_NAME}.<subdomain>.workers.dev"
fi

echo
echo "Final Worker URL: $WORKER_BASE_URL"
echo "Stripe webhook endpoint URL: ${WORKER_BASE_URL}/api/stripe/webhook"

read -r -p "Enter AUTH_TOKEN for protected POST smoke test (leave blank to skip): " AUTH_TOKEN

echo "\nSmoke test: /api/health"
curl -sS "$WORKER_BASE_URL/api/health" && echo

echo "\nSmoke test: /api/agents/status"
curl -sS "$WORKER_BASE_URL/api/agents/status" && echo

if [[ -n "${AUTH_TOKEN}" ]]; then
  echo "\nSmoke test: POST /api/agents/run (revenue_sentinel)"
  curl -sS -X POST "$WORKER_BASE_URL/api/agents/run" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $AUTH_TOKEN" \
    -d '{"agent":"revenue_sentinel"}' && echo
else
  echo "\nSkipping POST /api/agents/run smoke test because AUTH_TOKEN was blank."
fi

echo "\nStripe webhook smoke test: expect HTTP 400 without stripe-signature"
curl -sS -o /tmp/archaios-stripe-webhook-smoke.json -w "HTTP %{http_code}\n" \
  -X POST "$WORKER_BASE_URL/api/stripe/webhook" \
  -H "Content-Type: application/json" \
  -d '{}'
cat /tmp/archaios-stripe-webhook-smoke.json && echo

echo "\nDone."
