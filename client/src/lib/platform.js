import { isSupabaseEnabled, supabase } from "./supabase";

const DEFAULT_BACKEND_URL = "https://archaios-saas-worker.quandrix357.workers.dev";

function resolveApiBaseUrl() {
  const configured = String(import.meta.env.VITE_BACKEND_URL || "").replace(/\/+$/, "");

  if (import.meta.env.PROD) {
    return configured || DEFAULT_BACKEND_URL;
  }

  return configured || "http://127.0.0.1:5050";
}

const API_BASE_URL = resolveApiBaseUrl();

export function getApiBaseUrl() {
  return API_BASE_URL;
}

export function getBackendConnectionSummary() {
  const configured = String(import.meta.env.VITE_BACKEND_URL || "").replace(/\/+$/, "");
  const isProd = Boolean(import.meta.env.PROD);
  const source = configured
    ? "env-configured"
    : isProd
      ? "cloudflare-default"
      : "local-dev-fallback";

  return {
    mode: isProd ? "production" : "development",
    configuredBackendUrl: configured || null,
    apiBaseUrl: API_BASE_URL,
    source,
    localTestMode: !isProd
  };
}

function logPlatformEvent(level, event, context = {}) {
  console[level](`[platform:${event}]`, context);
}

function toFriendlyApiError(path, error) {
  const message = String(error?.message || error || "Request failed");
  const status = Number(error?.status || 0);
  const unauthorized = status === 401 || status === 403 || /unauthorized|forbidden/i.test(message);

  if (path === "/api/stripe/checkout") {
    if (unauthorized) {
      return new Error("Checkout is blocked until you sign in with Supabase.");
    }
    return new Error("Checkout is temporarily unavailable. Verify billing configuration and try again.");
  }

  if (path === "/api/stripe/customer-portal" || path === "/api/stripe/portal") {
    return new Error("Billing portal is temporarily unavailable. Verify Stripe customer portal configuration and try again.");
  }

  if (path === "/api/leads") {
    return new Error("Lead capture is temporarily unavailable. Check backend health and try again.");
  }

  if (path === "/api/platform/dashboard") {
    return new Error("Dashboard data is temporarily unavailable. Check backend health and try again.");
  }

  return new Error(message);
}

export function getBackendHealthcheckUrl() {
  return `${API_BASE_URL || ""}/api/health`;
}

export function hasPaidAccess(tier) {
  return tier === "pro" || tier === "elite";
}

function isLikelyStripePriceId(value) {
  return /^price_[A-Za-z0-9]+$/.test(String(value || "").trim());
}

export function getStripeTestReadiness() {
  const proPriceId = String(import.meta.env.VITE_STRIPE_PRO_PRICE_ID || "").trim();
  const elitePriceId = String(import.meta.env.VITE_STRIPE_ELITE_PRICE_ID || "").trim();

  return {
    mode: "test-prep-only",
    clientPlaceholders: {
      proPriceId: proPriceId || "not-set",
      elitePriceId: elitePriceId || "not-set",
      proPriceIdValid: isLikelyStripePriceId(proPriceId),
      elitePriceIdValid: isLikelyStripePriceId(elitePriceId)
    },
    checkoutWiring: {
      wrapper: "src/agents/stripeAgent.js:startStripeCheckout",
      createCheckoutSession: "/api/stripe/create-checkout-session",
      checkoutFallback: "/api/stripe/checkout",
      customerPortal: ["/api/stripe/customer_portal", "/api/stripe/customer-portal", "/api/stripe/portal"],
      subscriptionEndpoint: "/api/subscription"
    },
    webhookRequirements: [
      "Stripe webhook endpoint must be configured in Cloudflare Worker",
      "Webhook signature verification must use Worker secret",
      "Webhook handler must upsert subscription tier/status to Supabase"
    ],
    postCheckoutSyncPath: [
      "Stripe redirects with ?checkout=success",
      "Dashboard or pricing reloads session and calls /api/subscription",
      "UI unlocks Pro/Elite only when backend reports active or trialing status"
    ]
  };
}

export function getRuntimeHostRoles() {
  const stripeTest = getStripeTestReadiness();
  const backendConnection = getBackendConnectionSummary();

  return {
    appHost: "Vercel primary",
    backupHost: "GitHub Pages static backup",
    backendHost: "Cloudflare Worker API/health",
    apiBaseUrl: API_BASE_URL,
    backendConnection,
    supabaseAuthReady: isSupabaseEnabled,
    billingMode: "prepared-not-activated",
    checkoutActivationRequired: [
      "Stripe test prices for Pro and Elite",
      "Cloudflare Worker Stripe secret configuration",
      "Stripe webhook endpoint verification",
      "Successful test-mode checkout and subscription sync"
    ],
    stripeTest
  };
}

