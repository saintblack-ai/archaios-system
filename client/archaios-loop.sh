#!/usr/bin/env bash
set -Eeuo pipefail

# ARCHAIOS autonomous loop runner.
# Read-only checks only: no deploys, no DNS edits, no secret mutations.

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$SCRIPT_DIR"
LOG_DIR="$ROOT_DIR/logs"
TASK_DIR="$ROOT_DIR/tasks"
CLOUDDOCS_ROOT="$HOME/Library/Mobile Documents/com~apple~CloudDocs"

SYSTEM_STATUS_FILE="$ROOT_DIR/system_status.md"
AGENT_ROLES_FILE="$ROOT_DIR/agent_roles.md"
NEXT_ACTIONS_FILE="$ROOT_DIR/next_actions.md"

LOOP_LOG_FILE="$LOG_DIR/autonomous-agent-loop.log"
LOOP_STATUS_LOG="$LOG_DIR/loop-status.log"
ERROR_LOG_FILE="$LOG_DIR/errors.log"
LAST_STATUS_JSON="$LOG_DIR/autonomous-agent-loop-last.json"
LOOP_STATE_FILE="$LOG_DIR/loop-state.env"

VERCEL_BASE_URL="${VERCEL_BASE_URL:-https://ai-assassins-client.vercel.app}"
GH_PAGES_BASE_URL="${GH_PAGES_BASE_URL:-https://saintblack-ai.github.io/ai-assassins-client}"
CF_WORKER_HEALTH_URL="${CF_WORKER_HEALTH_URL:-https://archaios-saas-worker.quandrix357.workers.dev/api/health}"

LOOP_INTERVAL_SECONDS="${LOOP_INTERVAL_SECONDS:-}"
LOOP_INTERVAL_MIN_SECONDS="${LOOP_INTERVAL_MIN_SECONDS:-300}"
LOOP_INTERVAL_MAX_SECONDS="${LOOP_INTERVAL_MAX_SECONDS:-600}"
LOOP_MAX_CYCLES="${LOOP_MAX_CYCLES:-0}"
BUILD_MIN_INTERVAL_SECONDS="${BUILD_MIN_INTERVAL_SECONDS:-3600}"
AUTO_PROCESS_KNOWLEDGE="${AUTO_PROCESS_KNOWLEDGE:-true}"
KNOWLEDGE_MIN_INTERVAL_SECONDS="${KNOWLEDGE_MIN_INTERVAL_SECONDS:-1800}"
ARCHAIOS_ARCHIVE_ROOT=""
EXPORT_KNOWLEDGE_SOURCE="$CLOUDDOCS_ROOT/Archaios Infrastructure/raw_exports/chatgpt_export_2026-04-16"
ORCHESTRATOR_ENABLED="${ORCHESTRATOR_ENABLED:-true}"
ORCHESTRATOR_SCRIPT="${ORCHESTRATOR_SCRIPT:-$ROOT_DIR/archaios-core/orchestrator/orchestrator.mjs}"
DAILY_SUMMARY_FILE="${DAILY_SUMMARY_FILE:-$LOG_DIR/daily-summary.log}"

usage() {
  cat <<'EOF'
Usage:
  ./archaios-loop.sh once
  ./archaios-loop.sh start
  ./archaios-loop.sh status

Environment overrides:
  LOOP_INTERVAL_SECONDS=300     # legacy fixed interval override
  LOOP_INTERVAL_MIN_SECONDS=300 # 5 minutes
  LOOP_INTERVAL_MAX_SECONDS=600 # 10 minutes
  LOOP_MAX_CYCLES=0   # 0 means run forever in start mode
  BUILD_MIN_INTERVAL_SECONDS=3600
  AUTO_PROCESS_KNOWLEDGE=true
  KNOWLEDGE_MIN_INTERVAL_SECONDS=1800
  EXPORT_KNOWLEDGE_SOURCE=...
  ORCHESTRATOR_ENABLED=true
  ORCHESTRATOR_SCRIPT=...
  VERCEL_BASE_URL=...
  GH_PAGES_BASE_URL=...
  CF_WORKER_HEALTH_URL=...
EOF
}

log() {
  local ts
  ts="$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
  mkdir -p "$LOG_DIR"
  printf "[%s] %s\n" "$ts" "$*" | tee -a "$LOOP_LOG_FILE" "$LOOP_STATUS_LOG" >/dev/null
}

