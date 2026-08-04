# Student Success Platform

Monorepo for the AI-Powered Student Success Analytics Platform (MSc project): a NestJS backend at the repo root, the Next.js frontend in [`frontend/`](frontend/README.md), and the Python risk-model service in [`analytics-service/`](analytics-service/README.md). Three separate projects living in one repo — no workspaces/build-system magic, just root scripts to run them together.

```
.
├── src/                  NestJS backend (this README)
├── frontend/             Next.js frontend (see frontend/README.md)
├── analytics-service/    Python risk models — classical ML + deep learning (see analytics-service/README.md)
├── .env                  backend env (create from .env.example)
└── frontend/.env.local   frontend env (create from frontend/.env.example)
```

## Running everything together

```bash
npm install              # backend deps (root)
npm run install:web       # frontend deps
npm run install:analytics # Python venv + deps for the analytics service
cp .env.example .env                                # fill in DATABASE_URL, pick a JWT_SECRET
cp frontend/.env.example frontend/.env.local         # no auth vars needed here
docker run -d --name student-success-db \
  -e POSTGRES_PASSWORD=password -e POSTGRES_DB=student_success \
  -p 5432:5432 postgres:16-alpine               # local database — skip if using Supabase
npm run seed              # populate the database with a synthetic cohort
npm run dev                # runs backend on :4001, frontend on :3000, analytics on :8000
```

Open `http://localhost:3000`. The frontend's `API_URL` already defaults to `http://localhost:4001`, matching this backend's `PORT=4001` — no port juggling needed. Click "Create one" on the sign-in screen to sign up (email, password, first/last name), then you're in.

The frontend is server-rendered — the browser never talks to this backend directly. Every page fetches from the NestJS API server-side (Server Components) and mutations go through Server Actions, which set an httpOnly session cookie (holding a JWT) on login/signup and attach it to backend requests. See `frontend/README.md`'s Architecture section for the full picture.

Auth is email/password — bcrypt-hashed passwords and JWT session tokens, stored in the same Postgres database as everything else (a `staff_users` table), no external identity provider to configure. The default `DATABASE_URL` in `.env.example` points at the local Postgres container above; swap it for a Supabase connection string whenever you're ready to move off a local database.

Don't have a database wired up yet? Set `NEXT_PUBLIC_DEMO_MODE=true` in `frontend/.env.local` to run the UI standalone with in-memory sample data — see `frontend/README.md`.

To run one piece at a time: `npm run dev:api`, `npm run dev:web`, or `npm run dev:analytics`.

## Backend modules

- `students` – student profile CRUD, backed by anonymized dataset records.
- `attendance` – attendance records and per-student attendance-rate summaries.
- `assessments` – assessment/grade records and weighted score summaries.
- `engagement` – VLE/engagement records (logins, clicks, forum activity) and summaries.
- `analytics-pipeline` – builds feature vectors from the above modules and calls the Python analytics service for classical ML and deep learning predictions.
- `risk-assessment` – runs and stores risk predictions (classical ML + deep learning) per student, exposes at-risk queries.
- `recommendations` – generates rule-based early-warning/guidance recommendations from risk assessments and tracks their status.
- `auth` – email/password signup and login (bcrypt password hashing, JWT session tokens), `JwtAuthGuard` protecting every other route, `GET /auth/me` for the current user's name/email.

## Setup

```bash
npm install
cp .env.example .env   # fill in DATABASE_URL, pick a JWT_SECRET, analytics service URL
npm run start:dev
```

API docs (Swagger) are served at `/docs` once the server is running.

## Analytics service contract

`ANALYTICS_SERVICE_URL` (defaults to `http://localhost:8000`) points at the Python service in `analytics-service/` — a classical ML model (logistic regression) and a deep learning model (feed-forward neural network, PyTorch), trained on synthetic data at startup and compared side by side, per the spec's model development plan. It exposes:

- `POST /predict/classical` – classical ML prediction
- `POST /predict/deep-learning` – deep learning prediction
- `GET /metrics` – accuracy/precision/recall/F1 for both models

Both prediction endpoints accept a `StudentFeatureVector` JSON body (see `src/analytics-pipeline/analytics-pipeline.service.ts`) and return `{ riskScore, modelVersion, contributingFactors? }`. See `analytics-service/README.md` for details.

## Seeding data

