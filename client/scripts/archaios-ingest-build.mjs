import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const DEFAULT_SOURCE = path.join(ROOT, "raw_exports", "chatgpt_export_2026-04-16");
const SOURCE = process.argv[2] ? path.resolve(process.argv[2]) : DEFAULT_SOURCE;

const CATEGORIES = [
  { id: "ai-infrastructure", label: "AI Infrastructure", keywords: ["architecture", "infrastructure", "cloudflare", "vercel", "supabase", "worker", "deployment", "health endpoint", "route"] },
  { id: "saas-systems", label: "SaaS Systems", keywords: ["saas", "subscription", "pricing", "stripe", "checkout", "pro", "elite", "revenue", "dashboard"] },
  { id: "music-saint-black", label: "Music (Saint Black)", keywords: ["saint black", "music", "album", "song", "lyrics", "track", "release", "promo"] },
  { id: "books-apple-books", label: "Books (Apple Books)", keywords: ["apple books", "book", "manuscript", "chapter", "echoes of eden", "holy war", "pleiadian project"] },
  { id: "game-development", label: "Game Development", keywords: ["game", "engine", "unity", "unreal", "gameplay", "quest", "level design"] },
  { id: "crypto-finance", label: "Crypto / Finance", keywords: ["crypto", "token", "wallet", "blockchain", "finance", "market", "defi"] },
  { id: "spiritual-research", label: "Spiritual / Research", keywords: ["spiritual", "sermon", "doctrine", "scripture", "mazzaroth", "research", "eden", "holy"] },
  { id: "automation-systems", label: "Automation Systems", keywords: ["automation", "agent", "loop", "scheduler", "workflow", "orchestrator", "task queue"] }
];

const AGENT_SPECS = [
  {
    key: "infra-agent",
    name: "Infra Agent",
    mission: "Monitor infrastructure state, route health, and deployment readiness.",
    outputs: ["infrastructure health reports", "route fix task proposals", "runtime status logs"]
  },
  {
    key: "product-agent",
    name: "Product Agent",
    mission: "Improve dashboard UX, feature clarity, and product workflow consistency.",
    outputs: ["feature specs", "ui iteration plans", "implementation task cards"]
  },
  {
    key: "revenue-agent",
    name: "Revenue Agent",
    mission: "Prepare monetization systems for books, music, and SaaS subscriptions without activating billing.",
    outputs: ["pricing experiments", "funnel updates", "Stripe prep checklists"]
  },
  {
    key: "content-agent",
    name: "Content Agent",
    mission: "Generate structured content packs for social, product pages, and campaign operations.",
    outputs: ["post packs", "campaign copy", "book/music promo briefs"]
  },
  {
    key: "research-agent",
    name: "Research Agent",
    mission: "Extract knowledge signals, classify themes, and maintain retrieval-ready research indexes.",
    outputs: ["research digests", "topic clusters", "knowledge gap reports"]
  }
];

const TEXT_EXT = new Set([".json", ".md", ".txt", ".html", ".htm"]);

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function walk(dir, acc = []) {
  if (!fs.existsSync(dir)) return acc;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(p, acc);
    else if (entry.isFile()) acc.push(p);
  }
  return acc;
}

function sampleText(filePath, max = 240_000) {
  const ext = path.extname(filePath).toLowerCase();
  if (!TEXT_EXT.has(ext)) return "";
  try {
    const fd = fs.openSync(filePath, "r");
    const buf = Buffer.alloc(max);
    const bytes = fs.readSync(fd, buf, 0, max, 0);
    fs.closeSync(fd);
    return buf.subarray(0, bytes).toString("utf8");
  } catch {
    return "";
  }
}

function classify(text) {
  const lower = text.toLowerCase();
  let best = { id: "automation-systems", score: 0 };
  for (const category of CATEGORIES) {
    const score = category.keywords.reduce((sum, kw) => sum + (lower.includes(kw) ? 1 : 0), 0);
    if (score > best.score) best = { id: category.id, score };
  }
  return best.id;
}

function parseConversationFile(filePath) {
  const raw = fs.readFileSync(filePath, "utf8");
  const parsed = JSON.parse(raw);
  if (!Array.isArray(parsed)) return [];
  return parsed.map((conv) => {
    const title = String(conv?.title || "Untitled conversation");
    const mapping = conv?.mapping || {};
    const parts = Object.values(mapping)
      .map((node) => node?.message?.content?.parts)
      .filter(Array.isArray)
      .flat()
      .filter((part) => typeof part === "string");
    const text = `${title}\n${parts.join("\n")}`.slice(0, 180_000);
    return {
      type: "conversation",
      title,
      category: classify(text),
      messageCount: parts.length
    };
  });
}