log_error() {
  local ts
  ts="$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
  mkdir -p "$LOG_DIR"
  printf "[%s] %s\n" "$ts" "$*" | tee -a "$ERROR_LOG_FILE" >/dev/null
}

on_error() {
  local exit_code="$1"
  local line_no="$2"
  log_error "loop error exit_code=$exit_code line=$line_no command=${BASH_COMMAND:-unknown}"
}

init_runtime_files() {
  mkdir -p "$LOG_DIR" "$TASK_DIR"
  touch "$LOOP_STATUS_LOG" "$ERROR_LOG_FILE" "$LOOP_LOG_FILE" "$DAILY_SUMMARY_FILE"
}

load_state() {
  LAST_BUILD_EPOCH=0
  LAST_BUILD_INPUT_HASH=""
  LAST_CYCLE_SIGNATURE=""
  LAST_KNOWLEDGE_EPOCH=0
  LAST_KNOWLEDGE_HASH=""
  if [[ -f "$LOOP_STATE_FILE" ]]; then
    # shellcheck disable=SC1090
    source "$LOOP_STATE_FILE"
  fi
}

save_state() {
  cat >"$LOOP_STATE_FILE" <<EOF
LAST_BUILD_EPOCH=${LAST_BUILD_EPOCH:-0}
LAST_BUILD_INPUT_HASH="${LAST_BUILD_INPUT_HASH:-}"
LAST_CYCLE_SIGNATURE="${LAST_CYCLE_SIGNATURE:-}"
LAST_KNOWLEDGE_EPOCH=${LAST_KNOWLEDGE_EPOCH:-0}
LAST_KNOWLEDGE_HASH="${LAST_KNOWLEDGE_HASH:-}"
EOF
}

write_if_changed() {
  local target="$1"
  local tmp_file="$2"
  if [[ -f "$target" ]] && cmp -s "$target" "$tmp_file"; then
    rm -f "$tmp_file"
    return 1
  fi
  mv "$tmp_file" "$target"
  return 0
}

http_code() {
  local url="$1"
  local code
  code="$(curl -s -L -o /dev/null -w "%{http_code}" "$url" || true)"
  if [[ -z "$code" ]]; then
    code="000"
  fi
  printf "%s" "$code"
}

is_2xx() {
  [[ "$1" =~ ^2[0-9][0-9]$ ]]
}

resolve_archive_root() {
  local exact_path fallback_path
  exact_path="$CLOUDDOCS_ROOT/Archaios Infrastructure"
  if [[ -d "$exact_path" ]]; then
    printf "%s" "$exact_path"
    return 0
  fi

  fallback_path="$(find "$CLOUDDOCS_ROOT" -maxdepth 1 -type d -name "Archaios Infrastructure*" | LC_ALL=C sort | head -n 1)"
  if [[ -n "$fallback_path" && -d "$fallback_path" ]]; then
    printf "%s" "$fallback_path"
    return 0
  fi

  return 1
}

sync_task_queue_source() {
  local queue_file="$TASK_DIR/agent-task-queue.json"
  [[ -f "$queue_file" ]] || return 0
  sed -E -i '' "s|(\"source\": \").*(\")|\\1$EXPORT_KNOWLEDGE_SOURCE\\2|g" "$queue_file"
}

