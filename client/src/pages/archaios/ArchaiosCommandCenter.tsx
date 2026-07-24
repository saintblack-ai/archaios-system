import { useEffect, useMemo, useState } from "react";
import CommandNav from "../../components/CommandNav";
import {
  ArchaiosCommandSnapshot,
  CommandDivision,
  CommandItem,
  CommandMetric,
  loadArchaiosCommandSnapshot
} from "./archaiosCommandData";

function statusLabel(status = "amber") {
  if (status === "green") return "Stable";
  if (status === "red") return "Critical";
  return "Watch";
}

function StatusPill({ status }: { status?: string }) {
  return <span className={`archaios-status archaios-status-${status || "amber"}`}>{statusLabel(status)}</span>;
}

function MetricTile({ metric }: { metric: CommandMetric }) {
  return (
    <article className="archaios-metric-tile">
      <div className="archaios-card-head">
        <p className="eyebrow">{metric.label}</p>
        <StatusPill status={metric.status} />
      </div>
      <strong>{metric.value}</strong>
      <span>{metric.detail}</span>
    </article>
  );
}

function ItemList({ title, items }: { title: string; items: CommandItem[] }) {
  return (
    <section className="archaios-list-panel">
      <h3>{title}</h3>
      <div className="archaios-command-list">
        {items.map((item) => (
          <article className="archaios-command-item" key={`${title}-${item.title}`}>
            <div>
              <strong>{item.title}</strong>
              <p>{item.detail}</p>
            </div>
            <StatusPill status={item.status} />
          </article>
        ))}
      </div>
    </section>
  );
}

function DivisionPanel({ division }: { division: CommandDivision }) {
  return (
    <section className="archaios-division-panel" id={division.id}>
      <div className="archaios-section-head">
        <div>
          <p className="eyebrow">{division.callSign}</p>
          <h2>{division.name}</h2>
          <p>{division.mission}</p>
        </div>
        <StatusPill status={division.status} />
      </div>
      <div className="archaios-metric-grid">
        {division.metrics.map((metric) => (
          <MetricTile metric={metric} key={`${division.id}-${metric.label}`} />
        ))}
      </div>
      <div className="archaios-command-list archaios-command-list-compact">
        {division.items.map((item) => (
          <article className="archaios-command-item" key={`${division.id}-${item.title}`}>
            <div>
              <strong>{item.title}</strong>
              <p>{item.detail}</p>
            </div>
            <StatusPill status={item.status} />
          </article>
        ))}
      </div>
    </section>
  );
}

export default function ArchaiosCommandCenter() {
  const [snapshot, setSnapshot] = useState<ArchaiosCommandSnapshot | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      const nextSnapshot = await loadArchaiosCommandSnapshot();
      if (!cancelled) {
        setSnapshot(nextSnapshot);
        setLoading(false);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  const systemCounts = useMemo(() => {
    const divisions = snapshot?.divisions || [];
    return {
      divisions: divisions.length,
      stable: divisions.filter((division) => division.status === "green").length,
      watch: divisions.filter((division) => division.status === "amber").length,
      critical: divisions.filter((division) => division.status === "red").length
    };
  }, [snapshot]);

  if (!snapshot) {
    return (
      <main className="archaios-command-shell">
        <CommandNav current="archaios" />
        <section className="archaios-hero">
          <p className="eyebrow">ARCHAIOS Command Center</p>
          <h1>{loading ? "Loading command center..." : "Command center unavailable"}</h1>
        </section>
      </main>
    );
  }

  return (
    <main className="archaios-command-shell">
      <CommandNav current="archaios" />

      <section className="archaios-hero">
        <div>
          <p className="eyebrow">ARCHAIOS Command Center V1</p>
          <h1>Saint Black ecosystem command surface</h1>
          <p>
            Executive command, revenue posture, research pipeline, media IP, commerce, and legacy preservation in one
            operating view.
          </p>
          <div className="archaios-hero-actions">
            <a className="primary-button saint-link-button" href="#executive-command">
              Executive Command
            </a>
            <a className="ghost-button saint-link-button" href="#legacy-archive">
              Legacy Archive
            </a>
            <button className="ghost-button" type="button" onClick={() => window.location.reload()}>
              Refresh
            </button>
          </div>
        </div>
        <aside className="archaios-command-card">
          <div className="archaios-card-head">
            <p className="eyebrow">Live State</p>
            <StatusPill status={systemCounts.critical ? "red" : systemCounts.watch ? "amber" : "green"} />
          </div>
          <div className="archaios-system-grid">
            <MetricTile metric={{ label: "Divisions", value: String(systemCounts.divisions), detail: "Tracked command areas.", status: "green" }} />
            <MetricTile metric={{ label: "Stable", value: String(systemCounts.stable), detail: "Green operational status.", status: "green" }} />
            <MetricTile metric={{ label: "Watch", value: String(systemCounts.watch), detail: "Needs operator attention.", status: "amber" }} />
            <MetricTile metric={{ label: "Critical", value: String(systemCounts.critical), detail: "Immediate risk items.", status: systemCounts.critical ? "red" : "green" }} />
          </div>
          <p className="archaios-meta">
            Source: {snapshot.source}. Generated: {new Date(snapshot.generatedAt).toLocaleString()}.
          </p>
        </aside>
      </section>

      <section className="archaios-executive-grid" id="executive-command">
        <article className="archaios-command-card archaios-command-card-wide">
          <div className="archaios-card-head">
            <p className="eyebrow">Executive Command</p>
            <StatusPill status="green" />
          </div>
          <h2>Mission Status</h2>
          <p>{snapshot.executive.missionStatus}</p>
          <div className="archaios-sitrep">
            <p className="eyebrow">Daily SITREP</p>
            <strong>{snapshot.executive.dailySitrep}</strong>
          </div>
        </article>
        <ItemList title="Current Priorities" items={snapshot.executive.priorities} />
        <ItemList title="Active Projects" items={snapshot.executive.activeProjects} />
        <ItemList title="Strategic Risks" items={snapshot.executive.strategicRisks} />
      </section>

      <section className="archaios-division-stack">
        {snapshot.divisions.map((division) => (
          <DivisionPanel division={division} key={division.id} />
        ))}
      </section>
    </main>
  );
}
