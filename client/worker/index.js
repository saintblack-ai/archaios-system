const DEFAULT_DASHBOARD_SIGNALS_PATH = "/api/internal/cron/dashboard-signals";
const DEFAULT_ACTIVITY_FEED_PATH = "/api/internal/cron/activity-feed";
const DEFAULT_METRICS_SNAPSHOTS_PATH = "/api/internal/cron/metrics-snapshots";
const STRIPE_API_BASE_URL = "https://api.stripe.com/v1";
const DEFAULT_REQUEST_TIMEOUT_MS = 30000;
const DEFAULT_SUPABASE_TIMEOUT_MS = 15000;
const DEFAULT_STRIPE_WEBHOOK_TOLERANCE_SECONDS = 300;
const STRIPE_SUBSCRIPTIONS_TABLE = "public.subscriptions";
const PRICING_TIERS = [
  {
    id: "free",
    name: "Free",
    price: 0,
    displayPrice: "$0",
    features: ["Limited intelligence mode", "Delayed alerts", "Preview dashboard"]
  },
  {
    id: "pro",
    name: "Pro",
    price: 49,
    displayPrice: "$49/month",
    features: ["Full AI dashboard", "Live alerts", "Content generation", "Full system access"]
  },
  {
    id: "elite",
    name: "Elite",
    price: 99,
    displayPrice: "$99/month",
    features: ["Priority signals", "High-threat alerts", "Premium intelligence layer"]
  }
];

function normalizeBaseUrl(value) {
  return String(value || "").replace(/\/+$/, "");
}

function createJsonResponse(payload, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(payload, null, 2), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      ...extraHeaders
    }
  });
}

function logEvent(level, event, context = {}) {
  const logger = level === "error" ? console.error : console.log;
  logger(JSON.stringify({ level, event, ...context }));
}

function buildHealthPayload(env) {
  return {
    ok: true,
    service: "archaios-daily-automation",
    backendBaseUrlConfigured: Boolean(normalizeBaseUrl(env.BACKEND_BASE_URL)),
    adminEmailConfigured: Boolean(String(env.ADMIN_EMAIL || env.VITE_ADMIN_EMAIL || "").trim()),
    cron: env.CRON_SCHEDULE || "17 13 * * *",
    jobs: buildJobDefinitions(env).map((job) => ({ key: job.key, path: job.path }))
  };
}

function createCorsHeaders() {
  return {
    "access-control-allow-origin": "*",
    "access-control-allow-headers": "Content-Type, Authorization",
    "access-control-allow-methods": "GET, POST, OPTIONS"
  };
}

function createOptionsResponse() {
  return new Response(null, {
    status: 204,
    headers: createCorsHeaders()
  });
}

function createStripeWebhookDebugFailureResponse(url) {
  if (url.pathname !== "/api/stripe/webhook" || url.searchParams.get("debug_fail") !== "1") {
    return null;
  }

  return new Response("WEBHOOK_DEBUG_V3_FAIL", {
    status: 500,
    headers: {
      "X-Webhook-Debug": "WEBHOOK_DEBUG_V3"
    }
  });
}

function maskIdentifier(value) {
  const normalized = String(value || "");
  if (!normalized) {
    return "";
  }

  if (normalized.length <= 8) {
    return normalized;
  }

  return `${normalized.slice(0, 4)}...${normalized.slice(-4)}`;
}

function decodeBase64Url(value) {
  const normalized = String(value || "").replace(/-/g, "+").replace(/_/g, "/");
  const padding = normalized.length % 4 === 0 ? "" : "=".repeat(4 - (normalized.length % 4));

  return atob(`${normalized}${padding}`);
}

function decodeJwtPayload(token) {
  try {
    const parts = String(token || "").split(".");
    if (parts.length < 2) {
      return null;
    }

    return JSON.parse(decodeBase64Url(parts[1]));
  } catch {
    return null;
  }
}

function extractBearerToken(request) {
  const authorization = request.headers.get("authorization") || "";
  if (!authorization.startsWith("Bearer ")) {
    return "";
  }

  return authorization.slice("Bearer ".length).trim();
}

function getFallbackUserContextFromToken(token) {
  const payload = decodeJwtPayload(token);
  return {
    userId: String(payload?.sub || ""),
    email: String(payload?.email || "")
  };
}

async function getAuthenticatedUserContext(request, env) {
  const token = extractBearerToken(request);
  if (!token) {
    return { userId: "", email: "" };
  }

  const { url, serviceRoleKey } = getSupabaseConfig(env);
  if (!url || !serviceRoleKey) {
    throw createHttpError("Supabase service role configuration is incomplete.", 500);
  }

  const controller = new AbortController();
  const timeoutMs = Number(env.SUPABASE_REQUEST_TIMEOUT_MS || DEFAULT_SUPABASE_TIMEOUT_MS);
  const timeoutId = setTimeout(() => controller.abort("supabase_auth_timeout"), timeoutMs);

  try {
    const response = await fetch(`${url}/auth/v1/user`, {
      method: "GET",
      signal: controller.signal,
      headers: {
        apikey: serviceRoleKey,
        authorization: `Bearer ${token}`
      }
    });

    if (response.status === 401 || response.status === 403) {
      throw createHttpError("Unauthorized", 401);
    }

    if (!response.ok) {
      const fallbackContext = getFallbackUserContextFromToken(token);
      if (fallbackContext.userId) {
        logEvent("error", "supabase.auth.verify_failed_fallback", {
          status: response.status,
          userId: maskIdentifier(fallbackContext.userId)
        });
      }
      throw createHttpError("Unable to verify authenticated user.", 503);
    }

    const payload = await response.json().catch(() => null);
    return {
      userId: String(payload?.id || ""),
      email: String(payload?.email || "")
    };
  } finally {
    clearTimeout(timeoutId);
  }
}

function normalizePlan(value) {
  const normalized = String(value || "").trim().toLowerCase();
  if (normalized === "elite") {
    return "elite";
  }
  if (normalized === "pro") {
    return "pro";
  }
  return "free";
}

function isPaidTier(tier) {
  return tier === "pro" || tier === "elite";
}

function isEliteTier(tier) {
  return tier === "elite";
}

function isActiveSubscriptionStatus(status) {
  return status === "active" || status === "trialing";
}

function normalizeSubscriptionResponse(record, userContext) {
  const tier = normalizePlan(record?.tier || record?.plan);
  const status = String(record?.status || (isPaidTier(tier) ? "active" : "free")).toLowerCase();

  return {
    user: {
      id: userContext?.userId || null,
      email: userContext?.email || null
    },
    tier,
    plan: tier,
    status,
    paid: isPaidTier(tier) && isActiveSubscriptionStatus(status),
    prioritySignals: isEliteTier(tier) && isActiveSubscriptionStatus(status),
    currentPeriodEnd: record?.current_period_end || record?.currentPeriodEnd || null,
    stripeCustomerId: record?.stripe_customer_id || record?.stripeCustomerId || null,
    stripeSubscriptionId: record?.stripe_subscription_id || record?.stripeSubscriptionId || null
  };
}

