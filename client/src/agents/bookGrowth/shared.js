export const AGENT_STATUS = {
  running: "Running",
  paused: "Paused",
  needsInput: "Needs Input",
  error: "Error"
};

export const BOOK_GROWTH_STORAGE_KEY = "saint-black-book-growth-os-v1";

export const SCHEDULE = [
  { cadence: "Every day", task: "Content generation", agentIds: ["content-creator-agent", "social-distribution-agent"] },
  { cadence: "Every day", task: "Analytics refresh", agentIds: ["analytics-agent", "operations-agent"] },
  { cadence: "Every 3 days", task: "Campaign review", agentIds: ["strategy-commander", "sales-optimizer-agent"] },
  { cadence: "Every week", task: "Strategy reset", agentIds: ["strategy-commander"] },
  { cadence: "Every week", task: "Metadata review", agentIds: ["seo-metadata-agent"] },
  { cadence: "Every week", task: "Funnel optimization review", agentIds: ["funnel-agent", "sales-optimizer-agent"] }
];

export function nowIso() {
  return new Date().toISOString();
}

export function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function createAgentDefinition({
  id,
  name,
  mission,
  currentTask,
  queueCount,
  boundaries = []
}) {
  return {
    id,
    name,
    status: AGENT_STATUS.paused,
    lastExecutionTime: null,
    currentTask,
    taskQueueCount: queueCount,
    mission,
    boundaries: [
      "No spam, fake engagement, fake reviews, or platform policy violations.",
      "No auto-posting until explicit publishing credentials and approval workflow exist.",
      "Use Apple Books links as outbound CTAs without claiming unverifiable sales.",
      ...boundaries
    ]
  };
}

export function createRun(agent, task, status, summary, payload = {}) {
  return {
    id: `${agent.id}-${Date.now()}`,
    agentId: agent.id,
    agentName: agent.name,
    status,
    task,
    timestamp: nowIso(),
    summary,
    payload
  };
}

export function updateAgentAfterRun(agent, run, nextTask = agent.currentTask) {
  return {
    ...agent,
    status: run.status === "failed" ? AGENT_STATUS.error : AGENT_STATUS.running,
    lastExecutionTime: run.timestamp,
    currentTask: nextTask,
    taskQueueCount: Math.max(0, Number(agent.taskQueueCount || 0) - 1)
  };
}

export function estimateKpiModel({ kpis, contentLibrary, campaigns }) {
  const shortPosts = contentLibrary.socialPosts?.length || 0;
  const longPromos = contentLibrary.longFormPromos?.length || 0;
  const emails = contentLibrary.emailSequences?.reduce((total, sequence) => total + sequence.emails.length, 0) || 0;
  const contentVolume = shortPosts + longPromos + emails;
  const activeCampaigns = campaigns.filter((campaign) => campaign.status === "active").length;
  const consistencyScore = Math.min(100, Math.round((contentVolume / 75) * 100));
  const campaignScore = Math.min(100, activeCampaigns * 18);
  const conversionScore = Math.round(consistencyScore * 0.42 + campaignScore * 0.28 + Number(kpis.conversionScore || 0) * 0.3);
  const clicksGenerated = Math.round(contentVolume * 22 + activeCampaigns * 140);
  const estimatedMonthlyRevenue = Math.round(
    clicksGenerated * Number(kpis.baselineConversionRate || 0.018) * Number(kpis.averageBookRoyalty || 4.2)
  );

  return {
    ...kpis,
    contentCreatedThisWeek: contentVolume,
    clicksGenerated,
    conversionScore,
    estimatedMonthlyRevenue,
    estimatedAnnualRevenue: estimatedMonthlyRevenue * 12,
    annualProgressPercent: Math.min(100, Math.round(((estimatedMonthlyRevenue * 12) / Number(kpis.annualRevenueTarget || 100000)) * 100))
  };
}

export function getBookById(books, bookId) {
  return books.find((book) => book.id === bookId) || books[0];
}
