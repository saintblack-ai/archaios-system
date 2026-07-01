import assert from "node:assert/strict";
import test from "node:test";

import worker from "../worker.js";
import { buildArchivistSearchPath, normalizeArchivistItemInput } from "../shared/archivist.js";

const USER_ID = "00000000-0000-4000-8000-000000000001";
const ITEM_ID = "00000000-0000-4000-8000-000000000002";

function createEnv() {
  return {
    SUPABASE_URL: "https://supabase.example",
    SUPABASE_ANON_KEY: "anon-key",
    SUPABASE_SERVICE_ROLE_KEY: "service-key",
    OPENAI_API_KEY: "openai-key",
    OPENAI_MODEL: "gpt-4o-mini"
  };
}

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
}

test("ARCHIVIST normalizes research input and search filters", () => {
  const item = normalizeArchivistItemInput({
    title: "  QX Materials Research  ",
    body: "Notes about material sourcing.",
    tags: ["QX Technology", "materials", "QX Technology"]
  });

  assert.deepEqual(item.tags, ["qx-technology", "materials"]);
  const path = buildArchivistSearchPath(USER_ID, new URLSearchParams({ q: "material sourcing", tag: "QX Technology" }));
  assert.match(path, /owner_id=eq/);
  assert.match(path, /tags=cs/);
  assert.match(path, /title.ilike/);
});

test("ARCHIVIST stores tagged research and searches only the authenticated owner's archive", async (t) => {
  const originalFetch = globalThis.fetch;
  const calls = [];
  t.after(() => {
    globalThis.fetch = originalFetch;
  });
  globalThis.fetch = async (url, options = {}) => {
    const target = String(url);
    calls.push({ target, options });
    if (target.endsWith("/auth/v1/user")) {
      return jsonResponse({ id: USER_ID, email: "operator@example.com" });
    }
    if (target.includes("/rest/v1/archivist_items") && options.method === "POST") {
      return jsonResponse([{ id: ITEM_ID, ...JSON.parse(options.body) }], 201);
    }
    if (target.includes("/rest/v1/archivist_items") && (!options.method || options.method === "GET")) {
      return jsonResponse([{ id: ITEM_ID, title: "QX Materials Research", owner_id: USER_ID, tags: ["qx-technology"] }]);
    }
    throw new Error(`Unexpected request: ${target}`);
  };

  const headers = { Authorization: "Bearer user-token", "Content-Type": "application/json" };
  const saveResponse = await worker.fetch(
    new Request("https://worker.example/api/archivist/items", {
      method: "POST",
      headers,
      body: JSON.stringify({ title: "QX Materials Research", body: "Research notes", tags: ["QX Technology"] })
    }),
    createEnv(),
    {}
  );
  assert.equal(saveResponse.status, 201);
  assert.deepEqual((await saveResponse.json()).item.tags, ["qx-technology"]);

  const searchResponse = await worker.fetch(
    new Request("https://worker.example/api/archivist/items?q=materials&tag=QX%20Technology", { headers }),
    createEnv(),
    {}
  );
  assert.equal(searchResponse.status, 200);
  assert.equal((await searchResponse.json()).items[0].owner_id, USER_ID);
  assert.ok(calls.some((call) => call.target.includes("owner_id=eq.00000000-0000-4000-8000-000000000001")));
});

test("ARCHIVIST creates and persists an AI summary for an owned research item", async (t) => {
  const originalFetch = globalThis.fetch;
  const writes = [];
  t.after(() => {
    globalThis.fetch = originalFetch;
  });
  globalThis.fetch = async (url, options = {}) => {
    const target = String(url);
    if (target.endsWith("/auth/v1/user")) {
      return jsonResponse({ id: USER_ID, email: "operator@example.com" });
    }
    if (target.includes("/rest/v1/archivist_items") && (!options.method || options.method === "GET")) {
      return jsonResponse([{ id: ITEM_ID, title: "QX Materials Research", body: "Research notes", category: "QX Technology", tags: ["materials"] }]);
    }
    if (target === "https://api.openai.com/v1/chat/completions") {
      return jsonResponse({ choices: [{ message: { content: "The research records material sourcing constraints and open validation questions." } }] });
    }
    if (target.includes("/rest/v1/archivist_items") && options.method === "PATCH") {
      writes.push(JSON.parse(options.body));
      return jsonResponse([{ id: ITEM_ID, summary: JSON.parse(options.body).summary }]);
    }
    if (target.includes("/rest/v1/archivist_summaries") && options.method === "POST") {
      writes.push(JSON.parse(options.body));
      return jsonResponse([{ id: "00000000-0000-4000-8000-000000000003" }], 201);
    }
    throw new Error(`Unexpected request: ${target}`);
  };

  const response = await worker.fetch(
    new Request(`https://worker.example/api/archivist/items/${ITEM_ID}/summarize`, {
      method: "POST",
      headers: { Authorization: "Bearer user-token" }
    }),
    createEnv(),
    {}
  );

  assert.equal(response.status, 200);
  assert.match((await response.json()).summary, /material sourcing/i);
  assert.equal(writes.length, 2);
  assert.equal(writes[1].owner_id, USER_ID);
});