export async function getCurrentSession() {
  if (!isSupabaseEnabled || !supabase) {
    return null;
  }

  const {
    data: { session }
  } = await supabase.auth.getSession();
  return session;
}

export function subscribeToAuthChanges(callback) {
  if (!isSupabaseEnabled || !supabase) {
    return { data: { subscription: { unsubscribe() {} } } };
  }

  return supabase.auth.onAuthStateChange((event, session) => callback(event, session));
}

export async function signIn(email, password) {
  if (!supabase) {
    throw new Error("Supabase auth is not configured");
  }

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    throw error;
  }

  return data;
}

export async function signUp(email, password) {
  if (!supabase) {
    throw new Error("Supabase auth is not configured");
  }

  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) {
    throw error;
  }

  return data;
}

export async function requestPasswordReset(email, redirectTo) {
  if (!supabase) {
    throw new Error("Supabase auth is not configured");
  }

  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo
  });

  if (error) {
    throw error;
  }

  return data;
}

export async function updatePassword(password) {
  if (!supabase) {
    throw new Error("Supabase auth is not configured");
  }

  const { data, error } = await supabase.auth.updateUser({ password });
  if (error) {
    throw error;
  }

  return data;
}

export async function resendConfirmationEmail(email, redirectTo) {
  if (!supabase) {
    throw new Error("Supabase auth is not configured");
  }

  const { data, error } = await supabase.auth.resend({
    type: "signup",
    email,
    options: redirectTo ? { emailRedirectTo: redirectTo } : undefined
  });

  if (error) {
    throw error;
  }

  return data;
}

export async function signOut() {
  if (!supabase) {
    return;
  }

  await supabase.auth.signOut();
}

export async function getUserTier(userId) {
  if (!supabase || !userId) {
    return "free";
  }

  const { data, error } = await supabase
    .from("subscriptions")
    .select("tier,status")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data) {
    return "free";
  }

  if (data.status === "active" || data.status === "trialing") {
    if (data.tier === "pro" || data.tier === "elite") {
      return data.tier;
    }
  }

  return "free";
}

export async function fetchActiveStripeSubscriberCount() {
  if (!supabase) {
    return null;
  }

  const { count, error } = await supabase
    .from("subscriptions")
    .select("id", { count: "exact", head: true })
    .in("status", ["active", "trialing"])
    .not("stripe_subscription_id", "is", null);

  if (error) {
    throw error;
  }

  return count ?? 0;
}

export function shouldPreferSignInForSignup(result) {
  const user = result?.user;
  if (!user) {
    return false;
  }

  if (user.email_confirmed_at || user.confirmed_at) {
    return true;
  }

  return Array.isArray(user.identities) && user.identities.length === 0;
}