function filterAlertsForTier(alerts, tier) {
  if (tier === "elite" || tier === "pro") {
    return alerts;
  }

  return alerts.filter((alert) => alert.severity !== "high").slice(0, 10);
}

function createPremiumModel(tier) {
  return {
    currentTier: tier,
    limitedMode: !isPaidTier(tier),
    delayedHighThreatAlerts: !isPaidTier(tier),
    canRefreshRealtime: isPaidTier(tier),
    canGeneratePosts: isPaidTier(tier),
    canExtendCalendar: isPaidTier(tier),
    prioritySignals: isEliteTier(tier)
  };
}

function buildRevenueSnapshot(tier) {
  return {
    monthlyRecurringRevenue: isEliteTier(tier) ? 18420 : isPaidTier(tier) ? 9210 : 2760,
    activeSubscribers: isEliteTier(tier) ? 191 : isPaidTier(tier) ? 104 : 37,
    conversionRate: isEliteTier(tier) ? 6.2 : isPaidTier(tier) ? 4.8 : 2.1,
    projectedRevenue: isEliteTier(tier) ? 24600 : isPaidTier(tier) ? 13300 : 3900
  };
}

function makeActivityFeed(tier) {
  const now = Date.now();
  const entries = [
    {
      actor: "Traffic Agent",
      action: "rerouted acquisition budget",
      detail: "Shifted volume toward short-form channels with higher conversion intent.",
      level: "medium"
    },
    {
      actor: "Content Agent",
      action: "queued daily publishing pack",
      detail: "Prepared nine cross-platform posts aligned to current signal themes.",
      level: "normal"
    },
    {
      actor: "Analytics Agent",
      action: "identified revenue acceleration",
      detail: "Detected stronger checkout intent on premium intelligence offer pages.",
      level: "normal"
    },
    {
      actor: "Intelligence Agent",
      action: "published daily operational brief",
      detail: "Merged market, conflict, and narrative signals into a user-facing report.",
      level: tier === "free" ? "medium" : "high"
    },
    {
      actor: "Conversion Agent",
      action: "tested urgency copy",
      detail: "Promoted scarcity framing on the premium intelligence paywall.",
      level: "medium"
    }
  ];

  return entries.map((entry, index) => ({
    id: `feed-${index + 1}`,
    ...entry,
    title: `${entry.actor} ${entry.action}`,
    timestamp: new Date(now - index * 7 * 60 * 1000).toISOString()
  }));
}

function buildAgentCards(tier) {
  const visibleAgentIds =
    tier === "elite"
      ? [
          "content-agent",
          "marketing-agent",
          "traffic-agent",
          "intelligence-agent",
          "conversion-agent",
          "analytics-agent"
        ]
      : tier === "pro"
        ? ["content-agent", "marketing-agent", "traffic-agent", "intelligence-agent", "conversion-agent"]
        : ["content-agent", "marketing-agent", "traffic-agent"];
  const visible = new Set(visibleAgentIds);

  return [
    {
      id: "content-agent",
      name: "Content Agent",
      summary: "Generates platform-ready post sequences for daily publishing.",
      output: "9 posts prepared for TikTok, Instagram, and Facebook with script-ready hooks.",
      metricLabel: "Posts queued",
      metricValue: "9",
      status: "active",
      minTier: "free"
    },
    {
      id: "marketing-agent",
      name: "Marketing Agent",
      summary: "Builds campaigns, captions, hooks, and channel messaging.",
      output: "Launched a campaign sequence around cosmic urgency and premium access.",
      metricLabel: "Campaigns live",
      metricValue: "4",
      status: "active",
      minTier: "free"
    },
    {
      id: "traffic-agent",
      name: "Traffic Agent",
      summary: "Recommends social routing, channel pressure, and CTA strategy.",
      output: "Recommended heavier Facebook retargeting and TikTok top-of-funnel volume.",
      metricLabel: "Traffic moves",
      metricValue: "3",
      status: "active",
      minTier: "free"
    },
    {
      id: "intelligence-agent",
      name: "Intelligence Agent",
      summary: "Produces the daily user intelligence briefing and signal digest.",
      output: "Generated the morning report covering market fragility and conflict escalation.",
      metricLabel: "Briefs delivered",
      metricValue: "1",
      status: "priority",
      minTier: "pro"
    },
    {
      id: "conversion-agent",
      name: "Conversion Agent",
      summary: "Improves upgrade messaging, CTA framing, and page conversion language.",
      output: "Raised urgency messaging around delayed free-tier high-threat alerts.",
      metricLabel: "Experiments",
      metricValue: "6",
      status: "active",
      minTier: "pro"
    },
    {
      id: "analytics-agent",
      name: "Analytics Agent",
      summary: "Tracks engagement, revenue momentum, and monetization performance.",
      output: "Detected stronger monetization from premium users engaging twice daily.",
      metricLabel: "Revenue signals",
      metricValue: isEliteTier(tier) ? "18" : "12",
      status: "watching",
      minTier: "elite"
    }
  ].map((agent) => ({
    ...agent,
    locked: !visible.has(agent.id)
  }));
}

function buildPlatformDashboardPayload(userContext, tier, growthMetrics = { leads: 0, ctaClicks: 0, source: "supabase" }) {
  return {
    generatedAt: new Date().toISOString(),
    pricing: PRICING_TIERS,
    userTier: tier,
    user: {
      id: userContext?.userId || null,
      email: userContext?.email || null,
      tier,
      paid: isPaidTier(tier),
      prioritySignals: isEliteTier(tier)
    },
    premium: createPremiumModel(tier),
    activityFeed: makeActivityFeed(tier),
    agents: buildAgentCards(tier),
    revenue: buildRevenueSnapshot(tier),
    analytics: {
      leadSubmissions: growthMetrics.leads || 0,
      ctaClicks: growthMetrics.ctaClicks || 0,
      source: growthMetrics.source || "supabase"
    },
    briefing: {
      title: "Daily Platform Brief",
      summary:
        "Operational pressure is rising across acquisition, monetization, and intelligence visibility. Premium plans unlock faster reaction speed, deeper signal coverage, and a more aggressive revenue posture.",
      actions: [
        "Push conversion-weighted messaging harder on premium surfaces.",
        "Prioritize short-form content with direct upgrade CTAs.",
        "Monitor high-threat alerts and route elite users to priority reports."
      ]
    }
  };
}

function timingSafeEqual(left, right) {
  const leftValue = String(left || "");
  const rightValue = String(right || "");

  if (leftValue.length !== rightValue.length) {
    return false;
  }

  let result = 0;
  for (let index = 0; index < leftValue.length; index += 1) {
    result |= leftValue.charCodeAt(index) ^ rightValue.charCodeAt(index);
  }

  return result === 0;
}

