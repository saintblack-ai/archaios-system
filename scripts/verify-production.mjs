import {
  BACKEND_WORKER_NAME,
  PRODUCTION_API_URL,
  PRODUCTION_FRONTEND_ORIGIN
} from "../shared/production-config.js";

const apiUrl = String(process.env.ARCHAIOS_PRODUCTION_API_URL || PRODUCTION_API_URL).replace(/\/+$/, "");
const expectedService = process.env.ARCHAIOS_EXPECTED_SERVICE || BACKEND_WORKER_NAME;

async function readJson(path, options = {}) {
  const response = await fetch(`${apiUrl}${path}`, {
    signal: AbortSignal.timeout(15_000),
    ...options,
    headers: {
      Origin: PRODUCTION_FRONTEND_ORIGIN,
      ...(options.headers || {})
    }
  });
  const body = await response.json().catch(() => null);
  return { response, body };
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

try {
  const health = await readJson("/api/health");
  assert(health.response.ok, `health returned HTTP ${health.response.status}`);
  assert(health.body?.ok === true, "health payload did not report ok=true");
  assert(health.body?.service === expectedService, `expected service ${expectedService}, received ${health.body?.service || "missing"}`);
  assert(typeof health.body?.release === "string" && health.body.release.length > 0, "health release identifier is missing");
  assert(
    health.response.headers.get("access-control-allow-origin") === PRODUCTION_FRONTEND_ORIGIN,
    "production CORS origin does not match the canonical frontend origin"
  );
  const methods = health.response.headers.get("access-control-allow-methods") || "";
  for (const method of ["GET", "POST", "DELETE", "PATCH", "OPTIONS"]) {
    assert(methods.includes(method), `CORS methods are missing ${method}`);
  }

  const pricing = await readJson("/api/pricing");
  assert(pricing.response.ok, `pricing returned HTTP ${pricing.response.status}`);
  assert(pricing.body?.ok === true && Array.isArray(pricing.body?.pricing), "pricing contract is invalid");

  console.log(`Production verified: ${apiUrl}`);
  console.log(`Service: ${health.body.service}`);
  console.log(`Release: ${health.body.release}`);
} catch (error) {
  console.error(`Production verification failed for ${apiUrl}: ${error.message}`);
  process.exitCode = 1;
}
