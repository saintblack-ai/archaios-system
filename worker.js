import { intelligenceAgent, getIntelligenceTopics, buildIntelligencePrompt } from "./agents/intelligence_agent.js";
import { contentAgent, buildContentPrompt } from "./agents/content_agent.js";
import { marketingAgent, buildMarketingPrompt } from "./agents/marketing_agent.js";
import { revenueAgent, buildRevenuePrompt } from "./agents/revenue_agent.js";
import { buildDistributionPrompt } from "./agents/distribution_agent.js";
import { buildFeedbackPrompt } from "./agents/feedback_agent.js";
import { buildOptimizationPrompt } from "./agents/optimization_agent.js";
import { PRICING_TIERS } from "./shared/pricing.js";

const DEFAULT_OPENAI_MODEL = "gpt-4o-mini";
const DEFAULT_WORKER_BASE_URL = "https://archaios-saas-worker.quandrix357.workers.dev";
const DEFAULT_FRONTEND_URL = "https://saintblack-ai.github.io/ai-assassins-client";
const corsHeaders = {
  "Access-Control-Allow-Origin": "https://saintblack-ai.github.io",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  Vary: "Origin"
};
const BRIEF_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["title", "summary", "content"],
  properties: {
    title: { type: "string" },
    summary: { type: "string" },
    content: { type: "string" }
  }
};
const MARKET_INTEL_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["headline", "opportunity", "threat", "recommendation"],
  properties: {
    headline: { type: "string" },
    opportunity: { type: "string" },
    threat: { type: "string" },
    recommendation: { type: "string" }
  }
};
const MARKETING_CHANNELS = ["x", "linkedin", "email"];
const DEFAULT_OPTIMIZATION_PROFILE = {
  topic_selection: "ai workflow automation",
  content_style: "operator-focused and tactical",
  posting_schedule: {
    x: "09:00",
    linkedin: "11:00",
    email: "14:00"
  }
};

const AGENTS = [
  {
    name: intelligenceAgent.name,
    schedule: "daily",
    description: intelligenceAgent.description,
    run: runIntelligenceAgent
  },
  {
    name: contentAgent.name,
    schedule: "daily",
    description: contentAgent.description,
    run: runSelfImprovingContentAgent
  },
  {
    name: marketingAgent.name,
    schedule: "daily",
    description: marketingAgent.description,
    run: runMarketingAgent
  },
  {
    name: revenueAgent.name,
    schedule: "daily",
    description: revenueAgent.description,
    run: runRevenueAgent
  }
];

const DASHBOARD_AGENT_CARDS = [
  {
    id: "content-agent",
    name: "Content Agent",
    summary: "Generates platform-ready post sequences for daily publishing.",
    output: "Prepared campaign-ready organic content aligned to current signals.",
    metricLabel: "Posts queued",
    metricValue: "9",
    status: "active",
    minTier: "free"
  },
  {
    id: "marketing-agent",
    name: "Marketing Agent",
    summary: "Builds campaigns, captions, hooks, and channel messaging.",
    output: "Queued revenue-weighted messaging for upgrade conversion surfaces.",
    metricLabel: "Campaigns live",
    metricValue: "4",
    status: "active",
    minTier: "free"
  },
  {
    id: "traffic-agent",
    name: "Traffic Agent",
    summary: "Recommends social routing, channel pressure, and CTA strategy.",
    output: "Shifted emphasis toward the highest-intent traffic sources.",
    metricLabel: "Traffic moves",
    metricValue: "3",
    status: "active",
    minTier: "free"
  },
  {
    id: "intelligence-agent",
    name: "Intelligence Agent",
    summary: "Produces the daily intelligence briefing and signal digest.",
    output: "Published the current operational brief and premium signal summary.",
    metricLabel: "Briefs delivered",
    metricValue: "1",
    status: "priority",
    minTier: "pro"
  },
  {
    id: "conversion-agent",
    name: "Conversion Agent",
    summary: "Improves upgrade messaging, CTA framing, and page conversion language.",
    output: "Adjusted upgrade copy around urgency, access, and premium visibility.",
    metricLabel: "Experiments",
    metricValue: "6",
    status: "active",
    minTier: "pro"
  },
  {
    id: "analytics-agent",
    name: "Analytics Agent",
    summary: "Tracks engagement, revenue momentum, and monetization performance.",
    output: "Monitoring upgrade intent and subscription quality across premium users.",
    metricLabel: "Revenue signals",
    metricValue: "12",
    status: "watching",
    minTier: "elite"
  }
];

export default {
  async fetch(request, env, ctx) {
    try {
      const url = new URL(request.url);
      const respond = (response) => withCors(response);
      const pathname = normalizeRoutePath(url.pathname);

      if (request.method === "OPTIONS") {
        console.log("CORS enabled:", env.WORKER_BASE_URL || DEFAULT_WORKER_BASE_URL);
        return new Response(null, { status: 204, headers: corsHeaders });
      }

      if (isBriefRoute(pathname) && request.method === "GET") {
        return respond(json({ ok: true, route: "brief" }));
      }

      if (request.method === "GET" && pathname === "/api/health") {
        return respond(json({ ok: true }));
      }

      if (request.method === "GET" && pathname === "/api/pricing") {
        return respond(
          json(
            {
              ok: true,
              pricing: PRICING_TIERS
            },
            200,
            {
              "Cache-Control": "public, max-age=300, s-maxage=300"
            }
          )
        );
      }

      if (request.method === "POST" && pathname === "/api/stripe/webhook") {
        try {
          const signature = request.headers.get("stripe-signature");
          const rawBody = await request.text();
          const event = await handleStripeWebhookEvent(env, rawBody, signature);
          return respond(json({ received: true, type: event.type }));
        } catch (error) {
          const message = String(error?.message || error || "Invalid Stripe webhook");
          const status = message.includes("Missing Stripe webhook secret") ? 503 : 400;
          return respond(json({ ok: false, error: message }, status));
        }
      }

      if (request.method === "GET" && pathname === "/api/subscription") {
        const user = await getAuthenticatedSupabaseUser(request, env);
        if (!user) {
          return respond(json({ ok: false, error: "Unauthorized" }, 401));
        }

        const subscription = await getCurrentSubscription(env, user.id);
        const tier = resolveSubscriptionTier(subscription);
        return respond(
          json({
            user: {
              id: user.id,
              email: user.email || null
            },
            tier,
            status: subscription?.status || "free",
            paid: hasPaidAccess(tier),
            prioritySignals: isEliteTier(tier),
            currentPeriodEnd: subscription?.current_period_end || null,
            stripeCustomerId: subscription?.stripe_customer_id || null,
            stripeSubscriptionId: subscription?.stripe_subscription_id || null
          })
        );
      }

      if (request.method === "GET" && pathname === "/api/alerts") {
        const user = await getAuthenticatedSupabaseUser(request, env);
        if (!user) {
          return respond(json({ ok: false, error: "Unauthorized" }, 401));
        }

        const tier = await getUserTier(env, user.id);
        const alerts = await getUserAlerts(env, user.id);
        return respond(
          json({
            tier,
            paid: hasPaidAccess(tier),
            prioritySignals: isEliteTier(tier),
            alerts
          })
        );
      }

      if (request.method === "DELETE" && pathname === "/api/alerts") {
        const user = await getAuthenticatedSupabaseUser(request, env);
        if (!user) {
          return respond(json({ ok: false, error: "Unauthorized" }, 401));
        }

        await clearUserAlerts(env, user.id);
        return respond(json({ ok: true, cleared: true }));
      }

      if (request.method === "POST" && pathname === "/api/stripe/checkout") {
        const user = await getAuthenticatedSupabaseUser(request, env);
        if (!user) {
          return respond(json({ ok: false, error: "Unauthorized" }, 401));
        }

        const body = await request.json().catch(() => null);
        const tier = normalizeCheckoutTier(body?.tier);
        const session = await createStripeCheckoutSession(env, user, tier, {
          successUrl: body?.successUrl,
          cancelUrl: body?.cancelUrl
        });
        return respond(json({ url: session.url, tier }));
      }

      if (request.method === "POST" && pathname === "/api/leads") {
        const body = await request.json().catch(() => null);
        const email = String(body?.email || "").trim().toLowerCase();
        const source = String(body?.source || "dashboard").trim() || "dashboard";

        if (!email || !email.includes("@")) {
          return respond(json({ ok: false, error: "Valid email required" }, 400));
        }

        const result = await recordLead(env, { email, source });
        return respond(json({ ok: true, stored: true, email, via: result.source }));
      }

      if (request.method === "POST" && pathname === "/api/cta-click") {
        const body = await request.json().catch(() => null);
        const cta = String(body?.cta || "").trim();
        const location = String(body?.location || "dashboard").trim() || "dashboard";
        const tier = normalizeTier(body?.tier || "free");

        if (!cta) {
          return respond(json({ ok: false, error: "CTA label required" }, 400));
        }

        const result = await recordCtaClick(env, { cta, location, tier });
        return respond(json({ ok: true, stored: true, via: result.source, cta, location, tier }));
      }

      if (request.method === "GET" && pathname === "/api/platform/dashboard") {
        const user = await getAuthenticatedSupabaseUser(request, env);
        const tier = user?.id ? await getUserTier(env, user.id) : "free";
        return respond(json(await buildPlatformDashboardPayload(env, user, tier)));
      }

      if (request.method === "GET" && pathname === "/api/admin/dashboard") {
        const user = await getAuthenticatedSupabaseUser(request, env);
        if (!user) {
          return respond(json({ ok: false, error: "Unauthorized" }, 401));
        }

        const adminEmail = String(env.ADMIN_EMAIL || "").trim().toLowerCase();
        if (!adminEmail || String(user.email || "").trim().toLowerCase() !== adminEmail) {
          return respond(json({ ok: false, error: "Forbidden" }, 403));
        }

        return respond(json(await buildAdminDashboardPayload(env)));
      }

      if (request.method === "GET" && pathname === "/api/agents/status") {
        assertCoreEnv(env);
        await syncAgentRegistry(env);
        return respond(json({
          ok: true,
          agents: await getAgentStatuses(env)
        }));
      }

      if (request.method === "POST" && pathname === "/api/agents/intelligence") {
        assertCoreEnv(env);
        const authError = validateAuth(request, env.AUTH_TOKEN);
        if (authError) {
          return respond(json({ ok: false, error: authError }, 401));
        }
        const result = await executeAgent(env, getAgent("intelligence_agent"), {
          trigger: "manual_intelligence",
          scheduledTag: "manual"
        });
        return respond(json({ ok: true, result }));
      }

      if (request.method === "POST" && pathname === "/api/agents/content") {
        assertCoreEnv(env);
        const authError = validateAuth(request, env.AUTH_TOKEN);
        if (authError) {
          return respond(json({ ok: false, error: authError }, 401));
        }
        const result = await executeAgent(env, getAgent("content_agent"), {
          trigger: "manual_content",
          scheduledTag: "manual"
        });
        return respond(json({ ok: true, result }));
      }

      if (request.method === "POST" && pathname === "/api/agents/marketing") {
        assertCoreEnv(env);
        const authError = validateAuth(request, env.AUTH_TOKEN);
        if (authError) {
          return respond(json({ ok: false, error: authError }, 401));
        }
        const result = await executeAgent(env, getAgent("marketing_agent"), {
          trigger: "manual_marketing",
          scheduledTag: "manual"
        });
        return respond(json({ ok: true, result }));
      }

      if (request.method === "POST" && pathname === "/api/agents/revenue") {
        assertCoreEnv(env);
        const authError = validateAuth(request, env.AUTH_TOKEN);
        if (authError) {
          return respond(json({ ok: false, error: authError }, 401));
        }
        const result = await executeAgent(env, getAgent("revenue_agent"), {
          trigger: "manual_revenue",
          scheduledTag: "manual"
        });
        return respond(json({ ok: true, result }));
      }

      if (request.method === "GET" && pathname === "/api/marketing/drafts") {
        assertCoreEnv(env);
        const authError = validateAuth(request, env.AUTH_TOKEN);
        if (authError) {
          return respond(json({ ok: false, error: authError }, 401));
        }

        return respond(json({
          ok: true,
          drafts: await listMarketingDrafts(env, url.searchParams)
        }));
      }

      if (request.method === "POST" && pathname === "/api/marketing/plan") {
        assertCoreEnv(env);
        const authError = validateAuth(request, env.AUTH_TOKEN);
        if (authError) {
          return respond(json({ ok: false, error: authError }, 401));
        }

        const result = await generateMarketingPlan(env, {
          trigger: "manual"
        });
        return respond(json({ ok: true, result }));
      }

      if (request.method === "POST" && pathname === "/api/marketing/draft") {
        assertCoreEnv(env);
        const authError = validateAuth(request, env.AUTH_TOKEN);
        if (authError) {
          return respond(json({ ok: false, error: authError }, 401));
        }

        const body = await request.json().catch(() => null);
        const channels = normalizeMarketingChannels(body?.channels);
        const result = await generateMarketingDrafts(env, {
          trigger: "manual",
          channels,
          planDate: String(body?.date || "").trim() || null
        });
        return respond(json({ ok: true, result }));
      }

      if (request.method === "POST" && pathname === "/api/marketing/approve") {
        assertCoreEnv(env);
        const authError = validateAuth(request, env.AUTH_TOKEN);
        if (authError) {
          return respond(json({ ok: false, error: authError }, 401));
        }

        const body = await request.json().catch(() => null);
        const draftId = Number(body?.id || 0);
        if (!draftId) {
          return respond(json({ ok: false, error: "missing_draft_id" }, 400));
        }

        const result = await approveMarketingDraft(env, {
          draftId,
          scheduledFor: String(body?.scheduled_for || "").trim() || null
        });
        return respond(json({ ok: true, result }));
      }

      if (request.method === "GET" && pathname === "/api/debug/brief") {
        assertCoreEnv(env);
        const authError = validateAuth(request, env.AUTH_TOKEN);
        if (authError) {
          return respond(json({ ok: false, error: authError }, 401));
        }

        const prompt = String(url.searchParams.get("prompt") || "").trim();
        if (!prompt) {
          return respond(json({ ok: false, error: "missing_prompt" }, 400));
        }

        const debug = await debugBriefGeneration(env, prompt);
        return respond(json({ ok: true, debug }));
      }

      if (request.method === "POST" && isBriefRoute(pathname)) {
        return respond(await handleBriefRequest(request, env));
      }

      if (request.method === "POST" && pathname === "/api/agents/market-intel") {
        return respond(await handleMarketIntelRequest(request, env));
      }

      if (request.method === "GET" && pathname === "/api/agents/logs") {
        assertCoreEnv(env);
        const authError = validateAuth(request, env.AUTH_TOKEN);
        if (authError) {
          return respond(json({ ok: false, error: authError }, 401));
        }

        return respond(json({
          ok: true,
          logs: await getAgentLogs(env, url.searchParams)
        }));
      }

      if (request.method === "POST" && pathname === "/api/agents/run") {
        assertCoreEnv(env);
        const authError = validateAuth(request, env.AUTH_TOKEN);
        if (authError) {
          return respond(json({ ok: false, error: authError }, 401));
        }

        await syncAgentRegistry(env);
        const body = await request.json().catch(() => null);
        const name = String(body?.agent || "").trim();
        const agent = getAgent(name);

        if (!agent) {
          return respond(json({ ok: false, error: "Invalid agent name" }, 400));
        }

        const result = await executeAgent(env, agent, {
          trigger: "manual",
          scheduledTag: "manual"
        });

        return respond(json({ ok: true, result }));
      }

      return respond(json({ ok: false, error: "Not found" }, 404));
    } catch (error) {
      console.log("caught error", error instanceof Error ? error.message : String(error));
      return new Response(JSON.stringify({
        success: false,
        error: "worker_internal_error",
        message: String(error && error.message ? error.message : error)
      }), {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders
        }
      });
    }
  },

  async scheduled(event, env, ctx) {
    ctx.waitUntil(handleScheduled(event, env));
  }
};

