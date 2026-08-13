import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

const clientRoot = path.dirname(fileURLToPath(import.meta.url));

function getRepositoryNameFromPackageJson() {
  try {
    const packageJsonPath = path.join(clientRoot, "package.json");
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
    const repository = packageJson.repository;

    if (typeof repository === "string") {
      const match = repository.match(/[:/]([^/]+)\/([^/.]+)(?:\.git)?$/);
      return match?.[2] || null;
    }

    if (repository && typeof repository.url === "string") {
      const match = repository.url.match(/[:/]([^/]+)\/([^/.]+)(?:\.git)?$/);
      return match?.[2] || null;
    }
  } catch {
    return null;
  }

  return null;
}

function getPagesBase() {
  if (!process.env.GITHUB_ACTIONS) {
    return "/";
  }

  const repoSlug = process.env.GITHUB_REPOSITORY;
  const owner = process.env.GITHUB_REPOSITORY_OWNER;
  const repoName = repoSlug?.split("/")[1] || getRepositoryNameFromPackageJson();

  if (!repoName) {
    return "/";
  }

  if (owner && repoName.toLowerCase() === `${owner.toLowerCase()}.github.io`) {
    return "/";
  }

  return `/${repoName}/`;
}

export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, clientRoot, "");
  const apiBaseUrl = String(env.VITE_API_BASE_URL || env.VITE_BACKEND_URL || "").trim();

  if (command === "build" && !apiBaseUrl) {
    throw new Error("Missing frontend API configuration. Set VITE_API_BASE_URL (or VITE_BACKEND_URL) before building for production.");
  }

  return {
    base: getPagesBase(),
    plugins: [react()],
    server: {
      fs: {
        allow: [path.resolve(clientRoot, "..")]
      }
    }
  };
});
