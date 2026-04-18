import OpenAI from "openai";
import { config } from "./config.js";
import { hasPaidAccess, isEliteTier } from "./auth.js";
import { PRICING_TIERS } from "../../shared/pricing.js";

const openai = config.openAiApiKey
  ? new OpenAI({
      apiKey: config.openAiApiKey
    })
  : null;

const AGENT_ORDER = [
  "content-agent",
  "marketing-agent",
  "traffic-agent",
  "intelligence-agent",
  "conversion-agent",
  "analytics-agent"
];

function visibleAgentsForTier(tier) {
  if (tier === "elite") {
    return AGENT_ORDER;
  }

  if (tier === "pro") {
    return AGENT_ORDER.slice(0, 5);
  }

  return AGENT_ORDER.slice(0, 3);
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
    timestamp: new Date(now - index * 7 * 60 * 1000).toISOString()
  }));
}

function buildAgentCards(tier) {
  const agents = [
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
  ];

  const visible = new Set(visibleAgentsForTier(tier));

  return agents.map((agent) => ({
    ...agent,
    locked: !visible.has(agent.id)
  }));
}

function createPremiumModel(tier) {
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

function buildRevenueSnapshot(tier) {
  return {
    monthlyRecurringRevenue: isEliteTier(tier) ? 18420 : hasPaidAccess(tier) ? 9210 : 2760,
    activeSubscribers: isEliteTier(tier) ? 191 : hasPaidAccess(tier) ? 104 : 37,
    conversionRate: isEliteTier(tier) ? 6.2 : hasPaidAccess(tier) ? 4.8 : 2.1,
    projectedRevenue: isEliteTier(tier) ? 24600 : hasPaidAccess(tier) ? 13300 : 3900
  };
}

async function maybeSummarizeWithOpenAI(tier) {
  if (!openai) {
    return null;
  }

  try {
    const completion = await openai.chat.completions.create({
      model: config.openAiModel,
      messages: [
        {
          role: "system",
          content:
            "You summarize premium dashboard state for a monetized AI platform. Return one short paragraph only."
        },
        {
          role: "user",
          content: `Summarize the current state of an AI intelligence dashboard for a ${tier} user. Mention urgency, monetization, and operational awareness.`
        }
      ],
      temperature: 0.7
    });

    return completion.choices?.[0]?.message?.content?.trim() || null;
  } catch {
    return null;
  }
}

export async function buildPlatformDashboard(user, tier, growthMetrics = { leads: 0, ctaClicks: 0, source: "local" }) {
  const aiSummary = await maybeSummarizeWithOpenAI(tier);

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
    premium: createPremiumModel(tier),
    activityFeed: makeActivityFeed(tier),
    agents: buildAgentCards(tier),
    revenue: buildRevenueSnapshot(tier),
    analytics: {
      leadSubmissions: growthMetrics.leads || 0,
      ctaClicks: growthMetrics.ctaClicks || 0,
      source: growthMetrics.source || "local"
    },
    briefing: {
      title: "Daily Platform Brief",
      summary:
        aiSummary ||
        "Operational pressure is rising across acquisition, monetization, and intelligence visibility. Premium plans unlock faster reaction speed, deeper signal coverage, and a more aggressive revenue posture.",
      actions: [
        "Push conversion-weighted messaging harder on premium surfaces.",
        "Prioritize short-form content with direct upgrade CTAs.",
        "Monitor high-threat alerts and route elite users to priority reports."
      ]
    }
  };
}

export function buildAgentEndpointPayload(tier) {
  const dashboard = {
    premium: createPremiumModel(tier),
    agents: buildAgentCards(tier)
  };

  return {
    content: dashboard.agents.find((item) => item.id === "content-agent"),
    marketing: dashboard.agents.find((item) => item.id === "marketing-agent"),
    traffic: dashboard.agents.find((item) => item.id === "traffic-agent"),
    intelligence: dashboard.agents.find((item) => item.id === "intelligence-agent"),
    conversion: dashboard.agents.find((item) => item.id === "conversion-agent"),
    analytics: dashboard.agents.find((item) => item.id === "analytics-agent")
  };
}
