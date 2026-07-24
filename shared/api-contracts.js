export const SUBSCRIPTION_TIERS = Object.freeze(["free", "pro", "elite"]);
export const PAID_TIERS = Object.freeze(["pro", "elite"]);
export const ACTIVE_SUBSCRIPTION_STATUSES = Object.freeze(["active", "trialing"]);

export function normalizeSubscriptionTier(value) {
  const tier = String(value || "free").trim().toLowerCase();
  return SUBSCRIPTION_TIERS.includes(tier) ? tier : "free";
}

export function normalizeCheckoutTier(value) {
  const tier = String(value || "").trim().toLowerCase();
  if (!PAID_TIERS.includes(tier)) {
    throw new TypeError("tier must be pro or elite");
  }
  return tier;
}

export function isPaidTier(value) {
  return PAID_TIERS.includes(normalizeSubscriptionTier(value));
}

export function apiError(code, message) {
  return { success: false, error: { code, message } };
}

export function getApiErrorMessage(payload, fallback = "Request failed") {
  if (typeof payload?.error === "string") return payload.error;
  if (typeof payload?.error?.message === "string") return payload.error.message;
  if (typeof payload?.message === "string") return payload.message;
  return fallback;
}
