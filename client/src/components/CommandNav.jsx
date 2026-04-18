const DEFAULT_ITEMS = [
  { label: "Links", path: "links" },
  { label: "Landing", path: "landing" },
  { label: "Pricing", path: "pricing" },
  { label: "Dashboard", path: "dashboard" },
  { label: "Operator", path: "operator" },
  { label: "Book Growth", path: "book-growth" }
];

function buildHref(path) {
  const base = import.meta.env.BASE_URL || "/";
  return `${base}${path}`.replace(/\/{2,}/g, "/");
}

export default function CommandNav({ current = "", items = DEFAULT_ITEMS, compact = false }) {
  return (
    <nav className={`command-nav ${compact ? "command-nav-compact" : ""}`} aria-label="ARCHAIOS command navigation">
      <a className="command-nav-brand" href={buildHref("landing")}>
        ARCHAIOS Command
      </a>
      <div className="command-nav-links">
        {items.map((item) => (
          <a className={current === item.path ? "is-active" : ""} href={buildHref(item.path)} key={item.path}>
            {item.label}
          </a>
        ))}
      </div>
    </nav>
  );
}
