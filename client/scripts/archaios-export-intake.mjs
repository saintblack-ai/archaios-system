import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const ROOT = process.cwd();
const INFRA_ROOT = path.join(ROOT, "ARCHAIOS_INFRASTRUCTURE");
const DEFAULT_SOURCE = path.join(INFRA_ROOT, "inbox");
const MANIFEST_DIR = path.join(INFRA_ROOT, "manifests");
const REPORT_DIR = path.join(INFRA_ROOT, "reports");
const sourceArg = process.argv[2] ? path.resolve(process.argv[2]) : DEFAULT_SOURCE;

const CATEGORY_RULES = [
  {
    id: "prompts",
    label: "Prompts",
    keywords: ["prompt", "system message", "agent", "role", "instructions", "workflow", "task"]
  },
  {
    id: "product-ideas",
    label: "Product ideas",
    keywords: ["vision", "mission", "product", "platform", "feature", "roadmap", "go live", "launch", "app idea", "saas", "user journey"]
  },
  {
    id: "business-model",
    label: "Business model",
    keywords: ["pricing", "stripe", "subscription", "revenue", "$49", "$99", "pro", "elite", "checkout", "billing", "sales", "conversion", "offer", "funnel"]
  },
  {
    id: "spiritual-research",
    label: "Spiritual research",
    keywords: ["scripture", "doctrine", "sermon", "mazzaroth", "spiritual", "bible", "prophecy", "eden", "holy", "kingdom"]
  },
  {
    id: "books",
    label: "Books",
    keywords: ["book", "chapter", "manuscript", "outline", "apple books", "author", "publishing", "the art of holy war", "echoes of eden", "pleiadian project"]
  },
  {
    id: "music",
    label: "Music",
    keywords: ["music", "album", "song", "lyrics", "track", "release", "promo", "artist", "saint black"]
  },
  {
    id: "game-os-systems",
    label: "Game / OS systems",
    keywords: ["game", "simulation", "operating system", "os", "archaios os", "dashboard", "control plane", "mission system", "quest"]
  },
  {
    id: "crypto-systems",
    label: "Crypto systems",
    keywords: ["crypto", "token", "wallet", "blockchain", "coin", "smart contract", "defi", "web3"]
  },
  {
    id: "raw-conversations",
    label: "Raw conversations",
    keywords: ["conversation", "chatgpt", "mapping", "message", "author", "create_time", "update_time"]
  },
  {
    id: "app-features",
    label: "Docs to convert into app features",
    keywords: ["implement", "api", "route", "component", "database", "schema", "supabase", "cloudflare", "vercel", "worker", "backend", "frontend", "deploy"]
  },
  {
    id: "brand-assets",
    label: "Brand assets",
    keywords: ["brand", "copy", "tagline", "logo", "visual", "voice", "tone", "campaign", "identity", "aesthetic"]
  }
];

const TEXT_EXTENSIONS = new Set([
  ".txt",
  ".md",
  ".markdown",
  ".json",
  ".html",
  ".htm",
  ".csv",
  ".js",
  ".jsx",
  ".ts",
  ".tsx",
  ".py",
  ".sql",
  ".yml",
  ".yaml",
  ".toml"
]);

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function listFiles(dir, files = []) {
  if (!fs.existsSync(dir)) return files;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.name === ".DS_Store" || entry.name === ".gitkeep") continue;
    if (entry.isDirectory()) {
      listFiles(fullPath, files);
    } else if (entry.isFile()) {
      files.push(fullPath);
    }
  }
  return files;
}

function safeReadSample(filePath, maxBytes = 120_000) {
  const ext = path.extname(filePath).toLowerCase();
  if (!TEXT_EXTENSIONS.has(ext)) return "";
  const fd = fs.openSync(filePath, "r");
  try {
    const buffer = Buffer.alloc(maxBytes);
    const bytesRead = fs.readSync(fd, buffer, 0, maxBytes, 0);
    return buffer.subarray(0, bytesRead).toString("utf8");
  } catch {
    return "";
  } finally {
    fs.closeSync(fd);
  }
}

function hashFile(filePath) {
  const hash = crypto.createHash("sha256");
  const data = fs.readFileSync(filePath);
  hash.update(data);
  return hash.digest("hex");
}

