import type { SwarmTaskContext, SwarmTaskResult } from "./types";

export class RevenueOptimizerAgent {
  static async execute(context: SwarmTaskContext): Promise<SwarmTaskResult> {
    const revenueSignal = Number(context.revenueSignal ?? 0);
    const conversionRate = Number(context.conversionRate ?? 0);
    const demandScore = Number(context.demandScore ?? 0);
    const priceMultiplier = revenueSignal > 2000 && conversionRate > 0.2 ? 1.12 : conversionRate < 0.08 ? 0.93 : 1.02;
    const exposure = conversionRate > 0.15 ? "increase" : demandScore > 60 ? "maintain" : "targeted";

    return {
      agent_type: "revenue_optimizer",
      task_type: "optimize",
      status: "success",
      score: Math.round((revenueSignal / 100) + (conversionRate * 100)),
      revenue_impact: Math.round(revenueSignal * (priceMultiplier - 1)),
      summary: "Revenue optimizer adjusted exposure and pricing guidance.",
      data: {
        winning_offer: revenueSignal > 1500 ? "high-intent premium offer" : "mid-ticket validation offer",
        exposure_action: exposure,
        recommended_price_multiplier: Number(priceMultiplier.toFixed(2)),
        pricing_notes:
          conversionRate > 0.2
            ? "Demand supports a premium test with increased exposure."
            : "Keep pricing adaptive while tightening funnel fit.",
        venture_metrics: {
          demand_score: demandScore,
          conversion_rate: conversionRate,
          revenue_signal: revenueSignal
        }
      }
    };
  }
}
