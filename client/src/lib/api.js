import { getApiErrorMessage } from "../../../shared/api-contracts.js";

const DEFAULT_TIMEOUT_MS = 12000;
const DEFAULT_API_BASE_URL = "https://archaios-saas-worker.quandrix357.workers.dev";
const RETRYABLE_STATUSES = new Set([408, 429, 500, 502, 503, 504]);

function trimTrailingSlash(value) {
  return String(value || "").replace(/\/+$/, "");
}

function resolveApiBaseUrl() {
  const configured = trimTrailingSlash(import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_BACKEND_URL);
  return configured || DEFAULT_API_BASE_URL;
}

export const API_BASE_URL = resolveApiBaseUrl();

export function getApiBaseUrl() {
  return API_BASE_URL;
}

export function buildApiUrl(path) {
  const normalizedPath = String(path || "/").startsWith("/") ? String(path || "/") : `/${path}`;
  return `${API_BASE_URL}${normalizedPath.replace(/^\/api\/api\//, "/api/")}`;
}

function shouldRetry(method, status) {
  return method === "GET" && RETRYABLE_STATUSES.has(status);
}

async function fetchWithTimeout(url, options, timeoutMs) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, {
      ...options,
      signal: controller.signal
    });
  } finally {
    clearTimeout(timer);
  }
}

export async function apiRequest(path, options = {}) {
  const method = String(options.method || "GET").toUpperCase();
  const url = buildApiUrl(path);
  const timeoutMs = Number(options.timeoutMs || DEFAULT_TIMEOUT_MS);
  const maxAttempts = method === "GET" && options.retry !== false ? 2 : 1;
  let lastError = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      const response = await fetchWithTimeout(
        url,
        {
          ...options,
          method,
          headers: {
            Accept: "application/json",
            ...(options.body ? { "Content-Type": "application/json" } : {}),
            ...(options.headers || {})
          }
        },
        timeoutMs
      );

      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        const error = new Error(getApiErrorMessage(payload, `request_failed_${response.status}`));
        error.status = response.status;
        error.payload = payload;
        if (attempt < maxAttempts && shouldRetry(method, response.status)) {
          lastError = error;
          continue;
        }
        throw error;
      }

      if (!payload || typeof payload !== "object") {
        throw new Error("invalid_json_response");
      }

      return payload;
    } catch (error) {
      lastError = error;
      if (attempt >= maxAttempts || method !== "GET") {
        if (error?.name === "AbortError") {
          throw new Error("request_timeout");
        }
        if (error instanceof TypeError) {
          throw new Error("network_unavailable");
        }
        throw error;
      }
    }
  }

  throw lastError || new Error("request_failed");
}
