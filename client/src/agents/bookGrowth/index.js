import booksSeed from "../../../data/books.json";
import campaignsSeed from "../../../data/campaigns.json";
import contentSeed from "../../../data/content-library.json";
import runsSeed from "../../../data/agent-runs.json";
import kpisSeed from "../../../data/kpis.json";
import { analyticsAgent, runAnalyticsAgent } from "./analyticsAgent";
import { createArchitectModeState, normalizeArchitectMode, runArchitectPass } from "./architectMode";
import { brandStoryAgent, runBrandStoryAgent } from "./brandStoryAgent";
import { createApprovalPackets, createContentQualityReport } from "./contentQuality";
import { contentCreatorAgent, runContentCreatorAgent } from "./contentCreatorAgent";
import { emailCommunityAgent, runEmailCommunityAgent } from "./emailCommunityAgent";
import { funnelAgent, runFunnelAgent } from "./funnelAgent";
import { getSocialConnectorStatus } from "../../integrations/social/connectors";
import { operationsAgent, runOperationsAgent } from "./operationsAgent";
import { createPostQueueFromContent } from "../../queues/postQueue";
import { createDefaultScheduler } from "../../scheduler/cronRunner";
import { salesOptimizerAgent, runSalesOptimizerAgent } from "./salesOptimizerAgent";
import { seoMetadataAgent, runSeoMetadataAgent } from "./seoMetadataAgent";
import { socialDistributionAgent, runSocialDistributionAgent } from "./socialDistributionAgent";
import { runStrategyCommander, strategyCommander } from "./strategyCommander";
import { AGENT_STATUS, BOOK_GROWTH_STORAGE_KEY, SCHEDULE, estimateKpiModel } from "./shared";

export const bookGrowthAgents = [
  strategyCommander,
  brandStoryAgent,
  contentCreatorAgent,
  seoMetadataAgent,
  funnelAgent,
  socialDistributionAgent,
  emailCommunityAgent,
  analyticsAgent,
  salesOptimizerAgent,
  operationsAgent
];

const runners = {
  [strategyCommander.id]: runStrategyCommander,
  [brandStoryAgent.id]: runBrandStoryAgent,
  [contentCreatorAgent.id]: runContentCreatorAgent,
  [seoMetadataAgent.id]: runSeoMetadataAgent,
  [funnelAgent.id]: runFunnelAgent,
  [socialDistributionAgent.id]: runSocialDistributionAgent,
  [emailCommunityAgent.id]: runEmailCommunityAgent,
  [analyticsAgent.id]: runAnalyticsAgent,
  [salesOptimizerAgent.id]: runSalesOptimizerAgent,
  [operationsAgent.id]: runOperationsAgent
};

export function createInitialBookGrowthState() {
  const seededContent = runContentCreatorAgent({
    books: booksSeed,
    campaigns: campaignsSeed,
    contentLibrary: contentSeed,
    kpis: kpisSeed,
    agents: bookGrowthAgents
  }).contentLibrary;
  const kpis = estimateKpiModel({ kpis: kpisSeed, contentLibrary: seededContent, campaigns: campaignsSeed });
  const postingScheduler = createDefaultScheduler();
  const socialConnectorConfig = {
    credentials: {
      X: { enabled: false },
      Facebook: { enabled: false },
      Instagram: { enabled: false }
    }
  };
  const postQueue = createPostQueueFromContent(seededContent, { maxItems: 18 });
  const contentQualityReport = createContentQualityReport(seededContent);

  return {
    version: 1,
    generatedAt: new Date().toISOString(),
    books: booksSeed,
    campaigns: campaignsSeed,
    contentLibrary: seededContent,
    agentRuns: runsSeed,
    kpis,
    agents: bookGrowthAgents,
    architectMode: createArchitectModeState(bookGrowthAgents),
    postQueue,
    contentQualityReport,
    approvalPackets: createApprovalPackets({ books: booksSeed, postQueue }),
    postingScheduler,
    postingLogs: [
      {
        id: "posting-log-seed",
        level: "info",
        timestamp: new Date().toISOString(),
        message: "Posting system initialized in manual approval-first mode. No external posting has occurred."
      }
    ],
    socialConnectorConfig,
    socialConnectors: getSocialConnectorStatus(socialConnectorConfig),
    campaignPipeline: ["idea", "in-production", "scheduled", "live", "completed", "best-performers"],
    automationSettings: {
      mode: "manual",
      autoPosting: false,
      paidAds: "optional-disabled",
      scheduler: "browser-local-dev",
      compliance: "No spam, no fake reviews, no policy-violating automation."
    },
    schedules: SCHEDULE,
    recommendations: [
      "Replace Apple Books placeholder links with live product URLs before publishing.",
      "Create one trackable landing route per book before scaling content volume.",
      "Begin with daily organic posts and weekly metadata review; add paid ads only after CTR is measurable.",
      "Use approval-first queues until real social publishing credentials are connected."
    ],
    lastRunSummary: "Seeded local Book Growth OS. No external posting has occurred."
  };
}

