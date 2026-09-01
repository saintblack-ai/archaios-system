import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const appSource = await readFile(new URL("../App.jsx", import.meta.url), "utf8");

test("signed-out upgrade controls remain actionable and route to auth", () => {
  assert.equal(
    appSource.includes("disabled={!session}"),
    false,
    "upgrade controls must remain clickable for signed-out users"
  );

  const checkoutStart = appSource.indexOf("const handleCheckout");
  const checkoutEnd = appSource.indexOf("const handleForgotPassword", checkoutStart);
  const checkoutHandler = appSource.slice(checkoutStart, checkoutEnd);

  assert.match(checkoutHandler, /if \(!session\?\.access_token\)/);
  assert.match(checkoutHandler, /setPendingCheckoutTier\(requestedTier\)/);
  assert.match(checkoutHandler, /setIsUpgradeModalOpen\(false\)/);
  assert.match(checkoutHandler, /auth-choice-grid/);
  assert.match(checkoutHandler, /return;/);
});