async function hmacSha256Hex(secret, payload) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload));

  return Array.from(new Uint8Array(signature))
    .map((value) => value.toString(16).padStart(2, "0"))
    .join("");
}

function parseStripeSignatureHeader(header) {
  return String(header || "")
    .split(",")
    .map((part) => part.trim())
    .reduce(
      (accumulator, part) => {
        const [key, value] = part.split("=");
        if (!key || !value) {
          return accumulator;
        }

        if (key === "t") {
          accumulator.timestamp = value;
        }

        if (key === "v1") {
          accumulator.signatures.push(value);
        }

        return accumulator;
      },
      { timestamp: "", signatures: [] }
    );
}

async function verifyStripeSignature(request, rawBody, env) {
  const webhookSecret = String(env.STRIPE_WEBHOOK_SECRET || "");
  if (!webhookSecret) {
    throw new Error("STRIPE_WEBHOOK_SECRET is not configured.");
  }

  const parsed = parseStripeSignatureHeader(request.headers.get("stripe-signature"));
  if (!parsed.timestamp || parsed.signatures.length === 0) {
    throw new Error("Missing Stripe signature");
  }

  const timestampSeconds = Number(parsed.timestamp);
  if (!Number.isFinite(timestampSeconds)) {
    throw new Error("Invalid Stripe signature timestamp");
  }

  const toleranceSeconds = Number(env.STRIPE_WEBHOOK_TOLERANCE_SECONDS || DEFAULT_STRIPE_WEBHOOK_TOLERANCE_SECONDS);
  const currentSeconds = Math.floor(Date.now() / 1000);
  if (Math.abs(currentSeconds - timestampSeconds) > toleranceSeconds) {
    throw new Error("Stripe signature timestamp outside tolerance");
  }

  const signedPayload = `${parsed.timestamp}.${rawBody}`;
  const expectedSignature = await hmacSha256Hex(webhookSecret, signedPayload);
  const valid = parsed.signatures.some((signature) => timingSafeEqual(signature, expectedSignature));

  if (!valid) {
    throw new Error("Invalid Stripe signature");
  }
}

function getSupabaseConfig(env) {
  return {
    url: normalizeBaseUrl(env.SUPABASE_URL || env.VITE_SUPABASE_URL),
    serviceRoleKey: String(env.SUPABASE_SERVICE_ROLE_KEY || "")
  };
}

function createHttpError(message, status = 500) {
  const error = new Error(message);
  error.status = status;
  return error;
}

async function supabaseRequest(env, path, options = {}) {
  const { url, serviceRoleKey } = getSupabaseConfig(env);
  if (!url || !serviceRoleKey) {
    if (!url) {
      console.error("stripe.webhook.supabase.missing_config", "SUPABASE_URL is missing");
    }
    if (!serviceRoleKey) {
      console.error(
        "stripe.webhook.supabase.missing_config",
        "SUPABASE_SERVICE_ROLE_KEY is missing"
      );
    }
    throw createHttpError("Supabase service role configuration is incomplete.", 500);
  }

  const controller = new AbortController();
  const timeoutMs = Number(env.SUPABASE_REQUEST_TIMEOUT_MS || DEFAULT_SUPABASE_TIMEOUT_MS);
  const timeoutId = setTimeout(() => controller.abort("supabase_timeout"), timeoutMs);

  try {
    const response = await fetch(`${url}${path}`, {
      ...options,
      signal: controller.signal,
      headers: {
        apikey: serviceRoleKey,
        authorization: `Bearer ${serviceRoleKey}`,
        ...(options.method && options.method !== "GET" ? { "content-type": "application/json" } : {}),
        ...(options.headers || {})
      }
    });
    const payload = await response.json().catch(() => null);

    if (!response.ok) {
      throw new Error(payload?.message || payload?.error || `supabase_http_${response.status}`);
    }

    return payload;
  } finally {
    clearTimeout(timeoutId);
  }
}

async function supabaseRawRequest(env, path, options = {}) {
  const { url, serviceRoleKey } = getSupabaseConfig(env);
  if (!url || !serviceRoleKey) {
    throw createHttpError("Supabase service role configuration is incomplete.", 500);
  }

  const controller = new AbortController();
  const timeoutMs = Number(env.SUPABASE_REQUEST_TIMEOUT_MS || DEFAULT_SUPABASE_TIMEOUT_MS);
  const timeoutId = setTimeout(() => controller.abort("supabase_timeout"), timeoutMs);

  try {
    return await fetch(`${url}${path}`, {
      ...options,
      signal: controller.signal,
      headers: {
        apikey: serviceRoleKey,
        authorization: `Bearer ${serviceRoleKey}`,
        ...(options.method && options.method !== "GET" && options.method !== "HEAD"
          ? { "content-type": "application/json" }
          : {}),
        ...(options.headers || {})
      }
    });
  } finally {
    clearTimeout(timeoutId);
  }
}

async function supabaseCount(env, table, query = "") {
  const response = await supabaseRawRequest(
    env,
    `/rest/v1/${table}?select=id${query}`,
    {
      method: "HEAD",
      headers: {
        prefer: "count=exact",
        range: "0-0"
      }
    }
  );

  if (!response.ok) {
    throw createHttpError(`Unable to count ${table}`, response.status);
  }

  const contentRange = response.headers.get("content-range") || "";
  const total = Number(contentRange.split("/")[1] || 0);
  return Number.isFinite(total) ? total : 0;
}

async function getLatestSubscriptionForUser(env, userId) {
  if (!userId) {
    return null;
  }

  const rows = await supabaseRequest(
    env,
    `/rest/v1/subscriptions?select=id,user_id,tier,status,current_period_end,stripe_customer_id,stripe_subscription_id,created_at&user_id=eq.${encodeURIComponent(userId)}&order=created_at.desc&limit=1`
  );

  return Array.isArray(rows) ? rows[0] || null : null;
}

async function getGrowthMetrics(env) {
  try {
    const [leads, ctaClicks] = await Promise.all([
      supabaseCount(env, "leads"),
      supabaseCount(env, "cta_events")
    ]);

    return {
      leads,
      ctaClicks,
      source: "supabase"
    };
  } catch {
    return {
      leads: 0,
      ctaClicks: 0,
      source: "worker-fallback"
    };
  }
}

function getAdminEmail(env) {
  return String(env.ADMIN_EMAIL || env.VITE_ADMIN_EMAIL || "").trim().toLowerCase();
}

async function requireAuthenticatedUser(request, env) {
  const userContext = await getAuthenticatedUserContext(request, env);
  if (!userContext.userId) {
    throw createHttpError("Unauthorized", 401);
  }
  return userContext;
}

async function requireAdminUser(request, env) {
  const userContext = await requireAuthenticatedUser(request, env);
  const adminEmail = getAdminEmail(env);

  if (!adminEmail) {
    throw createHttpError("ADMIN_EMAIL is not configured.", 503);
  }

  if (userContext.email.toLowerCase() !== adminEmail) {
    throw createHttpError("Forbidden", 403);
  }

  return userContext;
}

