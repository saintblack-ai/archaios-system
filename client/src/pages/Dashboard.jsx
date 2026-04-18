import { useEffect, useMemo, useState } from "react";
import CommandNav from "../components/CommandNav";
import ProtectedContent from "../components/ProtectedContent";
import { startStripeCheckout } from "../agents/stripeAgent";
import { PRICING_TIERS } from "../lib/pricing";
import {
  createBillingPortalSession,
  fetchPlatformDashboard,
  fetchSubscription,
  getApiBaseUrl,
  getBackendConnectionSummary,
  getBackendHealthcheckUrl,
  getCurrentSession,
  subscribeToAuthChanges
} from "../lib/platform";
import {
  getAccountExperienceState,
  getContentAccessState,
  hasPlanAccess,
  normalizePlan,
  normalizeSubscriptionRecord
} from "../lib/subscription";
import { MOCK_PLATFORM_DASHBOARD, setMockMode, shouldUseMockData } from "../lib/mockPlatform";

const ADMIN_EMAIL = String(import.meta.env.VITE_ADMIN_EMAIL || "").trim().toLowerCase();
const DASHBOARD_PATH = `${import.meta.env.BASE_URL || "/"}dashboard`.replace(/\/{2,}/g, "/");
const SIGNAL_PREVIEW_ITEMS = [
  {
    title: "Macro volatility pulse",
    detail: "Risk momentum increased in key sectors during the latest cycle."
  },
  {
    title: "Regional escalation watch",
    detail: "Escalation probability is elevated enough for proactive scenario planning."
  }
];
const LOCKED_SIGNAL_ITEMS = [
  "Priority signal queue",
  "High-urgency escalation feed",
  "Elite rapid-response signal lane"
];
const PLAN_REVENUE_SIMULATION = {
  free: {
    label: "Free",
    monthlyRevenueRange: "$0 - $250",
    executionSpeed: "Delayed",
    unlockedSignals: 2,
    impactScore: 26
  },
  pro: {
    label: "Pro",
    monthlyRevenueRange: "$2,500 - $8,000",
    executionSpeed: "Live",
    unlockedSignals: 6,
    impactScore: 64
  },
  elite: {
    label: "Elite",
    monthlyRevenueRange: "$8,000 - $20,000+",
    executionSpeed: "Priority",
    unlockedSignals: 10,
    impactScore: 92
  }
};

function getCheckoutReturnState() {
  if (typeof window === "undefined") {
    return "";
  }

  const value = new URLSearchParams(window.location.search).get("checkout");
  return value === "success" || value === "cancel" ? value : "";
}

function clearCheckoutReturnState() {
  if (typeof window === "undefined") {
    return;
  }

  const nextUrl = new URL(window.location.href);
  nextUrl.searchParams.delete("checkout");
  window.history.replaceState({}, "", nextUrl.toString());
}

function formatDate(value) {
  if (!value) {
    return "Not available";
  }

  try {
    return new Date(value).toLocaleString();
  } catch {
    return String(value);
  }
}

function DashboardMetric({ label, value, detail }) {
  return (
    <article className="saint-dashboard-card saint-dashboard-metric">
      <p className="eyebrow">{label}</p>
      <strong>{value}</strong>
      <span>{detail}</span>
    </article>
  );
}

function resolveAudienceLabel(access) {
  if (access.active) {
    return access.plan === "elite" ? "Paid Elite" : "Paid Pro";
  }

  return "Free Preview";
}

function getUpgradePrompt(accountExperience) {
  if (accountExperience.mode === "guest") {
    return "Early user advantage starts at sign-in. Free stays limited access with delayed signals.";
  }
  if (accountExperience.mode === "signed-in-free") {
    return "Signals are delayed on Free. Upgrade to unlock live execution layer speed and revenue-grade timing.";
  }
  if (accountExperience.mode === "pro") {
    return "Pro is active. Move to Elite for first-access signal advantage and faster decision cycles.";
  }
  return "Elite is active. You are in the priority lane with exclusivity on signal timing and depth.";
}

function getTierStateSummary(accountExperience) {
  if (accountExperience.mode === "guest") {
    return "Guest: limited access preview only. Upgrade flow is blocked until sign-in.";
  }
  if (accountExperience.mode === "signed-in-free") {
    return "Signed-In Free: delayed signals and restricted execution. Upgrade to unlock live execution layer.";
  }
  if (accountExperience.mode === "pro") {
    return "Pro: live execution layer is active for speed, monetization focus, and daily advantage.";
  }
  return "Elite: exclusive priority signal lane with maximum speed, advantage, and command visibility.";
}

