import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LOG_DIR = path.resolve(__dirname, "../../logs");
const LOG_FILE = path.resolve(LOG_DIR, "stripe_events.log");

export async function appendStripeEventLog(payload) {
  const entry = {
    timestamp: new Date().toISOString(),
    ...payload
  };

  await fs.mkdir(LOG_DIR, { recursive: true });
  await fs.appendFile(LOG_FILE, `${JSON.stringify(entry)}\n`, "utf8");
}

