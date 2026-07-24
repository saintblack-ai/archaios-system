export const LEGACY_DIVISIONS = [
  {
    id: "platform",
    code: "01",
    name: "ARCHAIOS Platform",
    purpose: "Production engineering for AI systems, SaaS infrastructure, agents, automation, and mobile command access.",
    initiatives: ["AI agent systems", "Cloudflare Worker runtime", "Mobile command access", "Versioned production engineering"],
    statuses: [
      { label: "Frontend operational", tone: "operational" },
      { label: "Runtime contracts validated", tone: "operational" },
      { label: "Authentication restoration in progress", tone: "restoration" },
      { label: "Revenue flow security gated", tone: "gated" }
    ]
  },
  {
    id: "media",
    code: "02",
    name: "Saint Black Media",
    purpose: "A connected creative-development system for music, film, books, visual storytelling, and the Saint Black universe.",
    initiatives: ["Spymaster — concept in development", "AI Assassin Saint Black 009 — creative initiative", "Assets and Missions", "Music and film production pipeline"],
    statuses: [
      { label: "Creative universe mapped", tone: "operational" },
      { label: "Release planning in development", tone: "planned" },
      { label: "Public proof assets planned", tone: "planned" }
    ]
  },
  {
    id: "research",
    code: "03",
    name: "QX Research",
    purpose: "A public-safe research-development structure for long-horizon computing, memory, routing, and systems architecture.",
    initiatives: ["Quantum hardware architecture", "AI compiler research", "Photonic routing", "Cryogenic systems", "Error correction", "Versioned research journal"],
    statuses: [
      { label: "Research categories established", tone: "operational" },
      { label: "Technical validation ongoing", tone: "restoration" },
      { label: "Private source material protected", tone: "gated" }
    ]
  },
  {
    id: "institutional",
    code: "04",
    name: "Institutional Legacy",
    purpose: "Respectful preservation of service, leadership, education, founder milestones, generational history, and permanent records.",
    initiatives: ["Military communications service", "Leadership and service milestones", "Graphic design and intelligence studies", "Founder history", "Generational archive", "Permanent record preservation"],
    statuses: [
      { label: "Public-safe categories defined", tone: "operational" },
      { label: "Permanent archive planned", tone: "planned" },
      { label: "Private records remain isolated", tone: "gated" }
    ]
  }
];

export const TIME_OPTIONS = ["30 minutes", "60 minutes", "2 hours", "Half day"];
export const ENERGY_OPTIONS = ["Focused", "Steady", "Low bandwidth", "High momentum"];
export const OUTCOME_OPTIONS = [
  "Create public proof",
  "Advance production",
  "Document research",
  "Prepare a creative release",
  "Preserve a milestone",
  "Build professional opportunity"
];

export const SYSTEM_STATUS = {
  operational: [
    "Public Vite/React frontend",
    "Production build pipeline",
    "Runtime contracts",
    "Cloudflare Worker",
    "GitHub Actions",
    "Responsive interface",
    "Local mission generator"
  ],
  restricted: [
    "Supabase authenticated access",
    "Persistent personal dashboards",
    "Subscription synchronization",
    "Stripe checkout",
    "Private Black Vault records"
  ]
};

export const DEFAULT_MISSION_SELECTION = {
  divisionId: "platform",
  time: "60 minutes",
  energy: "Focused",
  outcome: "Create public proof"
};

const DIVISION_ACTIONS = {
  platform: ["Choose one verified system capability to demonstrate", "Build or refine one public-safe proof surface", "Record the result and its next security gate"],
  media: ["Select one clearly labeled creative initiative", "Shape a concise release-ready concept artifact", "Document ownership, status, and the next production action"],
  research: ["Choose one public-safe research category", "Summarize the current question without exposing source material", "Create a versioned research note with validation criteria"],
  institutional: ["Select one public-safe milestone category", "Draft a respectful, source-aware record", "Mark private evidence for future secure archival review"]
};

const OUTCOME_LEADS = {
  "Create public proof": "Turn one verified capability into evidence another person can understand.",
  "Advance production": "Move one bounded deliverable from planning toward a reviewable state.",
  "Document research": "Convert a research question into a clear, versioned record.",
  "Prepare a creative release": "Prepare one creative initiative for its next approved release step.",
  "Preserve a milestone": "Capture one milestone with context, attribution, and continuity notes.",
  "Build professional opportunity": "Create one credible artifact that supports a future conversation or opportunity."
};

export function getDivisionById(id) {
  return LEGACY_DIVISIONS.find((division) => division.id === id) || LEGACY_DIVISIONS[0];
}

export function generateLegacyMission(selection = DEFAULT_MISSION_SELECTION) {
  const normalized = { ...DEFAULT_MISSION_SELECTION, ...selection };
  const division = getDivisionById(normalized.divisionId);
  const actions = DIVISION_ACTIONS[division.id];
  const lead = OUTCOME_LEADS[normalized.outcome] || OUTCOME_LEADS[DEFAULT_MISSION_SELECTION.outcome];

  return {
    title: `${division.name}: ${normalized.outcome}`,
    brief: `${lead} Planned for ${normalized.time} at a ${normalized.energy.toLowerCase()} energy level.`,
    disclosure: "Generated locally from deterministic planning rules. No AI inference or API call was used.",
    steps: actions.map((label, index) => ({
      id: `${division.id}-${index + 1}`,
      label,
      complete: false
    }))
  };
}

export function toggleMissionStep(mission, stepId) {
  if (!mission) {
    return mission;
  }

  return {
    ...mission,
    steps: mission.steps.map((step) => step.id === stepId ? { ...step, complete: !step.complete } : step)
  };
}

export function isPresentationMode(search = "") {
  return new URLSearchParams(search).get("presentation") === "1";
}
