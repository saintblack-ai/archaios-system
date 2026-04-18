export const MISSION_MODES = [
  "Growth Mode",
  "Revenue Mode",
  "Build Mode",
  "Intel Mode",
  "Creator Mode"
] as const;

export type MissionMode = (typeof MISSION_MODES)[number];

export type MarketIntelligence = {
  opportunity: string;
  threat: string;
  recommendation: string;
  status: "ready";
};

export type TaskPriority = "low" | "medium" | "high" | "critical";
export type TaskStatus = "pending" | "running" | "completed" | "blocked";

export type ActionTask = {
  id: string;
  title: string;
  assignedAgent: string;
  priority: TaskPriority;
  status: TaskStatus;
  result: string;
  createdAt: string;
  completedAt: string | null;
};

export type IntelligenceSnapshot = {
  overview: string;
  priorities: string[];
  commandNote: string;
  marketIntelligence: MarketIntelligence;
  bestNextMove: string;
  whyNow: string;
  expectedImpact: string;
  actionQueue: ActionTask[];
  missionMode: MissionMode;
};

type ModeTopic = {
  focus: string;
  overview: string;
  priorities: string[];
  commandNote: string;
  marketIntelligence: MarketIntelligence;
  bestNextMove: string;
  whyNow: string;
  expectedImpact: string;
  actionQueue: Array<{ title: string; assignedAgent: string; priority: TaskPriority; result: string }>;
};

