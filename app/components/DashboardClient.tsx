"use client";

import { useState } from "react";
import { SignOutButton } from "./SignOutButton";

type Tier = "free" | "pro" | "elite" | "enterprise";

type DashboardClientProps = {
  user: {
    email: string | null;
  };
  entitlement: {
    tier: Tier;
    dailyUsage: number;
    dailyLimit: number;
    canGenerate: boolean;
  };
  isAdmin: boolean;
};

const PLANS = [
  {
    id: "free",
    name: "Free",
    price: "$0",
    features: [
      "Preview dashboard access",
      "Locked AI generation",
      "Upgrade path to Pro"
    ]
  },
  {
    id: "pro",
    name: "Pro",
    price: "$49/month",
    features: [
      "AI generation unlocked",
      "Paid dashboard features",
      "Existing Stripe flow"
    ]
  },
  {
    id: "elite",
    name: "Elite",
    price: "$99/month",
    features: [
      "Priority tier access",
      "Higher limits",
      "Premium operator workflow"
    ]
  }
] as const;

export function DashboardClient({
  user,
  entitlement,
  isAdmin
}: DashboardClientProps) {
  const [prompt, setPrompt] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const isPaid = entitlement.tier === "pro" || entitlement.tier === "elite" || entitlement.tier === "enterprise";

  return (
    <main className="sb-shell">
      <nav className="sb-nav">
        <div>
          <div className="sb-brand">Saint Black Command</div>
          <div className="sb-status">
            Signed in as {user.email || "unknown"} | Tier {entitlement.tier.toUpperCase()}
          </div>
        </div>
        <div className="sb-nav-links">
          <a className="sb-button-secondary" href="/">
            Home
          </a>
          {isAdmin ? (
            <a className="sb-button-secondary" href="/admin">
              Admin
            </a>
          ) : null}
          <SignOutButton />
        </div>
      </nav>

      <section className="sb-hero">
        <div>
          <p className="sb-eyebrow">Protected dashboard</p>
          <h1>Operator dashboard for AI, billing, and account access.</h1>
          <p className="sb-copy">
            Signed-in users can view the dashboard. Paid tiers can use the AI endpoint.
            Stripe checkout stays on the current server route.
          </p>
          <div className="sb-actions">
            <span className={`sb-pill ${isPaid ? "live" : ""}`}>
              {isPaid ? "Paid account" : "Free account"}
            </span>
            <span className="sb-pill">
              Daily usage {entitlement.dailyUsage}
              {Number.isFinite(entitlement.dailyLimit) ? ` / ${entitlement.dailyLimit}` : ""}
            </span>
          </div>
        </div>
        <div className="sb-stats-grid">
          <div className="sb-card">
            <p className="sb-eyebrow">Current tier</p>
            <h3>{entitlement.tier.toUpperCase()}</h3>
            <p>Current access level from the latest subscription record.</p>
          </div>
          <div className="sb-card">
            <p className="sb-eyebrow">AI access</p>
            <h3>{isPaid ? "Unlocked" : "Locked"}</h3>
            <p>Free users can view the dashboard but cannot generate AI output.</p>
          </div>
        </div>
      </section>

      <section className="sb-pricing-grid">
        {PLANS.map((plan) => {
          const isCurrent = plan.id === entitlement.tier;
          const isPaidPlan = plan.id === "pro" || plan.id === "elite";

          return (
            <article
              className={`sb-card ${plan.id === "pro" ? "featured" : ""} ${isCurrent ? "current" : ""}`}
              key={plan.id}
            >
              <p className="sb-eyebrow">{plan.name}</p>
              <h3>{plan.price}</h3>
              <ul className="sb-list">
                {plan.features.map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>
              {isPaidPlan ? (
                <button
                  className="sb-button"
                  type="button"
                  disabled={loading || isCurrent}
                  onClick={async () => {
                    setError("");

                    try {
                      const response = await fetch("/api/stripe/checkout", {
                        method: "POST",
                        headers: {
                          "Content-Type": "application/json"
                        },
                        body: JSON.stringify({ tier: plan.id })
                      });
                      const payload = await response.json().catch(() => null);

                      if (!response.ok || !payload?.url) {
                        throw new Error(payload?.error || "Checkout failed.");
                      }

                      window.location.href = payload.url;
                    } catch (checkoutError) {
                      setError(
                        checkoutError instanceof Error
                          ? checkoutError.message
                          : "Checkout failed."
                      );
                    }
                  }}
                >
                  {isCurrent ? "Current plan" : `Upgrade to ${plan.name}`}
                </button>
              ) : (
                <span className="sb-pill">Public preview</span>
              )}
            </article>
          );
        })}
      </section>

      <section className="sb-grid">
        <article className="sb-card" style={{ gridColumn: "span 2" }}>
          <p className="sb-eyebrow">AI generator</p>
          <h2>Generate with /api/ai</h2>
          <textarea
            className="sb-textarea"
            placeholder={
              isPaid
                ? "Enter a prompt for the AI endpoint..."
                : "Upgrade to Pro or Elite to unlock AI generation."
            }
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            disabled={!isPaid || loading}
          />
          <div className="sb-inline-actions">
            <button
              className="sb-button"
              type="button"
              disabled={!isPaid || loading || !prompt.trim()}
              onClick={async () => {
                setLoading(true);
                setError("");
                setOutput("");

                try {
                  const response = await fetch("/api/ai", {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ prompt })
                  });
                  const payload = await response.json().catch(() => null);

                  if (!response.ok || !payload?.ok) {
                    throw new Error(payload?.error || "AI request failed.");
                  }

                  setOutput(String(payload.output || ""));
                } catch (aiError) {
                  setError(
                    aiError instanceof Error ? aiError.message : "AI request failed."
                  );
                } finally {
                  setLoading(false);
                }
              }}
            >
              {loading ? "Generating..." : "Generate"}
            </button>
            {!isPaid ? (
              <span className="sb-pill">Locked for free users</span>
            ) : null}
          </div>
          {error ? <div className="sb-banner error">{error}</div> : null}
          <div className="sb-banner">
            <strong>Response</strong>
            <div className="sb-output">{output || "AI output will appear here."}</div>
          </div>
        </article>

        <article className="sb-card">
          <p className="sb-eyebrow">Access rules</p>
          <h2>Current state</h2>
          <ul className="sb-list">
            <li>/dashboard requires sign-in</li>
            <li>/admin requires sign-in and admin email</li>
            <li>Free users can view but not generate AI</li>
            <li>Paid users can call /api/ai</li>
          </ul>
        </article>
      </section>
    </main>
  );
}