function classifyText(name, text) {
  const haystack = `${name}\n${text}`.toLowerCase();
  const scores = CATEGORY_RULES.map((rule) => {
    const matches = rule.keywords.filter((keyword) => haystack.includes(keyword.toLowerCase()));
    return {
      id: rule.id,
      label: rule.label,
      score: matches.length,
      matches
    };
  }).filter((item) => item.score > 0);

  scores.sort((a, b) => b.score - a.score || a.label.localeCompare(b.label));

  if (!scores.length) {
    return {
      primary: "unknown-review",
      primaryLabel: "Unknown / review",
      scores: []
    };
  }

  return {
    primary: scores[0].id,
    primaryLabel: scores[0].label,
    scores
  };
}

function summarizeConversationsJson(filePath) {
  try {
    const raw = fs.readFileSync(filePath, "utf8");
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return null;

    const conversations = parsed.map((conversation) => {
      const title = String(conversation.title || "Untitled conversation");
      const messages = Object.values(conversation.mapping || {})
        .map((node) => node?.message?.content?.parts)
        .filter(Array.isArray)
        .flat()
        .filter((part) => typeof part === "string");
      const joined = messages.join("\n").slice(0, 80_000);
      const classification = classifyText(title, joined);
      return {
        title,
        messageCount: messages.length,
        category: classification.primary,
        categoryLabel: classification.primaryLabel,
        matchedTerms: classification.scores.slice(0, 3).flatMap((score) => score.matches).slice(0, 12)
      };
    });

    return {
      count: conversations.length,
      conversations
    };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

function markdownTable(rows) {
  if (!rows.length) return "_No rows._";
  const headers = Object.keys(rows[0]);
  const escape = (value) => String(value ?? "").replace(/\|/g, "\\|").replace(/\n/g, " ");
  return [
    `| ${headers.join(" | ")} |`,
    `| ${headers.map(() => "---").join(" | ")} |`,
    ...rows.map((row) => `| ${headers.map((header) => escape(row[header])).join(" | ")} |`)
  ].join("\n");
}

function main() {
  ensureDir(INFRA_ROOT);
  ensureDir(MANIFEST_DIR);
  ensureDir(REPORT_DIR);

  const sourceExists = fs.existsSync(sourceArg);
  const sourceStats = sourceExists ? fs.statSync(sourceArg) : null;

  const manifest = {
    generatedAt: new Date().toISOString(),
    source: sourceArg,
    sourceExists,
    sourceType: sourceStats?.isDirectory() ? "directory" : sourceStats?.isFile() ? "file" : "missing",
    safety: {
      readOnlySource: true,
      movedFiles: false,
      deletedFiles: false,
      externalCalls: false
    },
    files: [],
    conversations: null,
    categories: {}
  };

  for (const rule of CATEGORY_RULES) {
    manifest.categories[rule.id] = { label: rule.label, count: 0 };
  }
  manifest.categories["unknown-review"] = { label: "Unknown / review", count: 0 };

  if (!sourceExists) {
    writeOutputs(manifest, [
      "Source folder does not exist yet.",
      "Place the extracted OpenAI export into `ARCHAIOS_INFRASTRUCTURE/inbox/`, then run `npm run archaios:intake`."
    ]);
    return;
  }

  if (sourceStats.isFile()) {
    const ext = path.extname(sourceArg).toLowerCase();
    manifest.files.push(fileRecord(sourceArg, sourceArg));
    const warnings = ext === ".zip"
      ? ["Zip archive detected. Extract it into `ARCHAIOS_INFRASTRUCTURE/inbox/` before running the full intake."]
      : ["Single file detected. For best results, pass the extracted export folder."];
    writeOutputs(manifest, warnings);
    return;
  }

  const files = listFiles(sourceArg);
  for (const filePath of files) {
    const record = fileRecord(filePath, sourceArg);
    manifest.files.push(record);
    manifest.categories[record.category].count += 1;

    if (path.basename(filePath).toLowerCase() === "conversations.json") {
      manifest.conversations = summarizeConversationsJson(filePath);
      if (manifest.conversations?.conversations) {
        for (const conversation of manifest.conversations.conversations) {
          if (!manifest.categories[conversation.category]) {
            manifest.categories[conversation.category] = { label: conversation.categoryLabel, count: 0 };
          }
        }
      }
    }
  }

  writeOutputs(manifest, []);
}

function fileRecord(filePath, basePath) {
  const relativePath = path.relative(basePath, filePath) || path.basename(filePath);
  const stats = fs.statSync(filePath);
  const sample = safeReadSample(filePath);
  const classification = classifyText(relativePath, sample);
  return {
    path: relativePath,
    absolutePath: filePath,
    extension: path.extname(filePath).toLowerCase() || "(none)",
    sizeBytes: stats.size,
    sha256: hashFile(filePath),
    readableTextSample: Boolean(sample),
    category: classification.primary,
    categoryLabel: classification.primaryLabel,
    matchedTerms: classification.scores.slice(0, 3).flatMap((score) => score.matches).slice(0, 12)
  };
}

function writeOutputs(manifest, warnings) {
  const manifestPath = path.join(MANIFEST_DIR, "export-inventory.json");
  const reportPath = path.join(REPORT_DIR, "EXPORT_INTAKE_REPORT.md");
  const summaryPath = path.join(REPORT_DIR, "EXPORT_CLASSIFICATION_SUMMARY.md");
  const queuePath = path.join(REPORT_DIR, "EXPORT_CONSOLIDATION_QUEUE.md");

  fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
  fs.writeFileSync(reportPath, buildReport(manifest, warnings));
  fs.writeFileSync(summaryPath, buildClassificationSummary(manifest));
  fs.writeFileSync(queuePath, buildConsolidationQueue(manifest));

  console.log("ARCHAIOS export intake complete.");
  console.log(`Source: ${manifest.source}`);
  console.log(`Files indexed: ${manifest.files.length}`);
  if (manifest.conversations?.count != null) {
    console.log(`Conversations found: ${manifest.conversations.count}`);
  }
  if (warnings.length) {
    console.log("Warnings:");
    for (const warning of warnings) console.log(`- ${warning}`);
  }
  console.log(`Manifest: ${path.relative(ROOT, manifestPath)}`);
  console.log(`Report: ${path.relative(ROOT, reportPath)}`);
  console.log(`Summary: ${path.relative(ROOT, summaryPath)}`);
  console.log(`Queue: ${path.relative(ROOT, queuePath)}`);
}

function buildReport(manifest, warnings) {
  const categoryRows = Object.entries(manifest.categories).map(([id, value]) => ({
    Category: value.label,
    ID: id,
    Count: value.count
  }));

  const largestFiles = [...manifest.files]
    .sort((a, b) => b.sizeBytes - a.sizeBytes)
    .slice(0, 20)
    .map((file) => ({
      File: file.path,
      Category: file.categoryLabel,
      Bytes: file.sizeBytes,
      Text: file.readableTextSample ? "yes" : "no"
    }));

  const lines = [
    "# ARCHAIOS Export Intake Report",
    "",
    `Generated: ${manifest.generatedAt}`,
    "",
    "## Source",
    "",
    `- Path: \`${manifest.source}\``,
    `- Exists: ${manifest.sourceExists ? "yes" : "no"}`,
    `- Type: ${manifest.sourceType}`,
    "",
    "## Safety",
    "",
    "- Source files moved: no",
    "- Source files deleted: no",
    "- Source files overwritten: no",
    "- External API calls: no",
    "",
    "## Warnings",
    "",
    warnings.length ? warnings.map((warning) => `- ${warning}`).join("\n") : "- None",
    "",
    "## Inventory",
    "",
    `- Files indexed: ${manifest.files.length}`,
    `- Conversations found: ${manifest.conversations?.count ?? "not detected"}`,
    "",
    "## Category Counts",
    "",
    markdownTable(categoryRows),
    "",
    "## Largest Files",
    "",
    markdownTable(largestFiles),
    "",
    "## Next Actions",
    "",
    "- If a zip was detected, extract it into `ARCHAIOS_INFRASTRUCTURE/inbox/` and rerun the scanner.",
    "- Review `EXPORT_CLASSIFICATION_SUMMARY.md` before any consolidation.",
    "- Convert confirmed product requirements into `docs/PRODUCT_REQUIREMENTS_FROM_EXPORT.md`.",
    "- Convert confirmed architecture notes into `docs/ARCHAIOS_LEGACY_ARCHITECTURE_FROM_EXPORT.md`.",
    "- Keep all source export files untouched until a reviewed copy plan is approved.",
    ""
  ];

  return `${lines.join("\n")}\n`;
}

function buildClassificationSummary(manifest) {
  const rows = manifest.files.map((file) => ({
    Category: file.categoryLabel,
    File: file.path,
    Bytes: file.sizeBytes,
    Matches: file.matchedTerms.join(", ")
  }));

  const conversationRows = manifest.conversations?.conversations
    ? manifest.conversations.conversations.slice(0, 100).map((conversation) => ({
        Category: conversation.categoryLabel,
        Title: conversation.title,
        Messages: conversation.messageCount,
        Matches: conversation.matchedTerms.join(", ")
      }))
    : [];

  const lines = [
    "# ARCHAIOS Export Classification Summary",
    "",
    `Generated: ${manifest.generatedAt}`,
    "",
    "## File Classifications",
    "",
    markdownTable(rows.slice(0, 200)),
    "",
    rows.length > 200 ? `_${rows.length - 200} additional files omitted from markdown summary. See manifest JSON._` : "",
    "",
    "## Conversation Classifications",
    "",
    manifest.conversations?.error ? `Conversation parse error: ${manifest.conversations.error}` : markdownTable(conversationRows),
    "",
    conversationRows.length === 100 ? "_Additional conversations omitted from markdown summary. See manifest JSON._" : "",
    ""
  ];

  return `${lines.join("\n")}\n`;
}

function buildConsolidationQueue(manifest) {
  const categoryActions = [
    {
      category: "prompts",
      output: "docs/PROMPT_REGISTRY_FROM_EXPORT.md",
      action: "Extract reusable system prompts, agent roles, workflows, and safety boundaries."
    },
    {
      category: "product-ideas",
      output: "docs/PRODUCT_REQUIREMENTS_FROM_EXPORT.md",
      action: "Convert product ideas into scoped requirements and backlog candidates."
    },
    {
      category: "business-model",
      output: "docs/REVENUE_NOTES_FROM_EXPORT.md",
      action: "Extract pricing, funnel, offer, Stripe, and conversion ideas."
    },
    {
      category: "app-features",
      output: "docs/APP_FEATURE_BACKLOG_FROM_EXPORT.md",
      action: "Convert implementation instructions into route, API, component, and schema tasks."
    },
    {
      category: "spiritual-research",
      output: "docs/SPIRITUAL_RESEARCH_INDEX_FROM_EXPORT.md",
      action: "Index doctrine, sermons, Mazzaroth, scripture, and spiritual research."
    },
    {
      category: "books",
      output: "docs/BOOK_PROJECTS_FROM_EXPORT.md",
      action: "Extract manuscripts, outlines, publishing plans, and book campaign material."
    },
    {
      category: "music",
      output: "docs/MUSIC_PROJECTS_FROM_EXPORT.md",
      action: "Extract lyrics, album ideas, release plans, and promo material."
    },
    {
      category: "game-os-systems",
      output: "docs/ARCHAIOS_OS_SYSTEMS_FROM_EXPORT.md",
      action: "Extract OS, game, simulation, and command-system concepts."
    },
    {
      category: "crypto-systems",
      output: "docs/CRYPTO_SYSTEMS_HOLD_QUEUE_FROM_EXPORT.md",
      action: "Place crypto/token ideas into a hold queue pending explicit approval."
    }
  ];

  const rows = categoryActions.map((item) => {
    const category = manifest.categories[item.category] || { count: 0 };
    return {
      Category: item.category,
      Count: category.count,
      Output: item.output,
      Action: item.action,
      Status: category.count > 0 ? "ready-after-review" : "waiting-for-export"
    };
  });

  return `${[
    "# ARCHAIOS Export Consolidation Queue",
    "",
    `Generated: ${manifest.generatedAt}`,
    "",
    "## Purpose",
    "",
    "This queue defines the exact docs to create after the export inventory is reviewed. It is generated automatically by the intake scanner.",
    "",
    "## Queue",
    "",
    markdownTable(rows),
    "",
    "## Rules",
    "",
    "- Do not publish raw export content.",
    "- Do not move source files during consolidation.",
    "- Keep private, sensitive, or uncertain content in hold queues.",
    "- Convert only reviewed material into product docs or implementation tasks.",
    ""
  ].join("\n")}\n`;
}

main();
