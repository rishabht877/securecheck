# SecureCheck Dashboard

A real-time analytics dashboard that visualizes security scan results from the SecureCheck CI/CD pipeline. Built as part of a Cloud Computing class project at Northeastern University.

## What it does

SecureCheck automatically scans every GitHub pull request for security vulnerabilities. This dashboard reads scan results from DynamoDB and displays:

- Total scans and vulnerability counts
- Severity breakdown across all scans
- Number of PRs blocked by HIGH severity findings
- Recent scan history with per-PR details
- Top vulnerability types across the codebase
- Direct links to full reports stored in S3

## Architecture

The dashboard is the read side of a larger system:

1. Developer opens a PR on GitHub
2. GitHub Actions sends a scan request to SQS
3. EC2 instance polls SQS, runs the Semgrep SAST scanner on the code
4. Scanner writes results to DynamoDB and uploads the full report to S3
5. **This dashboard reads from DynamoDB and displays the results**

## Tech stack

- **Frontend** — React (Vite), modern dark theme, responsive design
- **Backend** — Node.js + Express
- **AWS SDK** — DynamoDB and S3 clients
- **Data source** — DynamoDB (cross-account read access)

## Data modes

The dashboard supports three data modes with automatic fallback. A clear badge at the top indicates which mode is currently active:

### 1. LIVE DATA (green badge with pulsing indicator)
The dashboard queries DynamoDB directly. This is the default mode when proper IAM permissions are configured. In a production environment this works out of the box.

### 2. EXPORTED DATA (blue badge)
The dashboard loads from a JSON file containing a previous DynamoDB export. This is the current mode in AWS Academy Learner Lab environments where cross-account IAM role creation is restricted. The data shown is still real scan output, just static rather than live.

### 3. DEMO DATA (orange badge)
The dashboard falls back to hardcoded mock data if neither live query nor exported file is available. Ensures the UI never looks broken during development or demos.

This multi-tier fallback was designed to handle AWS Academy limitations gracefully while preserving the production-ready architecture.

## Running locally

### Prerequisites
- Node.js 18 or higher
- AWS credentials configured in `~/.aws/credentials` (for LIVE mode)

### Backend
```bash
cd backend
npm install
npm run dev
```
Runs on `http://localhost:3001`

### Frontend
```bash
cd frontend
npm install
npm run dev
```
Runs on `http://localhost:5173`

The frontend auto-refreshes every 30 seconds and includes a manual refresh button.

## Project structure
```
dashboard/
├── backend/
│   ├── server.js                          # Express server with 3-tier data fallback
│   ├── data/
│   │   └── securecheck-scans-export.json  # Exported DynamoDB scan data
│   └── package.json
├── frontend/
│   ├── index.html
│   ├── vite.config.js
│   ├── src/
│   │   ├── main.jsx
│   │   ├── App.jsx                        # Main dashboard layout
│   │   ├── App.css                        # Dark theme styles
│   │   └── components/
│   │       ├── StatsCards.jsx             # Top-level KPI cards
│   │       ├── ScansTable.jsx             # Recent scans table
│   │       └── VulnChart.jsx             # Vulnerability type bar chart
│   └── package.json
└── README.md
```

## API endpoints

### `GET /api/scans`
Returns all scan results with metadata.

Response:
```json
{
  "dataSource": "live | exported | mock",
  "scans": [
    {
      "scan_id": "uuid",
      "repo_name": "owner/repo",
      "pr_number": 42,
      "pr_title": "Add new feature",
      "scan_status": "completed",
      "vulnerability_count": 3,
      "severity_high": 1,
      "severity_medium": 2,
      "severity_low": 0,
      "scan_results": "s3://bucket/path.json",
      "timestamp": "2026-06-16T10:00:00Z"
    }
  ]
}
```

### `GET /api/reports/:scanId`
Returns a presigned S3 URL for the full scan report.

### `GET /health`
Health check endpoint.

## DynamoDB schema

Table name: `securecheck-scans`
- **Partition key:** `scan_id` (String)

Each item represents one PR scan with severity counts, status, and an S3 pointer to the full report.

## Known limitations

- **AWS Academy cross-account access** — Lab environments restrict IAM role creation, which prevents direct DynamoDB access across accounts. The exported JSON workaround preserves the architecture while sidestepping this restriction.
- **AWS credentials expiration** — Lab session credentials expire after 4 hours. Refresh credentials in `~/.aws/credentials` to switch back to LIVE mode.

## Team

- **Rishabh Tiwari** — Infrastructure layer, API layer, dashboard
- **Deeksha Manjunatha Bankapur** — Compute layer, SAST scanner, DynamoDB writes

Group 13, CS6620 Cloud Computing, Spring 2026
