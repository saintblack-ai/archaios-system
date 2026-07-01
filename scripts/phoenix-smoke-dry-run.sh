#!/usr/bin/env bash
set -euo pipefail

WORKER_BASE_URL="${WORKER_BASE_URL:-https://archaios-saas-worker.quandrix357.workers.dev}"
RUN_LEAD_STUB="${RUN_LEAD_STUB:-false}"
PASS_COUNT=0
FAIL_COUNT=0
SKIP_COUNT=0

echo "ARCHAIOS PHOENIX DRY-RUN SMOKE TEST"
echo "Compliance note: Do not transact or collect regulated data until licensed."
echo "Target: ${WORKER_BASE_URL}"
echo

pass() {
  PASS_COUNT=$((PASS_COUNT + 1))
  echo "PASS: $1"
  echo
}

fail() {
  FAIL_COUNT=$((FAIL_COUNT + 1))
  echo "FAIL: $1" >&2
  echo >&2
}

skip() {
  SKIP_COUNT=$((SKIP_COUNT + 1))
  echo "SKIP: $1"
  echo
}

check_get() {
  local path="$1"
  local label="$2"
  local body_file
  body_file="$(mktemp)"
  local status
  status="$(curl -sS -o "${body_file}" -w "%{http_code}" "${WORKER_BASE_URL}${path}")"
  echo "CHECK: ${label}"
  echo "URL: ${WORKER_BASE_URL}${path}"
  echo "HTTP: ${status}"
  cat "${body_file}"
  echo
  rm -f "${body_file}"
  if [[ "${status}" != "200" ]]; then
    fail "${label} expected HTTP 200, got ${status}."
    return 1
  fi
  pass "${label}"
}

check_post_expect() {
  local path="$1"
  local label="$2"
  local expected="$3"
  local payload="$4"
  local body_file
  body_file="$(mktemp)"
  local status
  status="$(curl -sS -o "${body_file}" -w "%{http_code}" \
    -X POST "${WORKER_BASE_URL}${path}" \
    -H "Content-Type: application/json" \
    --data "${payload}")"
  echo "CHECK: ${label}"
  echo "URL: ${WORKER_BASE_URL}${path}"
  echo "HTTP: ${status} (expected ${expected})"
  cat "${body_file}"
  echo
  rm -f "${body_file}"
  if [[ "${status}" != "${expected}" ]]; then
    fail "${label} expected HTTP ${expected}, got ${status}."
    return 1
  fi
  pass "${label}"
}

check_post_expect_any() {
  local path="$1"
  local label="$2"
  local expected_csv="$3"
  local payload="$4"
  local body_file
  body_file="$(mktemp)"
  local status
  status="$(curl -sS -o "${body_file}" -w "%{http_code}" \
    -X POST "${WORKER_BASE_URL}${path}" \
    -H "Content-Type: application/json" \
    --data "${payload}")"
  echo "CHECK: ${label}"
  echo "URL: ${WORKER_BASE_URL}${path}"
  echo "HTTP: ${status} (expected one of ${expected_csv})"
  cat "${body_file}"
  echo
  rm -f "${body_file}"
  IFS=',' read -r -a expected_codes <<< "${expected_csv}"
  for expected in "${expected_codes[@]}"; do
    if [[ "${status}" == "${expected}" ]]; then
      pass "${label}"
      return 0
    fi
  done
  fail "${label} expected one of ${expected_csv}, got ${status}."
  return 1
}

check_get "/api/health" "health"
check_get "/api/pricing" "pricing"

check_post_expect "/api/stripe/webhook" "unsigned webhook signature guard" "400" '{}'

echo "Dry-run checkout guard: unsigned checkout should be rejected."
check_post_expect_any "/api/stripe/checkout" "unsigned checkout guard" "401,403,500" '{"tier":"pro"}'

if [[ "${RUN_LEAD_STUB}" == "true" ]]; then
  echo "Lead write simulation requested."
  echo "This sends a test-only invalid-domain address. Run only after licensing/operator approval."
  check_post_expect "/api/leads" "lead test-only write" "200" '{"email":"phoenix-dry-run@example.invalid","source":"phoenix-dry-run"}'
else
  skip "POST /api/leads. Set RUN_LEAD_STUB=true only after licensing/operator approval."
fi

cat <<'EOF'

Paid dashboard unlock dry-run checklist:
- Do not run real checkout until licensed.
- Unit-test unlock logic with a stub subscription:
  tier=pro, status=active -> paid=true
  tier=elite, status=trialing -> paid=true
  tier=free, status=free -> paid=false
  tier=pro, status=canceled -> paid=false
- Authenticated endpoint checks require a Supabase test user and bearer token.
EOF

echo
echo "SUMMARY"
echo "PASS: ${PASS_COUNT}"
echo "FAIL: ${FAIL_COUNT}"
echo "SKIP: ${SKIP_COUNT}"

if [[ "${FAIL_COUNT}" -gt 0 ]]; then
  exit 1
fi