function getLockedStateMessage(access, accountExperience) {
  if (access.active) {
    return access.canAccessEliteSignals
      ? "All signal lanes are currently unlocked."
      : "Core paid lanes are active. Upgrade to unlock live execution layer access for Elite-only priority signals.";
  }

  if (accountExperience.mode === "guest") {
    return "Limited access: guest preview only. Upgrade to unlock live execution layer access after sign-in.";
  }

  return "Limited access on Free. Upgrade to unlock live execution layer access and remove delayed-signal restrictions.";
}

function PricingCard({ plan, currentPlan, active, checkoutBusy, session, onCheckout }) {
  const isCurrent = currentPlan === plan.id;
  const isPaidPlan = plan.id === "pro" || plan.id === "elite";
  const isDisabled = !isPaidPlan || checkoutBusy || !session || (isCurrent && active);

  return (
    <article
      className={[
        "saint-dashboard-card",
        "saint-pricing-card",
        isCurrent ? "saint-pricing-card-current" : "",
        plan.id === "pro" ? "saint-pricing-card-featured" : ""
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="saint-card-head">
        <p className="eyebrow">{plan.name}</p>
        {plan.id === "pro" ? <span className="status-chip status-chip-live">Most Popular</span> : null}
      </div>
      <h3>{plan.displayPrice}</h3>
      <p>{plan.id === "free" ? "Limited access preview with delayed signals." : "Outcome lane: faster execution, stronger conversion timing, and decision advantage."}</p>
      <ul className="saint-dashboard-list">
        {plan.features.map((feature) => (
          <li key={feature}>{feature}</li>
        ))}
      </ul>
      <button
        className={plan.id === "free" ? "ghost-button" : "primary-button"}
        type="button"
        onClick={() => {
          if (isPaidPlan) {
            onCheckout(plan.id);
          }
        }}
        disabled={isDisabled}
      >
        {plan.id === "free"
          ? "Current preview plan"
          : isCurrent && active
            ? "Current plan"
            : checkoutBusy
              ? "Starting..."
              : plan.id === "pro"
                ? "Unlock faster execution and revenue timing"
                : "Claim exclusive priority signal advantage"}
      </button>
    </article>
  );
}

function LockedCard({ title, description, requiredPlan }) {
  return (
    <article className="saint-dashboard-card saint-dashboard-card-locked">
      <div className="saint-card-head">
        <p className="eyebrow">Limited Access</p>
        <span className="status-chip">Requires {normalizePlan(requiredPlan).toUpperCase()}</span>
      </div>
      <h3>{title}</h3>
      <p>Upgrade to unlock live execution layer access. {description}</p>
    </article>
  );
}

function DashboardLayout({
  session,
  subscription,
  dashboard,
  health,
  loading,
  error,
  checkoutBusy,
  billingBusy,
  checkoutMessage,
  onCheckout,
  onManageBilling,
  onRefresh,
  mockEnabled,
  onToggleMock
}) {
  const access = getContentAccessState(subscription);
  const accountExperience = getAccountExperienceState(subscription, session);
  const userEmail = session?.user?.email || "Guest";
  const activityFeed = Array.isArray(dashboard?.activityFeed) ? dashboard.activityFeed.slice(0, 4) : [];
  const briefingActions = Array.isArray(dashboard?.briefing?.actions) ? dashboard.briefing.actions.slice(0, 3) : [];
  const pricing = Array.isArray(dashboard?.pricing) && dashboard.pricing.length ? dashboard.pricing : PRICING_TIERS;
  const healthUrl = getBackendHealthcheckUrl();
  const backendConnection = getBackendConnectionSummary();
  const paidState = resolveAudienceLabel(access);
  const upgradePrompt = getUpgradePrompt(accountExperience);
  const activePlanSimulation = PLAN_REVENUE_SIMULATION[access.plan] || PLAN_REVENUE_SIMULATION.free;
  const lockedSignals = access.canAccessEliteSignals ? [] : LOCKED_SIGNAL_ITEMS;
  const unlockedSignals = access.canAccessEliteSignals ? SIGNAL_PREVIEW_ITEMS.concat(
    LOCKED_SIGNAL_ITEMS.map((item) => ({ title: item, detail: "Live execution lane is available on your current plan." }))
  ) : SIGNAL_PREVIEW_ITEMS;

  return (
    <main className="saint-dashboard-shell">
      <CommandNav current="dashboard" />
      <section className="saint-dashboard-hero">
        <div className="saint-dashboard-copy">
          <p className="eyebrow">Saint Black Command Dashboard</p>
          <h1>Monetization, access control, and AI features in one command surface.</h1>
          <p>
            Early user advantage starts here: Free is limited access with delayed signals, Pro unlocks live execution, Elite unlocks exclusive priority speed.
          </p>
          <div className="saint-dashboard-actions">
            <button className="primary-button" type="button" onClick={() => onCheckout("pro")} disabled={checkoutBusy || !session}>
              {checkoutBusy ? "Starting..." : "Unlock faster execution for $49/mo"}
            </button>
            <button className="ghost-button" type="button" onClick={() => onCheckout("elite")} disabled={checkoutBusy || !session}>
              Claim exclusive priority lane for $99/mo
            </button>
            <a className="ghost-button saint-link-button" href={`${import.meta.env.BASE_URL || "/"}pricing`}>
              Pricing Page
            </a>
            <a className="ghost-button saint-link-button" href={`${import.meta.env.BASE_URL || "/"}landing`}>
              Public Landing
            </a>
            <button className="ghost-button" type="button" onClick={onRefresh} disabled={loading}>
              {loading ? "Refreshing..." : "Refresh dashboard"}
            </button>
            <button className="ghost-button" type="button" onClick={onToggleMock}>
              {mockEnabled ? "Disable mock mode" : "Enable mock mode"}
            </button>
            <a className="ghost-button saint-link-button" href={`${import.meta.env.BASE_URL || "/"}book-growth`}>
              Book Growth Command
            </a>
            <a className="ghost-button saint-link-button" href={`${import.meta.env.BASE_URL || "/"}operator`}>
              Operator Mode
            </a>
            <a className="ghost-button saint-link-button" href={`${import.meta.env.BASE_URL || "/"}#auth`}>
              {session ? "Back to home" : "Sign in from home"}
            </a>
          </div>
          {!session ? <p className="saint-dashboard-note">Signed-out users can view limited access, but upgrade is blocked until sign-in.</p> : null}
          <p className="saint-dashboard-note">{accountExperience.detail}</p>
          <p className="saint-dashboard-note">{getLockedStateMessage(access, accountExperience)}</p>
          <p className="saint-dashboard-note">{upgradePrompt}</p>
          {checkoutMessage ? <p className="saint-dashboard-note">{checkoutMessage}</p> : null}
          {error ? <p className="panel-note panel-note-error">{error}</p> : null}
        </div>

        <div className="saint-dashboard-hero-panel">
          <div className="status-row">
            <div className="status-chip">Account: {userEmail}</div>
            <div className="status-chip">Tier: {access.plan.toUpperCase()}</div>
            <div className="status-chip">Status: {access.status}</div>
            <div className="status-chip">Audience: {paidState}</div>
            <div className="status-chip">Mode: {accountExperience.label}</div>
            <div className="status-chip">Experience: {access.experience.name}</div>
            <div className="status-chip">Backend: {backendConnection.source}</div>
            <div className="status-chip">Health: {health.ok ? "online" : "check backend"}</div>
            {mockEnabled ? <div className="status-chip status-chip-live">Mock mode active</div> : null}
          </div>
          <div className="saint-dashboard-grid">
            <DashboardMetric
              label="Subscription"
              value={access.active ? "Active" : "Inactive"}
              detail={access.active ? "Live execution layer is active." : "Limited access mode is active until upgrade."}
            />
            <DashboardMetric
              label="AI Features"
              value={access.canUseAiTools ? "Enabled" : "Limited"}
              detail={access.canUseAiTools ? "Execution tools are live." : "Upgrade to unlock live execution layer for tool access."}
            />
            <DashboardMetric
              label="Period End"
              value={formatDate(access.currentPeriodEnd)}
              detail="Latest period end returned by the backend subscription record."
            />
            <DashboardMetric
              label="Signals"
              value={access.canAccessEliteSignals ? "Elite" : access.active ? "Standard" : "Preview"}
              detail={access.active ? "Live signal timing unlocked." : "Signals are delayed on Free limited access."}
            />
          </div>
        </div>
      </section>

      <section className="saint-dashboard-section-grid">
        <article className="saint-dashboard-card">
          <div className="saint-card-head">
            <p className="eyebrow">Account Overview</p>
            <span className="status-chip">{session ? "Authenticated" : "Guest"}</span>
          </div>
          <h2>Operator identity</h2>
          <p>{accountExperience.primaryAction}</p>
          <ul className="saint-dashboard-list">
            <li>Email: {userEmail}</li>
            <li>User ID: {session?.user?.id || "No active session"}</li>
            <li>Experience mode: {accountExperience.label}</li>
            <li>Paid or free: {paidState}</li>
            <li>Tier state: {getTierStateSummary(accountExperience)}</li>
            <li>Resolved API base URL: {backendConnection.apiBaseUrl}</li>
            <li>Backend source: {backendConnection.source}</li>
            <li>Runtime mode: {backendConnection.mode}</li>
            <li>Backend health URL: {healthUrl}</li>
          </ul>
        </article>

        <article className="saint-dashboard-card">
          <div className="saint-card-head">
            <p className="eyebrow">Subscription Status</p>
            <span className={`status-chip ${access.active ? "status-chip-live" : ""}`}>{access.status}</span>
          </div>
          <h2>Billing access</h2>
          <p>The worker-backed subscription endpoint controls content visibility and upgrade behavior.</p>
          <ul className="saint-dashboard-list">
            <li>Current plan: {access.plan}</li>
            <li>Experience layer: {access.experience.name}</li>
            <li>Briefing access: {access.experience.briefing}</li>
            <li>Current status: {access.status}</li>
            <li>Stripe customer: {access.stripeCustomerId || "Not linked yet"}</li>
            <li>Stripe subscription: {access.stripeSubscriptionId || "Not linked yet"}</li>
          </ul>
          <div className="saint-dashboard-inline-actions">
            <button className="primary-button" type="button" onClick={() => onCheckout("pro")} disabled={checkoutBusy || !session || hasPlanAccess(access.plan, "pro")}>
              Unlock faster execution for $49/mo
            </button>
            <button className="ghost-button" type="button" onClick={() => onCheckout("elite")} disabled={checkoutBusy || !session || access.plan === "elite"}>
              Claim exclusive priority lane for $99/mo
            </button>
            <button className="ghost-button" type="button" onClick={onManageBilling} disabled={billingBusy || !session || !access.canManageBilling}>
              {billingBusy ? "Opening..." : "Manage billing"}
            </button>
          </div>
        </article>

        <article className="saint-dashboard-card">
          <div className="saint-card-head">
            <p className="eyebrow">Content Access</p>
            <span className="status-chip">{access.unlocked ? "Live" : "Limited Access"}</span>
          </div>
          <h2>Access control state</h2>
          <p>{access.experience.headline}</p>
          <div className="saint-access-grid">
            <div className={`saint-access-pill ${access.canViewPreview ? "is-open" : ""}`}>Preview shell</div>
            <div className={`saint-access-pill ${access.canViewFullBriefing ? "is-open" : ""}`}>Full briefing</div>
            <div className={`saint-access-pill ${access.canUseAiTools ? "is-open" : ""}`}>AI tools</div>
            <div className={`saint-access-pill ${access.canAccessEliteSignals ? "is-open" : ""}`}>Elite signals</div>
          </div>
          <p className="saint-dashboard-note">{upgradePrompt}</p>
        </article>

        <article className="saint-dashboard-card">
          <div className="saint-card-head">
            <p className="eyebrow">Live Worker Data</p>
            <span className="status-chip">{loading ? "Refreshing" : "Loaded"}</span>
          </div>
          <h2>API status</h2>
          <p>This page reads from the already-live worker and renders the guest or signed-in view without changing backend logic.</p>
          <ul className="saint-dashboard-list">
            <li>`/api/health`: {health.ok ? "ok" : "not confirmed"}</li>
            <li>`/api/platform/dashboard`: {dashboard ? "loaded" : "waiting"}</li>
            <li>Returned user tier: {dashboard?.userTier || "free"}</li>
            <li>Pricing records received: {pricing.length}</li>
            <li>Mock mode: {mockEnabled ? "on" : "off"}</li>
          </ul>
        </article>

        <article className="saint-dashboard-card">
          <div className="saint-card-head">
            <p className="eyebrow">Access Lanes</p>
            <span className="status-chip">{accountExperience.label}</span>
          </div>
          <h2>Guest, Free, Pro, Elite states</h2>
          <p>{getTierStateSummary(accountExperience)}</p>
          <ul className="saint-dashboard-list">
            <li>Guest: preview shell only, sign-in required for checkout.</li>
            <li>Signed-In Free: limited access, delayed signals, and restricted execution.</li>
            <li>Pro: live execution layer with faster signal-to-action speed.</li>
            <li>Elite: exclusive priority lane for first-access signal advantage.</li>
          </ul>
        </article>

        <article className="saint-dashboard-card">
          <div className="saint-card-head">
            <p className="eyebrow">Signals Access Split</p>
            <span className="status-chip">{access.canAccessEliteSignals ? "All lanes open" : "Unlocked vs limited"}</span>
          </div>
          <h2>Unlocked and limited signal lanes</h2>
          <p>Free stays delayed. Pro unlocks live execution speed. Elite unlocks priority signal lanes for earliest action.</p>
          <div className="saint-signal-split">
            <div className="saint-signal-column saint-signal-column-open">
              <p className="eyebrow">Unlocked now</p>
              <ul className="saint-dashboard-list">
                {unlockedSignals.map((item) => (
                  <li key={item.title}>
                    <strong>{item.title}:</strong> {item.detail}
                  </li>
                ))}
              </ul>
            </div>
            <div className="saint-signal-column saint-signal-column-locked">
              <p className="eyebrow">{lockedSignals.length ? "Limited until upgrade" : "Priority lanes active"}</p>
              {lockedSignals.length ? (
                <ul className="saint-dashboard-list">
                  {lockedSignals.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              ) : (
                <p className="saint-dashboard-note">Elite plan detected. All priority signal lanes are unlocked.</p>
              )}
            </div>
          </div>
        </article>

        <article className="saint-dashboard-card saint-dashboard-card-wide saint-revenue-panel">
          <div className="saint-card-head">
            <p className="eyebrow">Revenue Potential</p>
            <span className="status-chip">Simulated local model</span>
          </div>
          <h2>Revenue intelligence projection</h2>
          <p>This panel is simulation-only and helps visualize upgrade impact before live billing activation.</p>
          <div className="saint-revenue-grid">
            <article className="saint-revenue-metric">
              <p className="eyebrow">Current lane</p>
              <strong>{activePlanSimulation.label}</strong>
            </article>
            <article className="saint-revenue-metric">
              <p className="eyebrow">Potential monthly range</p>
              <strong>{activePlanSimulation.monthlyRevenueRange}</strong>
            </article>
            <article className="saint-revenue-metric">
              <p className="eyebrow">Execution speed</p>
              <strong>{activePlanSimulation.executionSpeed}</strong>
            </article>
            <article className="saint-revenue-metric">
              <p className="eyebrow">Signals unlocked</p>
              <strong>{activePlanSimulation.unlockedSignals}</strong>
            </article>
          </div>
          <div className="saint-revenue-progress">
            <div className="saint-revenue-progress-track">
              <div className="saint-revenue-progress-fill" style={{ width: `${activePlanSimulation.impactScore}%` }} />
            </div>
            <p className="saint-dashboard-note">Upgrade impact score: {activePlanSimulation.impactScore}/100</p>
          </div>
        </article>

        <article className="saint-dashboard-card saint-dashboard-card-wide">
          <div className="saint-card-head">
            <p className="eyebrow">Upgrade Impact</p>
            <span className="status-chip status-chip-live">Pro and Elite advantage map</span>
          </div>
          <h2>What upgrading unlocks in outcomes</h2>
          <div className="saint-upgrade-impact-grid">
            <article className="saint-impact-card saint-impact-card-pro">
              <p className="eyebrow">Pro advantage</p>
              <h3>$49/mo: speed and conversion timing</h3>
              <ul className="saint-dashboard-list">
                <li>Live execution layer for faster response to daily signals.</li>
                <li>Reduced delay between signal and action windows.</li>
                <li>Higher conversion readiness than Free delayed mode.</li>
              </ul>
            </article>
            <article className="saint-impact-card saint-impact-card-elite">
              <p className="eyebrow">Elite advantage</p>
              <h3>$99/mo: priority signal exclusivity</h3>
              <ul className="saint-dashboard-list">
                <li>Priority signal queue with earliest actionable context.</li>
                <li>High-urgency escalation feed unlocked for faster pivots.</li>
                <li>Maximum decision-speed advantage over delayed Free access.</li>
              </ul>
            </article>
          </div>
        </article>
      </section>

      <section className="saint-dashboard-pricing-section">
        <div className="saint-dashboard-section-heading">
          <p className="eyebrow">Pricing</p>
          <h2>Free, Pro, and Elite</h2>
          <p>Free is limited access. Pro buys speed and execution. Elite secures early user advantage and exclusive signal timing.</p>
        </div>
        <div className="saint-pricing-grid">
          {pricing.map((plan) => (
            <PricingCard
              key={plan.id}
              plan={plan}
              currentPlan={access.plan}
              active={access.active}
              checkoutBusy={checkoutBusy}
              session={session}
              onCheckout={onCheckout}
            />
          ))}
        </div>
      </section>

      <section className="saint-dashboard-section-grid">
        <article className="saint-dashboard-card saint-dashboard-card-wide">
          <div className="saint-card-head">
            <p className="eyebrow">Tier Comparison</p>
            <span className="status-chip">Free vs Pro vs Elite</span>
          </div>
          <h2>Why Free feels restricted by design</h2>
          <ul className="saint-dashboard-list">
            <li>Free: limited access, delayed signals, restricted execution layer.</li>
            <li>Pro: live execution layer for speed, timing, and monetization momentum.</li>
            <li>Elite: exclusive priority lane with first-access signal advantage.</li>
          </ul>
        </article>
      </section>

      <section className="saint-dashboard-section-grid">
        <article className="saint-dashboard-card saint-dashboard-card-wide">
          <div className="saint-card-head">
            <p className="eyebrow">Mock Data Mode</p>
            <span className={`status-chip ${mockEnabled ? "status-chip-live" : ""}`}>{mockEnabled ? "Enabled" : "Disabled"}</span>
          </div>
          <h2>Pre-export dashboard testing</h2>
          <p>
            Use mock mode to test the dashboard, briefing, activity feed, and feature gates while live backend credentials
            or the ChatGPT export are unavailable.
          </p>
          <div className="saint-dashboard-inline-actions">
            <button className="primary-button" type="button" onClick={onToggleMock}>
              {mockEnabled ? "Turn mock mode off" : "Turn mock mode on"}
            </button>
            <a className="ghost-button saint-link-button" href={`${import.meta.env.BASE_URL || "/"}operator`}>
              Review operator shell
            </a>
          </div>
        </article>
      </section>

      <section className="saint-dashboard-section-grid">
        <ProtectedContent
          requiredPlan="pro"
          currentPlan={access.plan}
          status={access.status}
          title="AI Tools"
          description="Upgrade to Pro or Elite to unlock the AI tool suite."
        >
          <article className="saint-dashboard-card">
            <div className="saint-card-head">
              <p className="eyebrow">AI Tools</p>
              <span className="status-chip status-chip-live">Unlocked</span>
            </div>
            <h3>Paid AI workspace</h3>
            <p>{dashboard?.briefing?.summary || "AI features are live for your current plan."}</p>
            <ul className="saint-dashboard-list">
              {briefingActions.map((action) => (
                <li key={action}>{action}</li>
              ))}
            </ul>
          </article>
        </ProtectedContent>

        <ProtectedContent
          requiredPlan="pro"
          currentPlan={access.plan}
          status={access.status}
          title="Music Library"
          description="Music content unlocks on an active paid plan."
        >
          <article className="saint-dashboard-card">
            <div className="saint-card-head">
              <p className="eyebrow">Music</p>
              <span className="status-chip status-chip-live">Unlocked</span>
            </div>
            <h3>Music content</h3>
            <p>Premium plan members can access curated music drops and release planning surfaces.</p>
          </article>
        </ProtectedContent>

        <ProtectedContent
          requiredPlan="pro"
          currentPlan={access.plan}
          status={access.status}
          title="Books Library"
          description="Book access opens with an active paid plan."
        >
          <article className="saint-dashboard-card">
            <div className="saint-card-head">
              <p className="eyebrow">Books</p>
              <span className="status-chip status-chip-live">Unlocked</span>
            </div>
            <h3>Books and long-form intelligence</h3>
            <p>Readers on paid plans get access to premium books and long-form command material.</p>
          </article>
        </ProtectedContent>
      </section>

      <section className="saint-dashboard-section-grid">
        <article className="saint-dashboard-card saint-dashboard-card-wide">
          <div className="saint-card-head">
            <p className="eyebrow">Platform Brief</p>
            <span className="status-chip">{dashboard?.userTier || access.plan}</span>
          </div>
          <h2>{dashboard?.briefing?.title || "Daily Platform Brief"}</h2>
          <p>{dashboard?.briefing?.summary || "Dashboard insights will appear here after the worker returns platform data."}</p>
        </article>

        <article className="saint-dashboard-card">
          <div className="saint-card-head">
            <p className="eyebrow">Recent Activity</p>
            <span className="status-chip">{activityFeed.length} items</span>
          </div>
          <h2>Command feed</h2>
          {activityFeed.length ? (
            <ul className="saint-dashboard-list">
              {activityFeed.map((item, index) => (
                <li key={`${item.title || item.label || "feed"}-${index}`}>{item.title || item.label || item.summary || "Activity recorded"}</li>
              ))}
            </ul>
          ) : (
            <p>Activity feed will populate when the backend dashboard endpoint responds with live data.</p>
          )}
        </article>
      </section>

      {!access.active ? (
        <section className="saint-dashboard-section-grid">
          <LockedCard
            title="Upgrade screen"
            description={accountExperience.mode === "guest"
              ? "You are in guest preview. Sign in first, then return here to start Pro or Elite checkout."
              : "Your account is signed in but not on an active paid tier. Complete Pro or Elite checkout to unlock premium surfaces."}
            requiredPlan="pro"
          />
        </section>
      ) : null}
    </main>
  );
}

function AdminLayout({ session, adminData, loading, error, adminConfigured, authorized, onRefresh }) {
  if (!session) {
    return (
      <main className="saint-dashboard-shell">
        <section className="saint-dashboard-hero">
          <div className="saint-dashboard-copy">
            <p className="eyebrow">Hidden Admin Route</p>
            <h1>Admin access requires a signed-in session.</h1>
            <p>Sign in with the configured admin account, then return to this route.</p>
          </div>
        </section>
      </main>
    );
  }

  if (!adminConfigured) {
    return (
      <main className="saint-dashboard-shell">
        <section className="saint-dashboard-hero">
          <div className="saint-dashboard-copy">
            <p className="eyebrow">Hidden Admin Route</p>
            <h1>Admin email is not configured.</h1>
            <p>Set `VITE_ADMIN_EMAIL` in the frontend and `ADMIN_EMAIL` in the worker to activate the protected admin route.</p>
          </div>
        </section>
      </main>
    );
  }

  if (!authorized) {
    return (
      <main className="saint-dashboard-shell">
        <section className="saint-dashboard-hero">
          <div className="saint-dashboard-copy">
            <p className="eyebrow">Hidden Admin Route</p>
            <h1>Access denied.</h1>
            <p>This route only opens when the authenticated email matches the configured admin email.</p>
          </div>
        </section>
      </main>
    );
  }

  const logs = Array.isArray(adminData?.webhookLogs) ? adminData.webhookLogs : [];

  return (
    <main className="saint-dashboard-shell">
      <section className="saint-dashboard-hero">
        <div className="saint-dashboard-copy">
          <p className="eyebrow">Admin Command Surface</p>
          <h1>Subscription and webhook oversight.</h1>
          <p>This hidden route surfaces subscription counts and recent Stripe webhook activity without touching the existing webhook logic.</p>
          <div className="saint-dashboard-actions">
            <button className="primary-button" type="button" onClick={onRefresh} disabled={loading}>
              {loading ? "Refreshing..." : "Refresh admin metrics"}
            </button>
            <a className="ghost-button saint-link-button" href={DASHBOARD_PATH}>
              Open dashboard
            </a>
          </div>
          {error ? <p className="panel-note panel-note-error">{error}</p> : null}
        </div>
        <div className="saint-dashboard-grid">
          <DashboardMetric label="Total users" value={adminData?.totalUsers ?? 0} detail="Counted from Supabase profiles." />
          <DashboardMetric label="Active subscriptions" value={adminData?.activeSubscriptions ?? 0} detail="Active and trialing paid subscriptions." />
          <DashboardMetric label="Webhook logs" value={logs.length} detail="Recent Stripe webhook events returned by the worker." />
        </div>
      </section>

      <section className="saint-dashboard-section-grid">
        <article className="saint-dashboard-card saint-dashboard-card-wide">
          <div className="saint-card-head">
            <p className="eyebrow">Webhook Logs</p>
            <span className="status-chip">{logs.length ? "Live" : "Empty"}</span>
          </div>
          <h2>Recent Stripe webhook activity</h2>
          {logs.length ? (
            <div className="saint-admin-log-list">
              {logs.map((log) => (
                <div className="saint-admin-log-row" key={`${log.createdAt}-${log.eventType || log.status}`}>
                  <strong>{log.eventType || "stripe.event"}</strong>
                  <span>{log.status || "unknown"}</span>
                  <span>{log.tier || "n/a"}</span>
                  <span>{formatDate(log.createdAt)}</span>
                </div>
              ))}
            </div>
          ) : (
            <p>No webhook logs were returned for this admin view.</p>
          )}
        </article>
      </section>
    </main>
  );
}

export default function DashboardPage({ adminMode = false }) {
  const [session, setSession] = useState(null);
  const [subscription, setSubscription] = useState(() => normalizeSubscriptionRecord(null));
  const [dashboard, setDashboard] = useState(null);
  const [health, setHealth] = useState({ ok: false });
  const [adminData, setAdminData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checkoutBusy, setCheckoutBusy] = useState(false);
  const [billingBusy, setBillingBusy] = useState(false);
  const [error, setError] = useState("");
  const [checkoutMessage, setCheckoutMessage] = useState(() => {
    const state = getCheckoutReturnState();
    if (state === "success") {
      return "Stripe returned successfully. Refreshing your subscription access.";
    }
    if (state === "cancel") {
      return "Checkout was canceled. Your access has not changed.";
    }
    return "";
  });
  const [mockEnabled, setMockEnabledState] = useState(() => shouldUseMockData());

  useEffect(() => {
    let mounted = true;

    getCurrentSession().then((nextSession) => {
      if (mounted) {
        setSession(nextSession);
      }
    });

    const listener = subscribeToAuthChanges((_event, nextSession) => {
      if (mounted) {
        setSession(nextSession);
      }
    });

    return () => {
      mounted = false;
      listener.data.subscription.unsubscribe();
    };
  }, []);

  const authorizedAdmin = useMemo(() => {
    return Boolean(session?.user?.email && ADMIN_EMAIL && session.user.email.toLowerCase() === ADMIN_EMAIL);
  }, [session?.user?.email]);

  const refresh = async () => {
    setLoading(true);
    setError("");

    try {
      const healthResult = await fetch(getBackendHealthcheckUrl())
        .then((response) => response.json())
        .catch(() => ({ ok: false }));
      setHealth({ ok: Boolean(healthResult?.ok) });
      const dashboardPayload = await fetchPlatformDashboard(session?.access_token || null).catch(() => null);
      const resolvedDashboard = mockEnabled ? MOCK_PLATFORM_DASHBOARD : dashboardPayload;
      let normalizedSubscription = normalizeSubscriptionRecord(null);

      if (session?.access_token) {
        const subscriptionPayload = await fetchSubscription(session.access_token);
        normalizedSubscription = normalizeSubscriptionRecord({
          ...subscriptionPayload,
          plan: subscriptionPayload?.plan || subscriptionPayload?.tier
        });
      }

      setSubscription(normalizedSubscription);
      setDashboard(resolvedDashboard);

      if (!session?.access_token) {
        setAdminData(null);
        return;
      }

      if (adminMode && authorizedAdmin) {
        const adminPayload = await fetch(`${getApiBaseUrl()}/api/admin/dashboard`, {
          headers: {
            Authorization: `Bearer ${session.access_token}`
          }
        }).then(async (response) => {
          const payload = await response.json().catch(() => null);
          if (!response.ok) {
            throw new Error(payload?.error || `admin_request_failed_${response.status}`);
          }
          return payload;
        });
        setAdminData(adminPayload);
      } else {
        setAdminData(null);
      }

      if (getCheckoutReturnState()) {
        clearCheckoutReturnState();
        if (normalizedSubscription.active) {
          setCheckoutMessage("Premium access is now unlocked.");
        }
      }
    } catch (nextError) {
      if (mockEnabled) {
        setDashboard(MOCK_PLATFORM_DASHBOARD);
        setHealth({ ok: false });
      }
      setError(String(nextError?.message || nextError || "Dashboard request failed."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, [session?.access_token, adminMode, authorizedAdmin, mockEnabled]);

  const handleToggleMock = () => {
    const nextMockState = !mockEnabled;
    setMockMode(nextMockState);
    setMockEnabledState(nextMockState);
    if (nextMockState) {
      setDashboard(MOCK_PLATFORM_DASHBOARD);
      setCheckoutMessage("Mock mode is active. Live billing is not simulated.");
    } else {
      setCheckoutMessage("Mock mode disabled. Refreshing live worker data.");
    }
  };

  const handleCheckout = async (requestedPlan) => {
    if (!session?.access_token) {
      setCheckoutMessage(
        `Checkout is blocked until sign-in. Use the home auth panel, then return to start ${requestedPlan.toUpperCase()} checkout.`
      );
      setError("Sign in on the home page before starting checkout.");
      return;
    }

    setCheckoutBusy(true);
    setError("");

    try {
      const payload = await startStripeCheckout(session.access_token, requestedPlan);
      if (!payload?.url) {
        throw new Error("Stripe checkout URL missing.");
      }
      window.location.href = payload.url;
    } catch (nextError) {
      setError(String(nextError?.message || nextError || "Checkout failed."));
    } finally {
      setCheckoutBusy(false);
    }
  };

  const handleManageBilling = async () => {
    if (!session?.access_token) {
      setError("Sign in before opening billing.");
      return;
    }

    setBillingBusy(true);
    setError("");

    try {
      const payload = await createBillingPortalSession(session.access_token, typeof window !== "undefined" ? window.location.href : undefined);
      const url = payload?.url || payload?.portalUrl || payload?.billingPortalUrl;
      if (!url) {
        throw new Error("Billing portal URL missing.");
      }
      window.location.href = url;
    } catch (nextError) {
      setError(String(nextError?.message || nextError || "Billing portal is unavailable."));
    } finally {
      setBillingBusy(false);
    }
  };

  if (adminMode) {
    return (
      <AdminLayout
        session={session}
        adminData={adminData}
        loading={loading}
        error={error}
        adminConfigured={Boolean(ADMIN_EMAIL)}
        authorized={authorizedAdmin}
        onRefresh={refresh}
      />
    );
  }

  return (
    <DashboardLayout
      session={session}
      subscription={subscription}
      dashboard={dashboard}
      health={health}
      loading={loading}
      error={error}
      checkoutBusy={checkoutBusy}
      billingBusy={billingBusy}
      checkoutMessage={checkoutMessage}
      onCheckout={handleCheckout}
      onManageBilling={handleManageBilling}
      onRefresh={refresh}
      mockEnabled={mockEnabled}
      onToggleMock={handleToggleMock}
    />
  );
}
