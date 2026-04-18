import { NextResponse } from "next/server";
import { fetchRecentRevenueEvents, fetchRevenueSummary } from "../../../lib/revenueSignals";

export async function GET() {
  try {
    const [summary, recentEvents] = await Promise.all([
      fetchRevenueSummary(),
      fetchRecentRevenueEvents(8)
    ]);

    return NextResponse.json({
      ...summary,
      id: 1,
      totalRevenue: summary.total_revenue,
      activeSubscriptions: summary.active_subscriptions,
      failedPayments: summary.failed_payments,
      lastPaymentTimestamp: summary.last_payment_at,
      revenueStatus: summary.revenue_status,
      updatedAt: summary.updated_at,
      recentEvents
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load revenue summary.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