async function handleScheduled(event, env) {
  assertCoreEnv(env);
  await syncAgentRegistry(env);

  const tag = scheduleTagForCron(event.cron);
  if (!tag) {
    return;
  }

  const agents = await getScheduledAgents(env, tag);

  for (const agent of agents) {
    await executeAgent(env, agent, {
      trigger: "scheduled_master_loop",
      scheduledTag: tag
    });
  }
}

function scheduleTagForCron(cron) {
  if (cron === "0 7 * * *") {
    return "daily";
  }
  return null;
}

async function getScheduledAgents(env, tag) {
  const rows = await safeSupabaseSelect(
    env,
    `agents?select=name,schedule,status&enabled=eq.true&schedule=eq.${tag}&order=name.asc`
  );

  if (!Array.isArray(rows) || rows.length === 0) {
    return AGENTS.filter((agent) => agent.schedule === tag);
  }

  const enabled = new Set(rows.map((row) => row.name));
  return AGENTS.filter((agent) => enabled.has(agent.name));
}

function getAgent(name) {
  return AGENTS.find((agent) => agent.name === name) || null;
}

async function syncAgentRegistry(env) {
  for (const agent of AGENTS) {
    await supabaseUpsert(
      env,
      "agents",
      {
        name: agent.name,
        schedule: agent.schedule,
        status: "ready",
        description: agent.description
      },
      "name"
    );
  }
}

async function executeAgent(env, agent, context) {
  const startedAt = new Date().toISOString();
  const runRows = await supabaseInsert(env, "agent_runs", {
    agent_name: agent.name,
    scheduled_tag: context.scheduledTag,
    status: "running",
    result: {
      trigger: context.trigger,
      started_at: startedAt
    }
  });
  const runId = runRows?.[0]?.id || null;

  await updateAgentRegistry(env, agent.name, {
    status: "running"
  });

  try {
    const outcome = await agent.run(env);
    const finishedAt = new Date().toISOString();

    await supabaseUpdate(
      env,
      "agent_runs",
      {
        status: outcome.status,
        result: {
          summary: outcome.summary,
          output: outcome.output,
          finished_at: finishedAt
        }
      },
      { id: `eq.${runId}` }
    );

    await insertAgentLog(env, {
      agent_name: agent.name,
      status: outcome.status,
      result: {
        run_id: runId,
        summary: outcome.summary,
        output: outcome.output,
        timestamp: finishedAt
      }
    });

    await updateAgentRegistry(env, agent.name, {
      status: outcome.status,
      last_run: finishedAt
    });

    return {
      agent: agent.name,
      status: outcome.status,
      summary: outcome.summary,
      result: outcome.output
    };
  } catch (error) {
    const finishedAt = new Date().toISOString();
    const message = error instanceof Error ? error.message : String(error);

    await supabaseUpdate(
      env,
      "agent_runs",
      {
        status: "error",
        result: {
          error: message,
          finished_at: finishedAt
        }
      },
      { id: `eq.${runId}` }
    );

    await insertAgentLog(env, {
      agent_name: agent.name,
      status: "error",
      result: {
        run_id: runId,
        error: message,
        timestamp: finishedAt
      }
    });

    await updateAgentRegistry(env, agent.name, {
      status: "error",
      last_run: finishedAt
    });

    return {
      agent: agent.name,
      status: "error",
      error: message
    };
  }
}

async function runRevenueSentinel(env) {
  const subscriptions = await loadSubscriptions(env);
  const webhookEvents = await loadRevenueWebhookEvents(env);
  const newSubscriptions = webhookEvents.filter((event) => event?.result?.event_type === "checkout.session.completed");

  const snapshot = {
    subscription_count: subscriptions.length,
    active_subscriptions: subscriptions.filter((row) => row.status === "active" || row.status === "trialing").length,
    new_subscriptions: newSubscriptions.length,
    revenue_events: webhookEvents.length
  };

  const analysis = await requestText(
    env,
    [
      "You are revenue_sentinel.",
      "Analyze subscription and Stripe event signals and summarize revenue activity.",
      "Return concise markdown with sections: New Revenue, Risks, Next Action.",
      `Data: ${JSON.stringify(snapshot)}`
    ].join("\n")
  );

  return {
    status: "success",
    summary: `Detected ${snapshot.new_subscriptions} new subscriptions and ${snapshot.revenue_events} revenue events`,
    output: {
      ...snapshot,
      analysis
    }
  };
}

async function runBriefingAgent(env) {
  const statuses = await getAgentStatuses(env);
  const subscriptions = await loadSubscriptions(env);
  const payload = {
    active_agents: statuses,
    subscription_count: subscriptions.length
  };

  const briefing = await requestText(
    env,
    [
      "You are briefing_agent.",
      "Generate the ARCHAIOS daily operations briefing.",
      "Return concise markdown with sections: Priorities, Revenue, Risks, Recommended Moves.",
      `Context: ${JSON.stringify(payload)}`
    ].join("\n")
  );

  return {
    status: "success",
    summary: "Daily briefing generated",
    output: {
      briefing
    }
  };
}

async function runMarketScanner(env) {
  const events = await safeSupabaseSelect(
    env,
    "app_events?select=segment,event_name,created_at&order=created_at.desc&limit=100"
  );

  const analysis = await requestText(
    env,
    [
      "You are market_scanner.",
      "Analyze market and product signals from app events.",
      "Return concise markdown with sections: Signals, Opportunities, Threats, Next Campaign.",
      `Events: ${JSON.stringify(events)}`
    ].join("\n")
  );

  return {
    status: "success",
    summary: `Scanned ${events.length} market events`,
    output: {
      events_scanned: events.length,
      analysis
    }
  };
}

