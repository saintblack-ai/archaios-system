export const PRICING_TIERS = [
  {
    id: "free",
    name: "Free",
    price: 0,
    displayPrice: "$0",
    summary: "Limited preview of the ARCHAIOS intelligence system.",
    features: ["Limited preview dashboard", "Delayed sample signals", "Email capture and upgrade path"],
    gates: ["Teaser briefings", "Email capture", "Upgrade prompts"]
  },
  {
    id: "pro",
    name: "Pro",
    price: 49,
    displayPrice: "$49/month",
    summary: "$49/month full dashboard for daily intelligence, alerts, and execution workflows.",
    features: ["Full dashboard", "Live alerts", "Content generation", "Full system access"],
    gates: ["Full daily briefing", "Premium categories", "Saved history", "Member tools"]
  },
  {
    id: "elite",
    name: "Elite",
    price: 99,
    displayPrice: "$99/month",
    summary: "$99/month priority intelligence for operators who need earliest signals and deeper analysis.",
    features: ["Priority intelligence", "High-threat alerts", "Premium intelligence layer"],
    gates: ["Priority intelligence feed", "Elite reports", "Urgency alerts", "Future concierge features"]
  }
];

export const PRICING_TIER_MAP = Object.fromEntries(
  PRICING_TIERS.map((tier) => [tier.id, tier])
);

export const PAID_TIER_IDS = PRICING_TIERS.filter((tier) => tier.price > 0).map((tier) => tier.id);

export function getPricingTier(tierId) {
  return PRICING_TIER_MAP[tierId] || PRICING_TIER_MAP.free;
}
