import { createAgentDefinition, createRun, updateAgentAfterRun } from "./shared";

export const salesOptimizerAgent = createAgentDefinition({
  id: "sales-optimizer-agent",
  name: "Sales Optimizer Agent",
  mission: "Identify funnel drop-offs and improve CTA wording, layout, metadata, and content cadence.",
  currentTask: "Audit current funnel assumptions.",
  queueCount: 6
});

export function runSalesOptimizerAgent(state) {
  const recommendations = [
    "Replace generic Apple Books links with per-book UTM-style tracking routes before scaling traffic.",
    "Use one primary CTA per page: Read on Apple Books.",
    "Add review placeholders now, then replace only with real reader testimonials later.",
    "Test spiritual discipline hooks against mystery hooks before expanding cadence."
  ];
  const run = createRun(salesOptimizerAgent, "Create funnel improvement recommendations", "completed", "Generated conversion recommendations without claiming guaranteed sales.", { recommendations });

  return {
    run,
    agent: updateAgentAfterRun(salesOptimizerAgent, run, "Review landing page click data after tracking is connected."),
    recommendations
  };
}
