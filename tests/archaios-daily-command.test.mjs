import assert from "node:assert/strict";
import test from "node:test";

import { buildDailyCommandCenter } from "../client/archaios-core/daily/commander.mjs";

test("Commander merges structured agent reports into a daily command center", () => {
  const snapshot = buildDailyCommandCenter(process.cwd(), { generatedAt: "2026-06-28T12:00:00.000Z" });

  assert.equal(snapshot.title, "ARCHAIOS Daily Command Center");
  assert.equal(snapshot.commander.agentKey, "commander");
  assert.equal(snapshot.agentReports.length, 9);
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
