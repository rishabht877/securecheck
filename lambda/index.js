const { SQSClient, SendMessageCommand } = require("@aws-sdk/client-sqs");

const sqs = new SQSClient({ region: "us-east-1" });

exports.handler = async (event) => {
  console.log("Webhook received:", JSON.stringify(event));

  try {
    // Parse the GitHub webhook body
    const body = JSON.parse(event.body || "{}");
    const prNumber = body.pull_request?.number || "unknown";
    const repo = body.repository?.full_name || "unknown";
    const action = body.action || "unknown";

    console.log(`PR #${prNumber} ${action} on ${repo}`);

    // Only process when PR is opened or updated
    if (action !== "opened" && action !== "synchronize") {
      return {
        statusCode: 200,
        body: JSON.stringify({ message: "Ignored action: " + action })
      };
    }

    // Drop job into SQS
    const message = {
      prNumber,
      repo,
      action,
      timestamp: new Date().toISOString()
    };

    await sqs.send(new SendMessageCommand({
      QueueUrl: process.env.SQS_QUEUE_URL,
      MessageBody: JSON.stringify(message)
    }));

    console.log("Job dropped into SQS:", message);

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Scan job queued", prNumber })
    };

  } catch (err) {
    console.error("Error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
};