function normalizeSubscriptionRecord(input) {
  return Object.fromEntries(
    Object.entries(input).filter(([, value]) => value !== undefined && value !== null && value !== "")
  );
}

function extractWebhookMetadata(object = {}) {
  const metadata = object.metadata || {};
  const userId = metadata.user_id || metadata.userId || object.client_reference_id || "";

  return {
    userId: String(userId)
  };
}

function isUuid(value) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(value || ""));
}

function getStripeWebhookEventUserId(event) {
  return extractWebhookMetadata(event?.data?.object || {}).userId;
}

function createSubscriptionWritePayload(record) {
  return {
    user_id: record.user_id || "",
    tier: record.tier || record.plan || "",
    status: record.status || "",
    updated_at: record.updated_at || ""
  };
}

function normalizeStripeTimestamp(value) {
  if (!value) {
    return null;
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    return new Date(value * 1000).toISOString();
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
}

function buildSubscriptionRecordFromCheckoutSession(session) {
  const metadata = extractWebhookMetadata(session);
  const tier = normalizePlan(session?.metadata?.tier || session?.subscription_data?.metadata?.tier || "pro");
  const status =
    session.payment_status === "paid" || session.status === "complete" ? "active" : "incomplete";

  return normalizeSubscriptionRecord({
    user_id: metadata.userId,
    tier,
    plan: tier,
    status,
    stripe_customer_id: session.customer || null,
    stripe_subscription_id: session.subscription || null,
    updated_at: new Date().toISOString()
  });
}

function buildSubscriptionRecordFromSubscription(subscription) {
  const metadata = extractWebhookMetadata(subscription);
  const tier = normalizePlan(subscription?.metadata?.tier || "pro");

  return normalizeSubscriptionRecord({
    user_id: metadata.userId,
    tier,
    plan: tier,
    status: String(subscription.status || "active"),
    stripe_customer_id: subscription.customer || null,
    stripe_subscription_id: subscription.id || null,
    current_period_end: normalizeStripeTimestamp(subscription.current_period_end),
    updated_at: new Date().toISOString()
  });
}

async function findExistingSubscription(env, record) {
  if (record.user_id) {
    const byUser = await supabaseRequest(
      env,
      `/rest/v1/subscriptions?select=id,user_id&user_id=eq.${encodeURIComponent(record.user_id)}&order=updated_at.desc.nullslast&limit=1`,
      {
        headers: {
          "accept-profile": "public"
        }
      }
    );

    if (Array.isArray(byUser) && byUser.length > 0) {
      return byUser[0];
    }
  }

  return null;
}

async function upsertSubscriptionRecord(env, record) {
  const writePayload = createSubscriptionWritePayload(record);
  const existing = await findExistingSubscription(env, record);

  if (existing?.id) {
    const updated = await supabaseRequest(env, `/rest/v1/subscriptions?id=eq.${existing.id}`, {
      method: "PATCH",
      headers: {
        "content-profile": "public",
        prefer: "return=representation"
      },
      body: JSON.stringify(record)
    });

    return {
      action: "updated",
      row: Array.isArray(updated) ? updated[0] || null : updated,
      table: STRIPE_SUBSCRIPTIONS_TABLE,
      payload: writePayload
    };
  }

  const inserted = await supabaseRequest(env, "/rest/v1/subscriptions", {
    method: "POST",
    headers: {
      "content-profile": "public",
      prefer: "return=representation"
    },
    body: JSON.stringify([record])
  });

  return {
    action: "inserted",
    row: Array.isArray(inserted) ? inserted[0] || null : inserted,
    table: STRIPE_SUBSCRIPTIONS_TABLE,
    payload: writePayload
  };
}

async function processSubscriptionWebhookRecord(eventType, record, env) {
  const extractedUserId = String(record.user_id || "");
  const payload = createSubscriptionWritePayload(record);

  console.log("stripe.webhook.write.before", JSON.stringify({
    event_type: eventType || "unknown",
    user_id: extractedUserId,
    target_table: STRIPE_SUBSCRIPTIONS_TABLE,
    payload
  }));

  if (!isUuid(extractedUserId)) {
    console.warn(
      "stripe.webhook.write.ignored",
      JSON.stringify({
        event_type: eventType || "unknown",
        user_id: extractedUserId,
        target_table: STRIPE_SUBSCRIPTIONS_TABLE,
        reason:
          "Ignored Stripe test fixture or non-production event because user_id is missing or not a UUID. Production UUID should come from Stripe metadata.user_id and/or client_reference_id.",
        payload
      })
    );

    return {
      action: "ignored",
      table: STRIPE_SUBSCRIPTIONS_TABLE,
      payload,
      row: null
    };
  }

  const result = await upsertSubscriptionRecord(env, record);
  console.log("stripe.webhook.write.after", JSON.stringify({
    event_type: eventType || "unknown",
    user_id: extractedUserId,
    target_table: STRIPE_SUBSCRIPTIONS_TABLE,
    supabase: {
      status: "ok",
      error: null,
      data: {
        action: result.action,
        row: result.row
      }
    }
  }));
  return result;
}

async function handleStripeWebhookEvent(event, env) {
  if (event.type === "checkout.session.completed") {
    const record = buildSubscriptionRecordFromCheckoutSession(event.data?.object || {});
    return processSubscriptionWebhookRecord(event.type, record, env);
  }

  if (
    event.type === "customer.subscription.created" ||
    event.type === "customer.subscription.updated" ||
    event.type === "customer.subscription.deleted"
  ) {
    const record = buildSubscriptionRecordFromSubscription(event.data?.object || {});
    return processSubscriptionWebhookRecord(event.type, record, env);
  }

  return {
    action: "ignored",
    row: null
  };
}

function buildCheckoutUrl(baseUrl, status) {
  const url = new URL(baseUrl);
  url.searchParams.set("checkout", status);
  return url.toString();
}

function resolveCheckoutReturnUrl(request, explicitUrl, fallbackStatus) {
  if (explicitUrl) {
    return explicitUrl;
  }

  const origin = request.headers.get("origin");
  if (origin) {
    return buildCheckoutUrl(origin, fallbackStatus);
  }

  return buildCheckoutUrl(request.url, fallbackStatus);
}

function getStripePriceForTier(env, tier) {
  if (tier === "pro") {
    return String(env.STRIPE_PRICE_PRO || "");
  }

  if (tier === "elite") {
    return String(env.STRIPE_PRICE_ELITE || "");
  }

  return "";
}

async function createStripeCheckoutSession(env, payload, request) {
  const stripeSecretKey = String(env.STRIPE_SECRET_KEY || "");
  const requestedTier = String(payload?.tier || "pro").toLowerCase();
  const stripePrice = getStripePriceForTier(env, requestedTier);
  const userContext = await requireAuthenticatedUser(request, env);

  if (!stripeSecretKey) {
    throw new Error("STRIPE_SECRET_KEY is not configured.");
  }

  if (!stripePrice) {
    throw new Error(`No Stripe price is configured for tier "${requestedTier}".`);
  }

  const successUrl = resolveCheckoutReturnUrl(request, payload?.successUrl, "success");
  const cancelUrl = resolveCheckoutReturnUrl(request, payload?.cancelUrl, "cancel");
  const form = new URLSearchParams();

  form.set("mode", "subscription");
  form.set("success_url", successUrl);
  form.set("cancel_url", cancelUrl);
  form.set("line_items[0][price]", stripePrice);
  form.set("line_items[0][quantity]", "1");
  form.set("allow_promotion_codes", "true");
  form.set("metadata[tier]", requestedTier);
  form.set("subscription_data[metadata][tier]", requestedTier);
  if (userContext.userId) {
    form.set("client_reference_id", userContext.userId);
    form.set("metadata[user_id]", userContext.userId);
    form.set("subscription_data[metadata][user_id]", userContext.userId);
  }
  if (userContext.email) {
    form.set("customer_email", userContext.email);
    form.set("metadata[user_email]", userContext.email);
    form.set("subscription_data[metadata][user_email]", userContext.email);
  }

  const response = await fetch(`${STRIPE_API_BASE_URL}/checkout/sessions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${stripeSecretKey}`,
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: form.toString()
  });

  const result = await response.json().catch(() => null);
  if (!response.ok) {
    const stripeMessage = result?.error?.message || `stripe_http_${response.status}`;
    throw new Error(stripeMessage);
  }

  if (!result?.url) {
    throw new Error("Stripe did not return a checkout URL.");
  }

  return {
    ok: true,
    id: result.id,
    url: result.url,
    mode: result.mode,
    tier: requestedTier
  };
}

