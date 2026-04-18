import { supabaseAuth, supabaseAdmin } from "./supabase.js";

export function getBearerToken(request) {
  const header = request.headers.authorization || "";
  if (!header.startsWith("Bearer ")) {
    return null;
  }

  return header.slice("Bearer ".length);
}

export async function getAuthenticatedUser(request) {
  if (!supabaseAuth) {
    throw new Error("Missing Supabase auth configuration");
  }

  const token = getBearerToken(request);
  if (!token) {
    return null;
  }

  const {
    data: { user },
    error
  } = await supabaseAuth.auth.getUser(token);

  if (error || !user) {
    return null;
  }

  return user;
}

export async function getUserTier(userId) {
  const data = await getCurrentSubscription(userId);
  if (!data) {
    return "free";
  }

  if (data.status === "active" || data.status === "trialing") {
    if (data.tier === "pro" || data.tier === "elite") {
      return data.tier;
    }
  }

  return "free";
}

export async function getCurrentSubscription(userId) {
  if (!supabaseAdmin || !userId) {
    return null;
  }

  const { data, error } = await supabaseAdmin
    .from("subscriptions")
    .select("tier,status,current_period_end,stripe_customer_id,stripe_subscription_id")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return data;
}

export function hasPaidAccess(tier) {
  return tier === "pro" || tier === "elite";
}

export function isEliteTier(tier) {
  return tier === "elite";
}
