import { useState } from "react";
import CommandNav from "../../components/CommandNav";
import { captureLead, logCtaClick } from "../../lib/platform";
import { PRICING_TIERS } from "../../lib/pricing";

const signals = [
  "Global intelligence briefings",
  "Premium alert tiers",
  "Revenue and risk posture",
  "Operator-ready infrastructure"
];

const sampleBrief = [
  {
    category: "Global Risk",
    title: "Macro volatility signal",
    detail: "Free users see delayed summaries. Pro unlocks the full daily brief. Elite receives urgency-weighted analysis."
  },
  {
    category: "Markets",
    title: "Capital flow watch",
    detail: "Track market pressure, liquidity posture, and strategic action items in one daily command view."
  },
  {
    category: "Operator Action",
    title: "Decision queue",
    detail: "Convert signal into next actions: monitor, publish, protect, convert, or escalate."
  }
];

function planSummary(plan) {
  if (plan.id === "free") {
    return "Preview intelligence and enter the email funnel.";
  }

  if (plan.id === "pro") {
    return "Full daily intelligence and premium dashboard access.";
  }

  return "Priority intelligence, deeper reports, and high-urgency signals.";
}

export default function PublicLanding() {
  const [email, setEmail] = useState("");
  const [leadStatus, setLeadStatus] = useState("");

  async function handleLeadSubmit(event) {
    event.preventDefault();
    if (!email.trim()) {
      setLeadStatus("Enter an email to join the intelligence list.");
      return;
    }

    setLeadStatus("Saving...");
    try {
      await captureLead(email.trim());
      await logCtaClick("lead_capture", "public_landing", "free");
      setLeadStatus("Saved. Your intelligence access path is queued.");
      setEmail("");
    } catch (error) {
      setLeadStatus(String(error?.message || "Lead capture is not configured yet. Try again after backend setup."));
    }
  }

  async function handleCta(location) {
    await logCtaClick("landing_cta", location, "free").catch(() => null);
  }

  return (
    <main className="revenue-shell">
      <CommandNav current="landing" />
      <section className="revenue-hero">
        <div>
          <span className="revenue-eyebrow">AI Assassins · ARCHAIOS Infrastructure</span>
          <h1>Daily global intelligence for operators who need signal, not noise.</h1>
          <p>
            AI Assassins turns global events, markets, risk signals, and strategic context into a premium daily briefing
            system with tier-aware intelligence access.
          </p>
          <div className="revenue-actions">
            <a href={`${import.meta.env.BASE_URL || "/"}pricing`} onClick={() => handleCta("hero_pricing")}>View Pricing</a>
            <a className="secondary" href={`${import.meta.env.BASE_URL || "/"}dashboard`} onClick={() => handleCta("hero_dashboard")}>Open Dashboard</a>
            <a className="secondary" href={`${import.meta.env.BASE_URL || "/"}operator`} onClick={() => handleCta("hero_operator")}>System Status</a>
          </div>
        </div>
        <aside className="revenue-command-card">
          <span className="revenue-eyebrow">Today&apos;s Command Brief</span>
          {sampleBrief.map((item) => (
            <article className="revenue-signal" key={item.title}>
              <strong>{item.category}</strong>
              <h3>{item.title}</h3>
              <p>{item.detail}</p>
            </article>
          ))}
        </aside>
      </section>

      <section className="revenue-section">
        <div className="revenue-section-head">
          <span className="revenue-eyebrow">Product System</span>
          <h2>Built for recurring intelligence revenue.</h2>
          <p>Free users enter the funnel. Pro and Elite subscribers unlock deeper briefings, dashboards, and priority intelligence.</p>
        </div>
        <div className="revenue-grid">
          {signals.map((signal) => (
            <article className="revenue-card" key={signal}>
              <strong>{signal}</strong>
              <p>Designed as a modular layer inside the ARCHAIOS infrastructure stack.</p>
            </article>
          ))}
        </div>
      </section>

      <section className="revenue-section">
        <div className="revenue-section-head">
          <span className="revenue-eyebrow">Plans</span>
          <h2>Start free, upgrade when signal matters.</h2>
        </div>
        <div className="revenue-pricing-grid">
          {PRICING_TIERS.map((plan) => (
            <article className={`revenue-card revenue-plan-card ${plan.id === "pro" ? "featured" : ""}`} key={plan.id}>
              <span className="revenue-eyebrow">{plan.name}</span>
              <strong>{plan.displayPrice}</strong>
              <p>{planSummary(plan)}</p>
              <ul>
                {plan.features.map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>
              <a href={`${import.meta.env.BASE_URL || "/"}pricing`} onClick={() => handleCta(`plan_${plan.id}`)}>
                {plan.id === "free" ? "Join Free" : `Upgrade to ${plan.name}`}
              </a>
            </article>
          ))}
        </div>
      </section>

      <section className="revenue-section revenue-lead-section">
        <div>
          <span className="revenue-eyebrow">Onboarding Funnel</span>
          <h2>Join the intelligence list.</h2>
          <p>Lead capture routes prospects into the AI Assassins conversion system. Backend configuration is required for live storage.</p>
        </div>
        <form className="revenue-lead-form" onSubmit={handleLeadSubmit}>
          <input value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" type="email" />
          <button type="submit">Join Waitlist</button>
          {leadStatus ? <p>{leadStatus}</p> : null}
        </form>
      </section>

      <section className="revenue-section revenue-route-strip">
        <span className="revenue-eyebrow">Live Routes</span>
        <a href={`${import.meta.env.BASE_URL || "/"}pricing`}>Upgrade path</a>
        <a href={`${import.meta.env.BASE_URL || "/"}dashboard?mock=1`}>Test dashboard mock mode</a>
        <a href={`${import.meta.env.BASE_URL || "/"}book-growth`}>Book Growth Command</a>
      </section>
    </main>
  );
}