function toMarkdownTable(headers, rows) {
  const lines = [];
  lines.push(`| ${headers.join(" | ")} |`);
  lines.push(`| ${headers.map(() => "---").join(" | ")} |`);
  for (const row of rows) {
    lines.push(`| ${row.map((v) => String(v ?? "").replace(/\|/g, "\\|")).join(" | ")} |`);
  }
  return lines.join("\n");
}

function writeFile(filePath, content) {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, content);
}

function buildAgentFile(spec) {
  return `#!/usr/bin/env node
/**
 * ${spec.name}
 * Mission: ${spec.mission}
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const LOG_DIR = path.join(ROOT, "logs");
const TASK_DIR = path.join(ROOT, "tasks");
const OUT_DIR = path.join(ROOT, "projects", "${spec.key}");
const now = new Date().toISOString();

fs.mkdirSync(LOG_DIR, { recursive: true });
fs.mkdirSync(TASK_DIR, { recursive: true });
fs.mkdirSync(OUT_DIR, { recursive: true });

const task = process.argv.slice(2).join(" ").trim() || "default-cycle";
const logLine = \`[\${now}] ${spec.name} task=\${task}\\n\`;

fs.appendFileSync(path.join(LOG_DIR, "${spec.key}.log"), logLine);
fs.writeFileSync(path.join(OUT_DIR, "last-run.json"), JSON.stringify({
  agent: "${spec.name}",
  mission: "${spec.mission}",
  task,
  outputs: ${JSON.stringify(spec.outputs)},
  generatedAt: now
}, null, 2) + "\\n");

console.log("${spec.name} executed:", task);
`;
}

function main() {
  if (!fs.existsSync(SOURCE)) {
    throw new Error(`Source path not found: ${SOURCE}`);
  }

  const files = walk(SOURCE);
  const textFiles = files.filter((f) => TEXT_EXT.has(path.extname(f).toLowerCase()));
  const conversationFiles = files.filter((f) => /^conversations-\d+\.json$/i.test(path.basename(f)));

  const categorizedFiles = textFiles.map((filePath) => {
    const rel = path.relative(SOURCE, filePath);
    const content = sampleText(filePath);
    const category = classify(`${rel}\n${content}`);
    return { type: "file", path: rel, category };
  });

  const conversations = conversationFiles.flatMap((file) => parseConversationFile(file));
  const allRecords = [...categorizedFiles, ...conversations];

  const categoryMap = Object.fromEntries(CATEGORIES.map((c) => [c.id, { label: c.label, items: [] }]));
  for (const record of allRecords) {
    if (!categoryMap[record.category]) continue;
    categoryMap[record.category].items.push(record);
  }

  const knowledgeDir = path.join(ROOT, "knowledge");
  const projectsDir = path.join(ROOT, "projects");
  const revenueDir = path.join(ROOT, "revenue");
  const archaiosCore = path.join(ROOT, "archaios-core");
  const memoryDir = path.join(ROOT, "memory");

  ensureDir(knowledgeDir);
  ensureDir(projectsDir);
  ensureDir(revenueDir);
  ensureDir(memoryDir);
  ensureDir(path.join(archaiosCore, "agents"));
  ensureDir(path.join(archaiosCore, "memory"));
  ensureDir(path.join(archaiosCore, "logs"));
  ensureDir(path.join(archaiosCore, "tasks"));
  ensureDir(path.join(archaiosCore, "knowledge"));
  ensureDir(path.join(archaiosCore, "projects"));
  ensureDir(path.join(archaiosCore, "revenue"));

  for (const category of CATEGORIES) {
    const data = categoryMap[category.id];
    const fileRows = data.items.filter((x) => x.type === "file").slice(0, 200).map((x) => x.path);
    const convoRows = data.items.filter((x) => x.type === "conversation").slice(0, 80).map((x) => `${x.title} (${x.messageCount} msgs)`);
    const body = [
      `# ${category.label}`,
      "",
      `Generated: ${new Date().toISOString()}`,
      "",
      `Total records: ${data.items.length}`,
      "",
      "## Sample Files",
      "",
      fileRows.length ? fileRows.map((r) => `- \`${r}\``).join("\n") : "- none",
      "",
      "## Sample Conversations",
      "",
      convoRows.length ? convoRows.map((r) => `- ${r}`).join("\n") : "- none",
      ""
    ].join("\n");
    writeFile(path.join(knowledgeDir, `${category.id}.md`), `${body}\n`);
  }

  const summaryRows = CATEGORIES.map((c) => [c.label, c.id, categoryMap[c.id].items.length]);
  writeFile(path.join(knowledgeDir, "knowledge-index.json"), `${JSON.stringify({
    generatedAt: new Date().toISOString(),
    source: SOURCE,
    totals: {
      files: categorizedFiles.length,
      conversations: conversations.length,
      records: allRecords.length
    },
    categories: CATEGORIES.map((c) => ({
      id: c.id,
      label: c.label,
      count: categoryMap[c.id].items.length
    }))
  }, null, 2)}\n`);

  writeFile(path.join(ROOT, "system_map.md"), `# ARCHAIOS System Map

Generated: ${new Date().toISOString()}

## Source Ingestion

- Source folder: \`${SOURCE}\`
- Text files parsed: ${categorizedFiles.length}
- Conversations parsed: ${conversations.length}
- Total records indexed: ${allRecords.length}

## Core Structure

- \`/archaios-core\` execution backbone
- \`/agents\` agent modules and scope docs
- \`/memory\` persistent memory snapshots
- \`/logs\` runtime and loop logs
- \`/tasks\` queued and completed tasks
- \`/knowledge\` categorized export intelligence
- \`/projects\` project execution indexes
- \`/revenue\` monetization design docs

## Domain Coverage

${toMarkdownTable(["Category", "ID", "Records"], summaryRows)}
`);

  const projectIndexBody = `# ARCHAIOS Project Index

Generated: ${new Date().toISOString()}

## Active Domains

${CATEGORIES.map((c) => {
    const count = categoryMap[c.id].items.length;
    const status = count > 120 ? "active" : count > 20 ? "partial" : count > 0 ? "seed" : "waiting";
    return `### ${c.label}\n- Records: ${count}\n- Status: ${status}\n- Primary knowledge file: \`knowledge/${c.id}.md\``;
  }).join("\n\n")}
