import assert from "node:assert/strict";
import test from "node:test";

import {
  buildOperatingSnapshot,
  loadAgentNetwork,
  REQUIRED_KNOWLEDGE_PATHS,
  validateAgentNetwork
} from "../client/archaios-core/runtime/runtime-health.mjs";

test("ARCHAIOS agent network defines all required OMEGA agents with runtime contracts", () => {
  const manifest = loadAgentNetwork();
  const validation = validateAgentNetwork(manifest);

  assert.equal(validation.ok, true);
  assert.equal(validation.totalAgents, 10);
  assert.deepEqual(validation.missing, []);
  assert.deepEqual(validation.duplicates, []);
  assert.deepEqual(validation.incomplete, []);

  for (const agent of manifest.agents) {
    assert.ok(agent.role);
    assert.ok(agent.permissions.read.length > 0);
    assert.ok(agent.permissions.write.length > 0);
    assert.ok(agent.permissions.blocked.length > 0);
    assert.ok(agent.evaluationMetrics.length > 0);
  }
});

test("ARCHAIOS operating snapshot reports knowledge, queue, and security posture", () => {
  const snapshot = buildOperatingSnapshot();

  assert.equal(snapshot.system, "ARCHAIOS OMEGA");
  assert.equal(snapshot.agentNetwork.ok, true);
  assert.equal(snapshot.knowledge.required, REQUIRED_KNOWLEDGE_PATHS.length);
  assert.equal(snapshot.taskQueues.queue >= 0, true);
  assert.equal(snapshot.security.controls > 0, true);
  assert.ok(Array.isArray(snapshot.nextActions));
});
