# PRSense

PRSense is a production-grade, AI-powered code review SaaS that combines instant browser-side static analysis with Gemini-backed semantic review. It is built as a two-layer pipeline:

- Static Engine: fast regex and heuristic checks that run in the browser and surface known dangerous patterns immediately.
- AI Analysis: a backend Gemini flow that looks for logic flaws, architecture issues, and deeper review context.

## Stack

- Frontend: React 18, Vite, React Router, Zustand, Framer Motion, Monaco Editor, React Three Fiber, Tailwind CSS
- Backend: Express, Gemini API, Joi validation, Helmet, Morgan, CORS, rate limiting

## Project Structure

- `frontend/` contains the dashboard, landing page, results UI, static analysis engine, and shared design system.
- `backend/` contains the Gemini API service and review endpoints.

## Setup

1. Install dependencies in both apps:

```bash
cd backend && npm install
cd ../frontend && npm install
```

2. Configure environment variables:

- `backend/.env`:

```bash
GEMINI_API_KEY=your_key_here
PORT=3001
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

- `frontend/.env`:

```bash
VITE_API_BASE_URL=http://localhost:3001
```

3. Start the backend:

```bash
cd backend
npm run dev
```

4. Start the frontend:

```bash
cd frontend
npm run dev
```

## What PRSense Does

- Runs 25+ browser-side static rules in about 50ms.
- Starts Gemini analysis in parallel so the UI never waits for AI before showing feedback.
- Deduplicates overlapping findings and merges them into one review card when both engines catch the same issue.
- Surfaces a score, summary, categorized issues, and explain-fix guidance.
- Lets you choose a language, paste or upload code, and switch between Deep Review and Explain Code modes.
- Persists analysis state in session storage so the dashboard and results stay available after a refresh in the same session.

## Backend Endpoints

- `POST /api/analyze-code` - returns Gemini analysis for submitted code.
- `POST /api/explain-fix` - returns a plain-English fix explanation for a selected issue.
- `GET /health` - health check.

## Notes

- If `GEMINI_API_KEY` is missing, the backend falls back to a deterministic semantic analysis mode so the app remains usable during development.
- The frontend static engine does not depend on external packages and runs entirely in the browser.
- The results page will redirect back to the dashboard if there is no merged analysis in state.
