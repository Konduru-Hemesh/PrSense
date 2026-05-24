PRSense - Deployment & Test Notes

Local quickstart (dev):

1. Start backend (dev):
```bash
cd backend
npm install
npm run dev
```

2. (Optional) Start n8n and import the workflow from `integrations/n8n/prsense-github-webhook-workflow.json`.

Docker quickstart:

1. Build and run with docker-compose (requires Docker installed):
```bash
docker compose up --build
```

This starts the backend on port `3001` and n8n on `5678`.

Testing endpoints:
- `GET /health` — basic health check
- `POST /api/webhooks/github` — GitHub webhook (expects raw body and `x-hub-signature-256` header)
- `GET /metrics` — Prometheus metrics
- `GET /api/settings` — current settings
- `POST /api/settings` — update settings (requires `x-admin-secret` header if `ADMIN_SECRET` set)
- `GET /api/audit` — recent audit events

Security notes:
- If you set `ADMIN_SECRET` in the environment, updating settings requires that header on requests.
- Webhook secret is still verified via `GITHUB_WEBHOOK_SECRET`.