run_monetization_checks() {
  local tier_test="unknown"
  local build_check="unknown"
  local stripe_wrapper="missing"
  local build_reason="skipped"

  load_state

  if node --test "$ROOT_DIR/src/lib/subscription.test.js" >/dev/null 2>&1; then
    tier_test="pass"
  else
    tier_test="fail"
  fi

  local build_input_hash
  build_input_hash="$(
    {
      [[ -f "$ROOT_DIR/package.json" ]] && shasum "$ROOT_DIR/package.json"
      [[ -f "$ROOT_DIR/vite.config.js" ]] && shasum "$ROOT_DIR/vite.config.js"
      find "$ROOT_DIR/src" "$ROOT_DIR/worker" -type f 2>/dev/null | sort | xargs shasum 2>/dev/null || true
    } | shasum | awk '{print $1}'
  )"

  local now_epoch
  now_epoch="$(date +%s)"
  local elapsed_since_build=$((now_epoch - LAST_BUILD_EPOCH))

  local should_build="false"
  if [[ -z "${LAST_BUILD_INPUT_HASH:-}" ]]; then
    should_build="true"
    build_reason="first-run"
  elif [[ "$build_input_hash" != "${LAST_BUILD_INPUT_HASH:-}" ]]; then
    should_build="true"
    build_reason="source-change"
  elif [[ "$elapsed_since_build" -ge "$BUILD_MIN_INTERVAL_SECONDS" ]]; then
    should_build="true"
    build_reason="interval-refresh"
  fi

  if [[ "$should_build" == "true" ]]; then
    if npm run build >/dev/null 2>&1; then
      build_check="pass"
      LAST_BUILD_EPOCH="$now_epoch"
      LAST_BUILD_INPUT_HASH="$build_input_hash"
      save_state
    else
      build_check="fail"
      log_error "build failed reason=$build_reason"
    fi
  else
    build_check="skipped"
  fi

  if [[ -f "$ROOT_DIR/src/agents/stripeAgent.js" ]]; then
    stripe_wrapper="present"
  fi

  printf "%s|%s|%s|%s" "$tier_test" "$build_check" "$stripe_wrapper" "$build_reason"
}

knowledge_source_hash() {
  local src="$1"
  if [[ ! -d "$src" ]]; then
    echo "missing"
    return
  fi
  find "$src" -type f \( -iname "*.json" -o -iname "*.md" -o -iname "*.txt" -o -iname "*.html" -o -iname "*.htm" \) \
    -print | sort | shasum | awk '{print $1}'
}

write_agent_task_queue() {
  local now_ts="$1"
  local queue_file="$TASK_DIR/agent-task-queue.json"
  cat >"$queue_file" <<EOF
{
  "generatedAt": "$now_ts",
  "source": "$EXPORT_KNOWLEDGE_SOURCE",
  "tasks": [
    {
      "agent": "infra-agent",
      "priority": "high",
      "task": "Validate route availability and worker health after knowledge refresh."
    },
    {
      "agent": "product-agent",
      "priority": "high",
      "task": "Review knowledge/project indexes and propose dashboard integration updates."
    },
    {
      "agent": "revenue-agent",
      "priority": "medium",
      "task": "Re-evaluate monetization docs and Stripe prep artifacts from latest export insights."
    },
    {
      "agent": "content-agent",
      "priority": "medium",
      "task": "Generate fresh content queue candidates from updated category files."
    },
    {
      "agent": "research-agent",
      "priority": "high",
      "task": "Re-cluster conversations into AI/SaaS, books, music, game/OS, crypto, spiritual, and automation research domains."
    }
  ]
}
EOF
}

process_knowledge() {
  if [[ "$AUTO_PROCESS_KNOWLEDGE" != "true" ]]; then
    printf "disabled|disabled"
    return
  fi

  load_state
  local source_hash now_epoch elapsed should_ingest reason
  source_hash="$(knowledge_source_hash "$EXPORT_KNOWLEDGE_SOURCE")"
  now_epoch="$(date +%s)"
  elapsed=$((now_epoch - LAST_KNOWLEDGE_EPOCH))
  should_ingest="false"
  reason="skipped"

  if [[ "$source_hash" == "missing" ]]; then
    printf "skipped|source-missing"
    return
  fi

  if [[ -z "${LAST_KNOWLEDGE_HASH:-}" ]]; then
    should_ingest="true"
    reason="first-run"
  elif [[ "$source_hash" != "${LAST_KNOWLEDGE_HASH:-}" ]]; then
    should_ingest="true"
    reason="source-change"
  elif [[ "$elapsed" -ge "$KNOWLEDGE_MIN_INTERVAL_SECONDS" ]]; then
    should_ingest="true"
    reason="interval-refresh"
  fi

  if [[ "$should_ingest" == "true" ]]; then
    if npm run archaios:build -- "$EXPORT_KNOWLEDGE_SOURCE" >/dev/null 2>&1; then
      LAST_KNOWLEDGE_EPOCH="$now_epoch"
      LAST_KNOWLEDGE_HASH="$source_hash"
      save_state
      write_agent_task_queue "$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
      printf "processed|%s" "$reason"
      return
    fi
    log_error "knowledge ingest failed reason=$reason source=$EXPORT_KNOWLEDGE_SOURCE"
    printf "fail|%s" "$reason"
    return
  fi

  printf "skipped|%s" "$reason"
}