async function createStripeBillingPortalSession(env, payload, request) {
  const stripeSecretKey = String(env.STRIPE_SECRET_KEY || "");
  const userContext = await requireAuthenticatedUser(request, env);

  if (!stripeSecretKey) {
    throw createHttpError("STRIPE_SECRET_KEY is not configured.", 500);
  }

  const subscription = await getLatestSubscriptionForUser(env, userContext.userId);
  const stripeCustomerId = String(subscription?.stripe_customer_id || "");
  if (!stripeCustomerId) {
    throw createHttpError("No Stripe customer found for this account", 404);
  }

  const returnUrl =
    typeof payload?.returnUrl === "string" && payload.returnUrl.trim()
      ? payload.returnUrl.trim()
      : resolveCheckoutReturnUrl(request, "", "cancel");
  const form = new URLSearchParams();

  form.set("customer", stripeCustomerId);
  form.set("return_url", returnUrl);

  const response = await fetch(`${STRIPE_API_BASE_URL}/billing_portal/sessions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${stripeSecretKey}`,
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: form.toString()
  });

  const result = await response.json().catch(() => null);
  if (!response.ok) {
    throw createHttpError(result?.error?.message || `stripe_http_${response.status}`, response.status);
  }

  if (!result?.url) {
    throw createHttpError("Stripe did not return a billing portal URL.", 500);
  }

  return {
    ok: true,
    url: result.url
  };
}

async function handleSubscriptionRequest(request, env) {
  const userContext = await requireAuthenticatedUser(request, env);
  const subscription = await getLatestSubscriptionForUser(env, userContext.userId);
  return createJsonResponse(normalizeSubscriptionResponse(subscription, userContext), 200, createCorsHeaders());
}

async function handlePlatformDashboardRequest(request, env) {
  const userContext = await getAuthenticatedUserContext(request, env).catch((error) => {
    if (error?.status === 401) {
      return { userId: "", email: "" };
    }
    throw error;
  });
  const subscription = userContext.userId ? await getLatestSubscriptionForUser(env, userContext.userId) : null;
  const tier = normalizePlan(subscription?.tier);
  const growthMetrics = await getGrowthMetrics(env);
  const payload = buildPlatformDashboardPayload(
    userContext.userId ? userContext : { userId: null, email: null },
    tier,
    growthMetrics
  );

  return createJsonResponse(payload, 200, createCorsHeaders());
}

async function handleAlertsRequest(request, env) {
  const userContext = await requireAuthenticatedUser(request, env);
  const subscription = await getLatestSubscriptionForUser(env, userContext.userId);
  const tier = normalizePlan(subscription?.tier);
  const rows = await supabaseRequest(
    env,
    `/rest/v1/alerts?select=id,type,severity,message,timestamp&user_id=eq.${encodeURIComponent(userContext.userId)}&order=timestamp.desc&limit=100`
  );

  return createJsonResponse(
    {
      tier,
      paid: isPaidTier(tier) && isActiveSubscriptionStatus(subscription?.status || ""),
      prioritySignals: isEliteTier(tier) && isActiveSubscriptionStatus(subscription?.status || ""),
      alerts: filterAlertsForTier(Array.isArray(rows) ? rows : [], tier)
    },
    200,
    createCorsHeaders()
  );
}

async function handleClearAlertsRequest(request, env) {
  const userContext = await requireAuthenticatedUser(request, env);
  await supabaseRequest(
    env,
    `/rest/v1/alerts?user_id=eq.${encodeURIComponent(userContext.userId)}`,
    { method: "DELETE" }
  );

  return createJsonResponse({ ok: true, cleared: true }, 200, createCorsHeaders());
}

async function handleLeadRequest(request, env) {
  const payload = await readJsonBody(request);
  const email = String(payload?.email || "").trim().toLowerCase();
  const source = String(payload?.source || "dashboard").trim() || "dashboard";

  if (!email || !email.includes("@")) {
    throw createHttpError("Valid email required", 400);
  }

  await supabaseRequest(
    env,
    "/rest/v1/leads?on_conflict=email",
    {
      method: "POST",
      headers: {
        prefer: "resolution=merge-duplicates,return=representation"
      },
      body: JSON.stringify([
        {
          email,
          source,
          captured_at: new Date().toISOString()
        }
      ])
    }
  );

  return createJsonResponse({ ok: true, stored: true, email, via: "supabase" }, 200, createCorsHeaders());
}

async function handleCtaClickRequest(request, env) {
  const payload = await readJsonBody(request);
  const cta = String(payload?.cta || "").trim();
  const location = String(payload?.location || "dashboard").trim() || "dashboard";
  const tier = normalizePlan(payload?.tier);

  if (!cta) {
    throw createHttpError("CTA label required", 400);
  }

  await supabaseRequest(
    env,
    "/rest/v1/cta_events",
    {
      method: "POST",
      body: JSON.stringify([
        {
          cta,
          location,
          tier,
          created_at: new Date().toISOString()
        }
      ])
    }
  );

  return createJsonResponse({ ok: true, stored: true, via: "supabase", cta, location, tier }, 200, createCorsHeaders());
}

