# Zip the lambda function code
data "archive_file" "lambda_zip" {
  type        = "zip"
  source_dir  = "${path.module}/lambda"
  output_path = "${path.module}/lambda.zip"
}

# The Lambda function using existing LabRole
resource "aws_lambda_function" "webhook_receiver" {
  filename         = "lambda.zip"
  function_name    = "securecheck-webhook-receiver"
  role             = "arn:aws:iam::644257575072:role/LabRole"
  handler          = "index.handler"
  runtime          = "nodejs18.x"
  source_code_hash = data.archive_file.lambda_zip.output_base64sha256

  environment {
    variables = {
      SQS_QUEUE_URL = aws_sqs_queue.scan_jobs.url
    }
  }

  tags = { Name = "securecheck-webhook-receiver" }
}
