import assert from "node:assert/strict";
import test from "node:test";

import { deduplicateEvents } from "../server/intelligence/deduplicateEvents.js";
import { getThreatLevel } from "../server/intelligence/eventSchema.js";
import { fetchJsonWithTimeout } from "../server/intelligence/http.js";
import { normalizeEvent } from "../server/intelligence/normalizeEvent.js";
import { validateEvent } from "../server/intelligence/validateEvent.js";

function baseEvent(overrides = {}) {
  return normalizeEvent({
    source_key: "test-source",
    external_id: overrides.external_id || "event-1",
    headline: "Official test source reports a system update",
    summary: "A test summary with source attribution.",
    category: "infrastructure",
    severity: "guarded",
    confidence: 0.82,
    status: "live",
    source_name: "Official Test Source",
    source_url: "https://example.com/status",
    source_type: "official-public",
    published_at: "2026-07-10T12:00:00.000Z",
    latitude: 40,
    longitude: -90,
    tags: ["test"],
    entities: ["Test Source"],
    recommended_actions: ["Review the source record."],
    is_live: true,
    is_verified: true,
    raw_payload: { id: "event-1" },
    ...overrides
  });
}

test("normalizes and validates canonical SITREP events", () => {
  const event = baseEvent();
  assert.equal(event.id, "test-source:event-1");
  assert.equal(event.confidence, 0.82);
  assert.equal(validateEvent(event).ok, true);
});

test("rejects invalid coordinates and invalid confidence", () => {
  const invalid = {
    ...baseEvent(),
    latitude: 200,
    confidence: 2
  };
  const validation = validateEvent(invalid);
  assert.equal(validation.ok, false);
  assert.ok(validation.errors.includes("invalid_latitude"));
  assert.ok(validation.errors.includes("confidence_out_of_range"));
});

test("deduplicates by stable event id", () => {
  const first = baseEvent();
  const second = baseEvent({ headline: "Duplicate title changed" });
  const third = baseEvent({ external_id: "event-2" });
  assert.equal(deduplicateEvents([first, second, third]).length, 2);
});

test("computes highest threat from verified events first", () => {
  const sampleCritical = baseEvent({ external_id: "sample", severity: "critical", is_verified: false, is_live: false, status: "sample" });
  const verifiedElevated = baseEvent({ external_id: "verified", severity: "elevated", is_verified: true });
  assert.equal(getThreatLevel([sampleCritical, verifiedElevated]), "elevated");
});

test("fetch helper reports source failure instead of silently treating it as live", async () => {
  await assert.rejects(
    () =>
      fetchJsonWithTimeout("https://example.com", {
        retries: 0,
        fetchImpl: async () => ({ ok: false, status: 503 })
      }),
    /http_503/
  );
});
