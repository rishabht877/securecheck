import express from "express";
import cors from "cors";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const __dirname = dirname(fileURLToPath(import.meta.url));

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

const dynamoClient = new DynamoDBClient({ region: "us-east-1" });
const docClient = DynamoDBDocumentClient.from(dynamoClient);
const s3Client = new S3Client({ region: "us-east-1" });

function parseDynamoDBValue(attr) {
  if (attr.S !== undefined) return attr.S;
  if (attr.N !== undefined) return Number(attr.N);
  if (attr.BOOL !== undefined) return attr.BOOL;
  if (attr.NULL) return null;
  if (attr.L) return attr.L.map(parseDynamoDBValue);
  if (attr.M) return parseDynamoDBItem(attr.M);
  return null;
}

function parseDynamoDBItem(item) {
  const result = {};
  for (const [key, attr] of Object.entries(item)) {
    result[key] = parseDynamoDBValue(attr);
  }
  return result;
}

function normalizeExportedScan(raw) {
  const severity = (raw.severity || "").toUpperCase();
  const count = raw.findings_count || 0;
  return {
    scan_id: raw.scan_id || "unknown",
    repo_name: raw.repo || raw.repo_name || "unknown",
    pr_number: raw.pr_number || 0,
    pr_title: raw.pr_title || "",
    commit_sha: raw.commit_sha || "",
    scan_status: raw.scan_status || "completed",
    vulnerability_count: count,
    severity_high: severity === "HIGH" ? count : (raw.severity_high || 0),
    severity_medium: severity === "MEDIUM" ? count : (raw.severity_medium || 0),
    severity_low: severity === "LOW" ? count : (raw.severity_low || 0),
    scan_results: raw.scan_results || "",
    timestamp: raw.timestamp || new Date().toISOString(),
  };
}

function loadExportedScans() {
  const filePath = join(__dirname, "data", "securecheck-scans-export.json");
  const data = JSON.parse(readFileSync(filePath, "utf-8"));
  const items = data.Items || [];
  return items.map((item) => normalizeExportedScan(parseDynamoDBItem(item)));
}

const MOCK_SCANS = [
  {
    scan_id: "mock-001",
    repo_name: "securecheck/web-app",
    pr_number: 42,
    pr_title: "Add user authentication flow",
    commit_sha: "a1b2c3d4e5f6",
    scan_status: "completed",
    vulnerability_count: 5,
    severity_high: 2,
    severity_medium: 2,
    severity_low: 1,
    scan_results: "s3://securecheck-reports-295836073850/scan-results/mock-001.json",
    timestamp: "2026-06-15T14:30:00Z",
  },
  {
    scan_id: "mock-002",
    repo_name: "securecheck/api-service",
    pr_number: 87,
    pr_title: "Update database connection pooling",
    commit_sha: "f6e5d4c3b2a1",
    scan_status: "completed",
    vulnerability_count: 1,
    severity_high: 0,
    severity_medium: 1,
    severity_low: 0,
    scan_results: "s3://securecheck-reports-295836073850/scan-results/mock-002.json",
    timestamp: "2026-06-15T13:15:00Z",
  },
  {
    scan_id: "mock-003",
    repo_name: "securecheck/web-app",
    pr_number: 43,
    pr_title: "Fix SQL injection in search endpoint",
    commit_sha: "1a2b3c4d5e6f",
    scan_status: "completed",
    vulnerability_count: 8,
    severity_high: 4,
    severity_medium: 3,
    severity_low: 1,
    scan_results: "s3://securecheck-reports-295836073850/scan-results/mock-003.json",
    timestamp: "2026-06-15T11:45:00Z",
  },
  {
    scan_id: "mock-004",
    repo_name: "securecheck/infra-config",
    pr_number: 12,
    pr_title: "Add Terraform modules for staging",
    commit_sha: "6f5e4d3c2b1a",
    scan_status: "completed",
    vulnerability_count: 0,
    severity_high: 0,
    severity_medium: 0,
    severity_low: 0,
    scan_results: "s3://securecheck-reports-295836073850/scan-results/mock-004.json",
    timestamp: "2026-06-15T10:00:00Z",
  },
  {
    scan_id: "mock-005",
    repo_name: "securecheck/api-service",
    pr_number: 88,
    pr_title: "Implement rate limiting middleware",
    commit_sha: "abc123def456",
    scan_status: "completed",
    vulnerability_count: 3,
    severity_high: 1,
    severity_medium: 1,
    severity_low: 1,
    scan_results: "s3://securecheck-reports-295836073850/scan-results/mock-005.json",
    timestamp: "2026-06-14T16:20:00Z",
  },
  {
    scan_id: "mock-006",
    repo_name: "securecheck/web-app",
    pr_number: 39,
    pr_title: "Add XSS sanitization to input fields",
    commit_sha: "def456abc789",
    scan_status: "completed",
    vulnerability_count: 6,
    severity_high: 3,
    severity_medium: 2,
    severity_low: 1,
    scan_results: "s3://securecheck-reports-295836073850/scan-results/mock-006.json",
    timestamp: "2026-06-14T09:10:00Z",
  },
  {
    scan_id: "mock-007",
    repo_name: "securecheck/auth-service",
    pr_number: 5,
    pr_title: "Rotate hardcoded API keys",
    commit_sha: "789abc123def",
    scan_status: "completed",
    vulnerability_count: 4,
    severity_high: 2,
    severity_medium: 1,
    severity_low: 1,
    scan_results: "s3://securecheck-reports-295836073850/scan-results/mock-007.json",
    timestamp: "2026-06-13T15:45:00Z",
  },
  {
    scan_id: "mock-008",
    repo_name: "securecheck/web-app",
    pr_number: 41,
    pr_title: "Upgrade dependencies to fix CVEs",
    commit_sha: "321fed654cba",
    scan_status: "completed",
    vulnerability_count: 2,
    severity_high: 0,
    severity_medium: 2,
    severity_low: 0,
    scan_results: "s3://securecheck-reports-295836073850/scan-results/mock-008.json",
    timestamp: "2026-06-13T11:30:00Z",
  },
];

