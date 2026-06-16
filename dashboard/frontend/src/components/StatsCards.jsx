export default function StatsCards({ stats }) {
  const cards = [
    { label: "Total Scans", value: stats.totalScans, className: "" },
    { label: "Vulnerabilities Found", value: stats.totalVulnerabilities, className: "accent" },
    { label: "High Severity", value: stats.highSeverity, className: "danger" },
    { label: "Scans Blocked", value: stats.blockedScans, className: "danger" },
  ];

  return (
    <div className="stats-grid">
      {cards.map((card) => (
        <div key={card.label} className="stat-card">
          <div className="label">{card.label}</div>
          <div className={`value ${card.className}`}>{card.value}</div>
        </div>
      ))}
    </div>
  );
}
