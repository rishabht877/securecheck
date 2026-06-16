output "webhook_url" {
  description = "GitHub webhook URL"
  value       = "${aws_apigatewayv2_stage.default.invoke_url}/webhook"
}

output "sqs_queue_url" {
  description = "SQS queue URL"
  value       = aws_sqs_queue.scan_jobs.url
}

output "lambda_function_name" {
  description = "Lambda function name"
  value       = aws_lambda_function.webhook_receiver.function_name
}
