import { redirect } from "next/navigation";
import { requireAdminUser } from "../lib/dashboardAuth";
import { supabaseAdmin } from "../lib/supabaseAdmin";
import { SignOutButton } from "../components/SignOutButton";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const auth = await requireAdminUser();

  if ("error" in auth) {
    redirect(auth.error === "Unauthorized" ? "/login?redirectedFrom=/admin" : "/dashboard");
  }

  const [{ count: totalUsers }, { count: activeSubscriptions }, { data: webhookLogs }] =
    await Promise.all([
      supabaseAdmin.from("profiles").select("id", { count: "exact", head: true }),
      supabaseAdmin
        .from("subscriptions")
        .select("id", { count: "exact", head: true })
        .eq("status", "active"),
      supabaseAdmin
        .from("agent_logs")
        .select("id,agent_name,status,created_at,result")
        .eq("agent_name", "stripe_webhook")
        .order("created_at", { ascending: false })
        .limit(10)
    ]);

  return (
    <main className="sb-shell">
      <nav className="sb-nav">
        <div>
          <div className="sb-brand">Saint Black Command</div>
          <div className="sb-status">Admin route for {auth.user.email}</div>
        </div>
        <div className="sb-nav-links">
          <a className="sb-button-secondary" href="/dashboard">
            Dashboard
          </a>
          <SignOutButton />
        </div>
      </nav>

      <section className="sb-grid">
        <article className="sb-card">
          <p className="sb-eyebrow">Users</p>
          <h2>{totalUsers ?? 0}</h2>
          <p>Total users in Supabase profiles.</p>
        </article>
        <article className="sb-card">
          <p className="sb-eyebrow">Active subscriptions</p>
          <h2>{activeSubscriptions ?? 0}</h2>
          <p>Active subscription count from Supabase.</p>
        </article>
        <article className="sb-card">
          <p className="sb-eyebrow">Webhook logs</p>
          <h2>{webhookLogs?.length ?? 0}</h2>
          <p>Recent Stripe webhook records.</p>
        </article>
      </section>

      <section className="sb-card" style={{ marginTop: 20 }}>
        <p className="sb-eyebrow">Recent webhook events</p>
        <h2>Latest activity</h2>
        <ul className="sb-list">
          {(webhookLogs || []).map((log) => (
            <li key={log.id}>
              {log.status} | {log.created_at} | {String(log.result?.event_type || "stripe.event")}
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
