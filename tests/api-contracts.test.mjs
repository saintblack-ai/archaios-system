import assert from "node:assert/strict";
import test from "node:test";

import worker from "../worker.js";
import { getApiErrorMessage, normalizeCheckoutTier } from "../shared/api-contracts.js";
import {
  BACKEND_WORKER_NAME,
  BACKEND_WORKER_DEPLOYMENT_NAME,
  DAILY_AUTOMATION_WORKER_NAME,
  PRODUCTION_API_URL
} from "../shared/production-config.js";

test("checkout accepts only paid subscription tiers", () => {
  assert.equal(normalizeCheckoutTier("pro"), "pro");
  assert.equal(normalizeCheckoutTier("elite"), "elite");
  assert.throws(() => normalizeCheckoutTier("free"), /pro or elite/);
});

test("client error parser supports canonical and legacy errors", () => {
  assert.equal(getApiErrorMessage({ error: { code: "x", message: "Canonical" } }), "Canonical");
  assert.equal(getApiErrorMessage({ error: "Legacy" }), "Legacy");
});

test("worker CORS supports authenticated local development methods", async () => {
  const response = await worker.fetch(new Request("http://worker.test/api/health", {
    method: "OPTIONS",
    headers: { Origin: "http://127.0.0.1:5173" }
  }), {}, {});
  assert.equal(response.headers.get("access-control-allow-origin"), "http://127.0.0.1:5173");
  assert.match(response.headers.get("access-control-allow-methods"), /DELETE/);
  assert.match(response.headers.get("access-control-allow-methods"), /PATCH/);
});

test("production services have distinct Cloudflare identities", () => {
  assert.equal(BACKEND_WORKER_NAME, "archaios-core-api");
  assert.equal(BACKEND_WORKER_DEPLOYMENT_NAME, "archaios-saas-worker");
  assert.equal(DAILY_AUTOMATION_WORKER_NAME, "archaios-daily-automation");
  assert.match(PRODUCTION_API_URL, /^https:\/\/archaios-saas-worker\./);
  assert.notEqual(BACKEND_WORKER_DEPLOYMENT_NAME, DAILY_AUTOMATION_WORKER_NAME);
});
