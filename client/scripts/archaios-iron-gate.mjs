#!/usr/bin/env node
import path from "node:path";
import { fileURLToPath } from "node:url";
import { writeIronGateReadiness } from "../archaios-core/readiness/iron-gate.mjs";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, "..", "..");
const args = new Set(process.argv.slice(2));

const { interfacePath, markdownPath, report } = await writeIronGateReadiness(repoRoot, {
  runTests: args.has("--run-tests"),
  runBuild: args.has("--run-build"),
  runSecurityAudit: args.has("--run-security-audit")
});

console.log(JSON.stringify({
  ok: true,
  interfacePath,
  markdownPath,
  generatedAt: report.generatedAt,
  score: report.summary.score,
  status: report.summary.status,
  blockers: report.summary.blockers,
  warnings: report.summary.warnings
}));
