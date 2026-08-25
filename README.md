All infrastructure provisioned via Terraform — VPC, subnets, security groups, Lambda, SQS, IAM, ASG (17 resources total).

## Key Results

- 100% PR webhook success rate
- ≤15s latency from GitHub Actions to SQS
- 6 scans completed end to end
- EC2 isolated in a private subnet with no public IP; Lambda + API Gateway is the only public entry point
- Auto Scaling Group with CloudWatch CPU alarms restarts EC2 automatically on failure

## DynamoDB Schema

Table: `securecheck-scans` | Partition key: `scan_id` (String)

| Attribute | Type | Description |
|---|---|---|
| scan_id | String | UUID v4, unique per scan |
| repo_name | String | owner/repository format |
| pr_number | Number | GitHub PR number |
| pr_title | String | PR title at scan time |
| commit_sha | String | Git commit SHA scanned |
| scan_status | String | completed \| in_progress \| failed |
| vulnerability_count | Number | Total findings across all severities |
| severity_high | Number | Count of HIGH severity findings |
| severity_medium | Number | Count of MEDIUM severity findings |
| severity_low | Number | Count of LOW severity findings |
| scan_results | String | S3 URI to full HTML/JSON report |
| timestamp | String | ISO 8601 scan completion time |

## What We Learned

- Infrastructure as code is non-negotiable — clicking through the console isn't maintainable.
- Decoupling with SQS gave free retries, buffering, and protected EC2 from request floods.
- A private subnet with a Lambda front door is the standard pattern, not a nice-to-have.
- Auto Scaling Groups make EC2 actually production-ready by handling failure automatically.
- Cross-account access is complex but exposes how IAM should be designed in real systems.

## What We'd Do Differently

- Run Terraform from a single shared backend (S3 + DynamoDB state lock) instead of local state so both teammates can apply.
- Start both teammates in the same AWS account to avoid cross-account access friction.
- Use VPC endpoints from day one for DynamoDB and S3 instead of routing through NAT Gateway.
- Define a least-privilege IAM role per service instead of relying on LabRole.