async function runSystemSentinel(env) {
  const workerBaseUrl = env.WORKER_BASE_URL || DEFAULT_WORKER_BASE_URL;
  const health = await fetch(`${workerBaseUrl}/api/health`)
    .then(async (response) => ({
      ok: response.ok,
      status: response.status,
      body: await response.json().catch(() => null)
    }))
    .catch((error) => ({
      ok: false,
      status: 0,
      error: error instanceof Error ? error.message : String(error)
    }));

  const recentErrors = await safeSupabaseSelect(
    env,
    "agent_logs?select=agent_name,created_at,status&status=eq.error&order=created_at.desc&limit=20"
  );

  const analysis = await requestText(
    env,
    [
      "You are system_sentinel.",
      "Summarize worker health and recent execution failures.",
      "Return concise markdown with sections: Health, Failures, Immediate Response.",
      `Health: ${JSON.stringify(health)}`,
      `Errors: ${JSON.stringify(recentErrors)}`
    ].join("\n")
  );

  return {
    status: health.ok ? "success" : "warning",
    summary: health.ok ? "System healthy" : "System requires attention",
    output: {
      health,
      recent_errors: recentErrors,
      analysis
    }
  };
}

async function runIntelligenceAgent(env) {
  const subscriptions = await loadSubscriptions(env);
  const profile = await loadOptimizationProfile(env);
  const topics = buildAdaptiveTopics(profile);
  const topic = topics[new Date().getUTCDay() % topics.length];
  const brief = await requestText(
    env,
    buildIntelligencePrompt(topic, {
      subscription_count: subscriptions.length,
      active_subscription_count: subscriptions.filter((item) => item.status === "active" || item.status === "trialing").length,
      optimization_profile: profile
    })
  );

  const rows = await supabaseInsert(env, "intelligence_reports", {
    topic,
    report: brief,
    metadata: {
      source: "intelligence_agent",
      optimization_profile: profile
    }
  });

  return {
    status: "success",
    summary: `Generated intelligence report for ${topic}`,
    output: {
      id: rows?.[0]?.id || null,
      topic
    }
  };
}

async function runSelfImprovingContentAgent(env) {
  const briefs = await safeSupabaseSelect(
    env,
    "intelligence_reports?select=id,topic,report,created_at&order=created_at.desc&limit=1"
  );
  const latestReport = briefs?.[0];
  if (!latestReport) {
    return {
      status: "warning",
      summary: "No intelligence report available",
      output: {
        drafts_created: 0
      }
    };
  }

  const profile = await loadOptimizationProfile(env);
  const content = await requestText(env, buildContentPrompt(`${latestReport.report}\nOptimization profile: ${JSON.stringify(profile)}`));
  const draftDefinitions = [
    { channel: "x", content_type: "tweet" },
    { channel: "blog", content_type: "blog_post" },
    { channel: "email", content_type: "newsletter" }
  ];

  for (const draft of draftDefinitions) {
    await supabaseInsert(env, "content_drafts", {
      channel: draft.channel,
      content_type: draft.content_type,
      content,
      status: "draft",
      metadata: {
        intelligence_report_id: latestReport.id,
        topic: latestReport.topic,
        optimization_profile: profile
      }
    });
  }

  return {
    status: "success",
    summary: `Generated ${draftDefinitions.length} content drafts`,
    output: {
      drafts_created: draftDefinitions.length,
      source_report_id: latestReport.id
    }
  };
}

async function runSelfImprovingDistributionAgent(env) {
  const approvedDrafts = await safeSupabaseSelect(
    env,
    "content_drafts?select=id,channel,content_type,content,created_at,metadata,status&status=eq.approved&order=created_at.desc&limit=10"
  );
  const profile = await loadOptimizationProfile(env);
  const scheduleNotes = await requestText(env, buildDistributionPrompt(approvedDrafts, profile));
  const rows = [];

  for (const draft of approvedDrafts) {
    const inserted = await supabaseInsert(env, "marketing_queue", {
      channel: draft.channel,
      content: draft.content,
      scheduled_time: nextScheduledSlotForProfile(draft.channel, profile),
      status: "draft",
      metadata: {
        content_draft_id: draft.id,
        content_type: draft.content_type,
        schedule_notes: scheduleNotes
      }
    });
    rows.push(inserted?.[0] || null);
  }

  return {
    status: "success",
    summary: `Queued ${rows.length} marketing items`,
    output: {
      queued: rows.length
    }
  };
}

async function runMarketingAgent(env) {
  return runSelfImprovingDistributionAgent(env);
}

async function runFeedbackAgent(env) {
  const draftRows = await safeSupabaseSelect(
    env,
    "content_drafts?select=id,status,channel,content_type,created_at&order=created_at.desc&limit=50"
  );
  const queueRows = await safeSupabaseSelect(
    env,
    "marketing_queue?select=id,status,channel,scheduled_time,created_at&order=created_at.desc&limit=50"
  );
  const metricsContext = {
    drafts_created: draftRows.length,
    drafts_approved: draftRows.filter((item) => item.status === "approved" || item.status === "scheduled" || item.status === "sent").length,
    queue_items: queueRows.length,
    queue_approved: queueRows.filter((item) => item.status === "approved" || item.status === "scheduled" || item.status === "sent").length
  };
  const analysis = await requestText(env, buildFeedbackPrompt(metricsContext));

  const rows = await supabaseInsert(env, "performance_metrics", {
    metric_type: "feedback_snapshot",
    value: metricsContext,
    metadata: {
      analysis
    }
  });

  return {
    status: "success",
    summary: "Performance metrics snapshot recorded",
    output: {
      metric_id: rows?.[0]?.id || null,
      ...metricsContext
    }
  };
}

async function runOptimizationAgent(env) {
  const metrics = await safeSupabaseSelect(
    env,
    "performance_metrics?select=id,metric_type,value,metadata,created_at&order=created_at.desc&limit=10"
  );
  const currentProfile = await loadOptimizationProfile(env);
  const recommendation = await requestText(env, buildOptimizationPrompt(metrics, currentProfile));
  const nextProfile = deriveOptimizationProfile(metrics, currentProfile, recommendation);

  const rows = await supabaseInsert(env, "performance_metrics", {
    metric_type: "optimization_profile",
    value: nextProfile,
    metadata: {
      recommendation
    }
  });

  return {
    status: "success",
    summary: "Optimization profile refreshed",
    output: {
      metric_id: rows?.[0]?.id || null,
      profile: nextProfile
    }
  };
}

async function runAutonomousMarketingAgent(env) {
  const drafts = await safeSupabaseSelect(
    env,
    "content_drafts?select=id,channel,content_type,created_at,metadata&status=eq.draft&order=created_at.desc&limit=10"
  );
  const summary = drafts.map((item) => ({
    id: item.id,
    channel: item.channel,
    type: item.content_type
  }));
  const plan = await requestText(env, buildMarketingPrompt(summary));
  const rows = [];

  for (const draft of drafts.slice(0, 7)) {
    const inserted = await supabaseInsert(env, "marketing_schedule", {
      channel: draft.channel,
      content: plan,
      scheduled_time: nextScheduledSlot(draft.channel),
      status: "draft",
      metadata: {
        content_draft_id: draft.id,
        content_type: draft.content_type
      }
    });
    rows.push(inserted?.[0] || null);
  }

  return {
    status: "success",
    summary: `Queued ${rows.length} marketing schedule items`,
    output: {
      scheduled_items: rows.length
    }
  };
}

async function runAutonomousRevenueAgent(env) {
  const subscriptions = await loadSubscriptions(env);
  const content = await requestText(
    env,
    buildRevenuePrompt({
      subscriptions_total: subscriptions.length,
      active_subscriptions: subscriptions.filter((item) => item.status === "active" || item.status === "trialing").length
    })
  );
  const assets = [
    "premium_preview",
    "sales_email",
    "landing_page"
  ];

  for (const contentType of assets) {
    await supabaseInsert(env, "sales_content", {
      content_type: contentType,
      content,
      status: "draft",
      metadata: {
        source: "revenue_agent"
      }
    });
  }

  return {
    status: "success",
    summary: "Generated revenue conversion assets",
    output: {
      assets_created: assets.length
    }
  };
}

async function runRevenueAgent(env) {
  return runAutonomousRevenueAgent(env);
}

async function runMarketIntelAgent(env) {
  const result = await generateMarketingPlan(env, {
    trigger: "scheduled"
  });

  return {
    status: "success",
    summary: `Generated ${result.entries_created} weekly marketing slots`,
    output: result
  };
}

async function runContentAgent(env) {
  const result = await generateMarketingDrafts(env, {
    trigger: "scheduled",
    channels: MARKETING_CHANNELS,
    planDate: null
  });

  return {
    status: "success",
    summary: `Generated ${result.drafts_created} marketing drafts`,
    output: result
  };
}

async function runDistributionAgent(env) {
  const approvedDrafts = await safeSupabaseSelect(
    env,
    "marketing_drafts?select=id,channel,created_at,scheduled_for,metadata,status&status=eq.approved&order=created_at.asc&limit=20"
  );

  const scheduled = [];
  for (const draft of approvedDrafts) {
    const scheduledFor = draft.scheduled_for || nextScheduledSlot(draft.channel);
    await supabaseUpdate(
      env,
      "marketing_drafts",
      {
        status: "scheduled",
        scheduled_for: scheduledFor,
        updated_at: new Date().toISOString(),
        metadata: {
          ...(draft.metadata || {}),
          scheduled_by: "marketing_agent"
        }
      },
      { id: `eq.${draft.id}` }
    );

    scheduled.push({
      id: draft.id,
      channel: draft.channel,
      scheduled_for: scheduledFor
    });
  }

  await insertAgentLog(env, {
    agent_name: "marketing_agent",
    category: "marketing_queue",
    status: "success",
    output: {
      scheduled_count: scheduled.length,
      scheduled
    },
    result: {
      action: "queue_scheduled"
    }
  });

  return {
    status: "success",
    summary: `Scheduled ${scheduled.length} approved drafts`,
    output: {
      scheduled_count: scheduled.length,
      scheduled
    }
  };
}

async function runLeadCaptureAgent(env) {
  const leads = await safeSupabaseSelect(
    env,
    "leads?select=id,source,created_at&order=created_at.desc&limit=20"
  );
  const leadCount = Array.isArray(leads) ? leads.length : 0;
  const leadSources = summarizeLeadSources(leads);
  const copy = await requestText(
    env,
    [
      "You are lead_capture_agent for AI Assassins.",
      "Create one lead form hook and one short welcome email sequence draft.",
      "Do not send anything. Return concise markdown with sections: Form Hook, Welcome Email 1, Welcome Email 2.",
      `Recent lead sources: ${JSON.stringify(leadSources)}`,
      `Recent lead volume: ${leadCount}`
    ].join("\n")
  );

  const drafts = [
    {
      channel: "lead_form",
      content: copy,
      status: "draft",
      metadata: {
        source: "lead_capture_agent",
        type: "lead_form_copy"
      }
    },
    {
      channel: "email",
      content: copy,
      status: "draft",
      metadata: {
        source: "lead_capture_agent",
        type: "welcome_sequence"
      }
    }
  ];

  for (const draft of drafts) {
    await supabaseInsert(env, "marketing_drafts", draft);
  }

  return {
    status: "success",
    summary: "Lead capture copy queued for approval",
    output: {
      drafts_created: drafts.length,
      lead_sources: leadSources
    }
  };
}

