# Student Success Frontend

Next.js 14 (App Router) frontend for the **AI-Powered Student Success Analytics
Platform** (MSc project). This client connects to the NestJS backend
(`Student Success API`) and covers every backend module: students,
attendance, assessments, engagement, risk assessment, and recommendations.

Frontend/design lead: Milan and Nikin. Backend/API: Numo. ML models: Numo and
Vishal.

## Architecture: server-rendered, not a client-side SPA

Every data-driven page is an **async Server Component** — it fetches from the
NestJS API directly on the server during rendering and sends back real HTML,
instead of shipping an empty shell that fetches everything after the browser
loads. The browser never talks to the NestJS backend directly at all:

- **Reads** happen in Server Components (`lib/server/api.ts`), fetched during
  render on the server.
- **Writes** (running a risk assessment, generating recommendations, changing
  a recommendation's status) go through **Server Actions** (`app/actions.ts`),
  called from small client components, which then `revalidatePath` so the
  page's server-rendered data refreshes automatically.
- **Auth** is email/password sign-in against the backend (bcrypt-hashed
  passwords, JWT session tokens) — a Server Action stores the returned JWT in
  an httpOnly cookie, rather than a token sitting in `localStorage` that
  every client-side fetch has to attach. `middleware.ts` redirects to
  `/login` if the cookie is missing.

This was a deliberate change from an earlier client-rendered version (every
page was `'use client'`, fetched its own data after mount, and gated
everything behind a client-side check) — that architecture meant a page
couldn't render anything until the browser had loaded, checked auth, and
then fetched its data in a second round trip. Rendering server-side removes
that whole sequence for the common case.

## Just want to see the UI? Run it in demo mode

You don't need the backend or Supabase to preview this. There's a
built-in **demo mode** that fills the whole app with realistic sample data —
students, attendance, grades, engagement, risk levels, recommendations — all
generated in the browser. Demo mode is the one place still fully
client-rendered (each `Demo*` component fetches from in-memory mock data via
the old `useApi` hook), since there's no real backend to render against.

1. Install dependencies:
   ```bash
   npm install
   ```
2. Create a file called `.env.local` in this folder with just one line in it:
   ```
   NEXT_PUBLIC_DEMO_MODE=true
   ```
   (You don't need any of the other variables from `.env.example` for this —
   demo mode ignores them, and `middleware.ts` skips the login redirect
   entirely when it's on.)
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

- **Next.js 14** (App Router) + **TypeScript**, Server Components and Server
  Actions for real (non-demo) pages
- **Tailwind CSS** for styling, with a small custom design-token system (see
  `tailwind.config.ts`)
- **shadcn/ui** for interactive components (dropdown menu, avatar, tabs,
  switch) — these are copied into `components/ui/`, not installed as a
  package, so you fully own and can edit the code. Add more anytime with
  `npx shadcn add <component>` (a `components.json` is already set up)
- **lucide-react** for icons throughout the nav, buttons, and menus
- **Recharts** for charts (the one place that must stay client-rendered —
  each chart is its own small `'use client'` component under
  `components/charts/`, fed data as props from the server-rendered page)
- **Email/password auth**, backed by the NestJS API's bcrypt + JWT, held
  server-side in an httpOnly session cookie after login — see Architecture
  above.

No other UI framework or component library is used, so there's nothing extra
to learn before making changes.

## Project structure

```
app/
  layout.tsx                  Root layout: fonts, metadata only
  login/page.tsx, LoginForm.tsx     Email/password sign-in (Server Action + useFormState)
  signup/page.tsx, SignupForm.tsx    Create account: first/last name, email, password
  session-actions.ts           Server Actions: login, signup (both set the
                                 session cookie from the returned JWT), logout
  actions.ts                    Server Actions: run risk assessment, generate
                                 recommendations, update recommendation status
  (app)/                       Route group for every authenticated page —
                                 shares one layout.tsx that renders AppShell
                                 and fetches the current user for the header
    layout.tsx
    page.tsx, DemoDashboard.tsx        Cohort overview ("/")
    students/page.tsx, DemoStudentsPage.tsx     Paginated, filterable register
    students/[id]/page.tsx, DemoStudentDetail.tsx   Student profile
    attendance/page.tsx, DemoAttendancePage.tsx
    assessments/page.tsx, DemoAssessmentsPage.tsx
    engagement/page.tsx, DemoEngagementPage.tsx
    recommendations/page.tsx, DemoRecommendationsPage.tsx
    profile/page.tsx              Shows the signed-in user's name/email
    settings/page.tsx, SettingsView.tsx

  Every real route has a same-folder `Demo*` component — a plain client
  component preserving the original fully client-rendered behaviour, used
  only when NEXT_PUBLIC_DEMO_MODE=true. The `page.tsx` in each folder is a
  thin branch: demo mode renders `Demo*`, otherwise it fetches server-side
  and renders directly.

middleware.ts                 Redirects to /login when the session cookie is
                                missing (skipped entirely in demo mode)

components/
  ui/                          shadcn/ui primitives
  charts/                      Recharts wrappers (the only client-rendered
                                 pieces of the real, non-demo pages)
  UserMenu.tsx                 Avatar dropdown: Profile, Settings, Sign out
  AppShell.tsx                 Sidebar navigation + layout frame
  students/StudentHeader.tsx    Client island: the two action buttons + error
                                 banner on a student's profile page
  RecommendationCard.tsx        Client island: a recommendation with its
                                 Acknowledge/Resolve buttons (shared by the
                                 student profile and recommendations pages)
  StudentPickerLink.tsx          SSR-friendly picker — takes a preloaded
                                 student list as a prop, navigates via the
                                 URL instead of fetching itself
  StudentPicker.tsx, StudentRiskCell.tsx   Self-fetching originals, demo-only
  RiskCell.tsx                   Presentational counterpart to
                                 StudentRiskCell, fed already-fetched data
  KpiCard.tsx, RiskBadge.tsx, StatusPill.tsx, PulseStrip.tsx
  StatusStates.tsx, DataDisclosure.tsx, Pagination.tsx

lib/
  server/api.ts                 Server-only API client — reads the session
                                 cookie, calls the NestJS backend (signup,
                                 login, getCurrentUser, and every data
                                 endpoint), used only from Server
                                 Components/Actions
  server/session.ts             httpOnly cookie get/set/clear helpers
  demo-api.ts                   Demo-only API client, delegates to mock-data.ts
  types.ts                      TypeScript types mirroring the backend entities
  use-api.ts                    fetch-with-loading/error/refetch hook (demo only)
  format.ts                     Date/percentage formatting, label maps
  demo.ts                       Demo mode flag (NEXT_PUBLIC_DEMO_MODE)
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
   - `API_URL` — the base URL of your running NestJS backend (e.g.
     `http://localhost:4001`). Server-only; it never reaches the browser.
   - No auth variables to set here — create an account from `/signup` once
     the backend is running; there's nothing to configure on the frontend
     side for auth.
5. Run the dev server:
   ```bash
   npm run dev
   ```
   Then open `http://localhost:3000`, click "Create one" on the sign-in
   screen, and sign up.

## Backend contract this frontend expects

| Area | Endpoints used |
| --- | --- |
| Auth | `POST /auth/signup`, `POST /auth/login`, `GET /auth/me` |
| Students | `GET/POST /students`, `GET/PATCH/DELETE /students/:id` |
| Attendance | `GET /students/:id/attendance-records`, `GET /students/:id/attendance-summary`, `POST /attendance-records` |
| Assessments | `GET /students/:id/assessment-records`, `GET /students/:id/assessment-summary`, `POST /assessment-records` |
| Engagement | `GET /students/:id/engagement-records`, `GET /students/:id/engagement-summary`, `POST /engagement-records` |
| Risk assessment | `GET/POST /students/:id/risk-assessments`, `GET /risk-assessments/at-risk` |
| Recommendations | `GET/POST /students/:id/recommendations`, `GET /recommendations/early-warnings`, `PATCH /recommendations/:id/status` |

Every route except `signup`/`login` is protected by `JwtAuthGuard`, so every
request from `lib/server/api.ts` attaches the session cookie's JWT as an
`Authorization: Bearer` header automatically — done once, on the server,
rather than by every client-side fetch.

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
- Filter forms on `/students` and student pickers elsewhere degrade to plain
  URL-based navigation (`<form method="GET">`, `<Link>` pagination) — they
  work with JavaScript disabled, not just with a screen reader.

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
- `StudentPickerLink` (and demo mode's `StudentPicker`) load up to 100
  students into a `<datalist>` for simplicity. If your dataset grows much
  larger, swap this for a debounced server-side search once the backend
  supports filtering by `externalId`.
- The student register's per-row risk (`RiskCell`) is fetched server-side in
  parallel for every visible row — fine at the current page size (20), but
  worth revisiting for a batch endpoint if the backend adds one, since it's
  still N backend requests per page load (just N server-side requests now
  instead of N client-side ones).