function parseS3Uri(uri) {
  const match = uri.match(/^s3:\/\/([^/]+)\/(.+)$/);
  if (!match) return null;
  return { bucket: match[1], key: match[2] };
}

app.get("/api/scans", async (req, res) => {
  // Tier 1: Live DynamoDB
  try {
    const command = new ScanCommand({ TableName: "securecheck-scans" });
    const response = await docClient.send(command);
    const scans = response.Items || [];

    if (scans.length > 0) {
      scans.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      return res.json({ scans, dataSource: "live" });
    }
  } catch (error) {
    console.error("DynamoDB error:", error.message);
  }

  // Tier 2: Exported JSON file
  try {
    const exported = loadExportedScans();
    if (exported.length > 0) {
      exported.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      return res.json({ scans: exported, dataSource: "exported" });
    }
  } catch (error) {
    console.error("Export file error:", error.message);
  }

  // Tier 3: Hardcoded mock data
  return res.json({ scans: MOCK_SCANS, dataSource: "mock" });
});

app.get("/api/reports/:scanId", async (req, res) => {
  try {
    const { scanId } = req.params;

    const command = new ScanCommand({ TableName: "securecheck-scans" });
    const response = await docClient.send(command);
    const scan = (response.Items || []).find((s) => s.scan_id === scanId);

    const mockScan = MOCK_SCANS.find((s) => s.scan_id === scanId);
    const target = scan || mockScan;

    if (!target || !target.scan_results) {
      return res.status(404).json({ error: "Report not found" });
    }

    const s3Info = parseS3Uri(target.scan_results);
    if (!s3Info) {
      return res.status(400).json({ error: "Invalid S3 URI" });
    }

    const s3Command = new GetObjectCommand({
      Bucket: s3Info.bucket,
      Key: s3Info.key,
    });
    const url = await getSignedUrl(s3Client, s3Command, { expiresIn: 3600 });
    return res.json({ url });
  } catch (error) {
    console.error("Report error:", error.message);
    return res.status(500).json({ error: "Failed to generate report URL" });
  }
});

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.listen(PORT, () => {
  console.log(`SecureCheck backend running on http://localhost:${PORT}`);
});
