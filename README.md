# Student Success Platform

Monorepo for the AI-Powered Student Success Analytics Platform (MSc project): a NestJS backend at the repo root, and the Next.js frontend in [`frontend/`](frontend/README.md). They're two separate npm projects living in one repo — no workspaces/build-system magic, just a root script to run both together.

```
.
├── src/            NestJS backend (this README)
├── frontend/       Next.js frontend (see frontend/README.md)
├── .env            backend env (create from .env.example)
└── frontend/.env.local   frontend env (create from frontend/.env.example)
```

## Running both together

```bash
npm install          # backend deps (root)
npm run install:web  # frontend deps
cp .env.example .env                                # fill in DATABASE_URL, pick an API_KEY
cp frontend/.env.example frontend/.env.local         # no auth vars needed here
docker run -d --name student-success-db \
  -e POSTGRES_PASSWORD=password -e POSTGRES_DB=student_success \
  -p 5432:5432 postgres:16-alpine               # local database — skip if using Supabase
npm run dev           # runs backend on :4001 and frontend on :3000 concurrently
```

Open `http://localhost:3000`. The frontend's `NEXT_PUBLIC_API_URL` already defaults to `http://localhost:4001`, matching this backend's `PORT=4001` — no port juggling needed. Log in with the `API_KEY` value from `.env`.

Auth is a shared staff password (see below) — no external identity provider to configure. The default `DATABASE_URL` in `.env.example` points at the local Postgres container above; swap it for a Supabase connection string whenever you're ready to move off a local database.

Don't have a database wired up yet? Set `NEXT_PUBLIC_DEMO_MODE=true` in `frontend/.env.local` to run the UI standalone with in-memory sample data — see `frontend/README.md`.

To run only one side: `npm run dev:api` or `npm run dev:web`.

## Backend modules

- `students` – student profile CRUD, backed by anonymized dataset records.
- `attendance` – attendance records and per-student attendance-rate summaries.
- `assessments` – assessment/grade records and weighted score summaries.
- `engagement` – VLE/engagement records (logins, clicks, forum activity) and summaries.
- `analytics-pipeline` – builds feature vectors from the above modules and calls the Python analytics service for classical ML and deep learning predictions.
- `risk-assessment` – runs and stores risk predictions (classical ML + deep learning) per student, exposes at-risk queries.
- `recommendations` – generates rule-based early-warning/guidance recommendations from risk assessments and tracks their status.
- `auth` – shared staff password (`X-API-Key` header) guard, used to protect all routes.

## Setup

```bash
npm install
cp .env.example .env   # fill in DATABASE_URL, pick an API_KEY, analytics service URL
npm run start:dev
```

API docs (Swagger) are served at `/docs` once the server is running.

## Analytics service contract

`ANALYTICS_SERVICE_URL` should point to the Python service (Pandas/Scikit-learn + TensorFlow-Keras or PyTorch) exposing:

- `POST /predict/classical` – classical ML prediction
- `POST /predict/deep-learning` – deep learning prediction

Both accept a `StudentFeatureVector` JSON body (see `src/analytics-pipeline/analytics-pipeline.service.ts`) and return `{ riskScore, modelVersion, contributingFactors? }`.

## Scripts

```bash
npm run build       # compile
npm run start:dev   # watch mode
npm run test         # unit tests
npm run test:e2e     # e2e tests
npm run lint         # eslint --fix
```
