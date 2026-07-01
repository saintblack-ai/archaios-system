import CommandNav from "../../components/CommandNav";
import dailyCommand from "../../../archaios-core/interfaces/daily-command-center.json";

function statusLabel(status) {
  if (status === "green") return "Stable";
  if (status === "red") return "Critical";
  return "Watch";
}

function StatusChip({ status = "amber" }) {
  return <span className={`daily-status daily-status-${status}`}>{statusLabel(status)}</span>;
}

function MetricCard({ label, value, detail, status = "green" }) {
  return (
    <article className="daily-card daily-metric-card">
      <div className="daily-card-head">
        <p className="eyebrow">{label}</p>
        <StatusChip status={status} />
      </div>
      <strong>{value}</strong>
      <span>{detail}</span>
    </article>
  );
}

function BriefingPanel({ commander }) {
  return (
    <section className="daily-briefing-grid">
      <article className="daily-panel daily-panel-primary">
        <div className="daily-card-head">
          <p className="eyebrow">Morning Briefing</p>
          <StatusChip status={commander.status} />
        </div>
        <h2>{commander.morningBriefing.headline}</h2>
        <p>{commander.morningBriefing.summary}</p>
        <div className="daily-action-list">
          {commander.morningBriefing.actions.map((action) => (
            <div className="daily-action" key={action}>{action}</div>
          ))}
        </div>
      </article>
      <article className="daily-panel">
        <p className="eyebrow">Evening Review</p>
        <h2>Close the loop</h2>
        <p>{commander.eveningReview.summary}</p>
        <div className="daily-prompt-list">
          {commander.eveningReview.prompts.map((prompt) => (
            <span key={prompt}>{prompt}</span>
          ))}
        </div>
      </article>
    </section>
  );
}