async function handleAdminDashboardRequest(request, env) {
  await requireAdminUser(request, env);

  const [totalUsers, activeSubscriptions, webhookRows] = await Promise.all([
    supabaseCount(env, "profiles").catch(() => 0),
    supabaseCount(env, "subscriptions", "&status=in.(active,trialing)").catch(() => 0),
    supabaseRequest(
      env,
      "/rest/v1/revenue_events?select=event_type,status,occurred_at,metadata&order=occurred_at.desc&limit=10"
    ).catch(() => [])
  ]);

  const webhookLogs = Array.isArray(webhookRows)
    ? webhookRows.map((row) => ({
        eventType: row.event_type || "stripe.event",
        status: row.status || "unknown",
        tier: normalizePlan(row?.metadata?.tier),
        createdAt: row.occurred_at || null
      }))
    : [];

  return createJsonResponse(
    {
      ok: true,
      totalUsers,
      activeSubscriptions,
      webhookLogs
    },
    200,
    createCorsHeaders()
  );
}

function buildJobDefinitions(env) {
  return [
    {
      key: "dashboard-signals",
      label: "refresh dashboard signals",
      path: env.DASHBOARD_SIGNALS_PATH || DEFAULT_DASHBOARD_SIGNALS_PATH
    },
    {
      key: "activity-feed",
      label: "update activity feed",
      path: env.ACTIVITY_FEED_PATH || DEFAULT_ACTIVITY_FEED_PATH
    },
    {
      key: "metrics-snapshots",
      label: "write metrics snapshots",
      path: env.METRICS_SNAPSHOTS_PATH || DEFAULT_METRICS_SNAPSHOTS_PATH
    }
  ];
}

async function readJsonBody(request) {
  try {
    return await request.json();
  } catch {
    return {};
  }
}

function verifyCronAuthorization(request, env) {
  const expected = String(env.CRON_AUTH_TOKEN || "");
  if (!expected) {
    return true;
  }

  const header = request.headers.get("authorization") || "";
  return header === `Bearer ${expected}`;
}

function buildDashboardSignalsPayload(timestamp) {
  const signals = [
    {
      id: crypto.randomUUID(),
      title: "Macro pressure rising across AI infrastructure channels",
      severity: "high",
      score: 92
    },
    {
      id: crypto.randomUUID(),
      title: "Subscriber conversion momentum stable in premium cohorts",
      severity: "medium",
      score: 74
    },
    {
      id: crypto.randomUUID(),
      title: "Narrative volatility detected in geopolitical feed clustering",
      severity: "medium",
      score: 68
    }
  ];

  return {
    generatedAt: timestamp,
    signalCount: signals.length,
    topSeverity: signals[0]?.severity || "normal",
    signals
  };
}

function buildActivityFeedPayload(timestamp) {
  const items = [
    {
      id: crypto.randomUUID(),
      type: "system",
      title: "Daily signal refresh completed",
      detail: "ARCHAIOS refreshed premium signal groupings for the next operator cycle.",
      createdAt: timestamp
    },
    {
      id: crypto.randomUUID(),
      type: "traffic",
      title: "Activity surge detected",
      detail: "Traffic routing shifted toward conversion-heavy entry points.",
      createdAt: timestamp
    },
    {
      id: crypto.randomUUID(),
      type: "analytics",
      title: "Revenue posture snapshot generated",
      detail: "Mock revenue and engagement posture has been recomputed for dashboard display.",
      createdAt: timestamp
    }
  ];

  return {
    generatedAt: timestamp,
    itemCount: items.length,
    items
  };
}

function buildMetricsSnapshotPayload(timestamp) {
  return {
    generatedAt: timestamp,
    metrics: {
      leadSubmissions: 37,
      ctaClicks: 112,
      activeSubscribers: 18,
      monthlyRecurringRevenue: 1470,
      conversionRate: 4.8
    }
  };
}

