import assert from "node:assert/strict";
import test from "node:test";

import { buildCommanderExecutiveService } from "../client/archaios-core/commander/service.mjs";
import { buildDailyCommandCenter } from "../client/archaios-core/daily/commander.mjs";

test("Commander merges structured agent reports into a daily command center", () => {
  const snapshot = buildDailyCommandCenter(process.cwd(), { generatedAt: "2026-06-28T12:00:00.000Z" });

  assert.equal(snapshot.title, "ARCHAIOS Daily Command Center");
  assert.equal(snapshot.commander.agentKey, "commander");
  assert.equal(snapshot.agentReports.length, 9);
  assert.equal(snapshot.executiveOfficer.role, "AI Executive Officer");
  assert.equal(snapshot.executiveOfficer.monitors.length, 10);
  assert.ok(snapshot.executiveBrief.topPriorities.some((priority) => priority.area === "Revenue"));
  assert.ok(snapshot.executiveBrief.topPriorities.some((priority) => priority.area === "Security"));
  assert.ok(snapshot.commander.morningBriefing.actions.length >= 3);
  assert.ok(snapshot.commander.eveningReview.prompts.length >= 3);

  for (const report of snapshot.agentReports) {
    assert.ok(report.agentKey);
    assert.ok(report.summary);
    assert.ok(Array.isArray(report.findings));
    assert.ok(Array.isArray(report.actions));
    assert.ok(report.metrics && typeof report.metrics === "object");
  }
});

test("Daily command center exposes dashboards, scheduling, and semantic memory contract", () => {
  const snapshot = buildDailyCommandCenter(process.cwd(), { generatedAt: "2026-06-28T12:00:00.000Z" });

  assert.ok(snapshot.dashboards.activeProjects.length > 0);
  assert.ok(snapshot.dashboards.revenueProgress.readinessSystems > 0);
  assert.ok(snapshot.dashboards.books.length > 0);
  assert.ok(snapshot.dashboards.knowledgeGrowth.totals.records >= 0);
  assert.equal(snapshot.dashboards.memoryUsage.semanticMemory.provider, "supabase-pgvector");
  assert.equal(snapshot.dashboards.memoryUsage.semanticMemory.dimensions, 1536);
  assert.ok(snapshot.scheduledTasks.some((task) => task.id === "daily-morning-brief"));
  assert.ok(snapshot.scheduledTasks.some((task) => task.requiresApproval));
});

test("Commander executive officer monitors production command sectors", () => {
  const service = buildCommanderExecutiveService(process.cwd(), { generatedAt: "2026-07-01T12:00:00.000Z" });
  const monitorKeys = service.monitors.map((monitor) => monitor.key);

  assert.equal(service.service, "archaios-commander-executive-officer");
  assert.deepEqual(
    monitorKeys,
    [
      "unfinished-work",
      "revenue",
      "security",
      "deployments",
      "github",
      "supabase",
      "stripe",
      "cloudflare",
      "documentation",
      "tests"
    ]
  );
  assert.ok(service.executiveBrief.actionQueue.length > 0);
  assert.equal(service.executiveBrief.topPriorities[0].area, "Revenue");
  assert.equal(service.executiveBrief.topPriorities[1].area, "Security");
});