run_orchestrator() {
  if [[ "$ORCHESTRATOR_ENABLED" != "true" ]]; then
    printf "disabled|disabled"
    return
  fi
  if [[ ! -f "$ORCHESTRATOR_SCRIPT" ]]; then
    printf "skipped|script-missing"
    return
  fi

  if node "$ORCHESTRATOR_SCRIPT" >/dev/null 2>&1; then
    printf "ok|executed"
  else
    log_error "orchestrator cycle failed script=$ORCHESTRATOR_SCRIPT"
    printf "fail|execution-failed"
  fi
}

write_daily_summary() {
  local vercel_status="$1"
  local gh_status="$2"
  local cf_status="$3"
  local build_status="$4"
  local knowledge_status="$5"
  local orchestrator_status="$6"
  local summary_ts
  summary_ts="$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
  printf "[%s] vercel=%s gh=%s cf=%s build=%s knowledge=%s orchestrator=%s\n" \
    "$summary_ts" "$vercel_status" "$gh_status" "$cf_status" "$build_status" "$knowledge_status" "$orchestrator_status" \
    >>"$DAILY_SUMMARY_FILE"
}

write_agent_roles() {
  cat >"$AGENT_ROLES_FILE" <<'EOF'
# ARCHAIOS Agent Roles

Generated by autonomous loop.

## Infra Agent

- Mission: monitor infrastructure health and route integrity.
- Scope: Vercel primary, GitHub Pages backup, Cloudflare worker health.
- Guardrails: no deploy, no DNS changes, no secret changes.

## Product Agent

- Mission: improve dashboard and UI clarity.
- Scope: guest vs signed-in states, route UX consistency, tier messaging.
- Guardrails: no destructive refactors, no unapproved deployment changes.

## Revenue Agent

- Mission: prepare monetization flows for books/music and subscriptions.
- Scope: Free / Pro / Elite separation, pricing logic, checkout readiness.
- Guardrails: no billing activation, no secret modifications.
EOF
}

write_next_actions() {
  local vercel_ok="$1"
  local gh_ok="$2"
  local cf_ok="$3"
  local tier_test="$4"
  local build_check="$5"

  local tmp_file
  tmp_file="$(mktemp)"
  cat >"$tmp_file" <<EOF
# ARCHAIOS Next Actions

Generated by autonomous loop.

## Immediate

- Keep Vercel as primary app host.
- Keep GitHub Pages as static backup.
- Keep Cloudflare worker as backend/API/health layer.

## Validation Results

- Vercel routes: $vercel_ok
- GitHub Pages backup routes: $gh_ok
- Cloudflare worker health: $cf_ok
- Tier separation tests: $tier_test
- Build health: $build_check

## Safe Next Steps

- Continue auth and tier-gating cleanup in local code only.
- Keep Stripe in preparation mode until explicit activation approval.
- Re-run autonomous loop after each routing or billing-readiness change.
EOF
  write_if_changed "$NEXT_ACTIONS_FILE" "$tmp_file" >/dev/null || true
}