async function insertSupabaseRows(env, tableName, rows) {
  const supabaseUrl = normalizeBaseUrl(env.SUPABASE_URL || env.VITE_SUPABASE_URL);
  const serviceRoleKey = String(env.SUPABASE_SERVICE_ROLE_KEY || "");

  if (!supabaseUrl || !serviceRoleKey || !tableName) {
    return {
      ok: false,
      skipped: true,
      inserted: 0,
      reason: "supabase_not_configured"
    };
  }

  const controller = new AbortController();
  const timeoutMs = Number(env.SUPABASE_REQUEST_TIMEOUT_MS || DEFAULT_SUPABASE_TIMEOUT_MS);
  const timeoutId = setTimeout(() => controller.abort("supabase_timeout"), timeoutMs);

  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/${tableName}`, {
      method: "POST",
      signal: controller.signal,
      headers: {
        "content-type": "application/json",
        apikey: serviceRoleKey,
        authorization: `Bearer ${serviceRoleKey}`,
        prefer: "return=representation"
      },
      body: JSON.stringify(rows)
    });

    const payload = await response.text();
    if (!response.ok) {
      throw new Error(`supabase_http_${response.status}:${payload.slice(0, 400)}`);
    }

    return {
      ok: true,
      skipped: false,
      inserted: Array.isArray(rows) ? rows.length : 1
    };
  } catch (error) {
    return {
      ok: false,
      skipped: false,
      inserted: 0,
      error: String(error?.message || error || "supabase_insert_failed")
    };
  } finally {
    clearTimeout(timeoutId);
  }
}

async function logCronRun(env, payload) {
  return insertSupabaseRows(env, env.SUPABASE_CRON_RUNS_TABLE || "cron_job_runs", [payload]);
}

async function persistDashboardSignals(env, runId, payload, trigger) {
  const record = {
    run_id: runId,
    trigger,
    generated_at: payload.generatedAt,
    signal_count: payload.signalCount,
    top_severity: payload.topSeverity,
    signals: payload.signals
  };

  return insertSupabaseRows(env, env.SUPABASE_DASHBOARD_SIGNALS_TABLE || "dashboard_signal_runs", [record]);
}

async function persistActivityFeed(env, runId, payload, trigger) {
  const rows = payload.items.map((item) => ({
    run_id: runId,
    trigger,
    event_type: item.type,
    title: item.title,
    detail: item.detail,
    created_at: item.createdAt
  }));

  return insertSupabaseRows(env, env.SUPABASE_ACTIVITY_FEED_TABLE || "activity_feed_runs", rows);
}

async function persistMetricsSnapshot(env, runId, payload, trigger) {
  const record = {
    run_id: runId,
    trigger,
    generated_at: payload.generatedAt,
    metrics: payload.metrics
  };

  return insertSupabaseRows(env, env.SUPABASE_METRICS_SNAPSHOTS_TABLE || "metrics_snapshots", [record]);
}

async function recordRevenueEvent(env, eventType, status, metadata = {}) {
  return insertSupabaseRows(env, "revenue_events", [
    {
      event_type: String(eventType || "stripe.event"),
      status: String(status || "ok"),
      occurred_at: new Date().toISOString(),
      metadata
    }
  ]);
}

async function handleCronEndpoint({ request, env, jobKey, generatePayload, persistPayload }) {
  if (!verifyCronAuthorization(request, env)) {
    return createJsonResponse({ ok: false, error: "unauthorized" }, 401);
  }

  const body = await readJsonBody(request);
  const timestamp = new Date().toISOString();
  const runId = body.runId || crypto.randomUUID();
  const trigger = body.trigger || "manual";

  logEvent("info", "cron.endpoint.start", { job: jobKey, runId, trigger });

  const payload = generatePayload(timestamp);
  const supabaseResult = await persistPayload(env, runId, payload, trigger);
  const runLogResult = await logCronRun(env, {
    run_id: runId,
    job: jobKey,
    trigger,
    status: supabaseResult.ok || supabaseResult.skipped ? "ok" : "warning",
    request_payload: body,
    response_payload: payload,
    created_at: timestamp
  });

  if (!supabaseResult.ok && !supabaseResult.skipped) {
    logEvent("error", "cron.endpoint.supabase_failure", { job: jobKey, runId, error: supabaseResult.error || "unknown_error" });
  } else {
    logEvent("info", "cron.endpoint.success", {
      job: jobKey,
      runId,
      inserted: supabaseResult.inserted,
      supabaseSkipped: supabaseResult.skipped
    });
  }

  return createJsonResponse({
    ok: true,
    job: jobKey,
    runId,
    trigger,
    generatedAt: timestamp,
    supabase: supabaseResult,
    runLog: runLogResult,
    payload
  });
}

async function handleStripeCheckoutRequest(request, env) {
  const payload = await readJsonBody(request);
  const checkout = await createStripeCheckoutSession(env, payload, request);
  return createJsonResponse(checkout, 200, createCorsHeaders());
}

async function handleStripeWebhookRequest(request, env) {
  const debugResponse = createStripeWebhookDebugFailureResponse(new URL(request.url));
  if (debugResponse) {
    return debugResponse;
  }

  const debugHeaders = {
    "X-Webhook-Debug": "WEBHOOK_DEBUG_V3"
  };
  console.error("WEBHOOK_DEBUG_V3 top of webhook reached");
  console.log("WEBHOOK_DEBUG_V2 reached");
  const rawBody = await request.text();
  await verifyStripeSignature(request, rawBody, env);

  const event = JSON.parse(rawBody || "{}");
  const extractedUserId = String(getStripeWebhookEventUserId(event) || "");
  console.log("stripe.webhook.event", event.type || "unknown");
  console.log("stripe.webhook.user_id", extractedUserId);
  let result;

  try {
    result = await handleStripeWebhookEvent(event, env);
  } catch (error) {
    console.error("stripe.webhook.write.after", JSON.stringify({
      event_type: event.type || "unknown",
      user_id: extractedUserId,
      target_table: STRIPE_SUBSCRIPTIONS_TABLE,
      supabase: {
        status: "error",
        error: String(error?.message || error || "supabase_write_failed"),
        data: null
      }
    }));
    throw createHttpError(String(error?.message || error || "supabase_write_failed"), error?.status || 500);
  }

  await recordRevenueEvent(env, event.type || "unknown", result.action || "ignored", {
    tier: normalizePlan(event?.data?.object?.metadata?.tier),
    user_id: extractedUserId || null,
    stripe_customer_id: event?.data?.object?.customer || null,
    stripe_subscription_id: event?.data?.object?.subscription || event?.data?.object?.id || null
  }).catch(() => null);

  logEvent("info", "stripe.webhook.processed", {
    type: event.type || "unknown",
    action: result.action,
    userId: maskIdentifier(result.row?.user_id || extractedUserId),
    customerId: maskIdentifier(result.row?.stripe_customer_id || event.data?.object?.customer),
    subscriptionId: maskIdentifier(result.row?.stripe_subscription_id || event.data?.object?.id || event.data?.object?.subscription)
  });

  return createJsonResponse(
    {
      ok: true,
      received: true,
      type: event.type || "unknown",
      action: result.action
    },
    200,
    {
      ...createCorsHeaders(),
      ...debugHeaders
    }
  );
}

async function runBackendJob(job, env, runId, baseUrlOverride = "") {
  const backendBaseUrl = normalizeBaseUrl(baseUrlOverride || env.BACKEND_BASE_URL);
  if (!backendBaseUrl) {
    throw new Error("BACKEND_BASE_URL is required.");
  }

  const timeoutMs = Number(env.CRON_REQUEST_TIMEOUT_MS || DEFAULT_REQUEST_TIMEOUT_MS);
  const url = new URL(job.path, `${backendBaseUrl}/`);
  const startedAt = Date.now();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(`timeout:${job.key}`), timeoutMs);

  try {
    logEvent("info", "cron.job.start", { runId, job: job.key, url: url.toString() });

    const response = await fetch(url, {
      method: "POST",
      signal: controller.signal,
      headers: {
        "content-type": "application/json",
        ...(env.CRON_AUTH_TOKEN ? { authorization: `Bearer ${env.CRON_AUTH_TOKEN}` } : {}),
        "x-archaios-cron-job": job.key,
        "x-archaios-cron-run-id": runId
      },
      body: JSON.stringify({
        job: job.key,
        runId,
        trigger: "scheduled"
      })
    });

    const responseText = await response.text();
    const durationMs = Date.now() - startedAt;

    if (!response.ok) {
      throw new Error(`http_${response.status}:${responseText.slice(0, 400)}`);
    }

    logEvent("info", "cron.job.success", {
      runId,
      job: job.key,
      status: response.status,
      durationMs
    });

    return {
      ok: true,
      job: job.key,
      status: response.status,
      durationMs,
      body: responseText.slice(0, 400)
    };
  } catch (error) {
    const durationMs = Date.now() - startedAt;
    const message = String(error?.message || error || "cron_job_failed");

    logEvent("error", "cron.job.failure", {
      runId,
      job: job.key,
      durationMs,
      message
    });

    return {
      ok: false,
      job: job.key,
      durationMs,
      error: message
    };
  } finally {
    clearTimeout(timeoutId);
  }
}

async function runDailyAutomation(env, trigger = "scheduled", selectedJobKey = "", baseUrlOverride = "") {
  const runId = crypto.randomUUID();
  const jobs = buildJobDefinitions(env).filter((job) => !selectedJobKey || job.key === selectedJobKey);

  if (!jobs.length) {
    throw new Error(`Unknown cron job: ${selectedJobKey}`);
  }

  logEvent("info", "cron.run.start", {
    runId,
    trigger,
    jobs: jobs.map((job) => job.key)
  });

  const results = [];
  for (const job of jobs) {
    results.push(await runBackendJob(job, env, runId, baseUrlOverride));
  }

  const failedJobs = results.filter((result) => !result.ok);
  const summary = {
    ok: failedJobs.length === 0,
    trigger,
    runId,
    startedAt: new Date().toISOString(),
    jobCount: jobs.length,
    failures: failedJobs.length,
    results
  };

  if (failedJobs.length > 0) {
    logEvent("error", "cron.run.failure", {
      runId,
      failures: failedJobs.map((job) => job.job)
    });
    throw new Error(JSON.stringify(summary));
  }

  logEvent("info", "cron.run.success", {
    runId,
    jobs: jobs.map((job) => job.key)
  });
  return summary;
}

export default {
  async fetch(request, env, ctx) {
    if (request.url.includes('/api/stripe/webhook') && request.url.includes('debug_fail=1')) {
      return new Response('WEBHOOK_DEBUG_V3_FAIL', {
        status: 500,
        headers: { 'X-Webhook-Debug': 'WEBHOOK_DEBUG_V3' }
      });
    }

    const url = new URL(request.url);
    const corsHeaders = createCorsHeaders();

    if (request.method === "OPTIONS") {
      return createOptionsResponse();
    }

    if (request.method === "GET" && (url.pathname === "/health" || url.pathname === "/api/health")) {
      return createJsonResponse(buildHealthPayload(env), 200, corsHeaders);
    }

    if (request.method === "GET" && url.pathname === "/api/subscription") {
      try {
        return await handleSubscriptionRequest(request, env);
      } catch (error) {
        return createJsonResponse({ ok: false, error: String(error?.message || error || "subscription_failed") }, Number(error?.status || 500), corsHeaders);
      }
    }

    if (request.method === "GET" && url.pathname === "/api/platform/dashboard") {
      try {
        return await handlePlatformDashboardRequest(request, env);
      } catch (error) {
        return createJsonResponse({ ok: false, error: String(error?.message || error || "platform_dashboard_failed") }, Number(error?.status || 500), corsHeaders);
      }
    }

    if (request.method === "GET" && url.pathname === "/api/alerts") {
      try {
        return await handleAlertsRequest(request, env);
      } catch (error) {
        return createJsonResponse({ ok: false, error: String(error?.message || error || "alerts_failed") }, Number(error?.status || 500), corsHeaders);
      }
    }

    if (request.method === "DELETE" && url.pathname === "/api/alerts") {
      try {
        return await handleClearAlertsRequest(request, env);
      } catch (error) {
        return createJsonResponse({ ok: false, error: String(error?.message || error || "alerts_clear_failed") }, Number(error?.status || 500), corsHeaders);
      }
    }

    if (request.method === "POST" && url.pathname === "/api/leads") {
      try {
        return await handleLeadRequest(request, env);
      } catch (error) {
        return createJsonResponse({ ok: false, error: String(error?.message || error || "lead_capture_failed") }, Number(error?.status || 500), corsHeaders);
      }
    }

    if (request.method === "POST" && url.pathname === "/api/cta-click") {
      try {
        return await handleCtaClickRequest(request, env);
      } catch (error) {
        return createJsonResponse({ ok: false, error: String(error?.message || error || "cta_click_failed") }, Number(error?.status || 500), corsHeaders);
      }
    }

    if (request.method === "GET" && url.pathname === "/api/pricing") {
      return createJsonResponse({ ok: true, pricing: PRICING_TIERS }, 200, corsHeaders);
    }

    if (request.method === "GET" && url.pathname === "/api/admin/dashboard") {
      try {
        return await handleAdminDashboardRequest(request, env);
      } catch (error) {
        return createJsonResponse({ ok: false, error: String(error?.message || error || "admin_dashboard_failed") }, Number(error?.status || 500), corsHeaders);
      }
    }

    if (
      request.method === "POST" &&
      (url.pathname === "/api/stripe/create-checkout-session" || url.pathname === "/api/stripe/checkout")
    ) {
      try {
        return await handleStripeCheckoutRequest(request, env);
      } catch (error) {
        return createJsonResponse(
          {
            ok: false,
            error: String(error?.message || error || "stripe_checkout_failed")
          },
          500,
          corsHeaders
        );
      }
    }

    if (
      request.method === "POST" &&
      ["/api/stripe/customer_portal", "/api/stripe/customer-portal", "/api/stripe/portal"].includes(url.pathname)
    ) {
      try {
        const payload = await readJsonBody(request);
        const portal = await createStripeBillingPortalSession(env, payload, request);
        return createJsonResponse(portal, 200, corsHeaders);
      } catch (error) {
        return createJsonResponse(
          {
            ok: false,
            error: String(error?.message || error || "stripe_customer_portal_failed")
          },
          Number(error?.status || 500),
          corsHeaders
        );
      }
    }

    if (request.method === "POST" && url.pathname === "/api/stripe/webhook") {
      const debugResponse = createStripeWebhookDebugFailureResponse(url);
      if (debugResponse) {
        return debugResponse;
      }

      try {
        return await handleStripeWebhookRequest(request, env);
      } catch (error) {
        logEvent("error", "stripe.webhook.failed", {
          message: String(error?.message || error || "stripe_webhook_failed")
        });

        return createJsonResponse(
          {
            ok: false,
            error: String(error?.message || error || "stripe_webhook_failed")
          },
          Number(error?.status || 400),
          corsHeaders
        );
      }
    }

    if (request.method === "POST" && url.pathname === (env.DASHBOARD_SIGNALS_PATH || DEFAULT_DASHBOARD_SIGNALS_PATH)) {
      return handleCronEndpoint({
        request,
        env,
        jobKey: "dashboard-signals",
        generatePayload: buildDashboardSignalsPayload,
        persistPayload: persistDashboardSignals
      });
    }

    if (request.method === "POST" && url.pathname === (env.ACTIVITY_FEED_PATH || DEFAULT_ACTIVITY_FEED_PATH)) {
      return handleCronEndpoint({
        request,
        env,
        jobKey: "activity-feed",
        generatePayload: buildActivityFeedPayload,
        persistPayload: persistActivityFeed
      });
    }

    if (request.method === "POST" && url.pathname === (env.METRICS_SNAPSHOTS_PATH || DEFAULT_METRICS_SNAPSHOTS_PATH)) {
      return handleCronEndpoint({
        request,
        env,
        jobKey: "metrics-snapshots",
        generatePayload: buildMetricsSnapshotPayload,
        persistPayload: persistMetricsSnapshot
      });
    }

    if (request.method === "POST" && url.pathname === "/__scheduled") {
      try {
        const selectedJobKey = url.searchParams.get("job") || "";
        const summary = await runDailyAutomation(env, "manual", selectedJobKey, url.origin);
        return createJsonResponse(summary, 200, corsHeaders);
      } catch (error) {
        return createJsonResponse(
          {
            ok: false,
            trigger: "manual",
            error: String(error?.message || error || "manual_cron_failed")
          },
          500,
          corsHeaders
        );
      }
    }

    return createJsonResponse({ ok: false, error: "not_found" }, 404, corsHeaders);
  },

  async scheduled(controller, env, ctx) {
    ctx.waitUntil(runDailyAutomation(env, "scheduled", ""));
  }
};
