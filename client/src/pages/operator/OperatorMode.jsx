import operatorSeed from "../../../data/operator/system-health.json";
import CommandNav from "../../components/CommandNav";
import { OperatorListCard, OperatorMetric } from "../../components/operator/OperatorCards";

function formatCurrency(value) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value || 0);
}

export default function OperatorMode() {
  const metrics = operatorSeed.subscriptionMetrics;

  return (
    <main className="operator-shell">
      <CommandNav current="operator" />
      <section className="operator-hero">
        <div>
          <span className="operator-eyebrow">ARCHAIOS Infrastructure</span>
          <h1>Operator Mode</h1>
          <p>{operatorSeed.summary}</p>
          <p>
            Operator Mode is an internal readiness surface. Customer conversion and account upgrades happen on Pricing and Dashboard routes.
          </p>
          <div className="operator-actions">
            <a href={`${import.meta.env.BASE_URL || "/"}landing`}>Landing</a>
            <a href={`${import.meta.env.BASE_URL || "/"}pricing`}>Pricing</a>
            <a href={`${import.meta.env.BASE_URL || "/"}dashboard`}>Customer Dashboard</a>
            <a href={`${import.meta.env.BASE_URL || "/"}dashboard?mock=1`}>Mock Dashboard</a>
            <a href={`${import.meta.env.BASE_URL || "/"}book-growth`}>Book Growth Command</a>
          </div>
        </div>
        <div className="operator-metric-grid">
          <OperatorMetric label="MRR" value={formatCurrency(metrics.mrr)} detail={metrics.source} tone="gold" />
          <OperatorMetric label="Pro" value={metrics.proSubscriptions} detail="Active Pro subscriptions" />
          <OperatorMetric label="Elite" value={metrics.eliteSubscriptions} detail="Active Elite subscriptions" />
          <OperatorMetric label="Churn Signals" value={metrics.churnSignals} detail="Requires live Stripe/Supabase data" />
        </div>
      </section>

      <section className="operator-grid">
        <OperatorListCard
          eyebrow="Repos"
          title="Repository Health"
          items={operatorSeed.repos}
          renderItem={(repo) => (
            <>
              <strong>{repo.name}</strong>
              <span>{repo.health}</span>
              <p>{repo.role}</p>
              <small>{repo.risk}</small>
            </>
          )}
        />

        <OperatorListCard
          eyebrow="Deploys"
          title="Deployment Health"
          items={operatorSeed.deployHealth}
          renderItem={(deploy) => (
            <>
              <strong>{deploy.surface}</strong>
              <span>{deploy.status}</span>
              <p>{deploy.target}</p>
              <small>{deploy.next}</small>
            </>
          )}
        />

        <OperatorListCard
          eyebrow="Content"
          title="Pipeline Status"
          items={operatorSeed.contentPipeline}
          renderItem={(stage) => (
            <>
              <strong>{stage.stage}</strong>
              <span>{stage.status}</span>
              <p>{stage.detail}</p>
            </>
          )}
        />

        <OperatorListCard
          eyebrow="Tasks"
          title="Pending Tasks"
          items={operatorSeed.pendingTasks.map((item) => ({ item }))}
          renderItem={(task) => <p>{task.item}</p>}
        />

        <OperatorListCard
          eyebrow="Roadmap"
          title="Roadmap Board"
          items={operatorSeed.roadmap}
          renderItem={(roadmap) => (
            <>
              <strong>{roadmap.phase}</strong>
              <span>{roadmap.status}</span>
              <p>{roadmap.item}</p>
            </>
          )}
        />

        <OperatorListCard
          eyebrow="Blocked"
          title="Awaiting Authorization"
          items={operatorSeed.blockedItems}
          renderItem={(blocked) => (
            <>
              <strong>{blocked.item}</strong>
              <p>{blocked.reason}</p>
            </>
          )}
        />

        <OperatorListCard
          eyebrow="Export"
          title="Export Intake Readiness"
          items={operatorSeed.exportReadiness}
          renderItem={(item) => (
            <>
              <strong>{item.name}</strong>
              <span>{item.status}</span>
              <p>{item.detail}</p>
            </>
          )}
        />

        <OperatorListCard
          eyebrow="Mock"
          title="Mock Data Mode"
          items={operatorSeed.mockMode}
          renderItem={(item) => (
            <>
              <strong>{item.name}</strong>
              <span>{item.status}</span>
              <p>{item.detail}</p>
            </>
          )}
        />
      </section>

      <section className="operator-card operator-card-wide">
        <span className="operator-eyebrow">Daily System Summary</span>
        <h2>Ready for staging preparation, blocked before live integrations.</h2>
        <p>
          The current safe next step is backend alignment and test-mode Stripe validation. Live credentials, public deployment,
          email delivery, and real external automation require explicit approval.
        </p>
        <p>
          Access boundary: Guest and signed-in customer state messaging is surfaced in Dashboard/Pricing; Operator remains infrastructure-only.
        </p>
        <div className="operator-list">
          {operatorSeed.recentErrors.map((error) => (
            <div className="operator-row" key={error}>
              <p>{error}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
