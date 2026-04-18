import { PRICING_TIERS } from "./pricing";

export const MOCK_PLATFORM_DASHBOARD = {
  generatedAt: "mock-pre-export",
  mode: "mock",
  userTier: "free",
  pricing: PRICING_TIERS,
  briefing: {
    title: "Mock Daily Intelligence Brief",
    summary:
      "Pre-export mock mode is active. This simulates the dashboard, briefing, and premium locks until live data and the ChatGPT export are connected.",
    actions: [
      "Validate public landing and pricing flow.",
      "Prepare Stripe test-mode checkout.",
      "Run export intake when the archive arrives."
    ]
  },
  activityFeed: [
    { title: "Mock briefing generated for dashboard QA." },
    { title: "Export intake waiting for source archive." },
    { title: "Pricing and gating skeleton ready for Pro and Elite." },
    { title: "Operator shell tracking blocked external integrations." }
  ],
  analytics: {
    visitors: 0,
    signups: 0,
    checkoutStarts: 0,
    conversionRate: 0
  },
  revenue: {
    projectedRevenue: 0,
    target: 100000,
    source: "mock projection"
  },
  agents: [
    { name: "Intelligence Agent", status: "mock-ready" },
    { name: "Conversion Agent", status: "mock-ready" },
    { name: "Analytics Agent", status: "mock-ready" }
  ],
  premium: {
    pro: ["Full daily briefing", "Premium categories", "Saved history"],
    elite: ["Priority feed", "Elite reports", "Urgency alerts"]
  }
};

export function shouldUseMockData() {
  if (typeof window === "undefined") {
    return false;
  }

  const params = new URLSearchParams(window.location.search);
  return params.get("mock") === "1" || window.localStorage.getItem("archaios_mock_mode") === "on";
}

export function setMockMode(enabled) {
  if (typeof window === "undefined") {
    return;
  }

  if (enabled) {
    window.localStorage.setItem("archaios_mock_mode", "on");
  } else {
    window.localStorage.removeItem("archaios_mock_mode");
  }
}

