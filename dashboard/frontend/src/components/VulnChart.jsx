import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

const VULN_TYPES = [
  { name: "SQL Injection", count: 12, color: "#EF4444" },
  { name: "XSS", count: 9, color: "#F59E0B" },
  { name: "Hardcoded Secrets", count: 7, color: "#EF4444" },
  { name: "Path Traversal", count: 5, color: "#F59E0B" },
  { name: "Insecure Deserialization", count: 4, color: "#F59E0B" },
  { name: "Open Redirect", count: 3, color: "#22C55E" },
  { name: "SSRF", count: 2, color: "#22C55E" },
];

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "#1A2940",
      border: "1px solid #2A3F5F",
      borderRadius: 6,
      padding: "8px 12px",
      fontSize: 13,
    }}>
      <span style={{ color: "#E8ECF1" }}>{payload[0].payload.name}: </span>
      <span style={{ color: "#E8621A", fontWeight: 600 }}>{payload[0].value}</span>
    </div>
  );
};

export default function VulnChart() {
  return (
    <div className="chart-container">
      <h2>Top Vulnerability Types</h2>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={VULN_TYPES} layout="vertical" margin={{ left: 40, right: 24, top: 8, bottom: 8 }}>
          <XAxis type="number" stroke="#8899AA" fontSize={11} tickLine={false} axisLine={false} />
          <YAxis type="category" dataKey="name" stroke="#8899AA" fontSize={12} tickLine={false} axisLine={false} width={160} />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(232, 98, 26, 0.06)" }} />
          <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={20}>
            {VULN_TYPES.map((entry, i) => (
              <Cell key={i} fill={entry.color} fillOpacity={0.8} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
