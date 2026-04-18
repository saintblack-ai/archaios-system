import { spawn } from "node:child_process";

const rootCwd = process.cwd();
const children = [];

function run(name, args) {
  const child = spawn("npm", args, {
    cwd: rootCwd,
    stdio: "inherit",
    shell: true
  });

  child.on("exit", (code) => {
    if (code && code !== 0) {
      process.exitCode = code;
    }
  });

  children.push(child);
}

function shutdown() {
  for (const child of children) {
    if (!child.killed) {
      child.kill("SIGTERM");
    }
  }
}

process.on("SIGINT", () => {
  shutdown();
  process.exit(0);
});

process.on("SIGTERM", () => {
  shutdown();
  process.exit(0);
});

run("server", ["--prefix", "server", "run", "dev"]);
run("client", ["--prefix", "client", "run", "dev"]);
