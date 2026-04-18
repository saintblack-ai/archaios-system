export default function PricingPage() {
  return (
    <main className="sb-shell">
      <div className="sb-nav">
        <div>
          <div className="sb-brand">Saint Black Command</div>
          <div className="sb-status">Public pricing page</div>
        </div>
        <a className="sb-button-secondary" href="/">
          Home
        </a>
      </div>

      <section className="sb-pricing-grid">
        {[
          {
            name: "Free",
            price: "$0",
            features: ["Public preview", "Dashboard requires sign-in", "AI locked"]
          },
          {
            name: "Pro",
            price: "$49/month",
            features: ["AI unlocked", "Paid dashboard access", "Existing Stripe flow"]
          },
          {
            name: "Elite",
            price: "$99/month",
            features: ["Priority tier", "Higher limits", "Premium workflow"]
          }
        ].map((plan) => (
          <article className={`sb-card ${plan.name === "Pro" ? "featured" : ""}`} key={plan.name}>
            <p className="sb-eyebrow">{plan.name}</p>
            <h2>{plan.price}</h2>
            <ul className="sb-list">
              {plan.features.map((feature) => (
                <li key={feature}>{feature}</li>
              ))}
            </ul>
            <a className="sb-button" href="/login">
              Sign in to continue
            </a>
          </article>
        ))}
      </section>
    </main>
  );
}
