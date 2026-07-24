import { useEffect, useMemo, useState } from "react";
import CommandNav from "../../components/CommandNav";
import { fetchLatestSitrep, fetchSitrepMap, fetchSitrepSources } from "../../api/liveSitrep";

const threatLevels = ["LOW", "GUARDED", "ELEVATED", "HIGH"];

const sitrepSections = [
  {
    id: "ai",
    label: "AI",
    level: "ELEVATED",
    confidence: 86,
    summary: "Frontier model releases, agent tooling, and infrastructure competition remain the highest velocity signal cluster.",
    source: "ARCHAIOS AI desk"
  },
  {
    id: "defense",
    label: "Defense",
    level: "GUARDED",
    confidence: 78,
    summary: "Regional posture remains active with procurement, drone warfare, and maritime security as primary watch items.",
    source: "Open source defense feeds"
  },
  {
    id: "markets",
    label: "Markets",
    level: "GUARDED",
    confidence: 74,
    summary: "Liquidity, energy pricing, and AI infrastructure capex continue to shape the near-term risk picture.",
    source: "Market intelligence layer"
  },
  {
    id: "cyber",
    label: "Cyber",
    level: "ELEVATED",
    confidence: 82,
    summary: "Provider status, SaaS exposure, credential abuse, and software supply chain activity require active monitoring.",
    source: "Cyber status adapters"
  },
  {
    id: "space",
    label: "Space",
    level: "LOW",
    confidence: 69,
    summary: "Space weather and launch activity are stable, with research events queued for weekly strategic review.",
    source: "NASA and OSINT"
  },
  {
    id: "weather",
    label: "Weather",
    level: "GUARDED",
    confidence: 80,
    summary: "Severe weather remains a regional operational risk for logistics, power stability, and field movement.",
    source: "Weather adapter"
  }
];

const markers = [
  { id: "north-america", type: "AI", x: 23, y: 35, level: "ELEVATED" },
  { id: "atlantic", type: "Cyber", x: 43, y: 44, level: "ELEVATED" },
  { id: "europe", type: "Defense", x: 52, y: 32, level: "GUARDED" },
  { id: "middle-east", type: "Markets", x: 60, y: 48, level: "GUARDED" },
  { id: "pacific", type: "Weather", x: 78, y: 52, level: "GUARDED" },
  { id: "orbit", type: "Space", x: 67, y: 20, level: "LOW" }
];

const missionQueue = [
  "Generate morning SITREP from active AI, defense, markets, cyber, space, and weather sections.",
  "Run provider-status sweep for OpenAI, Cloudflare, Supabase, and Stripe.",
  "Prioritize events missing research-mode bias and counterargument assessments.",
  "Refresh memory graph relationships for high-confidence elevated events."
];

const researchItems = [
  { title: "AI infrastructure capex pressure", status: "Analysis queued", priority: "High" },
  { title: "Cyber provider incident correlation", status: "Source review", priority: "High" },
  { title: "Space weather operational exposure", status: "Monitor", priority: "Normal" }
];

const graphNodes = [
  "AI",
  "Cyber",
  "Markets",
  "Defense",
  "Space",
  "Weather",
  "Memory"
];

const categoryOptions = ["all", "ai", "cyber", "defense", "markets", "space", "weather", "science", "infrastructure", "archaios"];
const severityOptions = ["all", "informational", "low", "guarded", "elevated", "high", "critical"];

function levelClass(level) {
  return String(level || "low").toLowerCase();
}

function eventToLevel(event) {
  if (event?.severity === "critical" || event?.severity === "high") return "HIGH";
  if (event?.severity === "elevated") return "ELEVATED";
  if (event?.severity === "guarded") return "GUARDED";
  return "LOW";
}

function formatTimestamp(value) {
  if (!value) return "No timestamp";
  return new Date(value).toLocaleString();
}

function projectCoordinate(latitude, longitude) {
  return {
    x: ((Number(longitude) + 180) / 360) * 100,
    y: ((90 - Number(latitude)) / 180) * 100
  };
}

function useLiveSitrep() {
  const [state, setState] = useState({
    loading: true,
    error: "",
    latest: null,
    mapEvents: [],
    sources: []
  });
  const [filters, setFilters] = useState({ category: "all", severity: "all", verifiedOnly: false });

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setState((current) => ({ ...current, loading: true, error: "" }));
      try {
        const apiFilters = {
          category: filters.category === "all" ? "" : filters.category,
          severity: filters.severity === "all" ? "" : filters.severity,
          verifiedOnly: filters.verifiedOnly ? "true" : ""
        };
        const [latest, map, sources] = await Promise.all([
          fetchLatestSitrep(),
          fetchSitrepMap(apiFilters),
          fetchSitrepSources()
        ]);
        if (!cancelled) {
          setState({
            loading: false,
            error: "",
            latest,
            mapEvents: map.events || [],
            sources: sources.sources || []
          });
        }
      } catch (error) {
        if (!cancelled) {
          setState({
            loading: false,
            error: String(error?.message || error),
            latest: null,
            mapEvents: [],
            sources: []
          });
        }
      }
    }

    load();
    const timer = setInterval(load, 60000);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [filters]);

  return { ...state, filters, setFilters };
}