write_system_status() {
  local ts="$1"
  local vercel_root="$2"
  local vercel_landing="$3"
  local vercel_pricing="$4"
  local vercel_dashboard="$5"
  local vercel_operator="$6"
  local gh_root="$7"
  local gh_landing="$8"
  local gh_pricing="$9"
  local gh_dashboard="${10}"
  local gh_operator="${11}"
  local cf_health="${12}"
  local tier_test="${13}"
  local build_check="${14}"
  local stripe_wrapper="${15}"

  local vercel_ok="fail"
  local gh_ok="fail"
  local cf_ok="fail"

  if is_2xx "$vercel_root" && is_2xx "$vercel_landing" && is_2xx "$vercel_pricing" && is_2xx "$vercel_dashboard" && is_2xx "$vercel_operator"; then
    vercel_ok="pass"
  fi
  if is_2xx "$gh_root" && is_2xx "$gh_landing" && is_2xx "$gh_pricing" && is_2xx "$gh_dashboard" && is_2xx "$gh_operator"; then
    gh_ok="pass"
  fi
  if is_2xx "$cf_health"; then
    cf_ok="pass"
  fi

  local tmp_file
  tmp_file="$(mktemp)"
  cat >"$tmp_file" <<EOF
# ARCHAIOS System Status

Generated: $ts (autonomous loop)

## Scope Guardrails

- No deployment executed.
- No DNS changes made.
- No secret values modified.
- No billing activation performed.

## Infrastructure Validation

### Vercel Primary

- $VERCEL_BASE_URL -> $vercel_root
- $VERCEL_BASE_URL/landing -> $vercel_landing
- $VERCEL_BASE_URL/pricing -> $vercel_pricing
- $VERCEL_BASE_URL/dashboard -> $vercel_dashboard
- $VERCEL_BASE_URL/operator -> $vercel_operator

Status: $vercel_ok

### GitHub Pages Backup

- $GH_PAGES_BASE_URL/ -> $gh_root
- $GH_PAGES_BASE_URL/landing -> $gh_landing
- $GH_PAGES_BASE_URL/pricing -> $gh_pricing
- $GH_PAGES_BASE_URL/dashboard -> $gh_dashboard
- $GH_PAGES_BASE_URL/operator -> $gh_operator

Status: $gh_ok

### Cloudflare Worker Health

- $CF_WORKER_HEALTH_URL -> $cf_health

Status: $cf_ok

## Monetization Readiness (No Activation)

- Tier tests: $tier_test
- Build check: $build_check
- Stripe wrapper file: $stripe_wrapper

## Host Role Split

- Vercel: primary app host.
- GitHub Pages: static backup shell.
- Cloudflare Worker: backend/API/health.
EOF

  write_if_changed "$SYSTEM_STATUS_FILE" "$tmp_file" >/dev/null || true

  write_agent_roles
  write_next_actions "$vercel_ok" "$gh_ok" "$cf_ok" "$tier_test" "$build_check"

  cat >"$LAST_STATUS_JSON" <<EOF
{
  "generatedAt": "$ts",
  "vercel": {
    "root": "$vercel_root",
    "landing": "$vercel_landing",
    "pricing": "$vercel_pricing",
    "dashboard": "$vercel_dashboard",
    "operator": "$vercel_operator",
    "status": "$vercel_ok"
  },
  "githubPages": {
    "root": "$gh_root",
    "landing": "$gh_landing",
    "pricing": "$gh_pricing",
    "dashboard": "$gh_dashboard",
    "operator": "$gh_operator",
    "status": "$gh_ok"
  },
  "cloudflareWorker": {
    "health": "$cf_health",
    "status": "$cf_ok"
  },
  "monetization": {
    "tierTests": "$tier_test",
    "buildCheck": "$build_check",
    "stripeWrapper": "$stripe_wrapper"
  }
}
EOF

  load_state
  LAST_CYCLE_SIGNATURE="${vercel_root}|${vercel_landing}|${vercel_pricing}|${vercel_dashboard}|${vercel_operator}|${gh_root}|${gh_landing}|${gh_pricing}|${gh_dashboard}|${gh_operator}|${cf_health}|${tier_test}|${build_check}"
  save_state
}

