import "./light-temple.css";

const systems = [
  { name: "Light Command", role: "Core intelligence platform", status: "Canonical runtime connected", href: "/dashboard" },
  { name: "Lumen Core", role: "AI operating intelligence", status: "Local interface ready", href: "/archaios" },
  { name: "Illumination Brief", role: "Daily intelligence system", status: "Briefing route available", href: "/daily" },
  { name: "Order Agents", role: "Coordinated agent network", status: "Mission systems available", href: "/mission-control" },
  { name: "QX Technology", role: "Research and experimental division", status: "Protected research gateway", href: "/operator" },
  { name: "Archaios Legacy System", role: "Historical foundation and provenance", status: "Preserved", href: "/archaios" }
];

const principles = [
  "Light represents verified knowledge.",
  "Legacy remains preserved through Git history.",
  "Production changes require evidence and review.",
  "Saint Black retains founder attribution."
];

export default function LightTemple() {
  return (
    <main className="light-temple">
      <div className="light-temple__halo" aria-hidden="true" />
      <header className="light-temple__hero">
        <div className="light-temple__seal" aria-hidden="true"><span>OL</span></div>
        <p className="light-temple__eyebrow">The First Order of Light</p>
        <h1>Knowledge becomes light.<br />Intelligence becomes command.</h1>
        <p className="light-temple__declaration">
          From the Black Vault, knowledge becomes light. From light, intelligence becomes command.
          The First Order has begun.
        </p>
        <div className="light-temple__actions">
          <a className="light-temple__primary" href="/dashboard">Enter Light Command</a>
          <a className="light-temple__secondary" href="/daily">Open Illumination Brief</a>
        </div>
        <div className="light-temple__founder">
          <span>Founder &amp; Commander</span>
          <strong>Colonel Quandrix Lee Blackburn</strong>
          <em>Saint Black</em>
        </div>
      </header>

      <section className="light-temple__status" aria-labelledby="systems-heading">
        <div className="light-temple__section-heading">
          <p>Living architecture</p>
          <h2 id="systems-heading">The sovereign system</h2>
          <span>Local pre-release · API contracts unchanged</span>
        </div>
        <div className="light-temple__grid">
          {systems.map((system, index) => (
            <a className="light-temple__card" href={system.href} key={system.name}>
              <span className="light-temple__index">{String(index + 1).padStart(2, "0")}</span>
              <h3>{system.name}</h3>
              <p>{system.role}</p>
              <small><i aria-hidden="true" />{system.status}</small>
            </a>
          ))}
        </div>
      </section>

      <section className="light-temple__doctrine">
        <div>
          <p className="light-temple__eyebrow">Light Shield doctrine</p>
          <h2>Truth. Evidence. Sovereignty. Discipline.</h2>
        </div>
        <ul>
          {principles.map((principle) => <li key={principle}>{principle}</li>)}
        </ul>
      </section>

      <footer className="light-temple__footer">
        <span>The First Order of Light</span>
        <span>Archaios preserved as the historical foundation</span>
        <span>Saint Black Studios · QX Technology</span>
      </footer>
    </main>
  );
}
