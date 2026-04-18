import { useEffect, useMemo, useState } from "react";
import CommandNav from "../../components/CommandNav";
import {
  createInitialBookGrowthState,
  loadBookGrowthState,
  pauseBookGrowthAgent,
  resetWeeklyPlanning,
  runAllBookGrowthAgents,
  runArchitectPass,
  runBookGrowthAgent,
  saveBookGrowthState
} from "../../agents/bookGrowth";
import {
  AgentStatusPanel,
  AnalyticsPanel,
  ArchitectModePanel,
  BookCard,
  CampaignPipeline,
  ContentLibraryPanel,
  ExecutionLog,
  GrowthKpiCard,
  PostingLogPanel,
  PostQueuePanel,
  QualityReviewPanel
} from "../../components/bookGrowth/BookGrowthCards";
import { runScheduledPostingJob } from "../../jobs/postingJobs";
import { approveQueueItem, createPostQueueFromContent, getQueueSummary, retryFailedPosts, schedulePendingPosts } from "../../queues/postQueue";
import { updateSchedulerMode } from "../../scheduler/cronRunner";

function formatCurrency(value) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value || 0);
}

function exportContentPack(state) {
  const payload = JSON.stringify(
    {
      exportedAt: new Date().toISOString(),
      books: state.books,
      campaigns: state.campaigns,
      contentLibrary: state.contentLibrary,
      kpis: state.kpis,
      note: "Approval-ready export. No content has been posted automatically."
    },
    null,
    2
  );
  const blob = new Blob([payload], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "saint-black-book-growth-content-pack.json";
  anchor.click();
  URL.revokeObjectURL(url);
}

function Section({ eyebrow, title, body, children, actions }) {
  return (
    <section className="book-growth-section">
      <div className="book-growth-section-head">
        <div>
          <span className="book-growth-eyebrow">{eyebrow}</span>
          <h2>{title}</h2>
          {body ? <p>{body}</p> : null}
        </div>
        {actions ? <div className="book-growth-actions">{actions}</div> : null}
      </div>
      {children}
    </section>
  );
}

export default function BookGrowthCommand() {
  const [state, setState] = useState(() => loadBookGrowthState());
  const [notice, setNotice] = useState("Book Growth OS loaded in approval-first mode. No external posting is active.");
  const [scheduleTime, setScheduleTime] = useState(() => new Date(Date.now() + 60 * 60 * 1000).toISOString().slice(0, 16));

  useEffect(() => {
    saveBookGrowthState(state);
  }, [state]);

  useEffect(() => {
    const timerId = window.setInterval(() => {
      setState((currentState) => {
        const operatedState = runBookGrowthAgent(currentState, "operations-agent");
        if (!operatedState.postingScheduler?.enabled) {
          return operatedState;
        }

        runScheduledPostingJob(operatedState).then(({ state: jobState, logs }) => {
          setState((latestState) => ({
            ...latestState,
            ...jobState,
            postingLogs: [
              ...logs.map((log) => ({ ...log, id: `posting-log-${Date.now()}-${Math.random()}`, timestamp: new Date().toISOString() })),
              ...(latestState.postingLogs || [])
            ].slice(0, 80)
          }));
        });

        return operatedState;
      });
    }, 5 * 60 * 1000);

    return () => window.clearInterval(timerId);
  }, []);

  const totals = useMemo(() => {
    const activeCampaigns = state.campaigns.filter((campaign) => campaign.status === "active").length;
    const contentCreated = state.kpis.contentCreatedThisWeek || 0;
    const clicks = state.kpis.clicksGenerated || 0;
    const annualProjection = state.kpis.estimatedAnnualRevenue || 0;

    return {
      activeCampaigns,
      contentCreated,
      clicks,
      annualProjection,
      trajectory: `${state.kpis.annualProgressPercent || 0}% toward ${formatCurrency(state.kpis.annualRevenueTarget)}`
    };
  }, [state]);

  const queueSummary = useMemo(() => getQueueSummary(state.postQueue), [state.postQueue]);

  function handleRunAgent(agentId) {
    setState((currentState) => runBookGrowthAgent(currentState, agentId));
    setNotice(`Ran ${state.agents.find((agent) => agent.id === agentId)?.name || agentId}. Output saved to local dashboard state.`);
  }

  function handleRunAll() {
    setState((currentState) => runAllBookGrowthAgents(currentState));
    setNotice("Ran all Book Growth agents. Queues, projections, recommendations, and logs were refreshed.");
  }

  function handlePauseAgent(agentId) {
    setState((currentState) => pauseBookGrowthAgent(currentState, agentId));
    setNotice("Agent paused locally. No external scheduling or posting was affected.");
  }

  function handleReset() {
    setState((currentState) => resetWeeklyPlanning(currentState));
    setNotice("Weekly planning mode completed. Strategy Commander refreshed campaign focus.");
  }

  function handleRegenerateCampaign() {
    setState((currentState) => {
      const contentState = runBookGrowthAgent(runBookGrowthAgent(currentState, "content-creator-agent"), "social-distribution-agent");
      return {
        ...contentState,
        postQueue: createPostQueueFromContent(contentState.contentLibrary, { maxItems: 18 }),
        postingLogs: [
          {
            id: `posting-log-${Date.now()}`,
            level: "info",
            timestamp: new Date().toISOString(),
            message: "Post queue rebuilt from the latest Content Creator output."
          },
          ...(contentState.postingLogs || [])
        ].slice(0, 80)
      };
    });
    setNotice("Campaign content regenerated and distribution queue rebuilt for approval.");
  }

  function handleResetDemo() {
    const nextState = createInitialBookGrowthState();
    setState(nextState);
    setNotice("Local Book Growth OS state reset to seeded baseline.");
  }

  function handleArchitectPass() {
    setState((currentState) => runArchitectPass(currentState));
    setNotice("Architect Mode pass completed. Registry, permission boundaries, roadmap, dependency map, and health checks refreshed.");
  }

  function appendPostingLog(nextState, level, message) {
    return {
      ...nextState,
      postingLogs: [
        { id: `posting-log-${Date.now()}-${Math.random()}`, level, timestamp: new Date().toISOString(), message },
        ...(nextState.postingLogs || [])
      ].slice(0, 80)
    };
  }

  function handleModeChange(mode) {
    setState((currentState) => {
      const postingScheduler = updateSchedulerMode(currentState.postingScheduler, mode);
      return appendPostingLog(
        {
          ...currentState,
          postingScheduler,
          automationSettings: {
            ...currentState.automationSettings,
            mode,
            autoPosting: postingScheduler.autoPostEnabled
          }
        },
        "info",
        `Posting mode changed to ${mode}. ${mode === "auto-post" ? "Auto-post remains mock-only until real credentials are enabled." : "Approval-first safety preserved."}`
      );
    });
    setNotice(`Posting mode set to ${mode}.`);
  }

  function handleSchedulerField(field, value) {
    setState((currentState) => ({
      ...currentState,
      postingScheduler: {
        ...currentState.postingScheduler,
        [field]: field === "maxPostsPerDay" || field === "minMinutesBetweenPosts" ? Number(value) : value
      }
    }));
  }

  function handleScheduleQueue() {
    setState((currentState) =>
      appendPostingLog(
        {
          ...currentState,
          postQueue: schedulePendingPosts(currentState.postQueue || [], scheduleTime),
          postingScheduler: {
            ...currentState.postingScheduler,
            enabled: true,
            mode: currentState.postingScheduler.mode === "manual" ? "scheduled" : currentState.postingScheduler.mode
          }
        },
        "success",
        `Pending posts scheduled starting ${new Date(scheduleTime).toLocaleString()}.`
      )
    );
    setNotice("Pending posts scheduled. Manual approval is still required unless auto-post mode is explicitly enabled.");
  }

  function handleApprovePost(itemId) {
    setState((currentState) =>
      appendPostingLog(
        {
          ...currentState,
          postQueue: approveQueueItem(currentState.postQueue || [], itemId)
        },
        "success",
        `Approved ${itemId} for scheduled/mock posting.`
      )
    );
  }

  function handleRetryFailed() {
    setState((currentState) =>
      appendPostingLog(
        {
          ...currentState,
          postQueue: retryFailedPosts(currentState.postQueue || [])
        },
        "info",
        "Failed posts moved back to scheduled status if retry attempts remain."
      )
    );
  }

  async function handleRunPostingTick() {
    const { state: nextState, logs } = await runScheduledPostingJob(state);
    setState(
      appendPostingLog(
        {
          ...state,
          ...nextState
        },
        logs.some((log) => log.level === "error") ? "error" : "success",
        logs.map((log) => log.message).join(" ")
      )
    );
    setNotice("Posting scheduler tick completed. Check posting logs for mock/API result.");
  }

  const clicksByBook = useMemo(() => {
    return Object.fromEntries(
      state.books.map((book) => [
        book.id,
        (state.contentLibrary.socialPosts || []).filter((post) => post.bookId === book.id).length * 22
      ])
    );
  }, [state.books, state.contentLibrary.socialPosts]);

  return (
    <main className="book-growth-shell">
      <CommandNav current="book-growth" />
      <section className="book-growth-hero">
        <div className="book-growth-hero-copy">
          <span className="book-growth-eyebrow">ARCHAIOS Command · Saint Black</span>
          <h1>SAINT BLACK BOOK GROWTH COMMAND</h1>
          <p>
            A compliant organic promotion engine for Apple Books visibility, content velocity, campaign intelligence,
            funnel discipline, and revenue trajectory planning.
          </p>
          <div className="book-growth-actions">
            <button type="button" onClick={handleRunAll}>Run all agents</button>
            <button type="button" className="secondary" onClick={handleRegenerateCampaign}>Regenerate campaign</button>
            <button type="button" className="secondary" onClick={() => exportContentPack(state)}>Export content pack</button>
            <a className="book-growth-link-button" href={`${import.meta.env.BASE_URL || "/"}dashboard`}>Main dashboard</a>
          </div>
          <p className="book-growth-notice">{notice}</p>
        </div>
        <div className="book-growth-command-panel">
          <GrowthKpiCard label="Campaigns active" value={totals.activeCampaigns} detail="Organic and approval-first" tone="gold" />
          <GrowthKpiCard label="Content created this week" value={totals.contentCreated} detail="Posts, promos, emails, snippets" />
          <GrowthKpiCard label="Clicks generated" value={totals.clicks} detail="Projection proxy until tracking is live" />
          <GrowthKpiCard label="Queue scheduled" value={queueSummary.scheduled} detail={`${queueSummary.needsApproval} need approval`} />
          <GrowthKpiCard label="Conversion score" value={state.kpis.conversionScore} detail={state.kpis.projectionNote} tone="blue" />
          <GrowthKpiCard label="Revenue trajectory" value={formatCurrency(totals.annualProjection)} detail={totals.trajectory} tone="gold" />
        </div>
      </section>

      <Section
        eyebrow="Scheduler System"
        title="Social posting control layer"
        body="Manual mode is the default. Scheduled and auto-post modes are optional. Real social APIs are prepared as connector placeholders and run in mock mode until server-side credentials are connected."
        actions={
          <>
            <button type="button" onClick={handleRunPostingTick}>Run scheduler tick</button>
            <button type="button" className="secondary" onClick={handleScheduleQueue}>Schedule queue</button>
          </>
        }
      >
        <div className="scheduler-control-grid">
          <article className="book-growth-card scheduler-mode-card">
            <span className="book-growth-eyebrow">Posting mode</span>
            <strong>{state.postingScheduler.mode}</strong>
            <div className="mode-toggle-row">
              <button type="button" className={state.postingScheduler.mode === "manual" ? "" : "secondary"} onClick={() => handleModeChange("manual")}>Manual Mode</button>
              <button type="button" className={state.postingScheduler.mode === "scheduled" ? "" : "secondary"} onClick={() => handleModeChange("scheduled")}>Schedule Mode</button>
              <button type="button" className={state.postingScheduler.mode === "auto-post" ? "" : "secondary"} onClick={() => handleModeChange("auto-post")}>Auto Post: {state.postingScheduler.autoPostEnabled ? "ON" : "OFF"}</button>
            </div>
            <p>{state.postingScheduler.manualApprovalRequired ? "Manual approval is required before a queued post can be processed." : "Auto-post mode can process due scheduled posts, but remains mock-only until credentials exist."}</p>
          </article>
          <article className="book-growth-card scheduler-form-card">
            <label>
              Schedule picker
              <input type="datetime-local" value={scheduleTime} onChange={(event) => setScheduleTime(event.target.value)} />
            </label>
            <label>
              Cron expression
              <input value={state.postingScheduler.cronExpression} onChange={(event) => handleSchedulerField("cronExpression", event.target.value)} />
            </label>
            <label>
              Max posts per day
              <input type="number" min="1" max="10" value={state.postingScheduler.maxPostsPerDay} onChange={(event) => handleSchedulerField("maxPostsPerDay", event.target.value)} />
            </label>
            <label>
              Minimum minutes between posts
              <input type="number" min="15" max="1440" value={state.postingScheduler.minMinutesBetweenPosts} onChange={(event) => handleSchedulerField("minMinutesBetweenPosts", event.target.value)} />
            </label>
          </article>
          <article className="book-growth-card">
            <span className="book-growth-eyebrow">Queue summary</span>
            <div className="metric-bar"><span>Pending</span><strong>{queueSummary.pending}</strong></div>
            <div className="metric-bar"><span>Scheduled</span><strong>{queueSummary.scheduled}</strong></div>
            <div className="metric-bar"><span>Posted</span><strong>{queueSummary.posted}</strong></div>
            <div className="metric-bar"><span>Failed</span><strong>{queueSummary.failed}</strong></div>
          </article>
          <article className="book-growth-card">
            <span className="book-growth-eyebrow">Social connectors</span>
            {(state.socialConnectors || []).map((connector) => (
              <div className="metric-bar" key={connector.platform}>
                <span>{connector.platform}</span>
                <strong>{connector.connected ? "API ready" : "Mock"}</strong>
                <small>{connector.mode}</small>
              </div>
            ))}
          </article>
        </div>
      </Section>

      <Section eyebrow="Post Queue Engine" title="Pending, scheduled, posted, and failed posts" body="Approval-first fallback remains available in every mode. Failed posts can be retried without duplicating already posted queue items.">
        <PostQueuePanel queue={state.postQueue || []} onApprove={handleApprovePost} onRetry={handleRetryFailed} />
      </Section>

      <Section eyebrow="Quality Gate" title="Content QA and manual approval packets" body="Internal reviewer layer checks generated content before scheduling and prepares approval packets for manual publishing workflows.">
        <QualityReviewPanel report={state.contentQualityReport} approvalPackets={state.approvalPackets} />
      </Section>

      <Section
        eyebrow="Overview"
        title="Apple Books growth operating picture"
        body="The system is seeded with three Saint Black titles, compliant content queues, and a KPI model that estimates progress toward $100,000/year without claiming guaranteed sales."
      >
        <div className="book-card-grid">
          {state.books.map((book) => (
            <BookCard book={book} clicks={clicksByBook[book.id] || 0} key={book.id} />
          ))}
        </div>
      </Section>

      <Section
        eyebrow="ARCHITECT MODE"
        title="Layered autonomous build control"
        body="Internal orchestration layer for agent registry, support agents, permissions, dependencies, build logs, roadmaps, blocked authorization items, and safe next steps."
        actions={<button type="button" onClick={handleArchitectPass}>Run Architect Pass</button>}
      >
        <ArchitectModePanel architectMode={state.architectMode} />
      </Section>

      <Section
        eyebrow="Agents"
        title="Autonomous growth agent board"
        body="Agents run locally in browser-safe approval-first mode. They generate plans, queues, recommendations, and logs but do not post externally."
      >
        <div className="agent-status-grid">
          {state.agents.map((agent) => (
            <AgentStatusPanel agent={agent} onRun={handleRunAgent} onPause={handlePauseAgent} key={agent.id} />
          ))}
        </div>
      </Section>

      <Section eyebrow="Campaigns" title="Campaign pipeline" body="Each lane shows the current campaign stage plus best performers by score.">
        <CampaignPipeline campaigns={state.campaigns} />
      </Section>

      <Section
        eyebrow="Content Pipeline"
        title="Approval-ready content library"
        body="Initial 30-day engine includes 10 short posts per book, 5 long-form promos per book, 10 quote snippets per book, 5 audience hooks per book, 3 email sequences, 3 landing page variants, and 3 bundle ideas."
      >
        <ContentLibraryPanel contentLibrary={state.contentLibrary} />
      </Section>

      <Section eyebrow="Traffic Sources" title="Organic channel plan" body="Automation prepares queues only. Publishing integrations can be added later with explicit credentials and rate limits.">
        <div className="traffic-source-grid">
          {["X", "Instagram", "Threads", "Facebook", "TikTok", "YouTube", "Blog", "Email"].map((source, index) => (
            <article className="book-growth-card" key={source}>
              <span className="book-growth-eyebrow">{source}</span>
              <strong>{index < 6 ? "Short-form CTA tests" : "Long-form nurture"}</strong>
              <p>{index < 6 ? "Route strongest hook to one Apple Books or landing-page CTA." : "Build deeper reader intent before Apple Books CTA."}</p>
            </article>
          ))}
        </div>
      </Section>

      <Section eyebrow="Sales Funnel" title="Landing page and funnel map" body="Placeholder cover slots and Apple Books URLs are clearly marked until live assets are connected.">
        <div className="book-growth-card funnel-map">
          {(state.funnelMap || state.books.map((book) => ({ bookId: book.id, landingSlug: `/books/${book.id}`, primaryCta: `Read ${book.title} on Apple Books` }))).map((funnel) => (
            <article key={funnel.bookId}>
              <strong>{funnel.landingSlug}</strong>
              <p>{funnel.primaryCta}</p>
              <small>{(funnel.requiredSections || ["cover", "summary", "CTA", "author"]).join(" · ")}</small>
            </article>
          ))}
        </div>
      </Section>

      <Section eyebrow="Book Performance" title="KPI scoreboard and analytics" body="Metrics are local projections until real tracking, Apple Books links, and analytics integrations are connected.">
        <AnalyticsPanel state={state} />
      </Section>

      <Section eyebrow="Tasks / Execution Log" title="Agent run history" body="Every local agent action writes a visible log entry in this dashboard state.">
        <ExecutionLog runs={state.agentRuns} />
      </Section>

      <Section eyebrow="Posting Execution Logs" title="Scheduler and connector logs" body="Mock posting logs appear here until X, Facebook, or Instagram credentials are connected in a server-side environment.">
        <PostingLogPanel logs={state.postingLogs || []} />
      </Section>

      <Section eyebrow="Recommendations" title="Next best actions" body="Prioritized actions from Strategy, Analytics, SEO, and Sales Optimization agents.">
        <div className="recommendation-feed">
          {(state.recommendations || []).slice(0, 10).map((recommendation) => (
            <article className="book-growth-card" key={recommendation}>
              <p>{recommendation}</p>
            </article>
          ))}
        </div>
      </Section>

      <Section
        eyebrow="Automation Settings"
        title="Approval-first operating mode"
        body="Schedules are ready for local/dev execution and future production deployment. Posting, paid ads, and real analytics remain disabled until credentials and policy-safe integrations are added."
        actions={
          <>
            <button type="button" onClick={handleReset}>Weekly reset / planning mode</button>
            <button type="button" className="secondary" onClick={handleResetDemo}>Reset local demo state</button>
          </>
        }
      >
        <div className="automation-grid">
          <article className="book-growth-card">
            <span className="book-growth-eyebrow">Mode</span>
            <strong>{state.automationSettings.mode}</strong>
            <p>{state.automationSettings.compliance}</p>
          </article>
          {state.schedules.map((schedule) => (
            <article className="book-growth-card" key={`${schedule.cadence}-${schedule.task}`}>
              <span className="book-growth-eyebrow">{schedule.cadence}</span>
              <strong>{schedule.task}</strong>
              <p>{schedule.agentIds.join(", ")}</p>
            </article>
          ))}
        </div>
      </Section>
    </main>
  );
}
