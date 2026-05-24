PRSense n8n Integration

This folder contains a starter n8n workflow that forwards GitHub webhook events to the PRSense backend with retries and logging.

Files
- `prsense-github-webhook-workflow.json` — n8n workflow export. Import this into your n8n instance.

Purpose
- Use n8n as a lightweight gateway: receive GitHub webhooks, perform retries, add logging and optional transformations, and forward events to the PRSense backend endpoint at `/api/webhooks/github`.
- This decouples GitHub's delivery from the backend, lets you add observability or enrichment, and provides a safe place to apply filtering or enrichment before the backend receives events.

Environment
- The workflow uses the environment variable `PRSENSE_BACKEND_URL` to determine where to forward events. If not set, it defaults to `http://localhost:3001`.

How to import
1. Start n8n (desktop, docker, or hosted).
2. In n8n UI click "Import" and choose `prsense-github-webhook-workflow.json`.
3. Edit the webhook node (if necessary) to expose it on your chosen host.
4. Set environment variable `PRSENSE_BACKEND_URL` in n8n's runtime environment if your backend is not `http://localhost:3001`.
5. Activate the workflow.

How to wire with GitHub
1. Copy the webhook URL from the Webhook node (e.g., `https://<n8n-host>/webhook/prsense-github-webhook`).
2. In your GitHub App or repository webhook settings, set the Payload URL to the above and the secret to your `GITHUB_WEBHOOK_SECRET`.
3. Events will be forwarded to PRSense for processing.

Notes
- The workflow contains two retry attempts with backoff (10s, then 20s) and a `Logger` node that emits a compact JSON string to n8n's logs for troubleshooting.
- This workflow is optional — PRSense can receive webhooks directly. Use n8n when you want buffering, retries, transformation, or richer observability without touching backend code.

Next steps (optional)
- Add an `HTTP Request` node that posts to an auditing endpoint to persist incoming events.
- Add branching to filter out noise (e.g., ignore changes from bots).
- Add a node to transform payloads or enrich with repository metadata before forwarding.