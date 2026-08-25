# SecureCheck — CI/CD Security Gate with Analytics Dashboard

A full CI/CD security gate that scans every GitHub PR for vulnerabilities, blocks merges on HIGH severity findings, posts results as PR comments, and visualizes trends in an analytics dashboard.

Built by **Rishabh Tiwari** and **Deeksha Manjunatha Bankapur** for CS6620 Cloud Computing, Summer 2026.

## Problem

- **Insecure code gets merged** — without automated scanning, vulnerable code slips into production. Manual security reviews are slow and often skipped under deadline pressure.
- **No visibility into trends** — teams have no way to know if they're getting better or worse at writing secure code.
- **Developers get no feedback** — security issues are discovered weeks after the code was written, when they're hardest to fix.

## Team

**Rishabh Tiwari** — Infra & API layer
- Terraform modules, VPC, subnets, security groups, route tables
- Lambda function (GitHub webhook receiver)
- API Gateway (public HTTPS endpoint)
- SQS queue with dead-letter queue
- GitHub Actions workflow that triggers scans
- React + Node analytics dashboard reading from DynamoDB

**Deeksha Manjunatha Bankapur** — Compute & scanning layer
- EC2 in private subnet running a Dockerized SAST scanner (Semgrep)
- SQS consumer polling for scan jobs
- DynamoDB writes with scan metadata (vulnerability counts by severity, commit SHA, scan status)
- S3 uploads of full HTML/JSON scan reports
- GitHub PR comment posting after each scan

## Architecture