async function apiFetch(path, accessToken, options = {}) {
  const url = `${API_BASE_URL}${path}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        ...(options.headers || {})
      }
    });

    const payload = await response.json().catch(() => null);
    if (!response.ok) {
      const apiError = new Error(payload?.error || `request_failed_${response.status}`);
      apiError.status = response.status;

      logPlatformEvent("error", "api-response", {
        path,
        status: response.status,
        error: apiError.message
      });
      throw apiError;
    }

    if (
      path === "/api/stripe/checkout" ||
      path === "/api/stripe/customer-portal" ||
      path === "/api/stripe/portal" ||
      path === "/api/leads" ||
      path === "/api/platform/dashboard" ||
      path === "/api/cta-click"
    ) {
      logPlatformEvent("info", "api-success", { path, status: response.status });
    }

    return payload;
  } catch (error) {
    logPlatformEvent("error", "api-fetch", {
      path,
      url,
      message: String(error?.message || error)
    });
    const friendlyError = toFriendlyApiError(path, error);
    friendlyError.status = error?.status;
    throw friendlyError;
  }
}

async function apiFetchFirst(paths, accessToken, options = {}) {
  let lastError = null;

  for (const path of paths) {
    try {
      return await apiFetch(path, accessToken, options);
    } catch (error) {
      lastError = error;
      if (error?.status !== 404) {
        throw error;
      }
    }
  }

  throw lastError || new Error("Request failed");
}

export async function fetchUserAlerts(accessToken) {
  return apiFetch("/api/alerts", accessToken, { method: "GET" });
}

export async function clearUserAlerts(accessToken) {
  return apiFetch("/api/alerts", accessToken, { method: "DELETE" });
}

export async function createCheckoutSession(accessToken, tier) {
  const body = {
    tier
  };

  if (typeof window !== "undefined") {
    const successUrl = new URL(window.location.href);
    successUrl.searchParams.set("checkout", "success");

    const cancelUrl = new URL(window.location.href);
    cancelUrl.searchParams.set("checkout", "cancel");

    body.successUrl = successUrl.toString();
    body.cancelUrl = cancelUrl.toString();
  }

  if (tier === "pro") {
    return apiFetchFirst(["/api/stripe/create-checkout-session", "/api/stripe/checkout"], accessToken, {
      method: "POST",
      body: JSON.stringify(body)
    });
  }

  return apiFetch("/api/stripe/checkout", accessToken, {
    method: "POST",
    body: JSON.stringify(body)
  });
}

export async function createBillingPortalSession(accessToken, returnUrl) {
  return apiFetchFirst(["/api/stripe/customer_portal", "/api/stripe/customer-portal", "/api/stripe/portal"], accessToken, {
    method: "POST",
    body: JSON.stringify({
      ...(returnUrl ? { returnUrl } : {})
    })
  });
}

export async function fetchSubscription(accessToken) {
  return apiFetch("/api/subscription", accessToken, { method: "GET" });
}

export async function fetchPlatformDashboard(accessToken) {
  return apiFetch("/api/platform/dashboard", accessToken, { method: "GET" });
}

export async function captureLead(email) {
  return apiFetch("/api/leads", null, {
    method: "POST",
    body: JSON.stringify({
      email,
      source: "ai-assassins-dashboard"
    })
  });
}

export async function logCtaClick(cta, location, tier = "free") {
  return apiFetch("/api/cta-click", null, {
    method: "POST",
    body: JSON.stringify({
      cta,
      location,
      tier
    })
  });
}

export async function trackRevenueEvent(event, context = {}) {
  const detail = {
    event,
    location: context.location || "app",
    tier: context.tier || "free",
    requestedTier: context.requestedTier || "",
    authState: context.authState || "",
    source: context.source || "dashboard",
    timestamp: new Date().toISOString()
  };

  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("archaios:revenue-event", { detail }));

    if (Array.isArray(window.dataLayer)) {
      window.dataLayer.push(detail);
    }
  }

  const location = [detail.location, detail.requestedTier, detail.authState].filter(Boolean).join(":");
  return logCtaClick(event, location || "app", detail.tier).catch(() => null);
}

export function classifyAuthError(error, mode = "signin") {
  const message = String(error?.message || error || "Authentication failed");
  const lowered = message.toLowerCase();

  if (
    lowered.includes("rate limit") ||
    lowered.includes("too many requests") ||
    lowered.includes("security purposes") ||
    lowered.includes("over_email_send_rate_limit")
  ) {
    return {
      kind: "rate-limit",
      message:
        mode === "signup"
          ? "Too many sign-up or confirmation email attempts. Wait a minute, then try again or check the last confirmation email you already received."
          : "Too many sign-in attempts. Wait a minute, then try again."
    };
  }

  if (lowered.includes("email not confirmed") || lowered.includes("email_not_confirmed")) {
    return {
      kind: "email-not-confirmed",
      message: "Check your inbox and confirm your email before signing in."
    };
  }

  if (lowered.includes("invalid login credentials")) {
    return {
      kind: "invalid-credentials",
      message: "Email or password is incorrect. Try signing in again, or use Forgot password to reset access."
    };
  }

  if (
    lowered.includes("already registered") ||
    lowered.includes("already been registered") ||
    lowered.includes("user already registered") ||
    lowered.includes("user_already_exists")
  ) {
    return {
      kind: "existing-account",
      message: "This email is already confirmed. Sign in instead, or use Forgot password if you need to reset access."
    };
  }

  if (
    lowered.includes("invalid email") ||
    lowered.includes("email address") ||
    lowered.includes("unable to validate email address")
  ) {
    return {
      kind: "invalid-email",
      message: "Enter a valid email address and try again."
    };
  }

  return {
    kind: "unknown",
    message
  };
}

export function toFriendlyAuthError(error, mode = "signin") {
  return classifyAuthError(error, mode).message;
}
