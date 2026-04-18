export const PRICING_TIERS = [
  {
    id: "free",
    name: "Free",
    price: 0,
    displayPrice: "$0",
    summary: "Preview the intelligence system and enter the funnel.",
    features: ["Limited intelligence mode", "Delayed alerts", "Preview dashboard"],
    gates: ["Teaser briefings", "Email capture", "Upgrade prompts"]
  },
  {
    id: "pro",
    name: "Pro",
    price: 49,
    displayPrice: "$49/month",
    summary: "Unlock the full daily intelligence dashboard.",
    features: ["Full AI dashboard", "Live alerts", "Content generation", "Full system access"],
    gates: ["Full daily briefing", "Premium categories", "Saved history", "Member tools"]
  },
  {
    id: "elite",
    name: "Elite",
    price: 99,
    displayPrice: "$99/month",
    summary: "Operate with priority signals and deeper analysis.",
    features: ["Priority signals", "High-threat alerts", "Premium intelligence layer"],
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
