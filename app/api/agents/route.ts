import { NextResponse } from "next/server";
import { requireDashboardUser } from "../../lib/dashboardAuth";
import { supabaseAdmin } from "../../lib/supabaseAdmin";

const CORE_AGENT_NAMES = ["intelligence_agent", "content_agent", "marketing_agent", "revenue_agent"];
const SWARM_FALLBACK_NAMES = [
  "orchestrator_agent",
  "trend_scout",
  "opportunity_hunter",
  "experiment_runner",
  "launch_agent",
  "revenue_optimizer"
];

async function loadSwarmAgents() {
  const { data, error } = await supabaseAdmin
    .from("agents_registry")
    .select("id, agent_type, status, performance_score, tasks_completed, revenue_generated, created_at")
    .order("performance_score", { ascending: false })
    .limit(50);

  if (error) {
    return [];
  }

  return (data || []).map((agent) => ({
    name: agent.agent_type,
    description: `Dynamic ${agent.agent_type} in the self-replicating swarm`,
    schedule: "5-15 min loop",
    enabled: agent.status !== "inactive",
    tags: ["swarm", "dynamic"],
    last_run: agent.created_at,
    last_status: agent.status,
    performance_score: agent.performance_score,
    tasks_completed: agent.tasks_completed,
    revenue_generated: agent.revenue_generated,
    agent_id: agent.id
  }));
}

export async function GET() {
  const auth = await requireDashboardUser();
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: 401 });
  }

  const { data, error } = await supabaseAdmin
    .from("agents")
    .select("name, description, schedule, enabled")
    .in("name", CORE_AGENT_NAMES)
    .order("name", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const enriched = await Promise.all(
    (data || []).map(async (agent) => {
      const latestRun = await supabaseAdmin
        .from("agent_runs")
        .select("created_at, status")
        .eq("agent_name", agent.name)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      return {
        ...agent,
        tags: agent.schedule ? [agent.schedule] : [],
        last_run: latestRun.data?.created_at || null,
        last_status: latestRun.data?.status || "never_run"
      };
    })
  );

  const swarmAgents = await loadSwarmAgents();

  const fallbackSwarmAgents = SWARM_FALLBACK_NAMES
    .filter((name) => !swarmAgents.some((agent) => agent.name === name))
    .map((name) => ({
      name,
      description: "Swarm runtime ready",
      schedule: "5-15 min loop",
      enabled: true,
      tags: ["swarm", "fallback"],
      last_run: null,
      last_status: "ready"
    }));

  return NextResponse.json({ agents: [...enriched, ...swarmAgents, ...fallbackSwarmAgents] });
}

export async function PATCH(request: Request) {
  const auth = await requireDashboardUser();
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const agentName = String(body?.agent || "").trim();
  if (!agentName) {
    return NextResponse.json({ error: "Missing agent" }, { status: 400 });
  }
  if (!CORE_AGENT_NAMES.includes(agentName)) {
    return NextResponse.json({ error: "Unknown agent" }, { status: 400 });
  }

  const updates: Record<string, unknown> = {};
  if (typeof body?.enabled === "boolean") {
    updates.enabled = body.enabled;
  }
  if (typeof body?.schedule === "string") {
    if (["daily", "hourly", "weekly"].includes(body.schedule)) {
      updates.schedule = body.schedule;
    }
  } else if (Array.isArray(body?.tags)) {
    const nextSchedule = body.tags
      .map((value: unknown) => String(value))
      .find((value: string) => value === "daily" || value === "hourly" || value === "weekly");
    if (nextSchedule) {
      updates.schedule = nextSchedule;
    }
  }
  updates.updated_at = new Date().toISOString();

  const { data, error } = await supabaseAdmin
    .from("agents")
    .update(updates)
    .eq("name", agentName)
    .select("name, description, schedule, enabled")
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    agent: data
      ? {
          ...data,
          tags: data.schedule ? [data.schedule] : []
        }
      : null
  });
}
