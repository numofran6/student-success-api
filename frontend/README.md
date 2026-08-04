# Student Success Frontend

Next.js 14 (App Router) frontend for the **AI-Powered Student Success Analytics
Platform** (MSc project). This client connects to the NestJS backend
(`Student Success API`) and covers every backend module: students,
attendance, assessments, engagement, risk assessment, and recommendations.

Frontend/design lead: Milan and Nikin. Backend/API: Numo. ML models: Numo and
Vishal.

## Just want to see the UI? Run it in demo mode

You don't need the backend or Supabase to preview this. There's a
built-in **demo mode** that fills the whole app with realistic sample data —
students, attendance, grades, engagement, risk levels, recommendations — all
generated in the browser.

1. Install dependencies:
   ```bash
   npm install
   ```
2. Create a file called `.env.local` in this folder with just one line in it:
   ```
   NEXT_PUBLIC_DEMO_MODE=true
   ```
   (You don't need any of the other variables from `.env.example` for this —
   demo mode ignores them.)
3. Run it:
   ```bash
   npm run dev
   ```
4. Open `http://localhost:3000`. You'll land straight on the dashboard — no
   sign-in screen — with a "Demo mode" label in the sidebar so it's always
   clear this isn't real data.

Everything is clickable and functional: filter the student register, open a
student's profile, click "Run risk assessment" (it generates a new sample
score), click "Generate recommendations," change a recommendation's status.
Refreshing the page generates a fresh random cohort — nothing is saved
anywhere, it's all just in memory for that browser tab.

**When your friend's backend is ready:** delete that `.env.local` file (or
change the line to `NEXT_PUBLIC_DEMO_MODE=false`) and fill in the real values
as described below. Nothing else in the code needs to change.

---

## Stack

- **Next.js 14** (App Router) + **TypeScript**
- **Tailwind CSS** for styling, with a small custom design-token system (see
  `tailwind.config.ts`)
- **shadcn/ui** for interactive components (dropdown menu, avatar, tabs,
  switch) — these are copied into `components/ui/`, not installed as a
  package, so you fully own and can edit the code. Add more anytime with
  `npx shadcn add <component>` (a `components.json` is already set up)
- **lucide-react** for icons throughout the nav, buttons, and menus
- **Recharts** for charts
- **Shared staff password** — a login screen asks for the access password,
  which is then sent as the `X-API-Key` header on every request to match the
  backend's `ApiKeyAuthGuard`.

No other UI framework or component library is used, so there's nothing extra
to learn before making changes.

## Project structure

```
app/                        Routes (Next.js App Router)
  layout.tsx                 Root layout: fonts, auth provider, app shell
  page.tsx                    Cohort overview dashboard ("/")
  students/page.tsx           Paginated, filterable student register
  students/[id]/page.tsx       Student profile: attendance, assessments,
                               engagement, risk, recommendations
  attendance/page.tsx          Attendance module (pick a student, see records)
  assessments/page.tsx         Assessments module
  engagement/page.tsx          Engagement module
  recommendations/page.tsx     Cohort-wide early warnings + per-student lookup
  profile/page.tsx              Signed-in user's account info
  settings/page.tsx             Compact mode + default page size (real, saved
                               to this browser's localStorage)
  globals.css                  Tailwind layers + accessibility-related resets

components/
  ui/                          shadcn/ui primitives (button, card, avatar,
                               dropdown-menu, tabs, switch, label, separator)
  UserMenu.tsx                 Avatar dropdown: Profile, Settings, Sign out
  AppShell.tsx                Sidebar navigation + layout frame
  LoginGate.tsx                Shared-password screen shown when locked
  KpiCard.tsx, RiskBadge.tsx, StatusPill.tsx, PulseStrip.tsx
  StatusStates.tsx             Loading / error / empty state components
  DataDisclosure.tsx           <details> table fallback for every chart
  StudentPicker.tsx            Searchable student selector for module pages
  StudentRiskCell.tsx          Per-row risk badge + sparkline for the register
  Pagination.tsx

lib/                        Non-UI logic
  api.ts                       Typed API client — one object per backend module
  types.ts                     TypeScript types mirroring the backend entities
  session.ts                   localStorage helper for the stored API key
  auth-context.tsx             React context wrapping the password-gate state
  use-api.ts                   Small fetch-with-loading/error/refetch hook
  format.ts                    Date/percentage formatting, label maps
  demo.ts                      Demo mode flag (NEXT_PUBLIC_DEMO_MODE)
  mock-data.ts                  Sample data + mock API used only in demo mode
```

