#!/usr/bin/env bash
set -euo pipefail

WORKER_NAME="archaios-saas-worker"
WORKER_BASE_URL="https://${WORKER_NAME}.quandrix357.workers.dev"

echo "Smoke test: ${WORKER_BASE_URL}/api/health"
curl -sS "${WORKER_BASE_URL}/api/health"
printf "\n\n"

echo "Smoke test: ${WORKER_BASE_URL}/api/agents/status"
curl -sS "${WORKER_BASE_URL}/api/agents/status"
printf "\n\n"

echo "Smoke test: POST ${WORKER_BASE_URL}/api/stripe/webhook (expect HTTP 400 without stripe-signature)"
curl -sS -o /tmp/archaios-stripe-webhook-smoke.json -w "HTTP %{http_code}\n" \
  -X POST "${WORKER_BASE_URL}/api/stripe/webhook" \
  -H "Content-Type: application/json" \
  -d '{}'
cat /tmp/archaios-stripe-webhook-smoke.json
printf "\n"
