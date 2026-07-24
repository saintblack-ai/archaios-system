import {
  PRODUCTION_API_URL,
  PRODUCTION_FRONTEND_ORIGIN,
  PRODUCTION_FRONTEND_URL
} from "../shared/production-config.js";

const frontendUrl = String(process.env.ARCHAIOS_FRONTEND_URL || PRODUCTION_FRONTEND_URL).replace(/\/+$/, "");
const apiUrl = String(process.env.ARCHAIOS_API_URL || PRODUCTION_API_URL).replace(/\/+$/, "");
const frontendOrigin = String(process.env.ARCHAIOS_FRONTEND_ORIGIN || PRODUCTION_FRONTEND_ORIGIN).replace(/\/+$/, "");
const timeoutMs = Number(process.env.ARCHAIOS_VERIFY_TIMEOUT_MS || 12_000);
const SECRET_FIELD_PATTERN = /(token|secret|service_role|private|api[_-]?key|authorization|password)/i;

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

function assertNoSecretFields(value, location = "payload") {
  if (!value || typeof value !== "object") {
    return;
  }

  for (const [key, nested] of Object.entries(value)) {
    const nestedLocation = `${location}.${key}`;
    assert(!SECRET_FIELD_PATTERN.test(key), `secret-like field leaked at ${nestedLocation}`);
    if (nested && typeof nested === "object") {
      assertNoSecretFields(nested, nestedLocation);
    }
  }
}

async function verify() {
  const frontend = await fetchWithTimeout(frontendUrl, { method: "GET" });
  assert(frontend.ok, `frontend returned HTTP ${frontend.status}`);

  const health = await readJson("/api/health");
  assert(health.response.ok, `health returned HTTP ${health.response.status}`);
  assert(health.body?.ok === true, "health ok flag is missing");
  assert(health.body?.service === "archaios-core-api", "health service name is unexpected");
  assert(health.body?.runtime === "cloudflare-worker", "health runtime is unexpected");
  assertNoSecretFields(health.body, "health");

  const version = await readJson("/api/version");
  assert(version.response.ok, `version returned HTTP ${version.response.status}`);
  assert(typeof version.body?.version === "string" && version.body.version.length > 0, "version JSON is invalid");
  assertNoSecretFields(version.body, "version");

  const status = await readJson("/api/status");
  assert(status.response.ok, `status returned HTTP ${status.response.status}`);
  assert(status.body?.ok === true, "status ok flag is missing");
  assert(typeof status.body?.mode === "string" && status.body.mode.length > 0, "status mode is invalid");
  assertNoSecretFields(status.body, "status");

  const pricing = await readJson("/api/pricing");
  assert(pricing.response.ok, `pricing returned HTTP ${pricing.response.status}`);
  assert(pricing.body?.ok === true && Array.isArray(pricing.body?.pricing), "pricing contract is invalid");
  assertNoSecretFields(pricing.body, "pricing");

  const sitrep = await readJson("/api/sitrep/latest");
  assert(sitrep.response.ok, `sitrep returned HTTP ${sitrep.response.status}`);
  assert(sitrep.body?.ok === true, "sitrep ok flag is missing");
  assert(
    sitrep.body?.live === true || sitrep.body?.live === false || sitrep.body?.mode === "degraded_public",
    "sitrep live/degraded mode is undocumented"
  );
  assertNoSecretFields(sitrep.body, "sitrep");

  const cors = await readJson("/api/health", { method: "OPTIONS" });
  assert([204, 200].includes(cors.response.status), `CORS preflight returned HTTP ${cors.response.status}`);
  assert(
    cors.response.headers.get("access-control-allow-origin") === frontendOrigin,
    "CORS does not permit the configured frontend origin"
  );

  const missing = await readJson("/api/does-not-exist");
  assert(missing.response.status === 404, `unknown route returned HTTP ${missing.response.status}`);
  assert(missing.body?.error?.code === "not_found", "unknown route did not return controlled JSON 404");
  assertNoSecretFields(missing.body, "missing");

  const subscription = await readJson("/api/subscription");
  assert([401, 503].includes(subscription.response.status), `subscription degraded check returned HTTP ${subscription.response.status}`);
  if (subscription.response.status === 503) {
    assert(subscription.body?.status === "temporarily_unavailable", "subscription degraded payload is invalid");
    assert(subscription.body?.service === "supabase", "subscription degraded service is invalid");
  }
  assertNoSecretFields(subscription.body, "subscription");

  console.log(`Runtime verified: ${frontendUrl} -> ${apiUrl}`);
}

verify().catch((error) => {
  console.error(`Runtime verification failed: ${error.message}`);
  process.exitCode = 1;
});
