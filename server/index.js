import "dotenv/config";
import express from "express";
import http from "http";
import cors from "cors";
import { Server } from "socket.io";
import { config } from "./lib/config.js";
import { getAuthenticatedUser, getCurrentSubscription, getUserTier } from "./lib/auth.js";
import { supabaseAdmin } from "./lib/supabase.js";
import { createCheckoutForUser, createCustomerPortalSessionForUser, handleStripeWebhookEvent } from "./lib/stripe.js";
import { buildAgentEndpointPayload, buildPlatformDashboard } from "./lib/platformEngine.js";
import { getGrowthMetrics, recordCtaClick, recordLead } from "./lib/engagementStore.js";
import { appendStripeEventLog } from "./lib/stripeEventLog.js";
import { PRICING_TIERS } from "../shared/pricing.js";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});

app.use(cors({ origin: config.frontendUrl || true }));

app.use((request, _response, next) => {
  console.info(`[api] ${request.method} ${request.path}`);
  next();
});

function sendError(response, status, error, extra = {}) {
  const message = String(error?.message || error || "unknown_error");
  console.error(`[api:error] ${status} ${message}`);
  return response.status(status).json({
    ok: false,
    error: message,
    ...extra
  });
}

app.post("/api/stripe/webhook", express.raw({ type: "application/json" }), async (request, res) => {
  try {
    const signature = request.headers["stripe-signature"];
    const event = await handleStripeWebhookEvent(request.body, signature);
    return res.json({ received: true, type: event.type });
  } catch (error) {
    await appendStripeEventLog({
      source: "webhook",
      eventType: "webhook.error",
      status: "failed",
      message: String(error?.message || error || "Invalid Stripe webhook")
    }).catch(() => null);
    const status = String(error?.message || error).includes("Missing Stripe") ? 503 : 400;
    return sendError(res, status, error);
  }
});

app.use(express.json());

app.get("/api/stripe/config", (_request, res) => {
  return res.json({
    ok: true,
    publishableKey: config.stripePublishableKey || null,
    configured: Boolean(config.stripeSecretKey && config.stripeWebhookSecret)
  });
});

function filterAlertsForTier(alerts, tier) {
  if (tier === "elite") {
    return [...alerts].sort((left, right) => {
      const weight = { high: 3, medium: 2, normal: 1 };
      return weight[right.severity] - weight[left.severity];
    });
  }

  if (tier === "pro") {
    return alerts;
  }

  return alerts.filter((alert) => alert.severity !== "high").slice(0, 10);
}

io.on("connection", (socket) => {
  console.log("Agent connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("Agent disconnected:", socket.id);
  });
});

app.get("/", (_, res) => {
  res.send("AI Assassins Backend Live");
});

app.get("/api/health", (_request, res) => {
  return res.json({
    ok: true,
    status: "healthy",
    service: "archaios-api"
  });
});

app.get("/api/subscription", async (request, res) => {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return sendError(res, 401, "Unauthorized");
    }

    const subscription = await getCurrentSubscription(user.id);
    const tier = await getUserTier(user.id);
    return res.json({
      user: {
        id: user.id,
        email: user.email
      },
      tier,
      status: subscription?.status || "free",
      paid: tier === "pro" || tier === "elite",
      prioritySignals: tier === "elite",
      currentPeriodEnd: subscription?.current_period_end || null,
      stripeCustomerId: subscription?.stripe_customer_id || null,
      stripeSubscriptionId: subscription?.stripe_subscription_id || null
    });
  } catch (error) {
    return sendError(res, 500, error);
  }
});

app.get("/api/alerts", async (request, res) => {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return sendError(res, 401, "Unauthorized");
    }
    if (!supabaseAdmin) {
      return sendError(res, 500, "Missing Supabase admin configuration");
    }

    const tier = await getUserTier(user.id);
    const { data, error } = await supabaseAdmin
      .from("alerts")
      .select("id,type,severity,message,timestamp")
      .eq("user_id", user.id)
      .order("timestamp", { ascending: false })
      .limit(100);

    if (error) {
      return sendError(res, 500, error.message);
    }

    const alerts = filterAlertsForTier(data || [], tier);

    return res.json({
      tier,
      paid: tier === "pro" || tier === "elite",
      prioritySignals: tier === "elite",
      alerts
    });
  } catch (error) {
    return sendError(res, 500, error);
  }
});

app.delete("/api/alerts", async (request, res) => {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return sendError(res, 401, "Unauthorized");
    }
    if (!supabaseAdmin) {
      return sendError(res, 500, "Missing Supabase admin configuration");
    }

    const { error } = await supabaseAdmin.from("alerts").delete().eq("user_id", user.id);
    if (error) {
      return sendError(res, 500, error.message);
    }

    return res.json({ ok: true, cleared: true });
  } catch (error) {
    return sendError(res, 500, error);
  }
});

