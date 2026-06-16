resource "aws_sqs_queue" "scan_jobs" {
  name                      = "securecheck-scan-jobs"
  visibility_timeout_seconds = 300
  message_retention_seconds  = 86400

  tags = { Name = "securecheck-scan-jobs" }
}

# Dead letter queue — failed jobs go here
resource "aws_sqs_queue" "scan_jobs_dlq" {
  name = "securecheck-scan-jobs-dlq"
  tags = { Name = "securecheck-scan-jobs-dlq" }
}

# After 3 failed attempts, move to dead letter queue
resource "aws_sqs_queue_redrive_policy" "scan_jobs" {
  queue_url = aws_sqs_queue.scan_jobs.id
  redrive_policy = jsonencode({
    deadLetterTargetArn = aws_sqs_queue.scan_jobs_dlq.arn
    maxReceiveCount     = 3
  })
}
