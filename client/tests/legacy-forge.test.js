import assert from "node:assert/strict";
import test from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { createServer } from "vite";

import {
  DEFAULT_MISSION_SELECTION,
  LEGACY_DIVISIONS,
  SYSTEM_STATUS,
  generateLegacyMission,
  getDivisionById,
  isPresentationMode,
  toggleMissionStep
} from "../src/pages/legacy/legacyForgeModel.js";

test("Legacy Forge page renders the public command, divisions, vault, and founder statement", async (t) => {
  const vite = await createServer({ server: { middlewareMode: true }, appType: "custom", logLevel: "silent" });
  t.after(() => vite.close());
  const { default: LegacyForge } = await vite.ssrLoadModule("/src/pages/legacy/LegacyForge.jsx");
  const markup = renderToStaticMarkup(React.createElement(LegacyForge));

  assert.match(markup, /ARCHAIOS public preview/);
  assert.match(markup, /ARCHAIOS Platform/);
  assert.match(markup, /Saint Black Media/);
  assert.match(markup, /QX Research/);
  assert.match(markup, /Institutional Legacy/);
  assert.match(markup, /The Black Vault/);
  assert.match(markup, /I am not only building projects/);
});

test("the application route renders a nonblank Legacy Forge fallback without a runtime exception", async (t) => {
  const vite = await createServer({ server: { middlewareMode: true }, appType: "custom", logLevel: "silent" });
  const previousWindow = globalThis.window;
  t.after(async () => {
    globalThis.window = previousWindow;
    await vite.close();
  });
  globalThis.window = { location: { pathname: "/legacy-forge", search: "" } };

  const { default: App } = await vite.ssrLoadModule("/src/App.jsx");
  let markup = "";
  assert.doesNotThrow(() => {
    markup = renderToStaticMarkup(React.createElement(App));
  });
  assert.ok(markup.trim().length > 0);
  assert.match(markup, /Loading Legacy Forge|ARCHAIOS public preview/);
});

test("division selection resolves each public-safe division", () => {
  assert.equal(LEGACY_DIVISIONS.length, 4);
  for (const division of LEGACY_DIVISIONS) {
    assert.equal(getDivisionById(division.id).name, division.name);
    assert.ok(division.initiatives.length >= 4);
  }
});

test("mission generator returns one deterministic three-step local mission", () => {
  const mission = generateLegacyMission({
    ...DEFAULT_MISSION_SELECTION,
    divisionId: "research",
    outcome: "Document research"
  });
  assert.equal(mission.steps.length, 3);
  assert.match(mission.title, /QX Research/);
  assert.match(mission.disclosure, /No AI inference or API call/);
  assert.ok(mission.steps.every((step) => step.complete === false));
});

test("mission completion toggles one step without mutating the original mission", () => {
  const mission = generateLegacyMission();
  const updated = toggleMissionStep(mission, mission.steps[1].id);
  assert.equal(mission.steps[1].complete, false);
  assert.equal(updated.steps[1].complete, true);
  assert.equal(updated.steps[0].complete, false);
});

test("presentation mode is enabled only by the explicit query parameter", () => {
  assert.equal(isPresentationMode("?presentation=1"), true);
  assert.equal(isPresentationMode("?presentation=0"), false);
  assert.equal(isPresentationMode(""), false);
});

test("presentation rendering uses the condensed public-safe composition", async (t) => {
  const vite = await createServer({ server: { middlewareMode: true }, appType: "custom", logLevel: "silent" });
  const previousWindow = globalThis.window;
  t.after(async () => {
    globalThis.window = previousWindow;
    await vite.close();
  });
  globalThis.window = { location: { search: "?presentation=1" } };

  const { default: LegacyForge } = await vite.ssrLoadModule("/src/pages/legacy/LegacyForge.jsx");
  const markup = renderToStaticMarkup(React.createElement(LegacyForge));
  assert.match(markup, /legacy-forge-page is-presentation/);
  assert.match(markup, /The Black Vault/);
  assert.doesNotMatch(markup, /Mission Forge/);
});

test("status language distinguishes operational systems from restricted services", () => {
  assert.ok(SYSTEM_STATUS.operational.includes("Local mission generator"));
  assert.ok(SYSTEM_STATUS.restricted.includes("Supabase authenticated access"));
  assert.ok(SYSTEM_STATUS.restricted.includes("Stripe checkout"));
  assert.doesNotMatch(JSON.stringify(SYSTEM_STATUS), /100%|fully live|production ready/i);
});

test("Legacy Forge source has no persistence, API, Supabase, or Stripe dependency", async () => {
  const source = await import("node:fs/promises").then(({ readFile }) => readFile(new URL("../src/pages/legacy/LegacyForge.jsx", import.meta.url), "utf8"));
  assert.doesNotMatch(source, /localStorage|sessionStorage|fetch\(|supabase|stripe|service.role/i);
});

test("Legacy Forge CSS includes mobile and presentation layouts without horizontal overflow", async () => {
  const css = await import("node:fs/promises").then(({ readFile }) => readFile(new URL("../src/pages/legacy/legacyForge.css", import.meta.url), "utf8"));
  assert.match(css, /@media \(max-width: 720px\)/);
  assert.match(css, /\.legacy-forge-page\.is-presentation/);
  assert.match(css, /overflow-x:\s*hidden/);
});