function ThreatLadder({ level = "ELEVATED", dataStatus = "sample" }) {
  const activeLevel = String(level || "LOW").toUpperCase();
  return (
    <section className="ios-panel ios-threat-panel" aria-label="Global threat level">
      <div className="ios-panel-head">
        <span>Global Threat Level</span>
        <strong>{level}</strong>
      </div>
      <div className="ios-threat-ladder">
        {threatLevels.map((threatLevel) => (
          <div className={`ios-threat-step ${threatLevel === activeLevel ? "is-active" : ""}`} key={threatLevel}>
            <span>{threatLevel}</span>
          </div>
        ))}
      </div>
      <span className="ios-data-label">{dataStatus}</span>
    </section>
  );
}

function LiveWorldMap({ events = [], onSelect }) {
  const projected = events
    .filter((event) => Number.isFinite(Number(event.latitude)) && Number.isFinite(Number(event.longitude)))
    .map((event) => ({ ...event, ...projectCoordinate(event.latitude, event.longitude) }));

  return (
    <section className="ios-map-panel" aria-label="Live animated world map">
      <div className="ios-map-grid" />
      <div className="ios-orbit ios-orbit-one" />
      <div className="ios-orbit ios-orbit-two" />
      <div className="ios-worldline ios-worldline-one" />
      <div className="ios-worldline ios-worldline-two" />
      <div className="ios-worldline ios-worldline-three" />
      {projected.length === 0 ? (
        markers.map((marker) => (
          <button
            aria-label={`Sample ${marker.type} intelligence marker ${marker.level}`}
            className={`ios-map-marker marker-${levelClass(marker.level)}`}
            key={marker.id}
            style={{ left: `${marker.x}%`, top: `${marker.y}%` }}
            type="button"
          >
            <span />
            <strong>Sample</strong>
          </button>
        ))
      ) : projected.map((marker) => (
        <button
          aria-label={`${marker.category} intelligence marker ${marker.severity}`}
          className={`ios-map-marker marker-${levelClass(eventToLevel(marker))}`}
          key={marker.id}
          style={{ left: `${marker.x}%`, top: `${marker.y}%` }}
          onClick={() => onSelect(marker)}
          type="button"
        >
          <span />
          <strong>{marker.category}</strong>
        </button>
      ))}
      <div className="ios-map-label">
        <span>Live World Map</span>
        <strong>{projected.length ? `${projected.length} sourced markers` : "Sample marker layer"}</strong>
      </div>
    </section>
  );
}

function SitrepGrid({ events = [] }) {
  const sectionEvents = events.length ? events.slice(0, 6) : sitrepSections;
  return (
    <section className="ios-panel ios-section-span">
      <div className="ios-panel-head">
        <span>Today's SITREP</span>
        <strong>{events.length ? `${events.length} sourced events` : "sample sections"}</strong>
      </div>
      <div className="ios-sitrep-grid">
        {sectionEvents.map((section) => (
          <article className="ios-sitrep-card" key={section.id}>
            <div>
              <strong>{section.label || section.headline}</strong>
              <span className={`ios-level ios-level-${levelClass(section.severity || section.level)}`}>{section.severity || section.level}</span>
            </div>
            <p>{section.summary}</p>
            <footer>
              <span>{Math.round((section.confidence || 0) * (section.confidence <= 1 ? 100 : 1))}% confidence</span>
              <span>{section.source_name || section.source}</span>
            </footer>
          </article>
        ))}
      </div>
    </section>
  );
}

function CommanderBrief({ brief }) {
  return (
    <section className="ios-panel ios-commander-panel">
      <div className="ios-panel-head">
        <span>Commander Brief</span>
        <strong>Operational posture</strong>
      </div>
      <p>{brief?.executive_summary || "Commander assessment unavailable. Connect live sources or use refresh after authorization."}</p>
      <div className="ios-brief-actions">
        {(brief?.recommended_next_actions || [
          "Watch source freshness.",
          "Preserve source confidence on every event.",
          "Escalate only when two independent signals agree."
        ]).slice(0, 3).map((action) => <span key={action}>{action}</span>)}
      </div>
    </section>
  );
}