async function generateMarketingPlan(env, options) {
  const weekPlan = buildWeeklyMarketingCalendar();
  const summary = await requestText(
    env,
    [
      "You are market_intel_agent for AI Assassins.",
      "Turn this weekly plan into a concise operator summary.",
      "Return markdown with sections: Theme, Priority Channels, CTA Focus, Creative Risk.",
      JSON.stringify(weekPlan)
    ].join("\n")
  );

  for (const entry of weekPlan) {
        await supabaseUpsert(
      env,
      "marketing_calendar",
      {
        date: entry.date,
        theme: entry.theme,
        target_channel: entry.target_channel,
        metadata: {
          week_summary: summary,
          source: "market_intel_agent",
          trigger: options.trigger
        },
        updated_at: new Date().toISOString()
      },
      "date,target_channel"
    );
  }

  await insertAgentLog(env, {
    agent_name: "market_intel_agent",
    category: "marketing_plan",
    status: "success",
    output: {
      entries_created: weekPlan.length,
      summary
    },
    result: {
      week_start: weekPlan[0]?.date || null
    }
  });

  return {
    entries_created: weekPlan.length,
    week_start: weekPlan[0]?.date || null,
    summary
  };
}

async function generateMarketingDrafts(env, options) {
  const planDate = options.planDate || new Date().toISOString().slice(0, 10);
  let calendarRows = await safeSupabaseSelect(
    env,
    `marketing_calendar?select=date,theme,target_channel,metadata&date=eq.${planDate}&order=target_channel.asc`
  );

  if (!Array.isArray(calendarRows) || calendarRows.length === 0) {
    await generateMarketingPlan(env, { trigger: "auto_seed" });
    calendarRows = await safeSupabaseSelect(
      env,
      `marketing_calendar?select=date,theme,target_channel,metadata&date=eq.${planDate}&order=target_channel.asc`
    );
  }

  const selectedChannels = normalizeMarketingChannels(options.channels);
  const drafts = [];

  for (const row of calendarRows) {
    if (!selectedChannels.includes(row.target_channel)) {
      continue;
    }

    const content = await requestText(
      env,
      [
        "You are content_agent for AI Assassins.",
        "Write copy that is ready for human approval but do not publish.",
        `Channel: ${row.target_channel}`,
        `Theme: ${row.theme}`,
        `Date: ${row.date}`,
        "Return markdown with sections: Hook, Primary Draft, CTA, Notes."
      ].join("\n")
    );

    const inserted = await supabaseInsert(env, "marketing_drafts", {
      channel: row.target_channel,
      content,
      status: "draft",
      metadata: {
        theme: row.theme,
        date: row.date,
        source: "content_agent",
        trigger: options.trigger
      }
    });

    drafts.push(inserted?.[0] || null);
  }

  await insertAgentLog(env, {
    agent_name: "content_agent",
    category: "marketing_drafts",
    status: "success",
    output: {
      drafts_created: drafts.length,
      channels: selectedChannels,
      plan_date: planDate
    },
    result: {
      ids: drafts.map((draft) => draft?.id).filter(Boolean)
    }
  });

  return {
    drafts_created: drafts.length,
    channels: selectedChannels,
    plan_date: planDate
  };
}

async function approveMarketingDraft(env, options) {
  const rows = await safeSupabaseSelect(
    env,
    `marketing_drafts?select=id,channel,status,metadata&id=eq.${options.draftId}&limit=1`
  );
  const draft = rows?.[0];
  if (!draft) {
    throw new Error("Marketing draft not found");
  }

  const scheduledFor = options.scheduledFor || nextScheduledSlot(draft.channel);
  const updatedRows = await supabaseUpdate(
    env,
    "marketing_drafts",
    {
      status: "scheduled",
      scheduled_for: scheduledFor,
      updated_at: new Date().toISOString(),
      metadata: {
        ...(draft.metadata || {}),
        approved_at: new Date().toISOString(),
        scheduled_by: "api_marketing_approve"
      }
    },
    { id: `eq.${options.draftId}` }
  );

  await insertAgentLog(env, {
    agent_name: "marketing_agent",
    category: "marketing_queue",
    status: "success",
    output: {
      draft_id: options.draftId,
      scheduled_for: scheduledFor
    },
    result: {
      action: "approved_to_scheduled"
    }
  });

  return updatedRows?.[0] || {
    id: options.draftId,
    scheduled_for: scheduledFor,
    status: "scheduled"
  };
}

async function listMarketingDrafts(env, searchParams) {
  const status = String(searchParams.get("status") || "").trim();
  const params = new URLSearchParams({
    select: "id,channel,content,status,scheduled_for,created_at,metadata",
    order: "created_at.desc",
    limit: String(Math.min(Number(searchParams.get("limit") || "50"), 200))
  });

  if (status) {
    params.set("status", `eq.${status}`);
  }

  return supabaseSelect(env, `marketing_drafts?${params.toString()}`);
}

function buildWeeklyMarketingCalendar() {
  const start = startOfWeekDate();
  const themes = [
    "Stealth automation wins",
    "Founder operator diary",
    "Revenue proof point",
    "Brief workflow reveal",
    "Enterprise readiness story",
    "Weekend productivity ritual",
    "Next week teaser"
  ];

  const rows = [];
  for (let dayIndex = 0; dayIndex < 7; dayIndex += 1) {
    const date = new Date(start);
    date.setUTCDate(start.getUTCDate() + dayIndex);
    const planDate = date.toISOString().slice(0, 10);

    for (const channel of MARKETING_CHANNELS) {
      rows.push({
        date: planDate,
        theme: themes[dayIndex],
        target_channel: channel
      });
    }
  }

  return rows;
}

function startOfWeekDate() {
  const now = new Date();
  const utc = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const day = utc.getUTCDay();
  const distance = day === 0 ? -6 : 1 - day;
  utc.setUTCDate(utc.getUTCDate() + distance);
  return utc;
}

function nextScheduledSlot(channel) {
  const now = new Date();
  const offsets = {
    x: 2,
    linkedin: 4,
    email: 8,
    lead_form: 6
  };
  const scheduled = new Date(now.getTime() + (offsets[channel] || 3) * 60 * 60 * 1000);
  scheduled.setUTCMinutes(0, 0, 0);
  return scheduled.toISOString();
}

function nextScheduledSlotForProfile(channel, profile) {
  const raw = profile?.posting_schedule?.[channel];
  const now = new Date();
  const scheduled = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

  if (typeof raw === "string" && /^\d{2}:\d{2}$/.test(raw)) {
    const [hours, minutes] = raw.split(":").map(Number);
    scheduled.setUTCHours(hours, minutes, 0, 0);
    if (scheduled.getTime() <= now.getTime()) {
      scheduled.setUTCDate(scheduled.getUTCDate() + 1);
    }
    return scheduled.toISOString();
  }

  return nextScheduledSlot(channel);
}

function normalizeMarketingChannels(value) {
  if (!Array.isArray(value) || value.length === 0) {
    return MARKETING_CHANNELS;
  }

  const channels = value
    .map((item) => String(item).trim().toLowerCase())
    .filter((item) => MARKETING_CHANNELS.includes(item));

  return channels.length > 0 ? channels : MARKETING_CHANNELS;
}

function summarizeLeadSources(rows) {
  const counts = {};
  for (const row of rows || []) {
    const source = String(row?.source || "unknown");
    counts[source] = (counts[source] || 0) + 1;
  }
  return counts;
}

async function loadOptimizationProfile(env) {
  const rows = await safeSupabaseSelect(
    env,
    "performance_metrics?select=value&metric_type=eq.optimization_profile&order=created_at.desc&limit=1"
  );

  return rows?.[0]?.value || DEFAULT_OPTIMIZATION_PROFILE;
}

function buildAdaptiveTopics(profile) {
  const preferred = String(profile?.topic_selection || DEFAULT_OPTIMIZATION_PROFILE.topic_selection);
  const baseTopics = getIntelligenceTopics();
  if (baseTopics.includes(preferred)) {
    return [preferred, ...baseTopics.filter((item) => item !== preferred)];
  }
  return [preferred, ...baseTopics];
}

function deriveOptimizationProfile(metrics, currentProfile, recommendation) {
  const latestFeedback = metrics.find((item) => item.metric_type === "feedback_snapshot")?.value || {};
  const approvedRate =
    Number(latestFeedback.queue_approved || 0) > 0
      ? Number(latestFeedback.queue_approved) / Math.max(Number(latestFeedback.queue_items || 1), 1)
      : 0;

  return {
    topic_selection: approvedRate >= 0.5 ? "agentic revenue operations" : currentProfile.topic_selection || DEFAULT_OPTIMIZATION_PROFILE.topic_selection,
    content_style: approvedRate >= 0.5 ? "proof-driven and concise" : currentProfile.content_style || DEFAULT_OPTIMIZATION_PROFILE.content_style,
    posting_schedule: currentProfile.posting_schedule || DEFAULT_OPTIMIZATION_PROFILE.posting_schedule,
    recommendation
  };
}

async function getAgentStatuses(env) {
  const registry = await safeSupabaseSelect(
    env,
    "agents?select=name,schedule,status,last_run&order=name.asc"
  );

  const byName = new Map(
    (Array.isArray(registry) ? registry : []).map((agent) => [agent.name, agent])
  );

  return AGENTS.map((agent) => {
    const row = byName.get(agent.name);
    return {
      name: agent.name,
      schedule: row?.schedule || agent.schedule,
      status: row?.status || "unknown",
      last_run: row?.last_run || null
    };
  });
}

async function getAgentLogs(env, searchParams) {
  const limit = Math.min(Number(searchParams.get("limit") || "50"), 200);
  const agentName = searchParams.get("agent");
  const params = new URLSearchParams({
    select: "agent_name,created_at,result,status",
    order: "created_at.desc",
    limit: String(limit)
  });

  if (agentName) {
    params.set("agent_name", `eq.${agentName}`);
  }

  return supabaseSelect(env, `agent_logs?${params.toString()}`);
}

async function loadSubscriptions(env) {
  return safeSupabaseSelect(
    env,
    "subscriptions?select=user_id,tier,status,current_period_end,updated_at&order=updated_at.desc&limit=200"
  );
}

async function loadRevenueWebhookEvents(env) {
  return safeSupabaseSelect(
    env,
    "agent_logs?select=created_at,result,status&agent_name=eq.stripe_webhook&order=created_at.desc&limit=50"
  );
}

