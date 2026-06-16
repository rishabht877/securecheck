export default function ScansTable({ scans }) {
  function formatTime(ts) {
    const d = new Date(ts);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  async function openReport(scanId) {
    try {
      const res = await fetch(`/api/reports/${scanId}`);
      const data = await res.json();
      if (data.url) {
        window.open(data.url, "_blank");
      }
    } catch {
      console.error("Failed to get report URL");
    }
  }

  if (scans.length === 0) {
    return (
      <div className="table-container">
        <div className="table-header">
          <h2>Recent Scans</h2>
        </div>
        <div className="empty-state">No scans found</div>
      </div>
    );
  }

  return (
    <div className="table-container">
      <div className="table-header">
        <h2>Recent Scans</h2>
        <span className="count">{scans.length} scans</span>
      </div>
      <table className="scans-table">
        <thead>
          <tr>
            <th>Repository</th>
            <th>Pull Request</th>
            <th>Severity</th>
            <th>Status</th>
            <th>Time</th>
            <th>Report</th>
          </tr>
        </thead>
        <tbody>
          {scans.map((scan) => (
            <tr key={scan.scan_id}>
              <td>
                <span className="repo-name">{scan.repo_name}</span>
              </td>
              <td>
                <div className="pr-info">
                  <span className="pr-number">#{scan.pr_number}</span>
                  <span className="pr-title">{scan.pr_title}</span>
                </div>
              </td>
              <td>
                <div className="severity-badges">
                  {(scan.severity_high || 0) > 0 && (
                    <span className="badge high">{scan.severity_high} High</span>
                  )}
                  {(scan.severity_medium || 0) > 0 && (
                    <span className="badge medium">{scan.severity_medium} Med</span>
                  )}
                  {(scan.severity_low || 0) > 0 && (
                    <span className="badge low">{scan.severity_low} Low</span>
                  )}
                  {scan.vulnerability_count === 0 && (
                    <span className="badge low">Clean</span>
                  )}
                </div>
              </td>
              <td>
                <div className="status-badge">
                  <span className={`status-dot ${scan.scan_status}`} />
                  {scan.scan_status}
                </div>
              </td>
              <td>
                <span className="timestamp">{formatTime(scan.timestamp)}</span>
              </td>
              <td>
                <a
                  className="report-link"
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    openReport(scan.scan_id);
                  }}
                >
                  View Report →
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
