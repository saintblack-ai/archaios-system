function formatCurrency(value) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value || 0);
}

export function GrowthKpiCard({ label, value, detail, tone = "neutral" }) {
  return (
    <article className={`book-growth-card book-growth-kpi book-growth-kpi-${tone}`}>
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{detail}</small>
    </article>
  );
}

export function BookCard({ book, clicks }) {
  const salesScore = Math.min(99, Math.round((clicks / 25) + book.campaignPriority * 14));

  return (
    <article className="book-growth-card book-card">
      <div className={`book-cover-slot ${book.coverPlaceholder}`}>
        <span>{book.title.split(" ").slice(0, 3).join(" ")}</span>
      </div>
      <div className="book-card-body">
        <div className="book-growth-card-head">
          <span className="book-growth-eyebrow">{book.status}</span>
          <span className="book-growth-chip">Priority {book.campaignPriority}</span>
        </div>
        <h3>{book.title}</h3>
        <p>{book.description}</p>
        <div className="book-metrics-row">
          <span>Traffic {Math.max(0, clicks * 9)}</span>
          <span>Clicks {clicks}</span>
          <span>Sales score {salesScore}</span>
        </div>
        <dl className="book-detail-grid">
          <div>
            <dt>Audience</dt>
            <dd>{book.audienceSegment}</dd>
          </div>
          <div>
            <dt>Campaign focus</dt>
            <dd>{book.currentCampaignFocus}</dd>
          </div>
          <div>
            <dt>Revenue target</dt>
            <dd>{formatCurrency(book.revenueTargetContribution)}</dd>
          </div>
          <div>
            <dt>Next action</dt>
            <dd>Replace placeholder Apple Books link and publish the top approval-ready CTA.</dd>
          </div>
        </dl>
      </div>
    </article>
  );
}

export function AgentStatusPanel({ agent, onRun, onPause }) {
  const statusClass = agent.status.toLowerCase().replace(/\s+/g, "-");

  return (
    <article className="book-growth-card agent-status-card">
      <div className="book-growth-card-head">
        <span className={`agent-status-pill ${statusClass}`}>{agent.status}</span>
        <span className="book-growth-chip">{agent.taskQueueCount} queued</span>
      </div>
      <h3>{agent.name}</h3>
      <p>{agent.mission}</p>
      <div className="agent-task-box">
        <span>Current task</span>
        <strong>{agent.currentTask}</strong>
      </div>
      <small>Last run: {agent.lastExecutionTime ? new Date(agent.lastExecutionTime).toLocaleString() : "Not yet run"}</small>
      <div className="book-growth-actions compact">
        <button type="button" onClick={() => onRun(agent.id)}>Run</button>
        <button type="button" className="secondary" onClick={() => onPause(agent.id)}>Pause</button>
      </div>
    </article>
  );
}

export function CampaignPipeline({ campaigns }) {
  const stages = ["idea", "in-production", "scheduled", "live", "completed", "best-performers"];

  return (
    <div className="campaign-pipeline-grid">
      {stages.map((stage) => {
        const stageCampaigns = campaigns.filter((campaign) => campaign.stage === stage || (stage === "best-performers" && campaign.score >= 70));
        return (
          <section className="book-growth-card pipeline-column" key={stage}>
            <span className="book-growth-eyebrow">{stage.replace("-", " ")}</span>
            {stageCampaigns.length ? (
              stageCampaigns.map((campaign) => (
                <article className="pipeline-item" key={`${stage}-${campaign.id}`}>
                  <strong>{campaign.name}</strong>
                  <p>{campaign.goal}</p>
                  <small>Score {campaign.score} · {campaign.primaryChannels.join(", ")}</small>
                </article>
              ))
            ) : (
              <p className="muted-copy">No campaigns in this lane.</p>
            )}
          </section>
        );
      })}
    </div>
  );
}

export function ContentLibraryPanel({ contentLibrary }) {
  const groups = [
    ["Social posts", contentLibrary.socialPosts || []],
    ["Email drafts", contentLibrary.emailSequences || []],
    ["Blog/article drafts", contentLibrary.longFormPromos || []],
    ["Teaser copy", contentLibrary.audienceHooks || []],
    ["Quote graphic prompts", contentLibrary.quoteSnippets || []],
    ["Video promo prompts", contentLibrary.videoPromoPrompts || []]
  ];

  return (
    <div className="content-library-grid">
      {groups.map(([label, items]) => (
        <article className="book-growth-card content-library-card" key={label}>
          <div className="book-growth-card-head">
            <span className="book-growth-eyebrow">{label}</span>
            <span className="book-growth-chip">{items.length}</span>
          </div>
          {items.slice(0, 3).map((item) => (
            <p key={item.id || item.name}>{item.copy || item.title || item.name || item.hook || item.text || item.prompt}</p>
          ))}
        </article>
      ))}
    </div>
  );
}

