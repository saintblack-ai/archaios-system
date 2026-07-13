import CommandNav from "../../components/CommandNav";

type SyncStatus = "offline" | "connected" | "future" | "mock";

type SyncModule = {
  title: string;
  status: SyncStatus;
  metric: string;
  detail: string;
  nextAction: string;
};

type Integration = {
  name: string;
  status: SyncStatus;
  capability: string;
  boundary: string;
};

const statusLabels: Record<SyncStatus, string> = {
  offline: "Offline",
  connected: "Connected",
  future: "Future",
  mock: "Mock"
};

const dashboardModules: SyncModule[] = [
  {
    title: "Mission Status",
    status: "connected",
    metric: "Local mission map",
    detail: "Prepared for future mission sync without reading or writing remote systems.",
    nextAction: "Map mobile Mission records to dashboard summary cards."
  },
  {
    title: "Commander",
    status: "mock",
    metric: "Command console ready",
    detail: "Placeholder for Commander messages, routing, saved prompts, and operator handoff.",
    nextAction: "Define sync contract for local conversation exports."
  },
  {
    title: "Architecture",
    status: "connected",
    metric: "Sprint 17 aligned",
    detail: "Tracks architecture notes, SwiftData model docs, and roadmap readiness.",
    nextAction: "Add read-only import manifest for architecture documentation."
  },
  {
    title: "Black Vault",
    status: "offline",
    metric: "Vault sync disabled",
    detail: "Search and collection placeholders are present with no remote storage connection.",
    nextAction: "Design local export package format before any remote adapter."
  },
  {
    title: "Research",
    status: "mock",
    metric: "Research queue staged",
    detail: "Displays placeholder research collections for future local-to-web synchronization.",
    nextAction: "Normalize research item metadata across mobile and web."
  },
  {
    title: "Prompt Library",
    status: "future",
    metric: "Templates pending",
    detail: "Prepared for reusable prompt categories, favorites, and command presets.",
    nextAction: "Create a local JSON schema for prompt template imports."
  },
  {
    title: "Sprint Reports",
    status: "connected",
    metric: "Reports indexed",
    detail: "Dashboard section reserved for sprint report summaries and release notes.",
    nextAction: "Generate a report manifest from local docs during build prep."
  },
  {
    title: "System Health",
    status: "mock",
    metric: "No live checks",
    detail: "Health cards show future readiness only; no endpoints are called from this page.",
    nextAction: "Keep production health checks behind explicit feature flags."
  }
];

const integrations: Integration[] = [
  {
    name: "ChatGPT",
    status: "future",
    capability: "Conversation routing, summaries, and planning",
    boundary: "No OpenAI keys, requests, or provider clients are loaded."
  },
  {
    name: "Codex",
    status: "mock",
    capability: "Build sprint handoff and local task queue",
    boundary: "Copy-ready placeholders only; no remote execution."
  },
  {
    name: "GitHub",
    status: "future",
    capability: "Issues, pull requests, checkpoints, and release metadata",
    boundary: "No GitHub token, API client, or repository mutation."
  },
  {
    name: "Cloudflare",
    status: "future",
    capability: "Worker health, DNS, and deployment readiness",
    boundary: "No Worker calls, deploy commands, or tunnel links."
  },
  {
    name: "Notion",
    status: "future",
    capability: "Black Vault pages, research docs, and operating dashboards",
    boundary: "No Notion auth or workspace connection."
  },
  {
    name: "Supabase",
    status: "offline",
    capability: "Future sync store and auth-aware dashboard data",
    boundary: "This page does not import the Supabase client."
  },
  {
    name: "OpenClaw",
    status: "mock",
    capability: "Audit queue, command classification, and code review handoff",
    boundary: "Manual placeholder queue only."
  },
  {
    name: "Apple Devices",
    status: "future",
    capability: "iPhone, Mac Core, local bridge, and device handoff",
    boundary: "No LAN, tunnel, Bluetooth, or iCloud sync connection."
  }
];

const readinessChecks = [
  "Production integrations remain disabled by design.",
  "No API keys, provider secrets, or bearer tokens are required.",
  "All statuses are static local placeholders.",
  "Responsive layout supports mobile, tablet, and desktop command views.",
  "Founder Edition black-and-gold branding is preserved."
];

function StatusBadge({ status }: { status: SyncStatus }) {
  return <span className={`sync-status sync-status-${status}`}>{statusLabels[status]}</span>;
}

function ModuleCard({ module }: { module: SyncModule }) {
  return (
    <article className="sync-card">
      <div className="sync-card-head">
        <p className="eyebrow">{module.title}</p>
        <StatusBadge status={module.status} />
      </div>
      <h2>{module.metric}</h2>
      <p>{module.detail}</p>
      <div className="sync-next-action">
        <span>Next</span>
        <strong>{module.nextAction}</strong>
      </div>
    </article>
  );
}

function IntegrationCard({ integration }: { integration: Integration }) {
  return (
    <article className="sync-integration-card">
      <div className="sync-card-head">
        <h3>{integration.name}</h3>
        <StatusBadge status={integration.status} />
      </div>
      <p>{integration.capability}</p>
      <span>{integration.boundary}</span>
    </article>
  );
}

export default function FutureSyncDashboard() {
  return (
    <main className="sync-dashboard-shell">
      <CommandNav current="sync-readiness" />

      <section className="sync-hero">
        <div>
          <p className="eyebrow">ARCHAIOS Web Dashboard</p>
          <h1>Future synchronization command surface</h1>
          <p>
            Local-first placeholder modules for the next ARCHAIOS bridge. This screen prepares the dashboard for sync
            without connecting production services, exposing APIs, or loading provider credentials.
          </p>
          <div className="sync-badge-row" aria-label="Synchronization safety badges">
            <StatusBadge status="offline" />
            <StatusBadge status="connected" />
            <StatusBadge status="future" />
            <StatusBadge status="mock" />
          </div>
        </div>
        <aside className="sync-command-panel">
          <p className="eyebrow">Readiness posture</p>
          <strong>Placeholder Bridge</strong>
          <span>No network calls. No production APIs. No secret storage.</span>
          <div className="sync-readiness-meter" aria-label="Future sync readiness">
            <i style={{ width: "72%" }} />
          </div>
          <small>72% design-ready for a later opt-in sync layer.</small>
        </aside>
      </section>

      <section className="sync-section">
        <div className="sync-section-head">
          <div>
            <p className="eyebrow">Dashboard</p>
            <h2>Founder modules staged for synchronization</h2>
          </div>
          <StatusBadge status="mock" />
        </div>
        <div className="sync-module-grid">
          {dashboardModules.map((module) => (
            <ModuleCard module={module} key={module.title} />
          ))}
        </div>
      </section>

      <section className="sync-section">
        <div className="sync-section-head">
          <div>
            <p className="eyebrow">Future Integrations</p>
            <h2>Provider cards with local-only boundaries</h2>
          </div>
          <StatusBadge status="future" />
        </div>
        <div className="sync-integration-grid">
          {integrations.map((integration) => (
            <IntegrationCard integration={integration} key={integration.name} />
          ))}
        </div>
      </section>

      <section className="sync-section sync-readiness-section">
        <div>
          <p className="eyebrow">Deployment Readiness</p>
          <h2>Prepared, not published</h2>
          <p>
            This page is safe to build locally as a future synchronization preview. It intentionally avoids production
            service calls and should remain behind explicit release review before public promotion.
          </p>
        </div>
        <ul className="sync-check-list">
          {readinessChecks.map((check) => (
            <li key={check}>{check}</li>
          ))}
        </ul>
      </section>
    </main>
  );
}