async function updateAgentRegistry(env, agentName, values) {
  return supabaseUpdate(
    env,
    "agents",
    {
      ...values,
      updated_at: new Date().toISOString()
    },
    { name: `eq.${agentName}` }
  );
}

async function insertAgentLog(env, payload) {
  return supabaseInsert(env, "agent_logs", {
    user_id: payload.user_id || null,
    agent_name: payload.agent_name,
    category: payload.category || "general",
    status: payload.status,
    trigger: payload.trigger || null,
    output: payload.output || payload.result || {},
    result: payload.result,
    created_at: new Date().toISOString()
  });
}

function assertCoreEnv(env) {
  const required = ["OPENAI_API_KEY", "SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"];
  const missing = required.filter((key) => !env[key]);
  if (missing.length > 0) {
    throw new Error(`Missing required env vars: ${missing.join(", ")}`);
  }
}

function validateAuth(request, authToken) {
  if (!authToken) {
    return null;
  }

  const bearer = request.headers.get("Authorization") || "";
  const token = bearer.startsWith("Bearer ") ? bearer.slice(7).trim() : "";

  if (!token) {
    return "Missing bearer token";
  }
  if (token !== authToken) {
    return "Invalid token";
  }
  return null;
}

async function requestText(env, prompt) {
  const body = await requestOpenAI(env, {
    mode: shouldUseResponses(env) ? "responses" : "chat",
    prompt
  });
  return extractTextOutput(body);
}

function normalizeRoutePath(pathname) {
  if (!pathname) {
    return "/";
  }

  return pathname.length > 1 && pathname.endsWith("/")
    ? pathname.slice(0, -1)
    : pathname;
}

function isBriefRoute(pathname) {
  return ["/api/brief", "/brief", "/api/generateBrief", "/"].includes(pathname);
}

async function handleBriefRequest(request, env) {
  console.log("entered /api/brief");
  assertCoreEnv(env);
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return json({ success: false, error: "invalid_json_body" }, 400);
  }
  console.log("parsed request", {
    user_id: body.user_id || "guest-free",
    tier: body.tier || "free",
    location: body.location || "Chicago",
    focus: body.focus || "market expansion",
    tone: body.tone || "direct",
    has_prompt: Boolean(String(body.prompt || "").trim())
  });

  const location = String(body.location || "Chicago").trim() || "Chicago";
  const focus = String(body.focus || "market expansion").trim() || "market expansion";
  const tone = String(body.tone || "direct").trim() || "direct";
  const userId = String(body.user_id || "guest-free").trim() || "guest-free";
  const tier = normalizeTier(body.tier || "free");
  const prompt =
    String(body.prompt || "").trim() ||
    `Generate a daily intelligence brief for ${location} focused on ${focus} in a ${tone} tone.`;
  const isGuestFreeRequest = userId === "guest-free" && tier === "free";
  const actorId = userId || "guest-free";
  const authHeader = request.headers.get("Authorization") || "";
  const authError =
    !authHeader && isGuestFreeRequest
      ? null
      : validateAuth(request, env.AUTH_TOKEN);

  if (authError) {
    return json({ success: false, error: authError }, 401);
  }

  if (!prompt) {
    return json({ success: false, error: "missing_prompt" }, 400);
  }

  if (!userId && !isGuestFreeRequest) {
    return json({ success: false, error: "missing_user_id" }, 400);
  }

  try {
    console.log("starting OpenAI call");
    const brief = await generateBrief(env, {
      prompt,
      userId: userId || null,
      actorId,
      tier,
      location,
      focus,
      tone
    });
    console.log("OpenAI returned");

    console.log("returning success");
    return json({
      success: true,
      brief
    });
  } catch (error) {
    if (error instanceof BriefGenerationError) {
      console.log("caught error", error.details?.message || error.message);
      await logBriefEvent(env, {
        actor_id: actorId,
        tier,
        status: "error",
        error: error.details
      });

      return json(
        {
          success: false,
          error: "brief_error",
          reason: {
            status: error.details?.status || 502,
            message: error.details?.message || "OpenAI request failed"
          }
        },
        502
      );
    }

    throw error;
  }
}

async function handleMarketIntelRequest(request, env) {
  assertCoreEnv(env);
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return json({ success: false, error: "invalid_json_body" }, 400);
  }

  const location = String(body.location || "Chicago").trim() || "Chicago";
  const focus = String(body.focus || "market expansion").trim() || "market expansion";
  const tone = String(body.tone || "direct").trim() || "direct";
  const tier = normalizeTier(body.tier || "free");
  const userId = String(body.user_id || "guest-free").trim() || "guest-free";
  const briefSummary = String(body.brief_summary || "").trim();
  const briefCommand = String(body.brief_command || "").trim();
  const prompt = buildMarketIntelPrompt({
    location,
    focus,
    tone,
    tier,
    briefSummary,
    briefCommand
  });
  const isGuestFreeRequest = userId === "guest-free" && tier === "free";
  const authHeader = request.headers.get("Authorization") || "";
  const authError =
    !authHeader && isGuestFreeRequest
      ? null
      : validateAuth(request, env.AUTH_TOKEN);

  if (authError) {
    return json({ success: false, error: authError }, 401);
  }

  try {
    const intel = await generateMarketIntel(env, {
      prompt
    });
    return json({
      success: true,
      market_intel: intel
    });
  } catch (error) {
    if (error instanceof MarketIntelGenerationError) {
      return json(
        {
          success: false,
          error: "market_intel_error",
          reason: {
            status: error.details?.status || 502,
            message: error.details?.message || "Market intel request failed"
          }
        },
        502
      );
    }

    throw error;
  }
}

async function generateBrief(env, input) {
  const result = await generateBriefWithFallback(env, buildBriefPrompt(input));
  const briefData = result.brief;

  const savedRows = await supabaseInsert(env, "briefs", {
    user_id: input.userId,
    brief_json: briefData,
    location: input.location,
    focus: input.focus,
    tone: input.tone
  });

  const savedBrief = savedRows?.[0] || {};

  await logBriefEvent(env, {
    actor_id: input.actorId,
    tier: input.tier,
    status: "success",
    brief_id: savedBrief.id || null
  });

  return {
    id: savedBrief.id || null,
    title: briefData.title,
    summary: briefData.summary,
    content: briefData.content,
    tier: input.tier,
    created_at: savedBrief.created_at || null
  };
}

async function generateMarketIntel(env, input) {
  const result = await generateMarketIntelWithFallback(env, input.prompt);
  return result.marketIntel;
}

function buildMarketIntelPrompt(input) {
  return [
    "You are Market Intel Agent for ARCHAIOS.",
    "Return JSON only with keys: headline, opportunity, threat, recommendation.",
    "Focus analysis on: AI trends, SaaS opportunities, creator economy, media technology, automation markets.",
    "Be specific, concise, and commercially useful.",
    `Location context: ${input.location}`,
    `Mission focus: ${input.focus}`,
    `Tone: ${input.tone}`,
    `Audience tier: ${input.tier}`,
    input.briefSummary ? `Brief summary: ${input.briefSummary}` : "",
    input.briefCommand ? `Brief command note: ${input.briefCommand}` : ""
  ].filter(Boolean).join("\n");
}

async function debugBriefGeneration(env, prompt) {
  const result = await generateBriefWithFallback(env, prompt);
  return {
    brief: result.brief,
    attempts: result.attempts
  };
}

function buildBriefPrompt(input) {
  return [
    "You are ARCHAIOS, generating a concise command brief for AI Assassins.",
    `Audience tier: ${input.tier}`,
    "Return JSON only with keys: title, summary, content.",
    "Write a direct, useful brief with specific actions and no filler.",
    `User request: ${input.prompt}`
  ].join("\n");
}

function resolveBriefPrompt(body) {
  const directPrompt = String(body.message || body.prompt || "").trim();
  if (directPrompt) {
    return directPrompt;
  }

  const focus = String(body.focus || "").trim();
  const tone = String(body.tone || "").trim();
  const location = String(body.location || "").trim();

  if (!focus && !tone && !location) {
    return "";
  }

  const parts = [
    "Generate an ARCHAIOS brief."
  ];

  if (focus) {
    parts.push(`Focus: ${focus}.`);
  }
  if (tone) {
    parts.push(`Tone: ${tone}.`);
  }
  if (location) {
    parts.push(`Location context: ${location}.`);
  }

  parts.push("Return a practical brief with clear actions and concise situational context.");
  return parts.join(" ");
}

async function requestOpenAI(env, options) {
  if (options.mode === "responses") {
    try {
      return await requestResponsesAPI(env, options);
    } catch (error) {
      return requestChatCompletionsAPI(env, options, error);
    }
  }

  try {
    return await requestChatCompletionsAPI(env, options);
  } catch (error) {
    return requestResponsesAPI(env, options, error);
  }
}

async function generateBriefWithFallback(env, prompt) {
  const attempts = [];
  const callOrder = [callOpenAIChat, callOpenAIResponses];

  for (const call of callOrder) {
    const attempt = await call(env, prompt);
    const parsed = parseBriefOutput(attempt.rawOutput);
    attempts.push({
      endpoint: attempt.endpoint,
      status: attempt.status,
      message: attempt.message,
      raw: attempt.rawOutput.slice(0, 160),
      parseError: parsed.parseError
    });

    if (attempt.status >= 200 && attempt.status < 300 && parsed.brief) {
      return {
        brief: parsed.brief,
        attempts
      };
    }
  }

  const terminal = attempts[attempts.length - 1] || {
    status: 502,
    message: "OpenAI request failed",
    raw: ""
  };

  throw new BriefGenerationError({
    status: terminal.status || 502,
    message: terminal.parseError || terminal.message || "OpenAI request failed",
    raw: String(terminal.raw || "").slice(0, 160)
  });
}

async function generateMarketIntelWithFallback(env, prompt) {
  const attempts = [];
  const callOrder = [callOpenAIChatForMarketIntel, callOpenAIResponsesForMarketIntel];

  for (const call of callOrder) {
    const attempt = await call(env, prompt);
    const parsed = parseMarketIntelOutput(attempt.rawOutput);
    attempts.push({
      endpoint: attempt.endpoint,
      status: attempt.status,
      message: attempt.message,
      raw: attempt.rawOutput.slice(0, 160),
      parseError: parsed.parseError
    });

    if (attempt.status >= 200 && attempt.status < 300 && parsed.marketIntel) {
      return {
        marketIntel: parsed.marketIntel,
        attempts
      };
    }
  }

  const terminal = attempts[attempts.length - 1] || {
    status: 502,
    message: "Market intel request failed",
    raw: ""
  };

  throw new MarketIntelGenerationError({
    status: terminal.status || 502,
    message: terminal.parseError || terminal.message || "Market intel request failed",
    raw: String(terminal.raw || "").slice(0, 160)
  });
}

