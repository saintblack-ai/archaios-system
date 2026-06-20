import assert from "node:assert/strict";
import test from "node:test";

import worker from "../worker.js";

test("health endpoint identifies the canonical revenue Worker release", async () => {
  const response = await worker.fetch(
    new Request("https://archaios-saas-worker.quandrix357.workers.dev/api/health"),
    { WORKER_RELEASE: "test-release" },
    {}
  );

  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), {
    ok: true,
    service: "archaios-saas-worker",
    release: "test-release"
  });
});

test("canonical migration enforces the subscriptions upsert conflict target", async () => {
  const migration = await import("node:fs/promises").then(({ readFile }) =>
    readFile(new URL("../client/supabase/sql/2026-06-20_subscription_upsert_contract.sql", import.meta.url), "utf8")
  );

  assert.match(migration, /group by user_id/i);
  assert.match(migration, /having count\(\*\) > 1/i);
  assert.match(migration, /create unique index if not exists subscriptions_user_id_uidx/i);
  assert.match(migration, /on public\.subscriptions \(user_id\)/i);
});
