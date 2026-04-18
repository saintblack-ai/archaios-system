#!/usr/bin/env bash
set -euo pipefail

WORKER_NAME="archaios-saas-worker"
WEBHOOK_URL="https://archaios-saas-worker.quandrix357.workers.dev/api/stripe/webhook"

if [[ ! -f "wrangler.toml" ]]; then
  echo "Error: wrangler.toml not found in current directory: $(pwd)" >&2
  echo "Run this script from the repository root." >&2
  exit 1
fi

if ! command -v npx >/dev/null 2>&1; then
  echo "Error: npx is not installed or not in PATH." >&2
  exit 1
fi

printf "Enter STRIPE_SECRET_KEY: " >&2
read -rs STRIPE_SECRET_KEY
printf "\n" >&2

if [[ -z "${STRIPE_SECRET_KEY}" ]]; then
  echo "Error: STRIPE_SECRET_KEY cannot be blank." >&2
  exit 1
fi

printf "Enter STRIPE_WEBHOOK_SECRET (whsec_...): " >&2
read -rs STRIPE_WEBHOOK_SECRET
printf "\n" >&2

if [[ -z "${STRIPE_WEBHOOK_SECRET}" ]]; then
  echo "Error: STRIPE_WEBHOOK_SECRET cannot be blank." >&2
  exit 1
fi

printf "%s" "${STRIPE_SECRET_KEY}" | npx wrangler secret put STRIPE_SECRET_KEY --name "${WORKER_NAME}"
printf "%s" "${STRIPE_WEBHOOK_SECRET}" | npx wrangler secret put STRIPE_WEBHOOK_SECRET --name "${WORKER_NAME}"
npx wrangler deploy

echo
echo "Paste this Stripe webhook URL into Stripe:"
echo "${WEBHOOK_URL}"
