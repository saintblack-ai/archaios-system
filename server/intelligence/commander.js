import { getThreatLevel } from "./eventSchema.js";
import { saveReport } from "./store.js";

export async function generateCommanderBrief(events, systemHealth = {}) {
  const verified = events.filter((event) => event.is_verified);
  const uncertain = events.filter((event) => !event.is_verified);
  const sourceNames = [...new Set(events.map((event) => event.source_name).filter(Boolean))];
  const threatLevel = getThreatLevel(events);
  const generatedAt = new Date().toISOString();

  const report = {
    id: `brief-${generatedAt}`,
    report_type: "sitrep",
    generated_at: generatedAt,
    model_identifier: "deterministic-commander-v1",
    threat_level: threatLevel,
    executive_summary: `ARCHAIOS assessed ${events.length} sourced event records. Current global posture is ${threatLevel.toUpperCase()} based on available verified and sample-labeled inputs.`,
    confirmed_developments: verified.slice(0, 6).map((event) => ({
      headline: event.headline,
      source: event.source_name,
      source_url: event.source_url,
      confidence: event.confidence
    })),
    uncertain_developments: uncertain.slice(0, 6).map((event) => ({
      headline: event.headline,
      reason: event.status === "sample" ? "sample data" : "not verified",
      source: event.source_name
    })),
    system_health_status: systemHealth.status || "unknown",
    priority_research_questions: [
      "Which elevated items have independent second-source confirmation?",
      "Which infrastructure signals affect ARCHAIOS dependencies?",
      "Which map events require mission-level research follow-up?"
    ],
    mission_queue_updates: [
      "Refresh live sources before operational review.",
      "Link high-severity events to active research missions.",
      "Preserve source attribution on every derived assessment."
    ],
    recommended_next_actions: [
      "Review failed or stale sources.",
      "Open event details before making external claims.",
      "Separate confirmed facts from Commander interpretation."
    ],
    source_list: sourceNames,
    confidence_note: "This brief is deterministic and source-attributed. It does not convert model interpretation into verified fact."
  };

  await saveReport(report);
  return report;
}