export function loadBookGrowthState() {
  const defaults = createInitialBookGrowthState();

  if (typeof window === "undefined") {
    return defaults;
  }

  const saved = window.localStorage.getItem(BOOK_GROWTH_STORAGE_KEY);
  if (!saved) {
    return defaults;
  }

  try {
    const parsed = JSON.parse(saved);
    return normalizeBookGrowthState({ ...defaults, ...parsed });
  } catch {
    return defaults;
  }
}

export function normalizeBookGrowthState(state) {
  const defaults = createInitialBookGrowthState();
  const nextState = {
    ...defaults,
    ...state,
    books: state.books || defaults.books,
    campaigns: state.campaigns || defaults.campaigns,
    contentLibrary: { ...defaults.contentLibrary, ...(state.contentLibrary || {}) },
    agents: state.agents || defaults.agents,
    postQueue: state.postQueue || defaults.postQueue,
    contentQualityReport: state.contentQualityReport || defaults.contentQualityReport,
    approvalPackets: state.approvalPackets || defaults.approvalPackets,
    postingScheduler: { ...defaults.postingScheduler, ...(state.postingScheduler || {}) },
    postingLogs: state.postingLogs || defaults.postingLogs,
    socialConnectorConfig: state.socialConnectorConfig || defaults.socialConnectorConfig,
    socialConnectors: state.socialConnectors || defaults.socialConnectors,
    automationSettings: { ...defaults.automationSettings, ...(state.automationSettings || {}) },
    recommendations: state.recommendations || defaults.recommendations,
    schedules: state.schedules || defaults.schedules
  };

  return {
    ...nextState,
    architectMode: normalizeArchitectMode(state.architectMode, nextState.agents)
  };
}

export function saveBookGrowthState(state) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(BOOK_GROWTH_STORAGE_KEY, JSON.stringify(state));
}

function replaceAgent(agents, updatedAgent) {
  return agents.map((agent) => (agent.id === updatedAgent.id ? updatedAgent : agent));
}

function appendRun(state, run) {
  return [run, ...(state.agentRuns || [])].slice(0, 100);
}

export function runBookGrowthAgent(state, agentId) {
  const runner = runners[agentId];
  const fallbackAgent = state.agents.find((agent) => agent.id === agentId);

  if (!runner || !fallbackAgent) {
    return {
      ...state,
      lastRunSummary: `No runner exists for ${agentId}.`,
      agents: state.agents.map((agent) => (agent.id === agentId ? { ...agent, status: AGENT_STATUS.error } : agent))
    };
  }

  const result = runner(state);
  let nextState = {
    ...state,
    agents: replaceAgent(state.agents, result.agent),
    agentRuns: appendRun(state, result.run),
    lastRunSummary: result.run.summary
  };

  if (result.contentLibrary) nextState.contentLibrary = result.contentLibrary;
  if (result.kpis) nextState.kpis = result.kpis;
  if (result.recommendations) nextState.recommendations = [...result.recommendations, ...(state.recommendations || [])].slice(0, 20);
  if (result.metadataRecommendations) nextState.metadataRecommendations = result.metadataRecommendations;
  if (result.funnelMap) nextState.funnelMap = result.funnelMap;
  if (result.publishingQueue) nextState.publishingQueue = result.publishingQueue;
  if (result.leadMagnets) nextState.leadMagnets = result.leadMagnets;
  if (result.journey) nextState.readerJourney = result.journey;
  if (result.leaderboard) nextState.campaignLeaderboard = result.leaderboard;
  if (result.health) nextState.operationsHealth = result.health;
  if (result.angles) nextState.storyAngles = result.angles;

  nextState.kpis = estimateKpiModel(nextState);
  nextState.generatedAt = new Date().toISOString();
  return nextState;
}

export function runAllBookGrowthAgents(state) {
  return bookGrowthAgents.reduce((currentState, agent) => runBookGrowthAgent(currentState, agent.id), state);
}

export function pauseBookGrowthAgent(state, agentId) {
  return {
    ...state,
    agents: state.agents.map((agent) =>
      agent.id === agentId
        ? {
            ...agent,
            status: AGENT_STATUS.paused,
            currentTask: "Paused by operator. No automation is running."
          }
        : agent
    )
  };
}

export function resetWeeklyPlanning(state) {
  const nextState = {
    ...state,
    campaigns: state.campaigns.map((campaign, index) => ({
      ...campaign,
      stage: index === 0 ? "live" : campaign.stage,
      score: Math.min(100, Number(campaign.score || 50) + 3)
    })),
    recommendations: [
      "Weekly reset complete: lead with the highest-priority book, publish approval-ready posts, then review CTR proxies.",
      ...(state.recommendations || [])
    ].slice(0, 20)
  };

  return runBookGrowthAgent(nextState, strategyCommander.id);
}

export { runArchitectPass };
