import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import {
  FRONTEND_CANONICAL_API_ROUTES,
  WORKER_CANONICAL_API_ROUTES,
  routeKey
} from "../shared/runtime-routes.js";
import worker from "../worker.js";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const clientSrc = path.join(repoRoot, "client", "src");

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walk(fullPath)));
    } else if (/\.(js|jsx|ts|tsx)$/.test(entry.name)) {
      files.push(fullPath);
    }
  }
  return files;
}

test("canonical frontend API routes are implemented by the Worker route manifest", () => {
  const workerRoutes = new Set(WORKER_CANONICAL_API_ROUTES.map(routeKey));
  const missing = FRONTEND_CANONICAL_API_ROUTES.map(routeKey).filter((route) => !workerRoutes.has(route));
  assert.deepEqual(missing, []);
});

test("production frontend source does not hardcode localhost API URLs", async () => {
  const files = await walk(clientSrc);
  const offenders = [];
  for (const file of files) {
    const source = await readFile(file, "utf8");
    if (/(http:\/\/localhost|http:\/\/127\.0\.0\.1)/.test(source)) {
      offenders.push(path.relative(repoRoot, file));
    }
  }
  assert.deepEqual(offenders, []);
});

test("browser code does not expose private server credential names through VITE prefixes", async () => {
  const files = await walk(clientSrc);
  const privateNames = [
    "VITE_SUPABASE_SERVICE_ROLE_KEY",
    "VITE_STRIPE_SECRET_KEY",
    "VITE_STRIPE_WEBHOOK_SECRET",
    "VITE_OPENAI_API_KEY",
    "VITE_OPENAI_KEY"
  ];
  const offenders = [];
  for (const file of files) {
    const source = await readFile(file, "utf8");
    for (const name of privateNames) {
      if (source.includes(name)) {
        offenders.push(`${path.relative(repoRoot, file)} ${name}`);
      }
    }
  }
  assert.deepEqual(offenders, []);
});

test("Worker exposes health, version, status, and request id headers", async () => {
  const request = new Request("https://worker.example/api/health", {
    headers: { Origin: "https://saintblack-ai.github.io", "X-Request-Id": "test-request-123" }
  });
  const health = await worker.fetch(request, {}, {});
  assert.equal(health.status, 200);
  assert.equal(health.headers.get("x-request-id"), "test-request-123");
  const healthPayload = await health.json();
  assert.equal(healthPayload.ok, true);
  assert.equal(healthPayload.service, "archaios-core-api");
  assert.equal(healthPayload.status, "healthy");
  assert.equal(healthPayload.runtime, "cloudflare-worker");
  assert.equal(healthPayload.dependencies.supabase, "inactive");

  const version = await worker.fetch(new Request("https://worker.example/api/version"), {}, {});
  assert.equal(version.status, 200);
  assert.equal(typeof (await version.json()).version, "string");

  const status = await worker.fetch(new Request("https://worker.example/api/status"), {}, {});
  assert.equal(status.status, 200);
  assert.equal((await status.json()).mode, "degraded_public");
});

test("Worker exposes degraded-safe agent readiness without activated infrastructure", async () => {
  const health = await worker.fetch(new Request("https://worker.example/api/agents/health"), {}, {});
  assert.equal(health.status, 200);
  const healthPayload = await health.json();
  assert.equal(healthPayload.service, "archaios-core-api");
  assert.equal(healthPayload.mode, "agent_runtime_degraded");
  assert.equal(healthPayload.runtime.humanApprovalGate, "required_for_mutations");
  assert.equal(healthPayload.runtime.agentHealthMonitor, "ready");

  const status = await worker.fetch(new Request("https://worker.example/api/agents/status"), {}, {});
  assert.equal(status.status, 200);
  const statusPayload = await status.json();
  assert.equal(statusPayload.ok, true);
  assert.equal(statusPayload.mode, "agent_runtime_degraded");
  assert.ok(Array.isArray(statusPayload.agents));
  assert.ok(statusPayload.agents.length > 0);
  assert.equal(statusPayload.agents[0].status, "ready_degraded");
});

test("frontend build contains iPhone PWA install metadata", async () => {
  const index = await readFile(path.join(repoRoot, "client", "index.html"), "utf8");
  const manifest = await readFile(path.join(repoRoot, "client", "public", "manifest.json"), "utf8");
  const serviceWorker = await readFile(path.join(repoRoot, "client", "public", "service-worker.js"), "utf8");
  const main = await readFile(path.join(repoRoot, "client", "src", "main.jsx"), "utf8");
  const app = await readFile(path.join(repoRoot, "client", "src", "App.jsx"), "utf8");

  assert.match(index, /apple-mobile-web-app-capable/);
  assert.match(index, /apple-touch-icon/);
  assert.match(index, /viewport-fit=cover/);
  assert.equal(JSON.parse(manifest).display, "standalone");
  assert.match(serviceWorker, /2026-07-19-operation-black-vault/);
  assert.match(serviceWorker, /ARCHAIOS_SKIP_WAITING/);
  assert.match(serviceWorker, /url\.pathname\.startsWith\("\/api\/"\)/);
  assert.match(serviceWorker, /AUTH_QUERY_KEYS/);
  assert.match(main, /serviceWorker/);
  assert.match(main, /archaios-update-ready/);
  assert.match(app, /APP_BUILD_ID/);
});

test("Worker serves read-only SITREP routes without claiming live intelligence", async () => {
  const latest = await worker.fetch(new Request("https://worker.example/api/sitrep/latest"), {}, {});
  assert.equal(latest.status, 200);
  const latestPayload = await latest.json();
  assert.equal(latestPayload.ok, true);
  assert.equal(latestPayload.live, false);
  assert.equal(latestPayload.data_status, "sample_not_current");
  assert.ok(Array.isArray(latestPayload.events));

  const map = await worker.fetch(new Request("https://worker.example/api/sitrep/map"), {}, {});
  assert.equal(map.status, 200);
  assert.ok(Array.isArray((await map.json()).markers));
});

test("Worker returns controlled degraded and 404 JSON responses", async () => {
  const subscription = await worker.fetch(new Request("https://worker.example/api/subscription"), {}, {});
  assert.equal(subscription.status, 503);
  const subscriptionPayload = await subscription.json();
  assert.equal(subscriptionPayload.status, "temporarily_unavailable");
  assert.equal(subscriptionPayload.service, "supabase");

  const missing = await worker.fetch(new Request("https://worker.example/api/not-real"), {}, {});
  assert.equal(missing.status, 404);
  assert.equal((await missing.json()).error.code, "not_found");
});