export function ExecutionLog({ runs }) {
  return (
    <div className="book-growth-card execution-log">
      {(runs || []).slice(0, 12).map((run) => (
        <article key={run.id}>
          <span className={`agent-status-pill ${run.status}`}>{run.status}</span>
          <strong>{run.agentName}</strong>
          <p>{run.summary}</p>
          <small>{new Date(run.timestamp).toLocaleString()} · {run.task}</small>
        </article>
      ))}
    </div>
  );
}

export function AnalyticsPanel({ state }) {
  const bookClicks = state.books.map((book) => ({
    title: book.title,
    clicks: (state.contentLibrary.socialPosts || []).filter((post) => post.bookId === book.id).length * 22
  }));
  const trafficSources = ["X", "Instagram", "Threads", "Facebook", "TikTok", "YouTube"].map((source, index) => ({
    source,
    traffic: 320 + index * 80,
    ctr: `${(2.4 + index * 0.4).toFixed(1)}%`
  }));

  return (
    <div className="analytics-grid">
      <article className="book-growth-card">
        <span className="book-growth-eyebrow">Traffic by source</span>
        {trafficSources.map((source) => (
          <div className="metric-bar" key={source.source}>
            <span>{source.source}</span>
            <strong>{source.traffic}</strong>
            <small>{source.ctr}</small>
          </div>
        ))}
      </article>
      <article className="book-growth-card">
        <span className="book-growth-eyebrow">Clicks by book</span>
        {bookClicks.map((book) => (
          <div className="metric-bar" key={book.title}>
            <span>{book.title}</span>
            <strong>{book.clicks}</strong>
          </div>
        ))}
      </article>
      <article className="book-growth-card">
        <span className="book-growth-eyebrow">Campaign leaderboard</span>
        {[...(state.campaignLeaderboard || state.campaigns)].slice(0, 5).map((campaign) => (
          <div className="metric-bar" key={campaign.id}>
            <span>{campaign.name}</span>
            <strong>{campaign.score}</strong>
          </div>
        ))}
      </article>
      <article className="book-growth-card">
        <span className="book-growth-eyebrow">Recommendation feed</span>
        {(state.recommendations || []).slice(0, 6).map((recommendation) => (
          <p key={recommendation}>{recommendation}</p>
        ))}
      </article>
    </div>
  );
}

export function PostQueuePanel({ queue, onApprove, onRetry }) {
  return (
    <div className="post-queue-grid">
      {(queue || []).slice(0, 18).map((item) => (
        <article className="book-growth-card post-queue-card" key={item.id}>
          <div className="book-growth-card-head">
            <span className={`agent-status-pill ${item.status}`}>{item.status}</span>
            <span className="book-growth-chip">{item.platform}</span>
          </div>
          <p>{item.copy}</p>
          <small>Scheduled: {new Date(item.scheduledAt).toLocaleString()}</small>
          <small>Approval: {item.approvalStatus} · Attempts: {item.attempts}/{item.maxAttempts}</small>
          {item.lastError ? <small className="queue-error">{item.lastError}</small> : null}
          <div className="book-growth-actions compact">
            <button type="button" onClick={() => onApprove(item.id)} disabled={item.approvalStatus === "approved"}>
              Approve
            </button>
            <button type="button" className="secondary" onClick={onRetry} disabled={item.status !== "failed"}>
              Retry failed
            </button>
          </div>
        </article>
      ))}
    </div>
  );
}

export function PostingLogPanel({ logs }) {
  return (
    <div className="book-growth-card execution-log">
      {(logs || []).slice(0, 14).map((log) => (
        <article key={log.id || `${log.timestamp}-${log.message}`}>
          <span className={`agent-status-pill ${log.level}`}>{log.level}</span>
          <p>{log.message}</p>
          <small>{log.timestamp ? new Date(log.timestamp).toLocaleString() : "No timestamp"}</small>
        </article>
      ))}
    </div>
  );
}

