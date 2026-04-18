#!/usr/bin/env node
/**
 * Content Agent
 * Mission: Generate structured content packs for social, product pages, and campaign operations.
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const LOG_DIR = path.join(ROOT, "logs");
const TASK_DIR = path.join(ROOT, "tasks");
const OUT_DIR = path.join(ROOT, "projects", "content-agent");
const now = new Date().toISOString();

fs.mkdirSync(LOG_DIR, { recursive: true });
fs.mkdirSync(TASK_DIR, { recursive: true });
fs.mkdirSync(OUT_DIR, { recursive: true });

const task = process.argv.slice(2).join(" ").trim() || "default-cycle";
const logLine = `[${now}] Content Agent task=${task}\n`;

fs.appendFileSync(path.join(LOG_DIR, "content-agent.log"), logLine);
fs.writeFileSync(path.join(OUT_DIR, "last-run.json"), JSON.stringify({
  agent: "Content Agent",
  mission: "Generate structured content packs for social, product pages, and campaign operations.",
  task,
  outputs: ["post packs","campaign copy","book/music promo briefs"],
  generatedAt: now
}, null, 2) + "\n");

console.log("Content Agent executed:", task);
