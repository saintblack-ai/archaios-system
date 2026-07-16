import CommandNav from "../../components/CommandNav";
import dailyCommand from "../../../archaios-core/interfaces/daily-command-center.json";

function statusLabel(status) {
  if (status === "green") return "Stable";
  if (status === "red") return "Critical";
  return "Watch";
}

function StatusChip({ status = "amber" }) {
  return <span className={`mission-status mission-status-${status}`}>{statusLabel(status)}</span>;
}

function statusFromText(value = "") {
  const text = String(value).toLowerCase();
  if (text.includes("blocked") || text.includes("critical") || text.includes("red")) return "red";
  if (text.includes("missing") || text.includes("watch") || text.includes("amber") || text.includes("needed")) return "amber";
  return "green";
}

function Panel({ eyebrow, title, status = "green", children, className = "" }) {
  return (
    <section className={`mission-panel ${className}`}>
      <div className="mission-panel-head">
        <div>
          <p className="eyebrow">{eyebrow}</p>
          <h2>{title}</h2>
        </div>
        <StatusChip status={status} />
      </div>
      {children}
    </section>
  );
}

function Metric({ label, value, detail, status = "green" }) {
  return (
    <article className="mission-metric">
      <div className="mission-card-head">
        <span>{label}</span>
        <StatusChip status={status} />
      </div>
      <strong>{value}</strong>
      <p>{detail}</p>
    </article>
  );
}

function MiniList({ items, renderItem }) {
  return (
    <div className="mission-list">
      {items.map((item, index) => (
        <div className="mission-row" key={item.id || item.key || item.area || item.label || item.title || index}>
          {renderItem(item, index)}
        </div>
      ))}
    </div>
  );
}

function CommanderBrief({ command }) {
  const briefing = command.commander.morningBriefing;
  return (
    <Panel eyebrow="Commander Brief" title={briefing.headline} status={command.commander.status} className="mission-panel-command">
      <p>{briefing.summary}</p>
      <div className="mission-action-grid">
        {briefing.actions.map((action) => (
          <div className="mission-action" key={action}>{action}</div>
        ))}
      </div>
    </Panel>
  );
}

function AgentHealth({ dashboards }) {
  const health = dashboards.agentHealth;
  return (
    <Panel eyebrow="Agent Health" title={`${health.green} stable, ${health.amber} watch, ${health.red} critical`} status={health.red ? "red" : health.amber ? "amber" : "green"}>
      <MiniList
        items={health.reports}
        renderItem={(report) => (
          <>
            <div>
              <strong>{report.agentKey}</strong>
              <span>{report.summary}</span>
            </div>
            <StatusChip status={report.status} />
          </>
        )}
      />
    </Panel>
  );
}

function StatusGrid({ command }) {
  const dashboards = command.dashboards;
  const monitors = Object.fromEntries(command.executiveOfficer.monitors.map((monitor) => [monitor.key, monitor]));
  const sentinel = command.securityOperations;
  const revenue = dashboards.financialDashboard;
  const deployment = dashboards.deploymentStatus;

  return (
    <section className="mission-status-grid">
      <Metric label="GitHub" value={monitors.github?.metrics.branch || "unknown"} detail={`${monitors.github?.metrics.workflows || 0} workflows present`} status={monitors.github?.status} />
      <Metric label="Supabase" value={`${monitors.supabase?.metrics.migrations || 0} migrations`} detail="Local migration contract tracked" status={monitors.supabase?.status} />
      <Metric label="Stripe Revenue" value={`$${Number(revenue.estimatedMonthlyRevenue || 0).toLocaleString()}`} detail="Projected monthly until live metrics reconcile" status={monitors.stripe?.status} />
      <Metric label="Cloudflare" value={monitors.cloudflare?.metrics.rootName || "worker"} detail={deployment.backendHost} status={monitors.cloudflare?.status} />
      <Metric label="Security Alerts" value={String(sentinel.metrics.actionableFindings)} detail={sentinel.summary} status={sentinel.status} />
      <Metric label="Deployments" value={deployment.github.workflows.filter((workflow) => workflow.present).length} detail={deployment.localHealthSummary} status={monitors.deployments?.status} />
    </section>
  );
}

function TasksAndDeployments({ dashboards, scheduledTasks }) {
  return (
    <section className="mission-two-col">
      <Panel eyebrow="Tasks" title="Execution Queue" status={dashboards.taskQueue.counts.blocked ? "red" : dashboards.taskQueue.counts.inProgress ? "amber" : "green"}>
        <div className="mission-mini-metrics">
          <span>Queued {dashboards.taskQueue.counts.queue}</span>
          <span>Prioritized {dashboards.taskQueue.counts.prioritized}</span>
          <span>In Progress {dashboards.taskQueue.counts.inProgress}</span>
          <span>Blocked {dashboards.taskQueue.counts.blocked}</span>
        </div>
        <MiniList
          items={dashboards.taskQueue.samples.inProgress.slice(0, 5)}
          renderItem={(task) => (
            <>
              <div>
                <strong>{task.agent || task.id || "task"}</strong>
                <span>{task.task || task.stdout || "In-progress task"}</span>
              </div>
              <span className="mission-tag">active</span>
            </>
          )}
        />
      </Panel>

      <Panel eyebrow="Deployments" title="Release Control" status={statusFromText(dashboards.deploymentStatus.localHealthSummary)}>
        <MiniList
          items={dashboards.deploymentStatus.github.workflows}
          renderItem={(workflow) => (
            <>
              <div>
                <strong>{workflow.name}</strong>
                <span>{workflow.path}</span>
              </div>
              <StatusChip status={workflow.present ? "green" : "red"} />
            </>
          )}
        />
        <div className="mission-schedule">
          {scheduledTasks.map((task) => (
            <span key={task.id}>{task.owner}: {task.status}</span>
          ))}
        </div>
      </Panel>
    </section>
  );
}

