import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  FRONTEND_CANONICAL_API_ROUTES,
  WORKER_CANONICAL_API_ROUTES,
  routeKey
} from "../shared/runtime-routes.js";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const clientSrc = path.join(repoRoot, "client", "src");

const textExtensions = new Set([".js", ".jsx", ".ts", ".tsx", ".mjs", ".cjs"]);
const privateVitePrefixes = [
  "VITE_SUPABASE_SERVICE_ROLE_KEY",
  "VITE_STRIPE_SECRET_KEY",
  "VITE_STRIPE_WEBHOOK_SECRET",
  "VITE_OPENAI_API_KEY",
  "VITE_OPENAI_KEY"
];
const obviousSecretPatterns = [
  { name: "openai_api_key", pattern: /\bsk-[A-Za-z0-9_-]{20,}\b/ },
  { name: "stripe_secret_key", pattern: /\bsk_(?:live|test)_[A-Za-z0-9]{20,}\b/ },
  { name: "stripe_webhook_secret", pattern: /\bwhsec_[A-Za-z0-9]{20,}\b/ },
  { name: "supabase_jwt", pattern: /\beyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\b/ }
];

function fail(message) {
  console.error(message);
  process.exitCode = 1;
}

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (["node_modules", "dist", ".vite"].includes(entry.name)) {
        continue;
      }
      files.push(...(await walk(fullPath)));
    } else if (textExtensions.has(path.extname(entry.name))) {
      files.push(fullPath);
    }
  }

  return files;
}

function relative(file) {
  return path.relative(repoRoot, file);
}

const workerRoutes = new Set(WORKER_CANONICAL_API_ROUTES.map(routeKey));
for (const route of FRONTEND_CANONICAL_API_ROUTES) {
  const key = routeKey(route);
  if (!workerRoutes.has(key)) {
    fail(`Missing canonical Worker handler for frontend route: ${key}`);
  }
}

const clientFiles = await walk(clientSrc);
for (const file of clientFiles) {
  const source = await readFile(file, "utf8");
  if (/(http:\/\/localhost|http:\/\/127\.0\.0\.1)/.test(source)) {
    fail(`Production frontend source contains a localhost URL: ${relative(file)}`);
  }
  for (const name of privateVitePrefixes) {
    if (source.includes(name)) {
      fail(`Private server credential is referenced with a VITE_ browser prefix: ${relative(file)} ${name}`);
    }
  }
}

const scanTargets = [
  ...clientFiles,
  path.join(repoRoot, "worker.js"),
  path.join(repoRoot, "wrangler.toml"),
  path.join(repoRoot, "package.json"),
  path.join(repoRoot, "client", "package.json")
];

for (const file of scanTargets) {
  const source = await readFile(file, "utf8").catch(() => "");
  for (const { name, pattern } of obviousSecretPatterns) {
    if (pattern.test(source)) {
      fail(`Possible committed secret detected: ${relative(file)} ${name}`);
    }
  }
}

if (process.exitCode) {
  process.exit();
}

console.log("Runtime contract validated.");