`npm run seed` populates the database with a synthetic cohort (40 students with attendance, assessment, and engagement records) — the spec allows synthetically generated data where additional testing data is required. Re-running it clears the previously seeded synthetic students first, so it's safe to re-run without piling up duplicates. The cohort is weighted so most students land in the "struggling" tier — useful for demoing the risk/recommendation features, since an evenly-split cohort makes for a quiet dashboard.

Seeding only creates attendance/assessment/engagement records — it doesn't call the ML models. Risk assessments and recommendations only exist once something calls those endpoints (normally a button click per student in the UI). To populate them for the whole cohort in one go:

```bash
ASSESS_API_URL=http://localhost:4001 ASSESS_EMAIL=you@example.com ASSESS_PASSWORD=yourpassword npm run assess-all
```

Point `ASSESS_API_URL` at whichever backend you just seeded (local or deployed) and use credentials for a staff account that already exists there (sign up via the app first if needed).

## Deploying (free tier: Vercel + Render + Supabase)

This matches the spec's deployment plan — Vercel for the frontend, Render for
the two backend services, Supabase for Postgres. All three have a free tier
that's enough for this project. Render's free web services spin down after
15 minutes of inactivity and take ~30–60s to wake back up on the next
request — expected, not a bug.

**1. Database — Supabase**

1. Create a project at [supabase.com](https://supabase.com) (free tier).
2. Project Settings → Database → copy the connection string (URI format).
   Supabase requires SSL, which the backend already handles via
   `DATABASE_SSL=true`.

**2. Backend + analytics service — Render**

The repo includes `render.yaml`, so Render can create both services in one
step:

1. [dashboard.render.com](https://dashboard.render.com) → **New → Blueprint**
   → connect the `numofran6/student-success-api` GitHub repo. Render reads
   `render.yaml` and proposes two free web services: `student-success-api`
   (Node) and `student-success-analytics` (Python).
2. Before the first deploy finishes, open **student-success-api → Environment**
   and fill in the vars the blueprint left blank:
   - `DATABASE_URL` — the Supabase connection string from step 1
   - `JWT_SECRET` — a random string (`openssl rand -hex 32`)
   - `ANALYTICS_SERVICE_URL` — the `student-success-analytics` service's URL
     shown in its Render dashboard page (`https://student-success-analytics-xxxx.onrender.com`)
   - `ANALYTICS_SERVICE_API_KEY` — leave blank, it's optional
   - `CORS_ORIGIN` — leave blank for now; come back and set this once you
     have the Vercel URL from step 3
3. Note the `student-success-api` service's own URL — you'll need it for
   the frontend.

**3. Frontend — Vercel**

1. [vercel.com/new](https://vercel.com/new) → import the same GitHub repo.
2. **Root Directory**: set to `frontend` (this repo has three projects in
   one; Vercel needs to know which one to build).
3. Add an environment variable: `API_URL` = the `student-success-api` Render
   URL from step 2. Leave `NEXT_PUBLIC_DEMO_MODE` unset (defaults to real,
   non-demo mode).
4. Deploy. Note the resulting `https://your-app.vercel.app` URL.

**4. Close the loop**

Back in Render, set `student-success-api`'s `CORS_ORIGIN` to the Vercel URL
from step 3 and let it redeploy — this restricts the API to your deployed
frontend instead of allowing any origin.

**5. Seed the deployed database**

From your machine, temporarily point `DATABASE_URL` in your local `.env` at
the Supabase connection string and run `npm run seed`, then switch it back
(or just keep two `.env` files around). Alternatively, sign up through the
deployed app and add students via the API directly — the seed script is
just a shortcut for a realistic starting cohort.

Then populate risk assessments and recommendations for that cohort (seeding
alone doesn't call the ML models — see "Seeding data" above):

```bash
ASSESS_API_URL=https://student-success-api-pdzk.onrender.com \
  ASSESS_EMAIL=you@example.com ASSESS_PASSWORD=yourpassword \
  npm run assess-all
```

Visit the Vercel URL, sign up, and you're in.

## Scripts

```bash
npm run build              # compile
npm run start:dev          # watch mode
npm run test                # unit tests
npm run test:e2e             # e2e tests
npm run lint                 # eslint --fix
npm run seed                 # populate the database with synthetic students
npm run assess-all           # run risk assessment + recommendations for every student
npm run dev                  # run backend + frontend + analytics service together
npm run install:web          # install frontend deps
npm run install:analytics    # create the analytics-service Python venv + deps
```
