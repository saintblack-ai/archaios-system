export function OperatorMetric({ label, value, detail, tone = "neutral" }) {
  return (
    <article className={`operator-card operator-metric operator-metric-${tone}`}>
      <span>{label}</span>
      <strong>{value}</strong>
      <p>{detail}</p>
    </article>
  );
}

export function OperatorListCard({ title, eyebrow, items, renderItem }) {
  return (
    <article className="operator-card">
      <span className="operator-eyebrow">{eyebrow}</span>
      <h3>{title}</h3>
      <div className="operator-list">
        {items.map((item) => (
          <div className="operator-row" key={item.name || item.item || item.surface || item.stage || item.phase}>
            {renderItem(item)}
          </div>
        ))}
      </div>
    </article>
  );
}

