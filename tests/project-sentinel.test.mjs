import assert from "node:assert/strict";
import test from "node:test";

import { buildProjectSentinelDashboard } from "../client/archaios-core/sentinel/service.mjs";

test("Project Sentinel scans required SOC sectors and reports actionable findings only", () => {
  const dashboard = buildProjectSentinelDashboard(process.cwd(), { generatedAt: "2026-07-01T12:00:00.000Z" });
  const sectors = dashboard.sectors.map((sector) => sector.key);

  assert.equal(dashboard.service, "project-sentinel");
  assert.deepEqual(sectors, [
    "github",
    "dependencies",
    "secrets",
    "authentication",
    "cloudflare",
    "supabase",
    "stripe",
    "api-keys",
    "certificates",
    "broken-links",
    "deployments"
  ]);
  assert.equal(dashboard.metrics.sectors, 11);
  assert.equal(dashboard.metrics.actionableFindings, dashboard.findings.length);

  for (const finding of dashboard.findings) {
    assert.ok(finding.id);
    assert.ok(finding.sector);
    assert.ok(finding.severity);
    assert.ok(finding.title);
    assert.ok(finding.evidence);
    assert.ok(finding.action);
    assert.ok(finding.owner);
  }
});
