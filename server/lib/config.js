import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isProduction = process.env.NODE_ENV === "production";

[
  path.resolve(__dirname, `../.env.${isProduction ? "production" : "development"}`),
  path.resolve(__dirname, "../.env"),
  path.resolve(__dirname, `../../.env.${isProduction ? "production" : "development"}`),
  path.resolve(__dirname, "../../.env")
].forEach((envPath) => {
  dotenv.config({ path: envPath, override: false });
});

function trimTrailingSlash(value, fallback = "") {
  return String(value || fallback).replace(/\/+$/, "");
}

export const config = {
  port: Number(process.env.PORT || 5000),
  host: process.env.HOST || (isProduction ? "0.0.0.0" : "127.0.0.1"),
  frontendUrl: trimTrailingSlash(process.env.FRONTEND_URL, isProduction ? "" : "http://localhost:5173"),
  openAiApiKey: process.env.OPENAI_API_KEY || "",
  openAiModel: process.env.OPENAI_MODEL || "gpt-4o-mini",
  stripeSecretKey: process.env.STRIPE_SECRET_KEY || "",
  stripePublishableKey: process.env.STRIPE_PUBLISHABLE_KEY || "",
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET || "",
  supabaseUrl: process.env.SUPABASE_URL || "",
  supabaseAnonKey:
    process.env.SUPABASE_ANON_KEY ||
    process.env.SUPABASE_PUBLISHABLE_KEY ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    "",
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || "",
  priceIds: {
    pro: process.env.STRIPE_PRICE_PRO || process.env.STRIPE_PRICE_ID || process.env.PRICE_ID || "",
    elite: process.env.STRIPE_PRICE_ELITE || ""
  }
};

export function getSuccessUrl() {
  return `${config.frontendUrl}?checkout=success`;
}

export function getCancelUrl() {
  return `${config.frontendUrl}?checkout=cancel`;
}