Everything is a plain file you can open and edit — there is no code
generation step and no hidden configuration.

## Setup

1. **Requirements**: Node.js v18 or later.
2. Copy this folder next to (not inside) your backend repo.
3. Install dependencies:
   ```bash
   npm install
   ```
4. Copy the environment template and fill it in:
   ```bash
   cp .env.example .env.local
   ```
   - `NEXT_PUBLIC_API_URL` — the base URL of your running NestJS backend
     (e.g. `http://localhost:4001`). If the backend also runs on port 3000,
     either change one of the two ports or set this explicitly.
   - No auth variables to set here — the login screen asks for a password at
     runtime, checked against the backend's `API_KEY` env var. There's
     nothing to fill in on the frontend side for auth.
5. Run the dev server:
   ```bash
   npm run dev
   ```
   Then open `http://localhost:3000`.

## Backend contract this frontend expects

| Area | Endpoints used |
| --- | --- |
| Students | `GET/POST /students`, `GET/PATCH/DELETE /students/:id` |
| Attendance | `GET /students/:id/attendance-records`, `GET /students/:id/attendance-summary`, `POST /attendance-records` |
| Assessments | `GET /students/:id/assessment-records`, `GET /students/:id/assessment-summary`, `POST /assessment-records` |
| Engagement | `GET /students/:id/engagement-records`, `GET /students/:id/engagement-summary`, `POST /engagement-records` |
| Risk assessment | `GET/POST /students/:id/risk-assessments`, `GET /risk-assessments/at-risk` |
| Recommendations | `GET/POST /students/:id/recommendations`, `GET /recommendations/early-warnings`, `PATCH /recommendations/:id/status` |

All routes are protected by `ApiKeyAuthGuard`, so every request from
`lib/api.ts` attaches the stored shared password as an `X-API-Key` header
automatically, once the user has unlocked the app via `LoginGate`.

## Accessibility

This was built to WCAG 2.2 AA as a baseline:

- Semantic landmarks (`nav`, `main`, headings in order) and a visible
  "Skip to main content" link.
- All interactive elements have visible keyboard focus rings
  (`:focus-visible`) and are reachable by keyboard alone.
- Every chart (Recharts, marked `aria-hidden`) is paired with a `<details>`
  disclosure exposing the same data as a real `<table>`, so the information
  isn't visual-only.
- Colour is never the only signal: risk levels and recommendation statuses
  pair colour with a text label.
- `prefers-reduced-motion` is respected globally.
- Forms use associated `<label>`s; tables use `<caption>`, `scope="col"`,
  and proper header cells.

If you run an automated audit (e.g. axe, Lighthouse) as part of your
usability evaluation, this is the intended baseline to test against — please
do log anything it misses so it can be fixed.

## A note on academic integrity

This codebase was produced with AI assistance and then should be reviewed,
tested, and adapted by the team before submission. Check your programme's
AI-usage policy for how to disclose this in your methodology/appendix — the
honest version ("AI-assisted implementation, reviewed by the author(s)") is
what keeps this compliant, rather than a claim of fully manual authorship.

## Known limitations / good next steps

- The backend has no student-facing role — this frontend is built for
  academic staff/advisors, matching the current data model (no per-student
  login distinction). Adding a student-facing view later needs a new backend
  field linking a login to a `Student` record.
- `StudentPicker` loads up to 100 students into a `<datalist>` for
  simplicity. If your dataset grows much larger, swap this for a debounced
  server-side search once the backend supports filtering by `externalId`.
- The student register's per-row risk sparkline (`StudentRiskCell`) does one
  request per visible row. Fine at the current page size (20), but worth
  revisiting if the backend later adds a batch endpoint.
