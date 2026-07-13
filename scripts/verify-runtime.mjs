import {
  PRODUCTION_API_URL,
  PRODUCTION_FRONTEND_ORIGIN,
  PRODUCTION_FRONTEND_URL
} from "../shared/production-config.js";

const frontendUrl = String(process.env.ARCHAIOS_FRONTEND_URL || PRODUCTION_FRONTEND_URL).replace(/\/+$/, "");
const apiUrl = String(process.env.ARCHAIOS_API_URL || PRODUCTION_API_URL).replace(/\/+$/, "");
const frontendOrigin = String(process.env.ARCHAIOS_FRONTEND_ORIGIN || PRODUCTION_FRONTEND_ORIGIN).replace(/\/+$/, "");
const timeoutMs = Number(process.env.ARCHAIOS_VERIFY_TIMEOUT_MS || 12_000);

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

async function fetchWithTimeout(url, options = {}) {
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

async function readJson(path, options = {}) {
  const response = await fetchWithTimeout(`${apiUrl}${path}`, {
    ...options,
    headers: {
      Origin: frontendOrigin,
      ...(options.headers || {})
    }
  });
  const body = await response.json().catch(() => null);
  return { response, body };
}

async function verify() {
  const frontend = await fetchWithTimeout(frontendUrl, { method: "GET" });
  assert(frontend.ok, `frontend returned HTTP ${frontend.status}`);

  const health = await readJson("/api/health");
  assert(health.response.ok, `health returned HTTP ${health.response.status}`);
  assert(health.body?.ok === true, "health ok flag is missing");
  assert(health.body?.service === "archaios-core-api", "health service name is unexpected");
  assert(health.body?.runtime === "cloudflare-worker", "health runtime is unexpected");

  const version = await readJson("/api/version");
  assert(version.response.ok, `version returned HTTP ${version.response.status}`);
  assert(typeof version.body?.version === "string" && version.body.version.length > 0, "version JSON is invalid");

  const cors = await readJson("/api/health", { method: "OPTIONS" });
  assert([204, 200].includes(cors.response.status), `CORS preflight returned HTTP ${cors.response.status}`);
  assert(
    cors.response.headers.get("access-control-allow-origin") === frontendOrigin,
    "CORS does not permit the configured frontend origin"
  );

  const missing = await readJson("/api/does-not-exist");
  assert(missing.response.status === 404, `unknown route returned HTTP ${missing.response.status}`);
  assert(missing.body?.error?.code === "not_found", "unknown route did not return controlled JSON 404");

  const subscription = await readJson("/api/subscription");
  assert([401, 503].includes(subscription.response.status), `subscription degraded check returned HTTP ${subscription.response.status}`);
  if (subscription.response.status === 503) {
    assert(subscription.body?.status === "temporarily_unavailable", "subscription degraded payload is invalid");
    assert(subscription.body?.service === "supabase", "subscription degraded service is invalid");
  }

  console.log(`Runtime verified: ${frontendUrl} -> ${apiUrl}`);
}

verify().catch((error) => {
  console.error(`Runtime verification failed: ${error.message}`);
  process.exitCode = 1;
});