async function callOpenAIResponses(env, prompt) {
  const apiPath = "/v1/responses";
  console.log("starting OpenAI call", {
    model: getOpenAIModel(env),
    apiPath
  });
  const response = await fetch(`https://api.openai.com${apiPath}`, {
    method: "POST",
    headers: buildOpenAIHeaders(env, true),
    body: JSON.stringify({
      model: getOpenAIModel(env),
      input: prompt,
      text: {
        format: {
          type: "json_schema",
          json_schema: {
            name: "Brief",
            schema: BRIEF_SCHEMA
          }
        }
      }
    })
  });

  const body = await response.json().catch(() => null);
  logOpenAIResult({
    model: getOpenAIModel(env),
    apiPath,
    status: response.status,
    body
  });
  console.log("OpenAI returned", {
    model: getOpenAIModel(env),
    apiPath,
    status: response.status
  });
  return {
    endpoint: "responses",
    status: response.status,
    message: response.ok
      ? "ok"
      : sanitizeOpenAIErrorDetails(body, response.status).message,
    rawOutput: extractResponsesOutput(body)
  };
}

async function callOpenAIChat(env, prompt) {
  const apiPath = "/v1/chat/completions";
  console.log("starting OpenAI call", {
    model: getOpenAIModel(env),
    apiPath
  });
  const response = await fetch(`https://api.openai.com${apiPath}`, {
    method: "POST",
    headers: buildOpenAIHeaders(env, false),
    body: JSON.stringify({
      model: getOpenAIModel(env),
      messages: [
        {
          role: "system",
          content: "Return valid JSON only and match the requested schema exactly."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "Brief",
          schema: BRIEF_SCHEMA
        }
      }
    })
  });

  const body = await response.json().catch(() => null);
  logOpenAIResult({
    model: getOpenAIModel(env),
    apiPath,
    status: response.status,
    body
  });
  console.log("OpenAI returned", {
    model: getOpenAIModel(env),
    apiPath,
    status: response.status
  });
  return {
    endpoint: "chat_completions",
    status: response.status,
    message: response.ok
      ? "ok"
      : sanitizeOpenAIErrorDetails(body, response.status).message,
    rawOutput: extractChatOutput(body)
  };
}

async function callOpenAIResponsesForMarketIntel(env, prompt) {
  const apiPath = "/v1/responses";
  const response = await fetch(`https://api.openai.com${apiPath}`, {
    method: "POST",
    headers: buildOpenAIHeaders(env, true),
    body: JSON.stringify({
      model: getOpenAIModel(env),
      input: prompt,
      text: {
        format: {
          type: "json_schema",
          json_schema: {
            name: "MarketIntel",
            schema: MARKET_INTEL_SCHEMA
          }
        }
      }
    })
  });

  const body = await response.json().catch(() => null);
  logOpenAIResult({
    model: getOpenAIModel(env),
    apiPath,
    status: response.status,
    body
  });
  return {
    endpoint: "responses",
    status: response.status,
    message: response.ok
      ? "ok"
      : sanitizeOpenAIErrorDetails(body, response.status).message,
    rawOutput: extractResponsesOutput(body)
  };
}

async function callOpenAIChatForMarketIntel(env, prompt) {
  const apiPath = "/v1/chat/completions";
  const response = await fetch(`https://api.openai.com${apiPath}`, {
    method: "POST",
    headers: buildOpenAIHeaders(env, false),
    body: JSON.stringify({
      model: getOpenAIModel(env),
      messages: [
        {
          role: "system",
          content: "Return valid JSON only and match the requested schema exactly."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "MarketIntel",
          schema: MARKET_INTEL_SCHEMA
        }
      }
    })
  });

  const body = await response.json().catch(() => null);
  logOpenAIResult({
    model: getOpenAIModel(env),
    apiPath,
    status: response.status,
    body
  });
  return {
    endpoint: "chat_completions",
    status: response.status,
    message: response.ok
      ? "ok"
      : sanitizeOpenAIErrorDetails(body, response.status).message,
    rawOutput: extractChatOutput(body)
  };
}

function parseBriefOutput(rawOutput) {
  const parsed = tryParseJSONObject(rawOutput);
  if (!parsed) {
    return {
      brief: null,
      parseError: "JSON parse failed"
    };
  }

  try {
    return {
      brief: normalizeBriefPayload(parsed),
      parseError: null
    };
  } catch {
    return {
      brief: null,
      parseError: "Brief schema validation failed"
    };
  }
}

function parseMarketIntelOutput(rawOutput) {
  const parsed = tryParseJSONObject(rawOutput);
  if (!parsed) {
    return {
      marketIntel: null,
      parseError: "JSON parse failed"
    };
  }

  try {
    return {
      marketIntel: normalizeMarketIntelPayload(parsed),
      parseError: null
    };
  } catch {
    return {
      marketIntel: null,
      parseError: "Market intel schema validation failed"
    };
  }
}

function extractResponsesOutput(payload) {
  if (!payload) {
    return "";
  }

  if (typeof payload.output_text === "string" && payload.output_text.trim()) {
    return payload.output_text.trim();
  }

  const value = payload?.output?.[0]?.content?.[0]?.text?.value;
  if (typeof value === "string" && value.trim()) {
    return value.trim();
  }

  return collectOutputTexts(payload).join("\n").trim();
}

function extractChatOutput(payload) {
  if (!payload) {
    return "";
  }

  const content = payload?.choices?.[0]?.message?.content;
  if (typeof content === "string" && content.trim()) {
    return content.trim();
  }

  if (Array.isArray(content)) {
    const text = content
      .map((block) => block?.text?.value || block?.text || block?.content || "")
      .filter((value) => typeof value === "string" && value.trim())
      .join("\n")
      .trim();
    if (text) {
      return text;
    }
  }

  return collectOutputTexts(payload).join("\n").trim();
}

async function requestResponsesAPI(env, options, fallbackError = null) {
  const apiPath = "/v1/responses";
  const model = getOpenAIModel(env);
  const payload = {
    model,
    input: options.prompt
  };

  if (options.schema) {
    payload.text = {
      format: {
        type: "json_schema",
        name: "Brief",
        schema: options.schema
      }
    };
  }

  const response = await fetch(`https://api.openai.com${apiPath}`, {
    method: "POST",
    headers: buildOpenAIHeaders(env, true),
    body: JSON.stringify(payload)
  });

  try {
    const body = await handleOpenAIResponse(response);
    logOpenAIResult({
      model,
      apiPath,
      status: response.status,
      body
    });
    return body;
  } catch (error) {
    logOpenAIResult({
      model,
      apiPath,
      status: response.status,
      body: error
    });
    if (fallbackError) {
      throw new OpenAIRequestError(
        mergeOpenAIRequestDetails(fallbackError, error)
      );
    }
    throw error;
  }
}

async function requestChatCompletionsAPI(env, options, fallbackError = null) {
  const apiPath = "/v1/chat/completions";
  const model = getOpenAIModel(env);
  const payload = {
    model,
    messages: [
      {
        role: "system",
        content: options.schema
          ? "Return valid JSON only and match the requested schema exactly."
          : "Be concise, accurate, and directly answer the prompt."
      },
      {
        role: "user",
        content: options.prompt
      }
    ]
  };

  if (options.schema) {
    payload.response_format = {
      type: "json_schema",
      json_schema: {
        name: "Brief",
        schema: options.schema
      }
    };
  }

  const response = await fetch(`https://api.openai.com${apiPath}`, {
    method: "POST",
    headers: buildOpenAIHeaders(env, false),
    body: JSON.stringify(payload)
  });

  try {
    const body = await handleOpenAIResponse(response);
    logOpenAIResult({
      model,
      apiPath,
      status: response.status,
      body
    });
    return body;
  } catch (error) {
    logOpenAIResult({
      model,
      apiPath,
      status: response.status,
      body: error
    });
    if (fallbackError) {
      throw new OpenAIRequestError(
        sanitizeOpenAIErrorDetails(error, fallbackError)
      );
    }
    throw error;
  }
}

function buildOpenAIHeaders(env, includeBeta) {
  const headers = {
    Authorization: `Bearer ${env.OPENAI_API_KEY}`,
    "Content-Type": "application/json"
  };

  if (includeBeta) {
    headers["OpenAI-Beta"] = "assistants=v2";
  }

  return headers;
}

function getOpenAIModel(env) {
  return env.OPENAI_MODEL || DEFAULT_OPENAI_MODEL;
}

async function handleOpenAIResponse(response) {
  const body = await response.json().catch(() => null);

  if (!response.ok) {
    throw new OpenAIRequestError(
      sanitizeOpenAIErrorDetails(body, response.status)
    );
  }

  if (!body) {
    throw new OpenAIRequestError({
      status: response.status,
      message: "OpenAI returned an empty response body"
    });
  }

  return body;
}

function extractTextOutput(payload) {
  return collectOutputTexts(payload).join("\n").trim();
}

function extractStructuredOutput(payload) {
  const outputs = collectOutputTexts(payload);
  for (const text of outputs) {
    const parsed = tryParseJSONObject(text);
    if (parsed) {
      return normalizeBriefPayload(parsed);
    }
  }

  const rawOutput = outputs.join("\n").trim();
  throw new OpenAIParseError({
    raw: rawOutput.slice(0, 200)
  });
}

function collectOutputTexts(payload) {
  const texts = [];

  if (typeof payload?.output_text === "string" && payload.output_text.trim()) {
    texts.push(payload.output_text.trim());
  }

  if (Array.isArray(payload?.choices)) {
    for (const choice of payload.choices) {
      const content = choice?.message?.content;
      if (typeof content === "string" && content.trim()) {
        texts.push(content.trim());
      } else if (Array.isArray(content)) {
        for (const block of content) {
          const value = block?.text?.value || block?.text || block?.content || "";
          if (typeof value === "string" && value.trim()) {
            texts.push(value.trim());
          }
        }
      }
    }
  }

  if (Array.isArray(payload?.output)) {
    for (const item of payload.output) {
      if (!Array.isArray(item?.content)) {
        continue;
      }
      for (const block of item.content) {
        const value =
          block?.text?.value ||
          block?.text ||
          block?.output_text ||
          block?.content ||
          block?.value ||
          "";
        if (typeof value === "string" && value.trim()) {
          texts.push(value.trim());
        }
      }
    }
  }

  return texts;
}

function tryParseJSONObject(text) {
  try {
    return JSON.parse(text);
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) {
      return null;
    }

    try {
      return JSON.parse(match[0]);
    } catch {
      return null;
    }
  }
}

function normalizeBriefPayload(payload) {
  const title = String(payload?.title || "").trim();
  const summary = String(payload?.summary || "").trim();
  const content = String(payload?.content || "").trim();

  if (!title || !summary || !content) {
    throw new OpenAIParseError({
      raw: JSON.stringify(payload).slice(0, 200)
    });
  }

  return { title, summary, content };
}

