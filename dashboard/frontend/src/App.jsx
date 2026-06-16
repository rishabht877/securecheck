import { useState, useEffect, useCallback } from "react";
import StatsCards from "./components/StatsCards.jsx";
import ScansTable from "./components/ScansTable.jsx";
import VulnChart from "./components/VulnChart.jsx";

const REFRESH_INTERVAL = 30000;

const DATA_SOURCE_CONFIG = {
  live: { label: "Live Data", className: "badge-live" },
  exported: { label: "Exported Data", className: "badge-exported" },
  mock: { label: "Demo Data", className: "badge-mock" },
};

export default function App() {
  const [scans, setScans] = useState([]);
  const [dataSource, setDataSource] = useState("mock");
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchScans = useCallback(async () => {
    try {
      const res = await fetch("/api/scans");
      const data = await res.json();
      setScans(data.scans);
      setDataSource(data.dataSource || "mock");
      setLastUpdated(new Date());
    } catch {
      console.error("Failed to fetch scans");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchScans();
    const interval = setInterval(fetchScans, REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchScans]);

  const stats = {
    totalScans: scans.length,
    totalVulnerabilities: scans.reduce((sum, s) => sum + (s.vulnerability_count || 0), 0),
    highSeverity: scans.reduce((sum, s) => sum + (s.severity_high || 0), 0),
    blockedScans: scans.filter((s) => (s.severity_high || 0) > 0).length,
  };

  return (
    <div className="app">
      <header className="header">
        <div className="header-left">
          <div className="logo">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#E8621A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <path d="M9 12l2 2 4-4" />
            </svg>
            <h1>SecureCheck</h1>
          </div>
          <span className={`data-badge ${DATA_SOURCE_CONFIG[dataSource].className}`}>
            <span className="data-badge-dot" />
            {DATA_SOURCE_CONFIG[dataSource].label}
          </span>
        </div>
        <div className="header-right">
          {lastUpdated && (
            <span className="last-updated">
              Updated {lastUpdated.toLocaleTimeString()}
            </span>
          )}
          <button className="refresh-btn" onClick={fetchScans}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="23 4 23 10 17 10" />
              <polyline points="1 20 1 14 7 14" />
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
            </svg>
            Refresh
          </button>
        </div>
      </header>

      {loading ? (
        <div className="loading">
          <div className="spinner" />
          <p>Loading scan data...</p>
        </div>
      ) : (
        <main className="main">
          <StatsCards stats={stats} />
          <ScansTable scans={scans} />
          <VulnChart />
        </main>
      )}
    </div>
  );
}
