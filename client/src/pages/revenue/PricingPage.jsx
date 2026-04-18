import { useEffect, useMemo, useState } from "react";
import { startStripeCheckout } from "../../agents/stripeAgent";
import CommandNav from "../../components/CommandNav";
import { getBackendConnectionSummary, getCurrentSession, getRuntimeHostRoles, getStripeTestReadiness, logCtaClick, trackRevenueEvent } from "../../lib/platform";
import { PAID_TIER_IDS, PRICING_TIERS } from "../../lib/pricing";
import { FEATURE_GATES, getTierExperience, hasPlanAccess } from "../../lib/subscription";

const ACCESS_EMAIL_STORAGE_KEY = "archaios_saved_access_email";
const ACCESS_EMAIL_TIMESTAMP_KEY = "archaios_saved_access_timestamp";
const UPGRADE_INTENT_STORAGE_KEY = "archaios_upgrade_intent_tier";

function getPlanPosition(planId) {
  if (planId === "free") return "Funnel entry";
  if (planId === "pro") return "Core revenue plan";
  return "Priority intelligence plan";
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || "").trim());
}

function getDefaultCheckoutIntent() {
  if (typeof window === "undefined") {
    return "pro";
  }

  const stored = String(window.localStorage.getItem(UPGRADE_INTENT_STORAGE_KEY) || "").trim().toLowerCase();
  return PAID_TIER_IDS.includes(stored) ? stored : "pro";
}

