const DEFAULT_LOG_FILE_PATH = "./logs/webhook-debug.log";

function isNodeRuntime() {
  return typeof process !== "undefined" && Boolean(process.versions?.node);
}

function toLogLine(entry) {
  return `${JSON.stringify(entry)}\n`;
}

async function appendFileLog(line, logFilePath) {
  if (!isNodeRuntime()) return;

  try {
    const { appendFile, mkdir } = await import("node:fs/promises");
    const { dirname } = await import("node:path");
    const targetPath = logFilePath || DEFAULT_LOG_FILE_PATH;
    await mkdir(dirname(targetPath), { recursive: true });
    await appendFile(targetPath, line, "utf8");
  } catch {
    // Intentionally ignore file log failures to avoid impacting request flow.
  }
}

export function createLogger(options = {}) {
  const { service = "github-webhook", logFilePath } = options;

  async function emit(level, message, context = {}) {
    const entry = {
      timestamp: new Date().toISOString(),
      level,
      service,
      message,
      ...context
    };
    const line = toLogLine(entry);

    if (level === "error") {
      console.error(line.trim());
    } else if (level === "warn") {
      console.warn(line.trim());
    } else {
      console.log(line.trim());
    }

    await appendFileLog(line, logFilePath);
  }

  return {
    debug(message, context) {
      return emit("debug", message, context);
    },
    info(message, context) {
      return emit("info", message, context);
    },
    warn(message, context) {
      return emit("warn", message, context);
    },
    error(message, context) {
      return emit("error", message, context);
    }
  };
}
