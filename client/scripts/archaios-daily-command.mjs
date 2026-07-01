#!/usr/bin/env node
import path from "node:path";
import { fileURLToPath } from "node:url";
import { writeDailyCommandCenter } from "../archaios-core/daily/commander.mjs";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, "..", "..");
const { outputPath, snapshot } = writeDailyCommandCenter(repoRoot);

console.log(JSON.stringify({
  ok: true,
  outputPath,
  generatedAt: snapshot.generatedAt,
  agentReports: snapshot.agentReports.length,
  commanderStatus: snapshot.commander.status
}));