run_cycle() {
  init_runtime_files
  local resolved_archive_root=""
  if resolved_archive_root="$(resolve_archive_root)"; then
    ARCHAIOS_ARCHIVE_ROOT="$resolved_archive_root"
    EXPORT_KNOWLEDGE_SOURCE="$ARCHAIOS_ARCHIVE_ROOT/raw_exports/chatgpt_export_2026-04-16"
    log "resolved archive root: $ARCHAIOS_ARCHIVE_ROOT"
  else
    ARCHAIOS_ARCHIVE_ROOT=""
    EXPORT_KNOWLEDGE_SOURCE="$CLOUDDOCS_ROOT/Archaios Infrastructure/raw_exports/chatgpt_export_2026-04-16"
    log_error "archive root resolution failed; using fallback source=$EXPORT_KNOWLEDGE_SOURCE"
  fi
  export ARCHAIOS_ARCHIVE_ROOT EXPORT_KNOWLEDGE_SOURCE
  sync_task_queue_source

  local ts
  ts="$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
  log "starting cycle"

  local vercel_root vercel_landing vercel_pricing vercel_dashboard vercel_operator
  local gh_root gh_landing gh_pricing gh_dashboard gh_operator cf_health
  vercel_root="$(http_code "$VERCEL_BASE_URL")"
  vercel_landing="$(http_code "$VERCEL_BASE_URL/landing")"
  vercel_pricing="$(http_code "$VERCEL_BASE_URL/pricing")"
  vercel_dashboard="$(http_code "$VERCEL_BASE_URL/dashboard")"
  vercel_operator="$(http_code "$VERCEL_BASE_URL/operator")"

  gh_root="$(http_code "$GH_PAGES_BASE_URL/")"
  gh_landing="$(http_code "$GH_PAGES_BASE_URL/landing")"
  gh_pricing="$(http_code "$GH_PAGES_BASE_URL/pricing")"
  gh_dashboard="$(http_code "$GH_PAGES_BASE_URL/dashboard")"
  gh_operator="$(http_code "$GH_PAGES_BASE_URL/operator")"

  cf_health="$(http_code "$CF_WORKER_HEALTH_URL")"

  local checks tier_test build_check stripe_wrapper build_reason
  checks="$(run_monetization_checks)"
  tier_test="${checks%%|*}"
  checks="${checks#*|}"
  build_check="${checks%%|*}"
  checks="${checks#*|}"
  stripe_wrapper="${checks%%|*}"
  build_reason="${checks##*|}"

  local knowledge_status knowledge_reason knowledge_result
  knowledge_result="$(process_knowledge)"
  knowledge_status="${knowledge_result%%|*}"
  knowledge_reason="${knowledge_result##*|}"

  local orchestrator_status orchestrator_reason orchestrator_result
  orchestrator_result="$(run_orchestrator)"
  orchestrator_status="${orchestrator_result%%|*}"
  orchestrator_reason="${orchestrator_result##*|}"

  write_daily_summary "$vercel_root" "$gh_root" "$cf_health" "$build_check" "$knowledge_status" "$orchestrator_status"

  write_system_status "$ts" \
    "$vercel_root" "$vercel_landing" "$vercel_pricing" "$vercel_dashboard" "$vercel_operator" \
    "$gh_root" "$gh_landing" "$gh_pricing" "$gh_dashboard" "$gh_operator" \
    "$cf_health" "$tier_test" "$build_check" "$stripe_wrapper"

  log "cycle complete: vercel=$vercel_root gh=$gh_root cf=$cf_health tier_test=$tier_test build=$build_check reason=$build_reason knowledge=$knowledge_status knowledge_reason=$knowledge_reason orchestrator=$orchestrator_status orchestrator_reason=$orchestrator_reason"
}

run_start() {
  init_runtime_files
  load_state
  local cycles=0
  while true; do
    if ! run_cycle; then
      log_error "cycle failed; continuing after backoff"
    fi
    cycles=$((cycles + 1))
    if [[ "$LOOP_MAX_CYCLES" -gt 0 && "$cycles" -ge "$LOOP_MAX_CYCLES" ]]; then
      log "reached LOOP_MAX_CYCLES=$LOOP_MAX_CYCLES"
      break
    fi

    local sleep_seconds
    if [[ -n "$LOOP_INTERVAL_SECONDS" ]]; then
      sleep_seconds="$LOOP_INTERVAL_SECONDS"
    else
      if [[ "$LOOP_INTERVAL_MAX_SECONDS" -lt "$LOOP_INTERVAL_MIN_SECONDS" ]]; then
        LOOP_INTERVAL_MAX_SECONDS="$LOOP_INTERVAL_MIN_SECONDS"
      fi
      sleep_seconds="$((RANDOM % (LOOP_INTERVAL_MAX_SECONDS - LOOP_INTERVAL_MIN_SECONDS + 1) + LOOP_INTERVAL_MIN_SECONDS))"
    fi
    log "sleeping ${sleep_seconds}s before next cycle"
    sleep "$sleep_seconds"
  done
}

trap 'on_error "$?" "$LINENO"' ERR

cmd="${1:-once}"
case "$cmd" in
once)
  run_cycle
  ;;
start)
  run_start
  ;;
status)
  if [[ -f "$LAST_STATUS_JSON" ]]; then
    cat "$LAST_STATUS_JSON"
  else
    echo "No loop status yet. Run: ./archaios-loop.sh once"
  fi
  ;;
*)
  usage
  exit 1
  ;;
esac