export function ArchitectModePanel({ architectMode }) {
  const health = architectMode.systemHealth || { status: "unknown", checks: [] };

  return (
    <div className="architect-mode-grid">
      <article className="book-growth-card architect-mode-card-wide">
        <div className="book-growth-card-head">
          <span className="book-growth-eyebrow">Current build phase</span>
          <span className="book-growth-chip">{health.status}</span>
        </div>
        <h3>{architectMode.currentBuildPhase}</h3>
        <p>Layered Autonomous Build Mode is active internally. External integrations, live deployment, paid services, credential changes, and public launch actions remain blocked until explicit approval.</p>
      </article>

      <article className="book-growth-card">
        <span className="book-growth-eyebrow">System health</span>
        {(health.checks || []).map((check) => (
          <div className="metric-bar" key={check.id}>
            <span>{check.label}</span>
            <strong>{check.status}</strong>
            <small>{check.detail}</small>
          </div>
        ))}
      </article>

      <article className="book-growth-card">
        <span className="book-growth-eyebrow">Layers</span>
        {(architectMode.layers || []).map((layer) => (
          <div className="architecture-row" key={layer.id}>
            <strong>{layer.name}</strong>
            <span className={`agent-status-pill ${layer.status}`}>{layer.status}</span>
            <p>{layer.summary}</p>
          </div>
        ))}
      </article>

      <article className="book-growth-card architect-mode-card-wide">
        <span className="book-growth-eyebrow">Agent registry</span>
        <div className="agent-registry-table">
          {(architectMode.agentRegistry || []).map((agent) => (
            <article className="registry-agent-row" key={agent.id}>
              <strong>{agent.name}</strong>
              <span>{agent.parentAgent}</span>
              <p>{agent.purpose}</p>
              <small>Outputs: {(agent.outputs || []).join(", ")}</small>
            </article>
          ))}
        </div>
      </article>

      <article className="book-growth-card">
        <span className="book-growth-eyebrow">Orchestration map</span>
        {(architectMode.dependencyMap || []).map((edge) => (
          <div className="dependency-edge" key={`${edge.from}-${edge.to}-${edge.type}`}>
            <strong>{edge.from}</strong>
            <span>{edge.type}</span>
            <strong>{edge.to}</strong>
          </div>
        ))}
      </article>

      <article className="book-growth-card">
        <span className="book-growth-eyebrow">Permissions map</span>
        {(architectMode.permissionsMap || []).map((permission) => (
          <div className="architecture-row" key={permission.capability}>
            <strong>{permission.capability}</strong>
            <span className={`agent-status-pill ${permission.status}`}>{permission.status}</span>
            <p>{permission.boundary}</p>
          </div>
        ))}
      </article>

      <article className="book-growth-card">
        <span className="book-growth-eyebrow">Roadmap queue</span>
        {(architectMode.roadmapQueue || []).map((item) => (
          <div className="architecture-row" key={item.id}>
            <strong>{item.item}</strong>
            <span>{item.priority} · {item.status}</span>
          </div>
        ))}
      </article>

      <article className="book-growth-card">
        <span className="book-growth-eyebrow">Awaiting authorization</span>
        {(architectMode.awaitingAuthorization || []).map((item) => (
          <div className="architecture-row" key={item.id}>
            <strong>{item.item}</strong>
            <p>{item.reason}</p>
            <small>{item.status}</small>
          </div>
        ))}
      </article>

      <article className="book-growth-card architect-mode-card-wide">
        <span className="book-growth-eyebrow">Build log</span>
        {(architectMode.buildLog || []).slice(0, 8).map((entry) => (
          <div className="architecture-row" key={entry.id}>
            <strong>{entry.layer}</strong>
            <p>{entry.summary}</p>
            <small>{new Date(entry.timestamp).toLocaleString()} · {entry.status}</small>
          </div>
        ))}
      </article>

      <article className="book-growth-card architect-mode-card-wide">
        <span className="book-growth-eyebrow">Safe next steps</span>
        {(architectMode.safeNextSteps || []).map((step) => (
          <p key={step}>{step}</p>
        ))}
      </article>
    </div>
  );
}

export function QualityReviewPanel({ report, approvalPackets }) {
  return (
    <div className="architect-mode-grid">
      <article className="book-growth-card">
        <span className="book-growth-eyebrow">Content QA</span>
        <strong>{report?.averageScore || 0}/100 average</strong>
        <p>{report?.approvalReady || 0} approval-ready · {report?.needsReview || 0} need review</p>
      </article>
      <article className="book-growth-card architect-mode-card-wide">
        <span className="book-growth-eyebrow">Approval packets</span>
        <div className="agent-registry-table">
          {(approvalPackets || []).slice(0, 8).map((packet) => (
            <article className="registry-agent-row" key={packet.id}>
              <strong>{packet.bookTitle}</strong>
              <span>{packet.platform} · {packet.approvalStatus}</span>
              <p>{packet.copy}</p>
              <small>{packet.checklist.join(" · ")}</small>
            </article>
          ))}
        </div>
      </article>
      <article className="book-growth-card architect-mode-card-wide">
        <span className="book-growth-eyebrow">Review flags</span>
        {(report?.scores || [])
          .filter((score) => score.flags.length)
          .slice(0, 8)
          .map((score) => (
            <div className="architecture-row" key={score.contentId}>
              <strong>{score.contentId}</strong>
              <span>{score.platform} · {score.score}/100 · {score.status}</span>
              <p>{score.flags.join(", ")}</p>
            </div>
          ))}
      </article>
    </div>
  );
}