function normalizeMarketIntelPayload(payload) {
  const headline = String(payload?.headline || "").trim();
  const opportunity = String(payload?.opportunity || "").trim();
  const threat = String(payload?.threat || "").trim();
  const recommendation = String(payload?.recommendation || "").trim();

  if (!headline || !opportunity || !threat || !recommendation) {
    throw new OpenAIParseError({
      raw: JSON.stringify(payload).slice(0, 200)
    });
  }

  return {
    headline,
    opportunity,
    threat,
    recommendation
  };
}

function shouldUseResponses(env) {
  return String(env.OPENAI_USE_RESPONSES || "false").toLowerCase() === "true";
}

function normalizeTier(value) {
  const tier = String(value || "free").trim().toLowerCase();
  return ["free", "pro", "elite", "enterprise"].includes(tier) ? tier : "free";
}

function normalizeCheckoutTier(value) {
  return String(value || "pro").trim().toLowerCase() === "elite" ? "elite" : "pro";
}

function hasPaidAccess(tier) {
  return tier === "pro" || tier === "elite";
}

function isEliteTier(tier) {
  return tier === "elite";
}

function getFrontendUrl(env) {
  return String(env.FRONTEND_URL || DEFAULT_FRONTEND_URL).replace(/\/+$/, "");
}

function visibleAgentIdsForTier(tier) {
  if (tier === "elite") {
    return new Set(DASHBOARD_AGENT_CARDS.map((agent) => agent.id));
  }
  if (tier === "pro") {
    return new Set(DASHBOARD_AGENT_CARDS.slice(0, 5).map((agent) => agent.id));
  }
  return new Set(DASHBOARD_AGENT_CARDS.slice(0, 3).map((agent) => agent.id));
}

function buildPremiumState(tier) {
  return {
    currentTier: tier,
    limitedMode: !hasPaidAccess(tier),
    delayedHighThreatAlerts: !hasPaidAccess(tier),
    canRefreshRealtime: hasPaidAccess(tier),
    canGeneratePosts: hasPaidAccess(tier),
    canExtendCalendar: hasPaidAccess(tier),
    prioritySignals: isEliteTier(tier)
  };
}

function buildActivityFeed(tier) {
  const now = Date.now();
  return [
    {
      id: "feed-1",
      actor: "Traffic Agent",
      action: "rerouted acquisition budget",
      detail: "Shifted volume toward channels with stronger checkout intent.",
      level: "medium",
      timestamp: new Date(now).toISOString()
    },
    {
      id: "feed-2",
      actor: "Intelligence Agent",
      action: "published daily operational brief",
      detail: "Merged intelligence, platform, and market signals into the dashboard.",
      level: tier === "free" ? "medium" : "high",
      timestamp: new Date(now - 7 * 60 * 1000).toISOString()
    },
    {
      id: "feed-3",
      actor: "Analytics Agent",
      action: "identified monetization momentum",
      detail: "Detected stronger conversion pressure around premium intelligence tiers.",
      level: "normal",
      timestamp: new Date(now - 14 * 60 * 1000).toISOString()
    }
  ];
}

function buildAgentCards(tier) {
  const visibleAgentIds = visibleAgentIdsForTier(tier);
  return DASHBOARD_AGENT_CARDS.map((agent) => ({
    ...agent,
    metricValue: agent.id === "analytics-agent" && isEliteTier(tier) ? "18" : agent.metricValue,
    locked: !visibleAgentIds.has(agent.id)
  }));
}

function buildRevenueSnapshot(tier) {
  return {
    monthlyRecurringRevenue: isEliteTier(tier) ? 18420 : hasPaidAccess(tier) ? 9210 : 2760,
    activeSubscribers: isEliteTier(tier) ? 191 : hasPaidAccess(tier) ? 104 : 37,
    conversionRate: isEliteTier(tier) ? 6.2 : hasPaidAccess(tier) ? 4.8 : 2.1,
    projectedRevenue: isEliteTier(tier) ? 24600 : hasPaidAccess(tier) ? 13300 : 3900
  };
}

async function getAuthenticatedSupabaseUser(request, env) {
  const bearer = request.headers.get("Authorization") || "";
  const token = bearer.startsWith("Bearer ") ? bearer.slice(7).trim() : "";

  if (!token) {
    return null;
  }

  if (!env.SUPABASE_URL || (!env.SUPABASE_ANON_KEY && !env.SUPABASE_SERVICE_ROLE_KEY)) {
    throw new Error("Missing Supabase auth configuration");
  }

  const response = await fetch(`${env.SUPABASE_URL}/auth/v1/user`, {
    headers: {
      apikey: env.SUPABASE_ANON_KEY || env.SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${token}`
    }
  });

  if (response.status === 401 || response.status === 403) {
    return null;
  }

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(`Supabase auth failed (${response.status}): ${detail.slice(0, 300)}`);
  }

  return response.json();
}

async function getCurrentSubscription(env, userId) {
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY || !userId) {
    return null;
  }

  const rows = await safeSupabaseSelect(
    env,
    `subscriptions?select=user_id,tier,status,current_period_end,stripe_customer_id,stripe_subscription_id,updated_at&user_id=eq.${encodeURIComponent(userId)}&order=updated_at.desc&limit=1`
  );

  return Array.isArray(rows) ? rows[0] || null : null;
}

function resolveSubscriptionTier(subscription) {
  if (!subscription) {
    return "free";
  }

  if (subscription.status === "active" || subscription.status === "trialing") {
    return normalizeTier(subscription.tier);
  }

  return "free";
}

async function getUserTier(env, userId) {
  return resolveSubscriptionTier(await getCurrentSubscription(env, userId));
}

async function getUserAlerts(env, userId) {
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY || !userId) {
    return [];
  }

  const rows = await safeSupabaseSelect(
    env,
    `alerts?select=id,type,severity,message,timestamp&user_id=eq.${encodeURIComponent(userId)}&order=timestamp.desc&limit=100`
  );

  return Array.isArray(rows) ? rows : [];
}

async function clearUserAlerts(env, userId) {
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY || !userId) {
    return [];
  }

  return safeSupabaseDelete(env, "alerts", { user_id: `eq.${userId}` });
}

async function recordLead(env, { email, source }) {
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
    return { ok: true, stored: true, source: "worker" };
  }

  try {
    await supabaseUpsert(
      env,
      "leads",
      {
        email,
        source,
        updated_at: new Date().toISOString()
      },
      "email"
    );
    return { ok: true, stored: true, source: "supabase" };
  } catch {
    return { ok: true, stored: true, source: "worker" };
  }
}

async function recordCtaClick(env, { cta, location, tier }) {
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
    return { ok: true, stored: true, source: "worker" };
  }

  try {
    await supabaseInsert(env, "cta_events", {
      cta,
      location,
      tier,
      created_at: new Date().toISOString()
    });
    return { ok: true, stored: true, source: "supabase" };
  } catch {
    return { ok: true, stored: true, source: "worker" };
  }
}

async function getGrowthMetrics(env) {
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
    return {
      leadSubmissions: 0,
      ctaClicks: 0,
      source: "worker"
    };
  }

  const [leads, ctaEvents] = await Promise.all([
    safeSupabaseSelect(env, "leads?select=id&limit=1000"),
    safeSupabaseSelect(env, "cta_events?select=id&limit=1000")
  ]);

  return {
    leadSubmissions: Array.isArray(leads) ? leads.length : 0,
    ctaClicks: Array.isArray(ctaEvents) ? ctaEvents.length : 0,
    source: "supabase"
  };
}

async function buildPlatformDashboardPayload(env, user, tier) {
  const metrics = await getGrowthMetrics(env);

  return {
    generatedAt: new Date().toISOString(),
    pricing: PRICING_TIERS,
    userTier: tier,
    user: {
      id: user?.id || null,
      email: user?.email || null,
      tier,
      paid: hasPaidAccess(tier),
      prioritySignals: isEliteTier(tier)
    },
    premium: buildPremiumState(tier),
    activityFeed: buildActivityFeed(tier),
    agents: buildAgentCards(tier),
    revenue: buildRevenueSnapshot(tier),
    analytics: metrics,
    briefing: {
      title: "Daily Platform Brief",
      summary:
        "Operational pressure is rising across acquisition, monetization, and intelligence visibility. Premium plans unlock faster reaction speed, deeper signal coverage, and a more aggressive revenue posture.",
      actions: [
        "Push upgrade CTAs harder on premium surfaces.",
        "Prioritize short-form content with direct conversion hooks.",
        "Route high-threat signals to paid users first."
      ]
    }
  };
}

async function buildAdminDashboardPayload(env) {
  const [totalUsers, activeSubscriptions, webhookLogs] = await Promise.all([
    safeSupabaseCount(env, "profiles"),
    safeSupabaseCount(env, "subscriptions", "status=in.(active,trialing)"),
    loadRevenueWebhookEvents(env)
  ]);

  return {
    totalUsers,
    activeSubscriptions,
    webhookLogs: webhookLogs.map((event) => ({
      createdAt: event?.created_at || null,
      status: event?.status || "unknown",
      eventType: event?.result?.event_type || null,
      tier: event?.result?.tier || event?.result?.metadata?.tier || null
    }))
  };
}

function sanitizeCheckoutReturnUrl(env, candidate, fallbackPath) {
  const frontendBaseUrl = getFrontendUrl(env);
  const fallbackUrl = `${frontendBaseUrl}${fallbackPath}`;
  const normalizedCandidate = String(candidate || "").trim();

  if (!normalizedCandidate) {
    return fallbackUrl;
  }

  if (normalizedCandidate.startsWith(frontendBaseUrl)) {
    return normalizedCandidate;
  }

  return fallbackUrl;
}

async function createStripeCheckoutSession(env, user, tier, options = {}) {
  if (!env.STRIPE_SECRET_KEY) {
    throw new Error("Missing Stripe configuration");
  }

  const priceId = tier === "elite" ? env.STRIPE_PRICE_ELITE : env.STRIPE_PRICE_PRO;
  if (!priceId) {
    throw new Error(`Missing Stripe price id for ${tier}`);
  }

  const successUrl = sanitizeCheckoutReturnUrl(env, options.successUrl, "/dashboard?checkout=success");
  const cancelUrl = sanitizeCheckoutReturnUrl(env, options.cancelUrl, "/dashboard?checkout=cancel");
  const params = new URLSearchParams();
  params.set("mode", "subscription");
  params.set("line_items[0][price]", priceId);
  params.set("line_items[0][quantity]", "1");
  params.set("success_url", successUrl);
  params.set("cancel_url", cancelUrl);
  params.set("metadata[user_id]", user.id);
  params.set("metadata[tier]", tier);
  params.set("subscription_data[metadata][user_id]", user.id);
  params.set("subscription_data[metadata][tier]", tier);

  if (user.email) {
    params.set("customer_email", user.email);
  }

  const response = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.STRIPE_SECRET_KEY}`,
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: params
  });

  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    const message = payload?.error?.message || `Stripe checkout failed (${response.status})`;
    throw new Error(message);
  }

  return payload;
}

