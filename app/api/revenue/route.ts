import { NextResponse } from "next/server";
import { requireDashboardUser } from "../../lib/dashboardAuth";
import { fetchRecentRevenueEvents, fetchRevenueSummary } from "../../lib/revenueSignals";
import { supabaseAdmin } from "../../lib/supabaseAdmin";

export async function GET() {
  const auth = await requireDashboardUser();
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: 401 });
  }

  const { data: subscriptions, error: subsError } = await supabaseAdmin
    .from("subscriptions")
    .select("tier, status, updated_at");

  if (subsError) {
    return NextResponse.json({ error: subsError.message }, { status: 500 });
  }

  const today = new Date().toISOString().slice(0, 10);
  const summary = await fetchRevenueSummary().catch(() => null);
  const recentRevenueEvents = await fetchRecentRevenueEvents(12).catch(() => []);
  const { data: metrics } = await supabaseAdmin
    .from("metrics")
    .select("metric_date, value")
    .eq("metric_name", "mrr_snapshot")
    .order("metric_date", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data: webhookEvents, count } = await supabaseAdmin
    .from("agent_logs")
    .select("created_at, output, status", { count: "exact" })
    .eq("agent_name", "stripe_webhook")
    .order("created_at", { ascending: false })
    .limit(20);

  const revenueToday = (webhookEvents || []).filter((event) => event.created_at.startsWith(today)).length;

  return NextResponse.json({
    subscriptions: {
      total: subscriptions?.length || 0,
      active: (subscriptions || []).filter((item) => item.status === "active" || item.status === "trialing").length
    },
    revenueToday,
    summary,
    totalRevenue: summary?.total_revenue ?? 0,
    mrr: summary?.mrr ?? 0,
    activeSubscriptions: summary?.active_subscriptions ?? ((subscriptions || []).filter((item) => item.status === "active" || item.status === "trialing").length),
    failedPayments: summary?.failed_payments ?? 0,
    lastPaymentTimestamp: summary?.last_payment_at ?? null,
    revenueStatus: summary?.revenue_status ?? "Standby",
    recentRevenueEvents,
    stripeMetrics: metrics?.value || null,
    webhookEvents: {
      total: count || 0,
      latest: webhookEvents || []
    }
  });
}
