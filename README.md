# Dayflow

A Human Resource Management System: attendance, leave, payroll and people data,
with role-separated employee and HR views.

This repo holds **two separate frontends**. Know which one you are demoing:

| Part | Path | Talks to the API? |
|---|---|---|
| **API** — FastAPI, SQLAlchemy 2.0, PostgreSQL, JWT auth | `backend/` | — |
| **Main app** — Next.js 16 (App Router), TypeScript, Tailwind v4 | `frontend/` | **Yes.** Real data, real auth, real RBAC. |
| **Showcase** — landing page + portal walkthrough, React & Vite | repo root (`src/`, `index.html`) | **No.** Client-side mock state only. |

The showcase is a walkthrough, not the product: it fakes its own state so it can
be demoed with nothing else running. The real flows live in `frontend/`.

---

## Run it

### 1. Backend

Postgres needs to be running locally.

```bash
cd backend
cp .env.example .env                                     # then set a real JWT_SECRET
python -c "import secrets; print(secrets.token_urlsafe(48))"
createdb dayflow
uv sync --python 3.12
uv run python -m app.seed                                # demo users + history
uv run uvicorn app.main:app --reload --port 8000
```

API docs available at http://localhost:8000/docs.

### 2. Frontend (Main App)

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

Open http://localhost:3000. If something else already owns 3000, Next falls back
to 3001 — both origins are in the backend's default `CORS_ORIGINS`.

### 3. Showcase (Vite landing page + portal walkthrough)

Runs from the repo root. Mock data — it does not need the
backend running.

```bash
npm install
npm run dev
```

---

### Demo accounts

Password for all four: `dayflow123`. The login page has one-click buttons for the
first two.

| Role | Email |
|---|---|
| Admin (HR) | `priya.nair@dayflow.in` |
| Employee | `arjun.rao@dayflow.in` |
| Employee | `meera.iyer@dayflow.in` |
| Employee | `rohit.desai@dayflow.in` |

---

## The demo loop

The seed is arranged so this runs without any setup on stage:

1. Sign in as **Meera** (`meera.iyer@dayflow.in`) — she has *not* checked in today,
   so **Check in** is the live button. Click it.
2. Go to **Leave** → apply for paid leave with a date range and a remark.
3. Sign in as **Priya** (admin) in a second tab → **Leave approvals**. The new
   request is at the top of the pending queue.
4. Type a note, hit **Approve**.
5. Click back to Meera's tab. It refetches on focus: the badge flips to
   **Approved** and Priya's note appears under the request.

Arjun is seeded as *already checked in*, so his **Check out** button is the live
one — both attendance states are visible without waiting for a clock.

---

## Layout

```
backend/app/
  models.py        five tables, enums, relationships
  schemas.py       request/response contracts and the field-level boundaries
  security.py      bcrypt + JWT issue/verify   (run directly for a self-check)
  deps.py          get_current_user, require_admin
  seed.py          demo data
  routers/         auth, profile, employees, attendance, leave, payroll, analytics

frontend/src/
  lib/api.ts       fetch wrapper: bearer token, one shared refresh, error shapes
  lib/auth.tsx     session context
  lib/use-api.ts   GET + refetch-on-focus, derived loading, cancel-on-change
  components/      UI primitives, role gate, shells, forms
  app/employee/*   overview, attendance, leave, payroll, profile
  app/admin/*      dashboard, employees, employee detail, attendance, approvals

src/                 (repo root — the Vite showcase, mock data)
  components/        landing hero, features carousel, role comparison, pricing
  components/hrms/   portal walkthrough screens
  context/           HRMSContext — useState + localStorage, no API calls
  styles/            animations and responsive styling
```

---

## Design notes

**Roles are enforced on the server.** Every admin route depends on
`require_admin`. The `/employee` and `/admin` route groups in the frontend are
navigation, not security — an employee token gets a 403 from the API regardless
of which URL they open.

**The employee-editable profile boundary is a schema, not a UI state.**
`ProfileSelfUpdate` sets `extra="forbid"`, so an employee sending `job_title` to
`PUT /profile/me` gets a 422. Hiding the input would not have been enough.

**Tokens carry a `type` claim.** An access token cannot be replayed at
`/auth/refresh` to mint a fresh pair, and a refresh token is not accepted as a
bearer credential. Both directions are covered by the self-check in
`security.py`.

**Attendance can't double-count.** One row per employee per day is a
`UNIQUE (user_id, date)` constraint, so a duplicate check-in fails at the
database even if a handler ever forgot to look.

**Leave decisions are final.** Re-deciding a settled request is a 409 rather than
a silent overwrite of the admin's original note.

**Payroll is read-only for employees by construction** — there is no
`PUT /payroll/me` route to defend.

---

## Checks

```bash
cd backend  && uv run python -m app.security   # hashing + token-type self-check
cd frontend && npx tsc --noEmit && npx eslint src && npm run build
```

## Known gaps

- **Email verification is stubbed.** Accounts are created `is_verified=True`.
  `POST /auth/request-verification` is the placeholder; flipping the default to
  `False` and gating login is the remaining work.
- **No migrations.** The app calls `create_all` on startup. Add Alembic before
  the data needs to survive a schema change.
- **Refresh tokens are not revocable.** There is no server-side token store, so
  a logout clears the client only. Fine for a demo, not for production.
- **Analytics is three counts.** Charts and trends would go here next.
- **The showcase and the real app are not connected.** The Vite portal at the
  repo root mocks its own state, so a change made there does not reach the
  database. Demo the flows from `frontend/` if you want them to be real.
- **History carries a deleted `node_modules`.** An early commit tracked
  `odoo/node_modules` (2267 files). The directory is gone from the tree, but the
  blobs remain in history, so `.git` stays around 21 MB until someone rewrites it.
