import CommandNav from "../../components/CommandNav";

const groups = [
  {
    eyebrow: "Public",
    title: "Funnel and conversion",
    links: [
      { label: "Public Landing", path: "landing", detail: "Top-level offer, lead capture, and product explanation." },
      { label: "Pricing", path: "pricing", detail: "Free, Pro $49, and Elite $99 upgrade path." },
      { label: "Static Public Launcher", href: "https://saintblack-ai.github.io/Ai-Assassins", detail: "Legacy/static public GitHub Pages surface." }
    ]
  },
  {
    eyebrow: "Member",
    title: "Dashboard and premium shell",
    links: [
      { label: "Customer Dashboard", path: "dashboard", detail: "Supabase session, subscription state, and premium feature gates." },
      { label: "Mock Dashboard", path: "dashboard?mock=1", detail: "Pre-export testing mode for briefing and gate layouts." },
      { label: "Book Growth Command", path: "book-growth", detail: "Saint Black book marketing and content command layer." }
    ]
  },
  {
    eyebrow: "Operator",
    title: "System readiness",
    links: [
      { label: "Operator Mode", path: "operator", detail: "Repo health, export readiness, mock mode, roadmap, and blockers." },
      { label: "Admin Route", path: "admin", detail: "Protected admin route; requires configured admin account." },
      { label: "Worker Health", href: "https://archaios-saas-worker.quandrix357.workers.dev/api/health", detail: "Cloudflare Worker health endpoint." }
    ]
  }
];

function buildHref(path) {
  const base = import.meta.env.BASE_URL || "/";
  return `${base}${path}`.replace(/\/{2,}/g, "/");
}

export default function CommandLinks() {
  return (
    <main className="revenue-shell">
      <CommandNav current="links" />
      <section className="revenue-hero pricing-hero">
        <div>
          <span className="revenue-eyebrow">ARCHAIOS Command Links</span>
          <h1>One launcher for every live surface.</h1>
          <p>
            Use this route as the bridge between public discovery, upgrade flow, authenticated dashboard,
            operator shell, and export-prep testing.
          </p>
          <div className="revenue-actions">
            <a href={buildHref("landing")}>Start at Landing</a>
            <a className="secondary" href={buildHref("dashboard?mock=1")}>Open Mock Dashboard</a>
          </div>
        </div>
      </section>

      <section className="launcher-grid">
        {groups.map((group) => (
          <article className="revenue-card launcher-card" key={group.title}>
            <span className="revenue-eyebrow">{group.eyebrow}</span>
            <h2>{group.title}</h2>
            <div className="launcher-link-list">
              {group.links.map((link) => (
                <a href={link.href || buildHref(link.path)} key={link.label}>
                  <strong>{link.label}</strong>
                  <span>{link.detail}</span>
                </a>
              ))}
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}

