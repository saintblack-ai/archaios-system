import architectSeed from "../../../data/architect-mode.json";
import { createApprovalPackets, createContentQualityReport } from "./contentQuality";

function createTimestampedLog(summary, layer = "Layered Autonomous Build Mode", status = "complete") {
  return {
    id: `build-${Date.now()}`,
    timestamp: new Date().toISOString(),
    layer,
    summary,
    status
  };
}

export function createArchitectModeState(baseAgents = []) {
  const primaryAgentRegistry = baseAgents.map((agent) => ({
    id: agent.id,
    name: agent.name,
    purpose: agent.mission,
    parentAgent: "Saint Black Book Growth Command",
    inputs: ["book records", "campaign state", "content library", "KPI state"],
    outputs: ["agent run", "dashboard state", "recommendations"],
    schedules: ["Manual run", "Run all agents", "Operations refresh where applicable"],
    permissions: agent.boundaries || ["internal planning", "dashboard reporting"],
    currentStatus: agent.status,
    dependencies: []
  }));

  return {
    ...architectSeed,
    agentRegistry: [...primaryAgentRegistry, ...architectSeed.supportAgents],
    currentBuildPhase: architectSeed.currentBuildPhase,
    systemHealth: {
      status: "nominal",
      checks: []
    }
  };
}

export function normalizeArchitectMode(existingArchitectMode, baseAgents = []) {
  const defaults = createArchitectModeState(baseAgents);
  const existingRegistry = existingArchitectMode?.agentRegistry || [];
  const registryById = new Map([...defaults.agentRegistry, ...existingRegistry].map((agent) => [agent.id, agent]));

  return {
    ...defaults,
    ...(existingArchitectMode || {}),
    layers: existingArchitectMode?.layers || defaults.layers,
    supportAgents: existingArchitectMode?.supportAgents || defaults.supportAgents,
    agentRegistry: Array.from(registryById.values()),
    buildLog: existingArchitectMode?.buildLog || defaults.buildLog,
    dependencyMap: existingArchitectMode?.dependencyMap || defaults.dependencyMap,
    permissionsMap: existingArchitectMode?.permissionsMap || defaults.permissionsMap,
    roadmapQueue: existingArchitectMode?.roadmapQueue || defaults.roadmapQueue,
    awaitingAuthorization: existingArchitectMode?.awaitingAuthorization || defaults.awaitingAuthorization,
    systemHealth: existingArchitectMode?.systemHealth || defaults.systemHealth
  };
}

export function evaluateArchitectHealth(state) {
  const postQueue = state.postQueue || [];
  const failedPosts = postQueue.filter((item) => item.status === "failed").length;
  const awaitingApproval = postQueue.filter((item) => item.approvalStatus !== "approved").length;
  const blockedItems = state.architectMode.awaitingAuthorization?.length || 0;
  const missingLiveLinks = state.books.filter((book) => book.appleBooksLink.includes("placeholder")).length;
  const autoPostBoundary =
    state.postingScheduler?.autoPostEnabled && state.socialConnectors?.some((connector) => !connector.connected);

  const checks = [
    {
      id: "health-agents",
      label: "Agent registry",
      status: state.architectMode.agentRegistry.length >= state.agents.length ? "pass" : "warn",
      detail: `${state.architectMode.agentRegistry.length} registered agents and support agents.`
    },
    {
      id: "health-queue",
      label: "Queue safety",
      status: failedPosts ? "warn" : "pass",
      detail: `${failedPosts} failed posts, ${awaitingApproval} posts awaiting approval.`
    },
    {
      id: "health-permissions",
      label: "Permission boundaries",
      status: blockedItems ? "hold" : "pass",
      detail: `${blockedItems} items intentionally blocked pending explicit authorization.`
    },
    {
      id: "health-links",
      label: "Apple Books links",
      status: missingLiveLinks ? "warn" : "pass",
      detail: `${missingLiveLinks} titles still use placeholder Apple Books URLs.`
    },
    {
      id: "health-autopost",
      label: "Auto-post boundary",
      status: autoPostBoundary ? "hold" : "pass",
      detail: autoPostBoundary ? "Auto-post mode is mock-only because real connectors are not connected." : "No live posting boundary crossed."
    }
  ];

  const status = checks.some((check) => check.status === "hold")
    ? "holding at permission boundary"
    : checks.some((check) => check.status === "warn")
      ? "needs review"
      : "nominal";

  return {
    status,
    checks
  };
}

export function runArchitectPass(state) {
  const architectMode = normalizeArchitectMode(state.architectMode, state.agents);
  const withArchitect = {
    ...state,
    architectMode
  };
  const health = evaluateArchitectHealth(withArchitect);
  const contentQualityReport = createContentQualityReport(state.contentLibrary);
  const approvalPackets = createApprovalPackets(state);
  const safeNextSteps = [
    "Review content quality scores before moving posts from pending to scheduled.",
    "Create exportable manual posting packets for X, Facebook, Instagram, and email.",
    "Simulate server-side queue worker behavior without connecting real APIs.",
    "Add a local dependency warning when auto-post mode is enabled without live connectors.",
    "Keep all real external API connections in the awaiting authorization queue."
  ];

  return {
    ...withArchitect,
    contentQualityReport,
    approvalPackets,
    architectMode: {
      ...architectMode,
      currentBuildPhase: "Layer 3 - Orchestrate",
      systemHealth: health,
      safeNextSteps,
      buildLog: [
        createTimestampedLog("Architect Mode pass refreshed registry, permission boundaries, roadmap, and system health.", "Layer 3 - Orchestrate"),
        ...(architectMode.buildLog || [])
      ].slice(0, 40),
      roadmapQueue: architectMode.roadmapQueue.map((item) =>
        item.id === "roadmap-001" || item.id === "roadmap-002" ? { ...item, status: "complete" } : item
      )
    }
  };
}