const FALLBACK_TOPICS: Record<MissionMode, readonly ModeTopic[]> = {
  "Growth Mode": [
    {
      focus: "AI trends",
      overview: "AI demand is clustering around focused operator workflows, so growth is strongest where positioning is sharp and proof of value is immediate.",
      priorities: [
        "Clarify the one-sentence product promise on the first screen.",
        "Turn the best intelligence output into a shareable growth asset.",
        "Use visible wins to pull new users into a repeatable motion."
      ],
      commandNote: "Expand reach by packaging the dashboard as an operating advantage, not a feature list.",
      marketIntelligence: {
        opportunity: "Founders are actively testing AI systems that collapse research, planning, and action into one workflow.",
        threat: "Broad AI positioning risks blending into generic assistant products.",
        recommendation: "Lead with a sharp operator outcome and back it with visible, immediate evidence.",
        status: "ready"
      },
      bestNextMove: "Publish one concrete operator use case that shows how ARCHAIOS cuts research-to-decision time.",
      whyNow: "Buyer curiosity is high, but attention closes quickly unless the value proposition is specific.",
      expectedImpact: "Higher conversion from curious visitors into users who understand the product within one session.",
      actionQueue: [
        { title: "Write a homepage proof block around one operator workflow.", assignedAgent: "content_agent", priority: "high", result: "Homepage proof block drafted for operator workflow positioning." },
        { title: "Turn the latest brief into a public-facing sample output.", assignedAgent: "marketing_agent", priority: "medium", result: "Public sample output prepared for growth-facing distribution." },
        { title: "Add one CTA tied to a measurable growth outcome.", assignedAgent: "optimization_agent", priority: "high", result: "Growth CTA variant added with measurable conversion target." }
      ]
    }
  ],
  "Revenue Mode": [
    {
      focus: "SaaS opportunities",
      overview: "Revenue expansion is strongest when the product shows a clear weekly payoff and keeps the path from insight to conversion extremely short.",
      priorities: [
        "Surface the revenue-critical KPI and decision in one view.",
        "Align messaging around payback instead of generic automation.",
        "Reduce friction between insight, offer, and follow-up action."
      ],
      commandNote: "Convert intelligence into monetization moves that are visible and easy to execute.",
      marketIntelligence: {
        opportunity: "Lean SaaS buyers still spend when the product directly replaces fragmented, revenue-adjacent manual work.",
        threat: "Decorative AI experiences lose monetization power when they don’t clearly improve pipeline or retention.",
        recommendation: "Tie every brief to one revenue action and one commercial outcome.",
        status: "ready"
      },
      bestNextMove: "Create a revenue play card that links the current brief to a concrete pricing, sales, or upsell action.",
      whyNow: "The dashboard already has revenue signals, so the shortest path to value is turning those signals into decisions.",
      expectedImpact: "More direct monetization behavior and a stronger reason for operators to return daily.",
      actionQueue: [
        { title: "Define one monetization move from the current brief.", assignedAgent: "revenue_agent", priority: "critical", result: "Monetization move defined and attached to current revenue brief." },
        { title: "Add revenue-oriented messaging to the decision summary.", assignedAgent: "marketing_agent", priority: "medium", result: "Revenue-oriented messaging added to the decision summary." },
        { title: "Prepare a follow-up action tied to trial conversion or upsell.", assignedAgent: "feedback_agent", priority: "high", result: "Follow-up upsell action prepared for trial conversion flow." }
      ]
    }
  ],
  "Build Mode": [
    {
      focus: "automation markets",
      overview: "Product momentum is highest when teams can see what to build next, why it matters, and how it compounds operational trust.",
      priorities: [
        "Turn the dashboard into a command surface for the next product improvement.",
        "Promote reliability and traceability as visible product features.",
        "Make every new capability measurable in operator terms."
      ],
      commandNote: "Use intelligence to prioritize the next build decision, not just summarize conditions.",
      marketIntelligence: {
        opportunity: "Teams are rewarding automation products that make orchestration legible and dependable.",
        threat: "Black-box behavior creates hesitation and slows adoption of more advanced features.",
        recommendation: "Ship operator-visible decision tools that reveal progress and next action clearly.",
        status: "ready"
      },
      bestNextMove: "Build one operator-facing feature that turns today’s intelligence into a direct workflow step.",
      whyNow: "The dashboard already has live state and generated outputs, so adding actionability compounds immediately.",
      expectedImpact: "Stronger user trust and faster product differentiation through visible execution support.",
      actionQueue: [
        { title: "Choose one workflow gap revealed by the brief.", assignedAgent: "intelligence_agent", priority: "high", result: "Workflow gap identified and prioritized for the next build cycle." },
        { title: "Define a UI state that turns the gap into an action.", assignedAgent: "content_agent", priority: "medium", result: "Operator-facing UI action state defined for the selected workflow gap." },
        { title: "Instrument the action so impact can be seen on the dashboard.", assignedAgent: "optimization_agent", priority: "high", result: "Execution instrumentation added for dashboard-visible impact tracking." }
      ]
    }
  ],
  "Intel Mode": [
    {
      focus: "media technology",
      overview: "Decision advantage now comes from turning noisy signal streams into clear, operator-ready moves faster than competitors.",
      priorities: [
        "Condense the signal into a single decisive recommendation.",
        "Preserve context while reducing interpretation load.",
        "Keep the intelligence loop visible and repeatable."
      ],
      commandNote: "Treat every brief as a command asset that shortens the path from awareness to action.",
      marketIntelligence: {
        opportunity: "Teams need intelligence surfaces that translate trends into immediate operational posture.",
        threat: "Raw summaries create hesitation if they do not resolve into a clear recommended move.",
        recommendation: "Promote decision clarity over data volume and make the next action unmistakable.",
        status: "ready"
      },
      bestNextMove: "Promote the clearest market signal into a top-level command for the operator.",
      whyNow: "Fast-changing AI and media conditions reward dashboards that reduce hesitation, not just information gaps.",
      expectedImpact: "Quicker operator response time and a stronger sense that ARCHAIOS is driving decisions.",
      actionQueue: [
        { title: "Select the strongest signal in the current brief.", assignedAgent: "intelligence_agent", priority: "critical", result: "Highest-conviction signal selected for operator escalation." },
        { title: "Map it to one strategic decision for the operator.", assignedAgent: "mentor_agent", priority: "high", result: "Strategic decision recommendation mapped to the selected signal." },
        { title: "Log the outcome so the next brief compounds context.", assignedAgent: "feedback_agent", priority: "medium", result: "Decision outcome logged to strengthen the next intelligence cycle." }
      ]
    }
  ],
  "Creator Mode": [
    {
      focus: "creator economy",
      overview: "Creators respond to tools that transform market awareness into content direction, monetization angles, and rapid execution without flattening voice.",
      priorities: [
        "Connect market signals to a publishable angle.",
        "Tie strategy output to audience growth or monetization.",
        "Keep creativity guided, not templated."
      ],
      commandNote: "Turn insight into a differentiated creator move with clear upside.",
      marketIntelligence: {
        opportunity: "Creators want systems that reveal what to say next and how it can compound across products and channels.",
        threat: "Generic AI outputs reduce distinctiveness and weaken audience trust.",
        recommendation: "Use the dashboard to suggest sharp, differentiated creator actions tied to monetization.",
        status: "ready"
      },
      bestNextMove: "Convert the current intelligence signal into one creator-facing angle with a monetizable follow-through.",
      whyNow: "Audience attention windows are short, so creators benefit most when insight turns into a clear publishing decision quickly.",
      expectedImpact: "More differentiated output and better alignment between content effort and commercial return.",
      actionQueue: [
        { title: "Turn the brief into one strong creator angle.", assignedAgent: "content_agent", priority: "high", result: "Creator angle drafted from the current signal." },
        { title: "Connect that angle to a product, offer, or funnel step.", assignedAgent: "revenue_agent", priority: "medium", result: "Creator angle connected to an offer and funnel step." },
        { title: "Draft the first execution move while the signal is fresh.", assignedAgent: "marketing_agent", priority: "high", result: "First execution move drafted for immediate creator deployment." }
      ]
    }
  ]
};

function getModeTopic(mode: MissionMode, seed = Date.now()) {
  const topics = FALLBACK_TOPICS[mode];
  return topics[seed % topics.length];
}

export function generateFallbackMarketIntelligence(seed = Date.now(), mode: MissionMode = "Intel Mode"): MarketIntelligence {
  return getModeTopic(mode, seed).marketIntelligence;
}

export function generateFallbackBrief(seed = Date.now(), mode: MissionMode = "Intel Mode"): IntelligenceSnapshot {
  const topic = getModeTopic(mode, seed);
  const createdAt = new Date(seed).toISOString();
  return {
    overview: topic.overview,
    priorities: topic.priorities,
    commandNote: topic.commandNote,
    marketIntelligence: topic.marketIntelligence,
    bestNextMove: topic.bestNextMove,
    whyNow: topic.whyNow,
    expectedImpact: topic.expectedImpact,
    actionQueue: topic.actionQueue.map((task, index) => ({
      id: `${mode.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${seed}-${index}`,
      title: task.title,
      assignedAgent: task.assignedAgent,
      priority: task.priority,
      status: "pending",
      result: task.result,
      createdAt,
      completedAt: null
    })),
    missionMode: mode
  };
}
