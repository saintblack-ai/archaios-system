import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { supabaseAdmin } from "./supabase.js";

const dataDir = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "data");
const dataFile = path.join(dataDir, "growth-events.json");

function ensureDataFile() {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  if (!fs.existsSync(dataFile)) {
    fs.writeFileSync(
      dataFile,
      JSON.stringify({ leads: [], ctaClicks: [] }, null, 2),
      "utf8"
    );
  }
}

function readLocalData() {
  ensureDataFile();
  return JSON.parse(fs.readFileSync(dataFile, "utf8"));
}

function writeLocalData(payload) {
  ensureDataFile();
  fs.writeFileSync(dataFile, JSON.stringify(payload, null, 2), "utf8");
}

export async function recordLead({ email, source }) {
  if (supabaseAdmin) {
    const { error } = await supabaseAdmin.from("leads").upsert(
      {
        email,
        source,
        captured_at: new Date().toISOString()
      },
      { onConflict: "email" }
    );

    if (!error) {
      return { ok: true, stored: true, source: "supabase" };
    }
  }

  const data = readLocalData();
  const existingIndex = data.leads.findIndex((item) => item.email === email);
  const payload = {
    email,
    source,
    captured_at: new Date().toISOString()
  };

  if (existingIndex >= 0) {
    data.leads[existingIndex] = payload;
  } else {
    data.leads.unshift(payload);
  }

  writeLocalData(data);
  return { ok: true, stored: true, source: "local" };
}

export async function recordCtaClick({ cta, location, tier = "free" }) {
  if (supabaseAdmin) {
    const { error } = await supabaseAdmin.from("cta_events").insert({
      cta,
      location,
      tier,
      created_at: new Date().toISOString()
    });

    if (!error) {
      return { ok: true, stored: true, source: "supabase" };
    }
  }

  const data = readLocalData();
  data.ctaClicks.unshift({
    cta,
    location,
    tier,
    created_at: new Date().toISOString()
  });
  writeLocalData(data);
  return { ok: true, stored: true, source: "local" };
}

export async function getGrowthMetrics() {
  if (supabaseAdmin) {
    const [leadResult, ctaResult] = await Promise.all([
      supabaseAdmin.from("leads").select("*", { count: "exact", head: true }),
      supabaseAdmin.from("cta_events").select("*", { count: "exact", head: true })
    ]);

    if (!leadResult.error && !ctaResult.error) {
      return {
        leads: leadResult.count || 0,
        ctaClicks: ctaResult.count || 0,
        source: "supabase"
      };
    }
  }

  const data = readLocalData();
  return {
    leads: data.leads.length,
    ctaClicks: data.ctaClicks.length,
    source: "local"
  };
}