`;

  writeFile(path.join(projectsDir, "project_index.md"), `${projectIndexBody}\n`);

  const revenueBody = `# ARCHAIOS Revenue Streams

Generated: ${new Date().toISOString()}

## Revenue Paths Discovered

1. SaaS subscriptions (Free / Pro / Elite) with Stripe test readiness.
2. Apple Books sales funnels and launch campaigns.
3. Saint Black music campaigns, release promos, and content bundles.
4. Premium intelligence products and gated dashboard features.
5. Digital products and consulting-style intelligence packs.

## Prep-Only Activation State

- Stripe mapping prepared: yes
- Billing activated: no
- Live payments enabled: no
- DNS changes required: no
`;

  writeFile(path.join(revenueDir, "revenue_streams.md"), `${revenueBody}\n`);

  writeFile(path.join(ROOT, "agent_roles.md"), `# ARCHAIOS Agent Roles

Generated: ${new Date().toISOString()}

${AGENT_SPECS.map((a) => `## ${a.name}

- Mission: ${a.mission}
- Inputs: knowledge indexes, queued tasks, system state
- Outputs: ${a.outputs.join(", ")}
- Safety: no deploy, no DNS changes, no secrets mutation, no live billing activation`).join("\n\n")}
`);

  for (const agent of AGENT_SPECS) {
    writeFile(path.join(ROOT, "agents", "archaios", `${agent.key}.js`), buildAgentFile(agent));
    writeFile(path.join(archaiosCore, "agents", `${agent.key}.js`), buildAgentFile(agent));
  }

  writeFile(path.join(archaiosCore, "README.md"), `# ARCHAIOS Core

Core execution structure for ingestion-mode operations.

- agents/: runnable core agents
- memory/: memory snapshots
- logs/: local core logs
- tasks/: orchestration tasks
- knowledge/: category intelligence
- projects/: project index and status
- revenue/: monetization prep artifacts
`);

  const topCounts = CATEGORIES
    .map((c) => ({ id: c.id, label: c.label, count: categoryMap[c.id].items.length }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  writeFile(path.join(ROOT, "next_actions.md"), `# ARCHAIOS Next Actions

Generated: ${new Date().toISOString()}

## Immediate

1. Review \`knowledge/knowledge-index.json\` and top category markdown files.
2. Run core agents in prep mode from \`agents/archaios/\`.
3. Keep Stripe in test preparation only until explicit activation.
4. Validate dashboard integration hooks for system status, agent activity, and task queue.

## Top Indexed Domains

${topCounts.map((x, i) => `${i + 1}. ${x.label} (${x.count})`).join("\n")}

## Command

\`node scripts/archaios-ingest-build.mjs "${SOURCE}"\`
`);

  console.log("ARCHAIOS ingestion build complete.");
  console.log(`Source: ${SOURCE}`);
  console.log(`Records: ${allRecords.length} (files=${categorizedFiles.length}, conversations=${conversations.length})`);
}

main();