function toIsoOrNull(unixSeconds) {
  if (!unixSeconds) {
    return null;
  }

  return new Date(unixSeconds * 1000).toISOString();
}

async function upsertSubscriptionRecord(env, { userId, tier, status, stripeCustomerId, stripeSubscriptionId, currentPeriodEnd }) {
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY || !userId) {
    return null;
  }

  const payload = {
    user_id: userId,
    tier: normalizeTier(tier),
    status: status || "active",
    stripe_customer_id: stripeCustomerId || null,
    stripe_subscription_id: stripeSubscriptionId || null,
    current_period_end: currentPeriodEnd || null,
    updated_at: new Date().toISOString()
  };

  const rows = await supabaseUpsert(env, "subscriptions", payload, "user_id");
  await supabaseUpsert(
    env,
    "profiles",
    {
      id: userId,
      tier: resolveSubscriptionTier(payload),
      updated_at: new Date().toISOString()
    },
    "id"
  );

  return Array.isArray(rows) ? rows[0] || null : null;
}

async function verifyStripeWebhookSignature(env, rawBody, signature) {
  if (!env.STRIPE_WEBHOOK_SECRET) {
    throw new Error("Missing Stripe webhook secret");
  }

  if (!signature) {
    throw new Error("Missing Stripe signature");
  }

  const parts = Object.fromEntries(
    signature.split(",").map((part) => {
      const [key, value] = part.split("=");
      return [key, value];
    })
  );

  const timestamp = parts.t;
  const expectedSignature = parts.v1;
  if (!timestamp || !expectedSignature) {
    throw new Error("Invalid Stripe signature");
  }

  const ageSeconds = Math.abs(Math.floor(Date.now() / 1000) - Number(timestamp));
  if (!Number.isFinite(ageSeconds) || ageSeconds > 300) {
    throw new Error("Expired Stripe signature");
  }

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(env.STRIPE_WEBHOOK_SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signed = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(`${timestamp}.${rawBody}`));
  const computedSignature = Array.from(new Uint8Array(signed))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");

  if (computedSignature !== expectedSignature) {
    throw new Error("Invalid Stripe signature");
  }
}

async function handleStripeWebhookEvent(env, rawBody, signature) {
  await verifyStripeWebhookSignature(env, rawBody, signature);

  let event;
  try {
    event = JSON.parse(rawBody);
  } catch {
    throw new Error("Invalid Stripe webhook body");
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data?.object;
    if (session?.mode === "subscription") {
      await upsertSubscriptionRecord(env, {
        userId: session.metadata?.user_id,
        tier: session.metadata?.tier,
        status: "active",
        stripeCustomerId: session.customer,
        stripeSubscriptionId: session.subscription,
        currentPeriodEnd: null
      });
    }
  }

  if (event.type === "customer.subscription.created" || event.type === "customer.subscription.updated") {
    const subscription = event.data?.object;
    await upsertSubscriptionRecord(env, {
      userId: subscription?.metadata?.user_id,
      tier: subscription?.metadata?.tier,
      status: subscription?.status,
      stripeCustomerId: subscription?.customer,
      stripeSubscriptionId: subscription?.id,
      currentPeriodEnd: toIsoOrNull(subscription?.current_period_end)
    });
  }

  if (event.type === "customer.subscription.deleted") {
    const subscription = event.data?.object;
    await upsertSubscriptionRecord(env, {
      userId: subscription?.metadata?.user_id,
      tier: "free",
      status: "canceled",
      stripeCustomerId: subscription?.customer,
      stripeSubscriptionId: subscription?.id,
      currentPeriodEnd: toIsoOrNull(subscription?.current_period_end)
    });
  }

  if (event.type === "invoice.payment_failed") {
    const invoice = event.data?.object;
    const userId = invoice?.subscription_details?.metadata?.user_id || invoice?.lines?.data?.[0]?.metadata?.user_id || null;
    const tier = invoice?.subscription_details?.metadata?.tier || invoice?.lines?.data?.[0]?.metadata?.tier || "free";
    await upsertSubscriptionRecord(env, {
      userId,
      tier,
      status: "past_due",
      stripeCustomerId: invoice?.customer,
      stripeSubscriptionId: invoice?.subscription,
      currentPeriodEnd: null
    });
  }

  return event;
}

async function logBriefEvent(env, payload) {
  console.log(
    JSON.stringify({
      event: "brief_generation",
      actor_id: payload.actor_id || null,
      tier: payload.tier,
      status: payload.status
    })
  );

  await insertAgentLogSafe(env, {
    agent_name: "brief_generation",
    category: "briefs",
    status: payload.status,
    output: {
      actor_id: payload.actor_id || null,
      tier: payload.tier,
      brief_id: payload.brief_id || null,
      error: payload.error || null
    },
    result: {
      event: "brief_generation"
    }
  });
}

async function insertAgentLogSafe(env, payload) {
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
    return null;
  }

  try {
    return await insertAgentLog(env, payload);
  } catch {
    return null;
  }
}

function sanitizeOpenAIErrorDetails(primary, secondary = null) {
  const details = mergeOpenAIRequestDetails(primary, secondary);
  if (!details) {
    return { message: "OpenAI request failed", status: 502 };
  }
  return details;
}

function logOpenAIResult({ model, apiPath, status, body }) {
  const safe = sanitizeOpenAIErrorDetails(body, status);
  console.log(
    JSON.stringify({
      event: "openai_request",
      model,
      api_path: apiPath,
      response_status: status,
      sanitized_error: safe.status >= 400 ? safe : null
    })
  );
}

function mergeOpenAIRequestDetails(primary, secondary = null) {
  const values = [primary, secondary]
    .map((value) => sanitizeOpenAIErrorValue(value))
    .filter(Boolean);

  if (values.length === 0) {
    return null;
  }

  const status =
    values.find((value) => typeof value.status === "number")?.status || 502;
  const message = values
    .map((value) => value.message)
    .filter(Boolean)
    .join(" | ")
    .slice(0, 300);

  return {
    status,
    message: message || "OpenAI request failed"
  };
}

function sanitizeOpenAIErrorValue(value) {
  if (!value) {
    return null;
  }

  if (typeof value === "number") {
    return { status: value };
  }

  if (value instanceof OpenAIRequestError) {
    return value.details;
  }

  if (value instanceof Error) {
    return {
      message: value.message.slice(0, 300)
    };
  }

  if (typeof value === "object") {
    const message =
      typeof value?.error?.message === "string"
        ? value.error.message
        : typeof value?.message === "string"
          ? value.message
          : typeof value?.error === "string"
            ? value.error
            : null;
    const code =
      typeof value?.error?.code === "string"
        ? value.error.code
        : typeof value?.code === "string"
          ? value.code
          : null;
    const status = typeof value?.status === "number" ? value.status : null;
    const detail = {};

    if (status) {
      detail.status = status;
    }
    if (code) {
      detail.code = code;
    }
    if (message) {
      detail.message = message.slice(0, 300);
    }

    return Object.keys(detail).length > 0 ? detail : null;
  }

  return {
    message: String(value).slice(0, 300)
  };
}

class OpenAIRequestError extends Error {
  constructor(details) {
    super("openai_request_failed");
    this.name = "OpenAIRequestError";
    this.details = details;
  }
}

class OpenAIParseError extends Error {
  constructor(details) {
    super("openai_parse_failed");
    this.name = "OpenAIParseError";
    this.details = details;
  }
}

class BriefGenerationError extends Error {
  constructor(details) {
    super("openai_request_failed");
    this.name = "BriefGenerationError";
    this.details = details;
  }
}

class MarketIntelGenerationError extends Error {
  constructor(details) {
    super("market_intel_request_failed");
    this.name = "MarketIntelGenerationError";
    this.details = details;
  }
}

async function supabaseSelect(env, path) {
  const response = await fetch(`${env.SUPABASE_URL}/rest/v1/${path}`, {
    method: "GET",
    headers: {
      apikey: env.SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`
    }
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(`Supabase select failed (${response.status}): ${detail.slice(0, 500)}`);
  }

  return response.json();
}

async function safeSupabaseSelect(env, path) {
  try {
    return await supabaseSelect(env, path);
  } catch {
    return [];
  }
}

async function supabaseCount(env, table, filters = "") {
  const path = filters ? `${table}?${filters}&select=*` : `${table}?select=*`;
  const response = await fetch(`${env.SUPABASE_URL}/rest/v1/${path}`, {
    method: "HEAD",
    headers: {
      apikey: env.SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
      Prefer: "count=exact"
    }
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(`Supabase count failed (${response.status}): ${detail.slice(0, 500)}`);
  }

  const contentRange = response.headers.get("content-range") || "";
  const total = Number(contentRange.split("/")[1]);
  return Number.isFinite(total) ? total : 0;
}

async function safeSupabaseCount(env, table, filters = "") {
  try {
    return await supabaseCount(env, table, filters);
  } catch {
    return 0;
  }
}

async function supabaseInsert(env, table, payload) {
  const response = await fetch(`${env.SUPABASE_URL}/rest/v1/${table}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: env.SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
      Prefer: "return=representation"
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(`Supabase insert failed (${response.status}): ${detail.slice(0, 500)}`);
  }

  return response.json();
}

async function supabaseUpsert(env, table, payload, onConflict) {
  const response = await fetch(`${env.SUPABASE_URL}/rest/v1/${table}?on_conflict=${encodeURIComponent(onConflict)}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: env.SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
      Prefer: "resolution=merge-duplicates,return=representation"
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(`Supabase upsert failed (${response.status}): ${detail.slice(0, 500)}`);
  }

  return response.json();
}

async function supabaseUpdate(env, table, payload, filters) {
  const params = new URLSearchParams(filters);
  const response = await fetch(`${env.SUPABASE_URL}/rest/v1/${table}?${params.toString()}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      apikey: env.SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
      Prefer: "return=representation"
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(`Supabase update failed (${response.status}): ${detail.slice(0, 500)}`);
  }

  return response.json();
}

async function safeSupabaseDelete(env, table, filters) {
  const params = new URLSearchParams(filters);

  try {
    const response = await fetch(`${env.SUPABASE_URL}/rest/v1/${table}?${params.toString()}`, {
      method: "DELETE",
      headers: {
        apikey: env.SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
        Prefer: "return=representation"
      }
    });

    if (!response.ok) {
      throw new Error(`Supabase delete failed (${response.status})`);
    }

    return response.json().catch(() => []);
  } catch {
    return [];
  }
}

function json(payload, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
      ...extraHeaders,
      ...corsHeaders
    }
  });
}

function withCors(response) {
  const headers = new Headers(response.headers);

  for (const [key, value] of Object.entries(corsHeaders)) {
    headers.set(key, value);
  }

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers
  });
}