function MissionQueue() {
  return (
    <section className="ios-panel">
      <div className="ios-panel-head">
        <span>Mission Queue</span>
        <strong>{missionQueue.length} active</strong>
      </div>
      <div className="ios-queue">
        {missionQueue.map((mission, index) => (
          <article key={mission}>
            <span>{String(index + 1).padStart(2, "0")}</span>
            <p>{mission}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function ResearchCenter({ sources = [] }) {
  const stale = sources.filter((source) => source.freshness !== "fresh").slice(0, 3);
  const display = stale.length
    ? stale.map((source) => ({ title: source.name, status: source.freshness, priority: source.latest_status === "failed" ? "High" : "Normal" }))
    : researchItems;
  return (
    <section className="ios-panel">
      <div className="ios-panel-head">
        <span>Research Center</span>
        <strong>GPT assessment queue</strong>
      </div>
      <div className="ios-research-list">
        {display.map((item) => (
          <article key={item.title}>
            <div>
              <strong>{item.title}</strong>
              <span>{item.status}</span>
            </div>
            <span className="ios-priority">{item.priority}</span>
          </article>
        ))}
      </div>
    </section>
  );
}

function MemoryGraph() {
  return (
    <section className="ios-panel ios-graph-panel">
      <div className="ios-panel-head">
        <span>Memory Graph</span>
        <strong>Semantic relationships</strong>
      </div>
      <div className="ios-graph">
        {graphNodes.map((node, index) => (
          <span
            className={node === "Memory" ? "is-core" : ""}
            key={node}
          >
            {node}
          </span>
        ))}
      </div>
    </section>
  );
}

function FilterBar({ filters, setFilters, sources }) {
  const fresh = sources.filter((source) => source.freshness === "fresh").length;
  return (
    <section className="ios-filter-bar" aria-label="SITREP filters">
      <select value={filters.category} onChange={(event) => setFilters((current) => ({ ...current, category: event.target.value }))}>
        {categoryOptions.map((category) => <option key={category} value={category}>{category}</option>)}
      </select>
      <select value={filters.severity} onChange={(event) => setFilters((current) => ({ ...current, severity: event.target.value }))}>
        {severityOptions.map((severity) => <option key={severity} value={severity}>{severity}</option>)}
      </select>
      <label>
        <input
          type="checkbox"
          checked={filters.verifiedOnly}
          onChange={(event) => setFilters((current) => ({ ...current, verifiedOnly: event.target.checked }))}
        />
        Verified only
      </label>
      <span>{fresh}/{sources.length || 0} sources fresh</span>
    </section>
  );
}

function EventDrawer({ event, onClose }) {
  if (!event) return null;
  return (
    <aside className="ios-event-drawer" aria-label="Event details">
      <button type="button" onClick={onClose}>Close</button>
      <span className={`ios-level ios-level-${levelClass(event.severity)}`}>{event.severity}</span>
      <h2>{event.headline}</h2>
      <p>{event.summary}</p>
      <dl>
        <dt>Category</dt><dd>{event.category}</dd>
        <dt>Confidence</dt><dd>{Math.round(Number(event.confidence || 0) * 100)}%</dd>
        <dt>Source</dt><dd>{event.source_url ? <a href={event.source_url} target="_blank" rel="noreferrer">{event.source_name}</a> : event.source_name}</dd>
        <dt>Published</dt><dd>{formatTimestamp(event.published_at)}</dd>
        <dt>Ingested</dt><dd>{formatTimestamp(event.ingested_at)}</dd>
        <dt>Location</dt><dd>{event.region || `${event.latitude}, ${event.longitude}`}</dd>
        <dt>Verified</dt><dd>{event.is_verified ? "yes" : "no"}</dd>
      </dl>
      {event.analysis ? <p className="ios-drawer-note">{event.analysis}</p> : null}
    </aside>
  );
}

export default function SitrepCommandCenter() {
  const { loading, error, latest, mapEvents, sources, filters, setFilters } = useLiveSitrep();
  const [selectedEvent, setSelectedEvent] = useState(null);
  const allEvents = latest?.events || [];
  const threat = eventToLevel({ severity: latest?.global_threat_level || "guarded" });
  const dataStatus = loading ? "loading" : error ? "unavailable" : latest?.data_status || "sample";
  const visibleEvents = useMemo(() => allEvents, [allEvents]);

  return (
    <main className="ios-shell">
      <CommandNav current="sitrep" compact />
      <header className="ios-hero">
        <div>
          <p className="eyebrow">ARCHAIOS</p>
          <h1>AI Intelligence Operating System</h1>
          <p className="ios-state-line">{error ? `Degraded: ${error}` : `Data status: ${dataStatus}`}</p>
        </div>
        <ThreatLadder level={threat} dataStatus={dataStatus} />
      </header>
      <FilterBar filters={filters} setFilters={setFilters} sources={sources} />
      <LiveWorldMap events={mapEvents} onSelect={setSelectedEvent} />
      <section className="ios-command-grid">
        <SitrepGrid events={visibleEvents} />
        <CommanderBrief brief={latest?.commander_brief} />
        <MissionQueue />
        <ResearchCenter sources={sources} />
        <MemoryGraph />
      </section>
      <EventDrawer event={selectedEvent} onClose={() => setSelectedEvent(null)} />
    </main>
  );
}
