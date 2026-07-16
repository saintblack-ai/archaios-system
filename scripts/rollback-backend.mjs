import { spawnSync } from "node:child_process";

const versionId = String(process.argv[2] || "").trim();
if (!versionId) {
  console.error("Usage: npm run rollback:backend -- <previous-version-id>");
  process.exit(2);
}

const result = spawnSync("npx", [
  "wrangler",
  "rollback",
  versionId,
  "--config",
  "wrangler.toml",
  "--name",
  "archaios-saas-worker"
], { stdio: "inherit" });

process.exit(result.status ?? 1);
