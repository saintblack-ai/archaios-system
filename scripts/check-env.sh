#!/usr/bin/env bash
set -euo pipefail

placeholder="replace_with_your_openai_api_key"
found=0

check_env_file() {
  local file="$1"

  if [[ ! -f "$file" ]]; then
    return
  fi

  local value
  value="$(awk -F= '
    /^[[:space:]]*OPENAI_API_KEY[[:space:]]*=/ {
      sub(/^[^=]*=/, "")
      gsub(/^[[:space:]]+|[[:space:]]+$/, "")
      gsub(/^["'\'']|["'\'']$/, "")
      print
      exit
    }
  ' "$file")"

  if [[ -n "$value" && "$value" != "$placeholder" ]]; then
    echo "OPENAI_API_KEY is set in $file."
    found=1
  elif [[ -n "$value" ]]; then
    echo "OPENAI_API_KEY is present in $file but still uses the placeholder."
  fi
}

if [[ -n "${OPENAI_API_KEY:-}" ]]; then
  echo "OPENAI_API_KEY is set in the current shell environment."
  found=1
else
  echo "OPENAI_API_KEY is not set in the current shell environment."
fi

check_env_file ".env"
check_env_file ".env.local"
check_env_file ".env.development"
check_env_file ".env.production"
check_env_file "server/.env"
check_env_file "server/.env.development"
check_env_file "server/.env.production"

if [[ "$found" -eq 1 ]]; then
  echo "Environment readiness check passed without exposing the key."
else
  echo "Environment readiness check failed: set OPENAI_API_KEY in your shell or a local env file."
  exit 1
fi
