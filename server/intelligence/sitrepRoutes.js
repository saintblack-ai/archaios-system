import express from "express";
import { getAuthenticatedUser, getUserTier, isEliteTier } from "../lib/auth.js";
import { generateCommanderBrief } from "./commander.js";
import { getThreatLevel } from "./eventSchema.js";
import { buildSitrepHealth } from "./health.js";
import { getSourceHealth, refreshSitrepSources } from "./ingestEvents.js";
import { createResearchMission, getEventById, getLatestReport, listEvents, listResearchMissions } from "./store.js";

export const sitrepRouter = express.Router();

function correlationId(request) {
  return request.headers["x-correlation-id"] || `sitrep-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function setStandardHeaders(request, response, cache = "private, max-age=30, stale-while-revalidate=120") {
  response.setHeader("Cache-Control", cache);
  response.setHeader("X-Correlation-Id", request.correlationId);
}

function parseFilters(query) {
  return {
    category: query.category || null,
    severity: query.severity || null,
    source: query.source || null,
    since: query.since || null,
    until: query.until || null,
    verifiedOnly: query.verifiedOnly === "true" || query.verified_only === "true",
    page: Number(query.page || 1),
    limit: Number(query.limit || 50)
  };
}

function sendRouteError(response, status, error, request) {
  return response.status(status).json({
    ok: false,
    error: String(error?.message || error || "sitrep_error"),
    correlation_id: request.correlationId
  });
}

async function requireRefreshAccess(request, response) {
  const internalToken = process.env.SITREP_REFRESH_TOKEN || process.env.AUTH_TOKEN || "";
  const provided = request.headers["x-sitrep-refresh-token"];
  if (internalToken && provided === internalToken) {
    return { mode: "internal-token" };
  }

  const user = await getAuthenticatedUser(request).catch(() => null);
  if (!user) {
    sendRouteError(response, 401, "Unauthorized", request);
    return null;
  }

  const tier = await getUserTier(user.id);
  if (!isEliteTier(tier)) {
    sendRouteError(response, 403, "Elite access required for refresh operations", request);
    return null;
  }

  return { mode: "user", user, tier };
}

sitrepRouter.use((request, response, next) => {
  request.correlationId = correlationId(request);
  response.setHeader("X-Correlation-Id", request.correlationId);
  next();
});

sitrepRouter.get("/latest", async (request, response) => {
  try {
    setStandardHeaders(request, response);
    const { events, total, via } = await listEvents({ limit: 50 });
    const health = await buildSitrepHealth();
    const latestReport = (await getLatestReport()) || (await generateCommanderBrief(events, health));
    return response.json({
      ok: true,
      correlation_id: request.correlationId,
      generated_at: new Date().toISOString(),
      data_status: via === "supabase" ? "stored" : "sample_or_memory",
      global_threat_level: getThreatLevel(events),
      total_events: total,
      events,
      commander_brief: latestReport,
      health
    });
  } catch (error) {
    return sendRouteError(response, 500, error, request);
  }
});

sitrepRouter.get("/events", async (request, response) => {
  try {
    setStandardHeaders(request, response);
    const result = await listEvents(parseFilters(request.query));
    return response.json({ ok: true, correlation_id: request.correlationId, ...result });
  } catch (error) {
    return sendRouteError(response, 500, error, request);
  }
});

sitrepRouter.get("/events/:id", async (request, response) => {
  try {
    setStandardHeaders(request, response);
    const { event, via } = await getEventById(request.params.id);
    if (!event) return sendRouteError(response, 404, "Event not found", request);
    return response.json({ ok: true, correlation_id: request.correlationId, event, via });
  } catch (error) {
    return sendRouteError(response, 500, error, request);
  }
});

sitrepRouter.get("/sources", async (request, response) => {
  try {
    setStandardHeaders(request, response, "private, max-age=60, stale-while-revalidate=300");
    return response.json({ ok: true, correlation_id: request.correlationId, sources: await getSourceHealth() });
  } catch (error) {
    return sendRouteError(response, 500, error, request);
  }
});

sitrepRouter.get("/health", async (request, response) => {
  try {
    setStandardHeaders(request, response, "private, max-age=30");
    return response.json({ ok: true, correlation_id: request.correlationId, health: await buildSitrepHealth() });
  } catch (error) {
    return sendRouteError(response, 500, error, request);
  }
});

sitrepRouter.get("/map", async (request, response) => {
  try {
    setStandardHeaders(request, response);
    const result = await listEvents(parseFilters(request.query));
    const events = result.events.filter((event) => Number.isFinite(Number(event.latitude)) && Number.isFinite(Number(event.longitude)));
    return response.json({
      ok: true,
      correlation_id: request.correlationId,
      events,
      total: events.length,
      via: result.via
    });
  } catch (error) {
    return sendRouteError(response, 500, error, request);
  }
});

sitrepRouter.get("/research", async (request, response) => {
  try {
    setStandardHeaders(request, response);
    return response.json({
      ok: true,
      correlation_id: request.correlationId,
      missions: await listResearchMissions()
    });
  } catch (error) {
    return sendRouteError(response, 500, error, request);
  }
});

sitrepRouter.post("/research", async (request, response) => {
  try {
    const access = await requireRefreshAccess(request, response);
    if (!access) return null;
    setStandardHeaders(request, response, "no-store");
    const mission = await createResearchMission(request.body || {});
    return response.status(201).json({ ok: true, correlation_id: request.correlationId, mission });
  } catch (error) {
    return sendRouteError(response, 500, error, request);
  }
});

sitrepRouter.post("/refresh", async (request, response) => {
  try {
    const access = await requireRefreshAccess(request, response);
    if (!access) return null;
    setStandardHeaders(request, response, "no-store");
    const result = await refreshSitrepSources({
      sourceKeys: Array.isArray(request.body?.sources) ? request.body.sources : undefined,
      supabaseConfigured: Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY)
    });
    const health = await buildSitrepHealth();
    const brief = await generateCommanderBrief(result.events, health);
    return response.json({
      ok: true,
      correlation_id: request.correlationId,
      refreshed_at: result.refreshed_at,
      event_count: result.events.length,
      runs: result.runs,
      commander_brief: brief
    });
  } catch (error) {
    return sendRouteError(response, 500, error, request);
  }
});