app.post("/api/stripe/checkout", async (request, res) => {
  try {
    // TODO(stripe): Enable live checkout once STRIPE_SECRET_KEY and price ids are populated.
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return sendError(res, 401, "Unauthorized");
    }

    const requestedTier = String(request.body?.tier || "pro").toLowerCase();
    const tier = requestedTier === "elite" ? "elite" : "pro";
    const session = await createCheckoutForUser(user, tier);

    return res.json({ url: session.url, tier });
  } catch (error) {
    const status = String(error?.message || error).includes("Missing Stripe") ? 503 : 500;
    return sendError(res, status, error);
  }
});

async function handleCustomerPortalRequest(request, res) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return sendError(res, 401, "Unauthorized");
    }

    const returnUrl =
      typeof request.body?.returnUrl === "string" && request.body.returnUrl.trim()
        ? request.body.returnUrl.trim()
        : config.frontendUrl;

    const session = await createCustomerPortalSessionForUser(user.id, returnUrl);
    return res.json({
      ok: true,
      url: session.url
    });
  } catch (error) {
    const message = String(error?.message || error || "");
    if (message.includes("No Stripe customer found")) {
      return sendError(res, 404, error);
    }

    const status = message.includes("Missing Stripe") ? 503 : 500;
    return sendError(res, status, error);
  }
}

app.post("/api/stripe/customer_portal", handleCustomerPortalRequest);
app.post("/api/stripe/customer-portal", handleCustomerPortalRequest);

app.post("/api/leads", async (request, res) => {
  try {
    const email = String(request.body?.email || "").trim().toLowerCase();
    const source = String(request.body?.source || "dashboard");

    if (!email || !email.includes("@")) {
      return sendError(res, 400, "Valid email required");
    }

    const result = await recordLead({ email, source });

    return res.json({ ok: true, stored: true, email, via: result.source });
  } catch (error) {
    return sendError(res, 500, error);
  }
});

app.post("/api/cta-click", async (request, res) => {
  try {
    const cta = String(request.body?.cta || "").trim();
    const location = String(request.body?.location || "dashboard").trim();
    const tier = String(request.body?.tier || "free").trim();

    if (!cta) {
      return sendError(res, 400, "CTA label required");
    }

    const result = await recordCtaClick({ cta, location, tier });
    return res.json({ ok: true, stored: true, via: result.source, cta, location, tier });
  } catch (error) {
    return sendError(res, 500, error);
  }
});

app.get("/api/platform/dashboard", async (request, res) => {
  try {
    const user = await getAuthenticatedUser(request).catch(() => null);
    const tier = user?.id ? await getUserTier(user.id) : "free";
    const growthMetrics = await getGrowthMetrics();
    const payload = await buildPlatformDashboard(user, tier, growthMetrics);
    return res.json(payload);
  } catch (error) {
    return sendError(res, 500, error);
  }
});

app.get("/api/pricing", (_request, res) => {
  res.setHeader("Cache-Control", "public, max-age=300, s-maxage=300");
  return res.json({
    ok: true,
    pricing: PRICING_TIERS
  });
});

app.get("/api/platform/feed", async (request, res) => {
  try {
    const user = await getAuthenticatedUser(request).catch(() => null);
    const tier = user?.id ? await getUserTier(user.id) : "free";
    const payload = await buildPlatformDashboard(user, tier);
    return res.json({
      generatedAt: payload.generatedAt,
      activityFeed: payload.activityFeed
    });
  } catch (error) {
    return sendError(res, 500, error);
  }
});

app.get("/api/agents", async (request, res) => {
  try {
    const user = await getAuthenticatedUser(request).catch(() => null);
    const tier = user?.id ? await getUserTier(user.id) : "free";
    return res.json({
      generatedAt: new Date().toISOString(),
      ...buildAgentEndpointPayload(tier)
    });
  } catch (error) {
    return sendError(res, 500, error);
  }
});

app.get("/api/agents/:agentId", async (request, res) => {
  try {
    const user = await getAuthenticatedUser(request).catch(() => null);
    const tier = user?.id ? await getUserTier(user.id) : "free";
    const payload = buildAgentEndpointPayload(tier);
    const agent = payload[String(request.params.agentId || "").toLowerCase()];

    if (!agent) {
      return sendError(res, 404, "Agent not found");
    }

    return res.json({
      generatedAt: new Date().toISOString(),
      agent
    });
  } catch (error) {
    return sendError(res, 500, error);
  }
});

server.listen(config.port, config.host, () => {
  console.log(`AIA Server running on http://${config.host}:${config.port}`);
});
