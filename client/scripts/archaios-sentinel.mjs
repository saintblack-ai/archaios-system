#!/usr/bin/env node
import path from "node:path";
import { fileURLToPath } from "node:url";
import { writeProjectSentinelDashboard } from "../archaios-core/sentinel/service.mjs";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, "..", "..");
const { outputPath, dashboard } = writeProjectSentinelDashboard(repoRoot);

console.log(JSON.stringify({
  ok: true,
  outputPath,
  generatedAt: dashboard.generatedAt,
  status: dashboard.status,
  actionableFindings: dashboard.metrics.actionableFindings
}));
