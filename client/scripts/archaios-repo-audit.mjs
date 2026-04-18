import fs from "node:fs";
import path from "node:path";

const repos = [
  {
    name: "ai-assassins-client",
    path: process.cwd()
  },
  {
    name: "Ai-Assassins",
    path: "/Users/quandrixblackburn/projects/Ai-Assassins"
  },
  {
    name: "saintblack-ai.github.io",
    path: "/Users/quandrixblackburn/saintblack-ai.github.io"
  },
  {
    name: "Archaios OS",
    path: "/Users/quandrixblackburn/Library/Mobile Documents/com~apple~CloudDocs/QX Technology 2019/Archaios OS"
  }
];

function exists(filePath) {
  return fs.existsSync(filePath);
}

function readJson(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch {
    return null;
  }
}

function summarizeRepo(repo) {
  const packageJson = readJson(path.join(repo.path, "package.json"));
  const workerPackageJson = readJson(path.join(repo.path, "worker", "package.json"));
  const summary = {
    name: repo.name,
    path: repo.path,
    exists: exists(repo.path),
    hasGit: exists(path.join(repo.path, ".git")),
    hasPackageJson: Boolean(packageJson),
    hasWorkerPackageJson: Boolean(workerPackageJson),
    scripts: packageJson?.scripts || {},
    workerScripts: workerPackageJson?.scripts || {},
    importantFiles: [
      "README.md",
      "worker/index.js",
      "worker/src/index.ts",
      "wrangler.jsonc",
      "vercel.json",
      "supabase",
      "docs"
    ].filter((item) => exists(path.join(repo.path, item)))
  };

  return summary;
}

const report = {
  generatedAt: new Date().toISOString(),
  repos: repos.map(summarizeRepo)
};

const outputDir = path.join(process.cwd(), "docs", "operator");
fs.mkdirSync(outputDir, { recursive: true });
const outputPath = path.join(outputDir, "repo-audit.snapshot.json");
fs.writeFileSync(outputPath, `${JSON.stringify(report, null, 2)}\n`);
console.log(`Wrote ${outputPath}`);