export default function PricingPage() {
  const [session, setSession] = useState(null);
  const hostRoles = getRuntimeHostRoles();
  const backendConnection = getBackendConnectionSummary();
  const stripeTest = getStripeTestReadiness();
  const [busyTier, setBusyTier] = useState("");
  const [checkoutIntentTier, setCheckoutIntentTier] = useState(() => getDefaultCheckoutIntent());
  const [savedEmail, setSavedEmail] = useState("");
  const [savedEmailTimestamp, setSavedEmailTimestamp] = useState("");
  const [emailInput, setEmailInput] = useState("");
  const [emailFeedback, setEmailFeedback] = useState("");
  const [message, setMessage] = useState(() => {
    if (typeof window === "undefined") {
      return "Stripe checkout uses the existing authenticated Worker flow. Missing credentials show a safe backend error.";
    }

    const checkout = new URLSearchParams(window.location.search).get("checkout");
    if (checkout === "success") {
      return "Stripe returned successfully. Open the dashboard to verify subscription sync.";
    }
    if (checkout === "cancel") {
      return "Checkout was canceled. No billing changes were made.";
    }

    return "Limited access is active on Free. Signals are delayed on Free, while Pro and Elite unlock speed and advantage.";
  });

  useEffect(() => {
    getCurrentSession().then(setSession).catch(() => setSession(null));

    if (typeof window === "undefined") {
      return;
    }

    const storedEmail = String(window.localStorage.getItem(ACCESS_EMAIL_STORAGE_KEY) || "").trim();
    const storedTimestamp = String(window.localStorage.getItem(ACCESS_EMAIL_TIMESTAMP_KEY) || "").trim();

    if (storedEmail) {
      setSavedEmail(storedEmail);
      setEmailInput(storedEmail);
    }

    if (storedTimestamp) {
      setSavedEmailTimestamp(storedTimestamp);
    }
  }, []);

  const selectedIntentPlan = useMemo(() => {
    return PRICING_TIERS.find((plan) => plan.id === checkoutIntentTier) || PRICING_TIERS.find((plan) => plan.id === "pro") || PRICING_TIERS[0];
  }, [checkoutIntentTier]);

  const selectedIntentExperience = getTierExperience(selectedIntentPlan?.id || "pro");

  const unlockedCapabilities = FEATURE_GATES.filter((gate) => hasPlanAccess(selectedIntentPlan?.id || "pro", gate.requiredPlan)).map((gate) => gate.label);
  const stillLockedCapabilities = FEATURE_GATES.filter((gate) => !hasPlanAccess(selectedIntentPlan?.id || "pro", gate.requiredPlan)).map((gate) => gate.label);

  function persistUpgradeIntent(tier) {
    if (!PAID_TIER_IDS.includes(tier)) {
      return;
    }

    setCheckoutIntentTier(tier);

    if (typeof window !== "undefined") {
      window.localStorage.setItem(UPGRADE_INTENT_STORAGE_KEY, tier);
    }
  }

  async function handleSaveAccess(event) {
    event.preventDefault();

    const normalized = String(emailInput || "").trim().toLowerCase();
    if (!isValidEmail(normalized)) {
      setEmailFeedback("Enter a valid email so ARCHAIOS can keep your upgrade lane saved locally.");
      return;
    }

    const timestamp = new Date().toISOString();

    if (typeof window !== "undefined") {
      window.localStorage.setItem(ACCESS_EMAIL_STORAGE_KEY, normalized);
      window.localStorage.setItem(ACCESS_EMAIL_TIMESTAMP_KEY, timestamp);
    }

    setSavedEmail(normalized);
    setSavedEmailTimestamp(timestamp);
    setEmailFeedback("Access saved locally. Your upgrade intent is now preserved for this browser session.");

    await trackRevenueEvent("email_capture_saved", {
      location: "pricing-save-access",
      requestedTier: checkoutIntentTier,
      authState: session?.access_token ? "signed-in" : "signed-out"
    }).catch(() => null);
  }

  async function handleCheckout(tier) {
    await logCtaClick("pricing_cta", `pricing:${tier}`, tier).catch(() => null);

    if (!PAID_TIER_IDS.includes(tier)) {
      window.location.href = `${import.meta.env.BASE_URL || "/"}#auth`;
      return;
    }

    persistUpgradeIntent(tier);

    if (!session?.access_token) {
      setMessage(
        savedEmail
          ? `Checkout is blocked until sign-in. ${tier.toUpperCase()} intent is saved for ${savedEmail}.`
          : `Checkout is blocked until sign-in. Save your access email below to keep your ${tier.toUpperCase()} early user advantage intent ready.`
      );
      await trackRevenueEvent("checkout_blocked_auth", { location: "pricing", requestedTier: tier, authState: "signed-out" });
      return;
    }

    setBusyTier(tier);
    setMessage(`Starting ${tier.toUpperCase()} checkout...`);

    try {
      await trackRevenueEvent("checkout_start", { location: "pricing", requestedTier: tier, authState: "signed-in" });
      const payload = await startStripeCheckout(session.access_token, tier);
      const url = payload?.url || payload?.checkoutUrl;
      if (!url) {
        throw new Error("Stripe checkout URL missing.");
      }
      window.location.href = url;
    } catch (error) {
      setMessage(String(error?.message || "Checkout is not configured yet. Verify Stripe env vars and Worker deployment."));
      setBusyTier("");
    }
  }

  return (
    <main className="revenue-shell">
      <CommandNav current="pricing" />
      <section className="revenue-hero pricing-hero">
        <div>
          <span className="revenue-eyebrow">AI Assassins Pricing</span>
          <p className="revenue-status"><strong>This system pays for itself with one signal.</strong></p>
          <h1>Turn daily signals into paid execution speed.</h1>
          <p>
            Free is limited access. Pro unlocks live execution speed. Elite adds exclusivity, first-access signal timing, and maximum command advantage.
          </p>
          <div className="revenue-actions">
            <a href={`${import.meta.env.BASE_URL || "/"}landing`}>Back to Landing</a>
            <a className="secondary" href={`${import.meta.env.BASE_URL || "/"}dashboard`}>Dashboard</a>
            <a className="secondary" href={`${import.meta.env.BASE_URL || "/"}dashboard?mock=1`}>Preview Mock Dashboard</a>
          </div>
          <p className="revenue-status">{message}</p>
          <p className="revenue-status">
            Host mode: {hostRoles.appHost}; backend: {hostRoles.backendHost}; billing: {hostRoles.billingMode}.
            {session ? " Signed in for checkout." : " Sign in is required before checkout."}
          </p>
          <p className="revenue-status">
            Resolved API base: {backendConnection.apiBaseUrl} ({backendConnection.source}, {backendConnection.mode} mode).
          </p>
          <p className="revenue-status">
            Urgency posture: Signals are delayed on Free. Early user advantage starts on paid tiers.
          </p>
        </div>
      </section>

      <section className="revenue-section">
        <div className="revenue-section-head">
          <span className="revenue-eyebrow">Save Your Access</span>
          <h2>Capture email, preserve upgrade intent, return without losing momentum.</h2>
        </div>
        <form className="revenue-actions" onSubmit={handleSaveAccess}>
          <input
            className="auth-input"
            type="email"
            placeholder="you@domain.com"
            value={emailInput}
            onChange={(event) => setEmailInput(event.target.value)}
          />
          <button type="submit">Save Access</button>
        </form>
        {emailFeedback ? <p className="revenue-status">{emailFeedback}</p> : null}
        {savedEmail ? (
          <p className="revenue-status">
            Saved email: {savedEmail}
            {savedEmailTimestamp ? ` (${new Date(savedEmailTimestamp).toLocaleString()})` : ""}
          </p>
        ) : (
          <p className="revenue-status">No saved email yet. Save access now so upgrade intent stays attached to this browser.</p>
        )}
      </section>

      <section className="revenue-pricing-grid pricing-page-grid">
        {PRICING_TIERS.map((plan) => (
          <article className={`revenue-card revenue-plan-card ${plan.id === "pro" ? "featured" : ""}`} key={plan.id}>
            <span className="revenue-eyebrow">{getPlanPosition(plan.id)}</span>
            <h2>{plan.name}</h2>
            <strong>{plan.displayPrice}</strong>
            <p>{plan.summary}</p>
            <p className="revenue-status">{getTierExperience(plan.id).headline}</p>
            {plan.id === "free" ? <p className="revenue-status">Limited access: delayed signals, restricted execution, no early user advantage.</p> : null}
            {plan.id === "pro" ? <p className="revenue-status">Most operators convert here: faster execution, better timing, and real revenue momentum.</p> : null}
            {plan.id === "elite" ? <p className="revenue-status">Exclusive lane: first-access priority signals and deepest command visibility.</p> : null}
            <ul>
              {plan.features.map((feature) => (
                <li key={feature}>{feature}</li>
              ))}
              <li>{getTierExperience(plan.id).briefing}</li>
              <li>{getTierExperience(plan.id).alerts}</li>
            </ul>
            <button
              type="button"
              onClick={() => handleCheckout(plan.id)}
              disabled={busyTier === plan.id}
            >
              {plan.id === "free"
                ? "Start Free"
                : busyTier === plan.id
                  ? "Starting..."
                  : plan.id === "pro"
                    ? `Accelerate execution for ${plan.displayPrice}`
                    : `Claim exclusive advantage for ${plan.displayPrice}`}
            </button>
          </article>
        ))}
      </section>

      <section className="revenue-section">
        <div className="revenue-section-head">
          <span className="revenue-eyebrow">Comparison</span>
          <h2>Free vs Pro vs Elite</h2>
        </div>
        <div className="feature-gate-table">
          <div className="feature-gate-row feature-gate-head">
            <span>Tier</span>
            <span>Position</span>
          </div>
          <div className="feature-gate-row">
            <strong>Free</strong>
            <span>Limited access with delayed signals and restricted execution.</span>
          </div>
          <div className="feature-gate-row">
            <strong>Pro</strong>
            <span>Live execution layer with faster signal-to-action speed and stronger monetization timing.</span>
          </div>
          <div className="feature-gate-row">
            <strong>Elite</strong>
            <span>Exclusive priority lane with first-access advantage and highest-depth visibility.</span>
          </div>
        </div>
      </section>

      <section className="revenue-section">
        <div className="revenue-section-head">
          <span className="revenue-eyebrow">Upgrade Outcome Preview</span>
          <h2>What unlocks after upgrade vs what stays limited.</h2>
        </div>
        <div className="feature-gate-table">
          <div className="feature-gate-row feature-gate-head">
            <span>Selected target tier</span>
            <span>{selectedIntentPlan?.name}</span>
          </div>
          <div className="feature-gate-row">
            <strong>Intent tier</strong>
            <span>{checkoutIntentTier.toUpperCase()} (saved locally)</span>
          </div>
          <div className="feature-gate-row">
            <strong>After upgrade you get</strong>
            <span>{selectedIntentExperience.headline}</span>
          </div>
          <div className="feature-gate-row">
            <strong>Unlocked capabilities</strong>
            <span>{unlockedCapabilities.length ? unlockedCapabilities.join(", ") : "None"}</span>
          </div>
          <div className="feature-gate-row">
            <strong>Upgrade to unlock live execution layer for</strong>
            <span>{stillLockedCapabilities.length ? stillLockedCapabilities.join(", ") : "All capability lanes are available at this level."}</span>
          </div>
          <div className="feature-gate-row">
            <strong>Auth requirement</strong>
            <span>{session ? "Satisfied (signed in)." : "Blocked until sign-in. Save access + intent, then sign in to continue."}</span>
          </div>
        </div>
        <p className="revenue-status">
          Checkout buttons above use real Stripe checkout-session creation in test mode through the backend. If Stripe is not configured, safe fallback errors are shown.
        </p>
      </section>

      <section className="revenue-section">
        <div className="revenue-section-head">
          <span className="revenue-eyebrow">Feature Gate</span>
          <h2>Free is intentionally restricted to create urgency.</h2>
        </div>
        <div className="feature-gate-table">
          <div className="feature-gate-row feature-gate-head">
            <span>Feature</span>
            <span>Free</span>
            <span>Pro</span>
            <span>Elite</span>
          </div>
          {FEATURE_GATES.map((gate) => (
            <div className="feature-gate-row" key={gate.key}>
              <strong>{gate.label}</strong>
              <span>{gate.free}</span>
              <span>{gate.pro}</span>
              <span>{gate.elite}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="revenue-section">
        <div className="revenue-section-head">
          <span className="revenue-eyebrow">Stripe Preparation</span>
          <h2>Checkout is prepared, not live-activated here.</h2>
        </div>
        <div className="feature-gate-table">
          <div className="feature-gate-row feature-gate-head">
            <span>Requirement</span>
            <span>Status</span>
          </div>
          <div className="feature-gate-row">
            <strong>Supabase browser auth</strong>
            <span>{hostRoles.supabaseAuthReady ? "Configured in client env" : "Missing client env"}</span>
          </div>
          <div className="feature-gate-row">
            <strong>Pro price ID placeholder</strong>
            <span>{stripeTest.clientPlaceholders.proPriceIdValid ? stripeTest.clientPlaceholders.proPriceId : "Not set or invalid format"}</span>
          </div>
          <div className="feature-gate-row">
            <strong>Elite price ID placeholder</strong>
            <span>{stripeTest.clientPlaceholders.elitePriceIdValid ? stripeTest.clientPlaceholders.elitePriceId : "Not set or invalid format"}</span>
          </div>
          <div className="feature-gate-row">
            <strong>Stripe checkout activation</strong>
            <span>Requires backend Worker secrets and test-mode verification</span>
          </div>
          {hostRoles.checkoutActivationRequired.map((item) => (
            <div className="feature-gate-row" key={item}>
              <strong>{item}</strong>
              <span>Manual verification required</span>
            </div>
          ))}
          <div className="feature-gate-row feature-gate-head">
            <span>Checkout Wiring</span>
            <span>Path</span>
          </div>
          <div className="feature-gate-row">
            <strong>Client wrapper</strong>
            <span>{stripeTest.checkoutWiring.wrapper}</span>
          </div>
          <div className="feature-gate-row">
            <strong>Create checkout session</strong>
            <span>{stripeTest.checkoutWiring.createCheckoutSession}</span>
          </div>
          <div className="feature-gate-row">
            <strong>Fallback checkout route</strong>
            <span>{stripeTest.checkoutWiring.checkoutFallback}</span>
          </div>
          <div className="feature-gate-row">
            <strong>Subscription sync endpoint</strong>
            <span>{stripeTest.checkoutWiring.subscriptionEndpoint}</span>
          </div>
          <div className="feature-gate-row feature-gate-head">
            <span>Webhook + Sync Requirements</span>
            <span>Status</span>
          </div>
          {stripeTest.webhookRequirements.map((item) => (
            <div className="feature-gate-row" key={item}>
              <strong>{item}</strong>
              <span>Required before live billing</span>
            </div>
          ))}
          {stripeTest.postCheckoutSyncPath.map((item) => (
            <div className="feature-gate-row" key={item}>
              <strong>{item}</strong>
              <span>Verified in test mode only</span>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
