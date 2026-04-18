import { NextResponse } from "next/server";
import { requireDashboardUser } from "../../lib/dashboardAuth";
import { supabaseAdmin } from "../../lib/supabaseAdmin";

export async function GET() {
  const auth = await requireDashboardUser();
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: 401 });
  }

  const [metricsQuery, salesQuery, swarmQuery] = await Promise.all([
    supabaseAdmin
      .from("performance_metrics")
      .select("id, metric_type, value, metadata, created_at")
      .order("created_at", { ascending: false })
      .limit(30),
    supabaseAdmin
      .from("sales_content")
      .select("id, content_type, content, status, created_at")
      .order("created_at", { ascending: false })
      .limit(20),
    supabaseAdmin
      .from("agents_registry")
      .select("id, agent_type, status, performance_score, tasks_completed, revenue_generated, created_at")
      .order("performance_score", { ascending: false })
      .limit(50)
  ]);

  if (metricsQuery.error) {
    return NextResponse.json({ error: metricsQuery.error.message }, { status: 500 });
  }
  if (salesQuery.error) {
    return NextResponse.json({ error: salesQuery.error.message }, { status: 500 });
  }

  return NextResponse.json({
    metrics: metricsQuery.data || [],
    salesContent: salesQuery.data || [],
    swarm: {
      agents: swarmQuery.error ? [] : swarmQuery.data || [],
      summary: swarmQuery.error
        ? {
            total_agents: 0,
            active_agents: 0,
            total_revenue_generated: 0
          }
        : {
            total_agents: (swarmQuery.data || []).length,
            active_agents: (swarmQuery.data || []).filter((agent) => agent.status !== "inactive").length,
            total_revenue_generated: (swarmQuery.data || []).reduce((sum, agent) => sum + Number(agent.revenue_generated || 0), 0)
          }
    }
  });
}