function KnowledgeAndMemory({ dashboards }) {
  const memory = dashboards.memoryUsage.semanticMemory;
  return (
    <section className="mission-two-col">
      <Panel eyebrow="Memory Growth" title={memory.provider} status="amber">
        <p>{memory.status}. {memory.dimensions} dimensions. {memory.tables.length} tables.</p>
        <MiniList
          items={dashboards.memoryUsage.timeline.slice(0, 5)}
          renderItem={(item) => (
            <div>
              <strong>{item.title}</strong>
              <span>{new Date(item.timestamp).toLocaleString()} - {item.detail}</span>
            </div>
          )}
        />
      </Panel>
      <Panel eyebrow="Knowledge Index" title={`${Number(dashboards.knowledgeGrowth.totals.records || 0).toLocaleString()} records`} status="green">
        <MiniList
          items={dashboards.knowledgeGrowth.clusters}
          renderItem={(cluster) => (
            <>
              <div>
                <strong>{cluster.label || cluster.id}</strong>
                <span>{cluster.count || 0} records</span>
              </div>
              <span className="mission-tag">{cluster.id || "cluster"}</span>
            </>
          )}
        />
      </Panel>
    </section>
  );
}

function CalendarAndObjectives({ command }) {
  const objectives = command.executiveBrief.topPriorities.map((priority) => ({
    id: priority.area,
    title: priority.area,
    detail: priority.directive,
    status: priority.status
  }));
  const calendar = [
    { id: "morning", title: "Morning Executive Brief", detail: "07:00 prepared daily briefing", status: command.commander.status },
    { id: "sentinel", title: "Sentinel SOC Scan", detail: `${command.securityOperations.metrics.actionableFindings} actionable findings`, status: command.securityOperations.status },
    { id: "evening", title: "Evening Review", detail: "20:30 capture wins, blockers, and preservation notes", status: "amber" }
  ];

  return (
    <section className="mission-two-col">
      <Panel eyebrow="Calendar" title="Operating Cadence" status="amber">
        <MiniList
          items={calendar}
          renderItem={(item) => (
            <>
              <div>
                <strong>{item.title}</strong>
                <span>{item.detail}</span>
              </div>
              <StatusChip status={item.status} />
            </>
          )}
        />
      </Panel>
      <Panel eyebrow="Daily Objectives" title="Company Priorities" status={command.executiveBrief.status}>
        <MiniList
          items={objectives}
          renderItem={(item, index) => (
            <>
              <div>
                <strong>{index + 1}. {item.title}</strong>
                <span>{item.detail}</span>
              </div>
              <StatusChip status={item.status} />
            </>
          )}
        />
      </Panel>
    </section>
  );
}

export default function MissionControl() {
  const dashboards = dailyCommand.dashboards;

  return (
    <main className="mission-control-shell">
      <CommandNav current="mission-control" />
      <section className="mission-hero">
        <div>
          <p className="eyebrow">ARCHAIOS Mission Control</p>
          <h1>Company Operating Screen</h1>
          <p>{dailyCommand.commander.summary}</p>
          <span>Generated {new Date(dailyCommand.generatedAt).toLocaleString()}</span>
        </div>
        <div className="mission-hero-metrics">
          <Metric label="Commander" value={statusLabel(dailyCommand.commander.status)} detail={dailyCommand.executiveBrief.summary} status={dailyCommand.commander.status} />
          <Metric label="Agents" value={`${dashboards.agentHealth.green}/${dailyCommand.agentReports.length}`} detail={`${dashboards.agentHealth.amber} watch, ${dashboards.agentHealth.red} critical`} status={dailyCommand.commander.status} />
          <Metric label="Revenue" value={`$${Number(dashboards.financialDashboard.estimatedMonthlyRevenue || 0).toLocaleString()}`} detail="Projected monthly revenue" status="amber" />
          <Metric label="Security" value={String(dailyCommand.securityOperations.metrics.actionableFindings)} detail="Actionable SOC findings" status={dailyCommand.securityOperations.status} />
        </div>
      </section>

      <CommanderBrief command={dailyCommand} />
      <StatusGrid command={dailyCommand} />
      <section className="mission-two-col">
        <AgentHealth dashboards={dashboards} />
        <Panel eyebrow="Security Alerts" title={dailyCommand.securityOperations.title} status={dailyCommand.securityOperations.status}>
          <MiniList
            items={dailyCommand.securityOperations.findings}
            renderItem={(finding) => (
              <>
                <div>
                  <strong>{finding.title}</strong>
                  <span>{finding.action}</span>
                </div>
                <span className="mission-tag">{finding.severity}</span>
              </>
            )}
          />
        </Panel>
      </section>
      <TasksAndDeployments dashboards={dashboards} scheduledTasks={dailyCommand.scheduledTasks} />
      <KnowledgeAndMemory dashboards={dashboards} />
      <CalendarAndObjectives command={dailyCommand} />
    </main>
  );
}