function AgentReports({ reports }) {
  return (
    <section className="daily-panel">
      <div className="daily-section-head">
        <div>
          <p className="eyebrow">Commander Orchestration</p>
          <h2>Structured Agent Reports</h2>
        </div>
        <span>{reports.length} reports</span>
      </div>
      <div className="daily-agent-grid">
        {reports.map((report) => (
          <article className="daily-agent-card" key={report.agentKey}>
            <div className="daily-card-head">
              <strong>{report.agentKey}</strong>
              <StatusChip status={report.status} />
            </div>
            <p>{report.summary}</p>
            <div className="daily-mini-list">
              {report.actions.slice(0, 2).map((action) => (
                <span key={action}>{action}</span>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function ExecutiveOfficerPanel({ executiveBrief, monitors }) {
  return (
    <section className="daily-panel">
      <div className="daily-section-head">
        <div>
          <p className="eyebrow">Executive Officer</p>
          <h2>{executiveBrief.title}</h2>
          <p>{executiveBrief.summary}</p>
        </div>
        <StatusChip status={executiveBrief.status} />
      </div>
      <div className="daily-dashboard-grid daily-dashboard-grid-wide">
        {executiveBrief.topPriorities.map((priority) => (
          <article className="daily-agent-card" key={priority.area}>
            <div className="daily-card-head">
              <strong>{priority.order}. {priority.area}</strong>
              <StatusChip status={priority.status} />
            </div>
            <p>{priority.directive}</p>
          </article>
        ))}
      </div>
      <div className="daily-monitor-grid">
        {monitors.map((monitor) => (
          <article className="daily-monitor-card" key={monitor.key}>
            <div className="daily-card-head">
              <strong>{monitor.label}</strong>
              <StatusChip status={monitor.status} />
            </div>
            <p>{monitor.summary}</p>
            <span className="daily-tag">Priority {monitor.priority}</span>
          </article>
        ))}
      </div>
    </section>
  );
}

function ProjectPanels({ dashboards }) {
  return (
    <section className="daily-dashboard-grid">
      <article className="daily-panel">
        <p className="eyebrow">Active Projects</p>
        <h2>Today&apos;s project board</h2>
        <div className="daily-list">
          {dashboards.activeProjects.map((project) => (
            <div className="daily-row" key={project.id}>
              <div>
                <strong>{project.name}</strong>
                <span>{project.nextAction}</span>
              </div>
              <span className="daily-tag">{project.status}</span>
            </div>
          ))}
        </div>
      </article>
      <article className="daily-panel">
        <p className="eyebrow">Revenue Progress</p>
        <h2>${Number(dashboards.revenueProgress.estimatedMonthlyRevenue).toLocaleString()} projected monthly</h2>
        <p>{dashboards.revenueProgress.note}</p>
        <div className="daily-mini-metrics">
          <span>Annual target: ${Number(dashboards.revenueProgress.annualTarget).toLocaleString()}</span>
          <span>Conversion score: {dashboards.revenueProgress.conversionScore}</span>
          <span>Systems: {dashboards.revenueProgress.readinessSystems}</span>
        </div>
      </article>
      <article className="daily-panel">
        <p className="eyebrow">Books</p>
        <h2>Publishing focus</h2>
        <div className="daily-list">
          {dashboards.books.slice(0, 3).map((book) => (
            <div className="daily-row" key={book.id}>
              <div>
                <strong>{book.title}</strong>
                <span>{book.campaignFocus}</span>
              </div>
              <span className="daily-tag">${Number(book.targetContribution).toLocaleString()}</span>
            </div>
          ))}
        </div>
      </article>
      <article className="daily-panel">
        <p className="eyebrow">Music</p>
        <h2>{dashboards.music.status}</h2>
        <p>{dashboards.music.nextAction}</p>
      </article>
    </section>
  );
}

function OperationsPanels({ dashboards, scheduledTasks }) {
  const memory = dashboards.memoryUsage.semanticMemory;
  return (
    <section className="daily-dashboard-grid daily-dashboard-grid-wide">
      <article className="daily-panel">
        <p className="eyebrow">Task Queue</p>
        <h2>Prepared execution</h2>
        <div className="daily-mini-metrics">
          <span>Queued: {dashboards.taskQueue.counts.queue}</span>
          <span>In progress: {dashboards.taskQueue.counts.inProgress}</span>
          <span>Blocked: {dashboards.taskQueue.counts.blocked}</span>
          <span>Completed: {dashboards.taskQueue.counts.completed}</span>
        </div>
      </article>
      <article className="daily-panel">
        <p className="eyebrow">Scheduled Automation</p>
        <h2>Future task prep</h2>
        <div className="daily-list">
          {scheduledTasks.map((task) => (
            <div className="daily-row" key={task.id}>
              <div>
                <strong>{task.action}</strong>
                <span>{task.cadence} {task.localTime ? `at ${task.localTime}` : ""}</span>
              </div>
              <span className="daily-tag">{task.status}</span>
            </div>
          ))}
        </div>
      </article>
      <article className="daily-panel">
        <p className="eyebrow">Memory Usage</p>
        <h2>{memory.provider}</h2>
        <p>{memory.status}. Migration: {memory.migration}</p>
        <div className="daily-mini-metrics">
          <span>{memory.dimensions} dimensions</span>
          <span>{memory.tables.length} tables</span>
          <span>{dashboards.aiConversationHistory.records} conversations</span>
        </div>
      </article>
      <article className="daily-panel">
        <p className="eyebrow">Deployment Status</p>
        <h2>Release gates</h2>
        <p>{dashboards.deploymentStatus.localHealthSummary}</p>
        <div className="daily-mini-list">
          {dashboards.deploymentStatus.github.workflows.map((workflow) => (
            <span key={workflow.path}>{workflow.name}: {workflow.present ? "present" : "missing"}</span>
          ))}
        </div>
      </article>
    </section>
  );
}

function KnowledgePanels({ dashboards }) {
  return (
    <section className="daily-dashboard-grid">
      <article className="daily-panel">
        <p className="eyebrow">Knowledge Growth</p>
        <h2>{Number(dashboards.knowledgeGrowth.totals.records || 0).toLocaleString()} records</h2>
        <div className="daily-mini-list">
          {dashboards.knowledgeGrowth.clusters.slice(0, 6).map((cluster) => (
            <span key={cluster.id || cluster.label}>{cluster.label || cluster.id}: {cluster.count || 0}</span>
          ))}
        </div>
      </article>
      <article className="daily-panel">
        <p className="eyebrow">Research Inbox</p>
        <h2>Next synthesis</h2>
        <p>{dashboards.researchInbox.nextAction}</p>
        <div className="daily-mini-list">
          {dashboards.researchInbox.clusters.slice(0, 4).map((cluster) => (
            <span key={cluster.id || cluster.label}>{cluster.label || cluster.id}</span>
          ))}
        </div>
      </article>
      <article className="daily-panel daily-panel-span">
        <p className="eyebrow">Memory Timeline</p>
        <h2>Recent operating memory</h2>
        <div className="daily-timeline">
          {dashboards.memoryUsage.timeline.map((item) => (
            <div className="daily-timeline-item" key={`${item.timestamp}-${item.title}`}>
              <span>{new Date(item.timestamp).toLocaleString()}</span>
              <strong>{item.title}</strong>
              <p>{item.detail}</p>
            </div>
          ))}
        </div>
      </article>
    </section>
  );
}

export default function DailyCommandCenter() {
  const dashboards = dailyCommand.dashboards;
  const agentHealth = dashboards.agentHealth;

  return (
    <main className="daily-command-shell">
      <CommandNav current="daily" />
      <section className="daily-hero">
        <div>
          <p className="eyebrow">ARCHAIOS Phase II</p>
          <h1>Daily Command Center</h1>
          <p>{dailyCommand.commander.summary}</p>
          <span>Generated {new Date(dailyCommand.generatedAt).toLocaleString()}</span>
        </div>
        <div className="daily-hero-metrics">
          <MetricCard label="Agent Health" value={`${agentHealth.green}/${dailyCommand.agentReports.length}`} detail={`${agentHealth.amber} watch, ${agentHealth.red} critical`} status={dailyCommand.commander.status} />
          <MetricCard label="Knowledge" value={Number(dashboards.knowledgeGrowth.totals.records || 0).toLocaleString()} detail="Indexed records" />
          <MetricCard label="Memory" value={dashboards.memoryUsage.semanticMemory.status} detail="pgvector contract" status="amber" />
          <MetricCard label="Goals" value={String(dashboards.longTermGoals.length)} detail="Long-term goals tracked" />
        </div>
      </section>

      <BriefingPanel commander={dailyCommand.commander} />
      <ExecutiveOfficerPanel executiveBrief={dailyCommand.executiveBrief} monitors={dailyCommand.executiveOfficer.monitors} />
      <ProjectPanels dashboards={dashboards} />
      <OperationsPanels dashboards={dashboards} scheduledTasks={dailyCommand.scheduledTasks} />
      <KnowledgePanels dashboards={dashboards} />
      <AgentReports reports={dailyCommand.agentReports} />
    </main>
  );
}
