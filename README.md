# 🌊 Dayflow — Modern Human Resource Management System

<div align="center">

<p align="center">
  <strong>Every workday, perfectly aligned.</strong>
</p>

<p align="center">
  A high-performance, judging-optimized HRMS designed to unify workforce management, smart attendance tracking, leave lifecycle orchestration, automated payroll processing, and real-time organizational analytics.
</p>

[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688.svg?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![Next.js](https://img.shields.io/badge/Next.js-16-black.svg?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791.svg?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org)
[![Python](https://img.shields.io/badge/Python-3.12+-3776AB.svg?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6.svg?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED.svg?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)

[Judging Criteria](#-judging-criteria-alignment) • [System Architecture](#-system-architecture) • [Three-Layer Validation](#-three-layer-validation-architecture) • [Workflows & Sequence](#-core-workflows) • [Data Model](#-data-model--er-diagram) • [Quickstart](#-getting-started) • [Judge Pitch Hooks](#-judge-talk-tracks-30-second-hooks)

---

</div>

## 🏆 Judging Criteria Alignment

| Criterion | Architectural Decision in Dayflow | How to Verify Live |
|---|---|---|
| **Database Design** | Normalized schema, `UNIQUE(user_id, date)` on attendance, `salary_structures` as a historical audit table (never overwritten), partial indexes, `CHECK` constraints, dedicated `audit_log` table. | Inspect `backend/app/models.py` |
| **Security** | Bcrypt password hashing, JWT with strict `type` claims, server-side RBAC dependencies (`require_admin`), rate limiting on `/auth/login`, parameterized queries (no raw SQL), strict schema boundaries (`extra="forbid"`). | Run `uv run python -m app.security` |
| **Robust Validation** | **Three-layer validation**: Postgres DB Constraints → Pydantic v2 model & cross-field validators → Zod client-side schemas. | Review `backend/app/schemas.py` & `frontend/src/lib/validators.ts` |
| **Modularity & Logic** | Thin route handlers delegating to independent, unit-testable service modules (`app/services/*`). Business logic isolated from HTTP/FastAPI framework. | Inspect `backend/app/services/` |
| **Frontend Design** | Clean neutral palette with single accent color, consistent 8px spacing, color-coded badges, skeleton loaders, and intuitive role-separated navigation. | Run `npm run dev` in `frontend/` |
| **Scalability & Performance** | Stateless JWT architecture (horizontal scaling without session stickiness), pagination on all collections, partial index on pending leave requests (`idx_leave_status_pending`), SQLAlchemy `joinedload` to prevent N+1 queries. | Check partial indexes in `models.py` |
| **Testing & CI/CD** | Automated pytest suite testing against PostgreSQL service container in GitHub Actions (`.github/workflows/ci.yml`), plus pre-push git hook. | Run `uv run pytest` in `backend/` |
| **Debugging & Observability** | Structured JSON logging with `request_id` correlation, global exception handler returning consistent `{detail, code}` payload, fullstack `healthcheck.py` tool. | Run `python3 scripts/healthcheck.py` |

---

## 🏗️ System Architecture

Dayflow is built following a clean layered architecture that separates presentation, API routing, domain business logic, and relational persistence.

```mermaid
flowchart TB
    subgraph ClientTier["Client Tier (Frontend / Next.js 16)"]
        UI["Next.js App Router (TypeScript + Tailwind v4)"]
        Zod["Zod Validation Layer"]
        Hooks["useApi Hook (Auto-Refetch on Focus)"]
        UI --> Zod
        UI --> Hooks
    end

    subgraph GatewayTier["API Gateway & Security Layer"]
        CORS["CORS Middleware"]
        AuthMid["JWT Bearer Authentication & Claims Parser"]
        RBAC["Role-Based Access Guard (require_admin)"]
        RateLimit["In-Memory Sliding Window Rate Limiter"]
    end

    subgraph ServiceTier["Domain Services Layer (Pure Business Logic)"]
        AuthSvc["Auth Service\n(Signup, Login, Token Issue)"]
        ProfileSvc["Profile Service\n(Self vs Admin Boundaries)"]
        AttendanceSvc["Attendance Engine\n(Check-in/out, Duplicate Guard)"]
        LeaveSvc["Leave Service\n(Apply, Decision, Partial Index Query)"]
        PayrollSvc["Payroll Engine\n(Historical Salary, Calculation)"]
        AuditSvc["Audit Logging Engine"]
    end

    subgraph DataTier["Data Persistence Tier (PostgreSQL 16)"]
        ORM["SQLAlchemy 2.0 (Joinedload, Connection Pool)"]
        DB[(PostgreSQL 16 Engine\nConstraints, Indexes, Triggers)]
    end

    ClientTier -->|HTTP / REST + JSON| CORS
    CORS --> RateLimit
    RateLimit --> AuthMid
    AuthMid --> RBAC
    RBAC --> ServiceTier
    ServiceTier --> AuditSvc
    ServiceTier --> ORM
    ORM --> DB
```

---

## 🔒 Three-Layer Validation Architecture

Dayflow enforces input validation across three independent layers that strictly agree with each other:

```
[User Input] 
     │
     ▼
┌───────────────────────────────────────────────────────────┐
│ 1. Frontend Layer (Zod in TypeScript)                     │
│    Instant client-side feedback before network dispatch   │
│    (e.g., end_date >= start_date, password complexity)   │
└────────────────────────────┬──────────────────────────────┘
                             │
                             ▼
┌───────────────────────────────────────────────────────────┐
│ 2. API Layer (Pydantic v2 Models)                         │
│    Schema-level security & cross-field model validators   │
│    (extra="forbid" on profile update, non-negative money)│
└────────────────────────────┬──────────────────────────────┘
                             │
                             ▼
┌───────────────────────────────────────────────────────────┐
│ 3. Database Layer (PostgreSQL 16 Engine)                 │
│    Unbypassable constraints enforced at storage layer:    │
│    - UNIQUE(user_id, date) on attendance                  │
│    - CHECK(end_date >= start_date) on leave requests      │
│    - CHECK(check_out IS NULL OR check_out > check_in)     │
│    - UNIQUE(user_id, effective_date) on salary history    │
└───────────────────────────────────────────────────────────┘
```

---

## 🔄 Core Workflows

### 1. Leave Application & Approval Lifecycle

```mermaid
sequenceDiagram
    autonumber
    actor Employee as 👨‍💼 Employee
    participant Client as 🖥️ Dayflow Portal (Next.js)
    participant API as ⚡ FastAPI Backend
    participant Audit as 📜 Audit Log
    participant DB as 🗄️ PostgreSQL
    actor Admin as 👔 HR Admin

    Employee->>Client: Select Leave Type, Date Range & Remarks
    Client->>Client: Zod Schema Validation (end >= start)
    Client->>API: POST /leave (JWT Bearer)
    API->>API: Pydantic v2 Range Validation
    API->>DB: INSERT into leave_requests (status: PENDING)
    API->>Audit: Log action "leave.apply"
    API-->>Client: 201 Created (Leave Request Registered)
    
    Admin->>Client: Opens Admin Approval Dashboard
    Client->>API: GET /leave?status=pending
    Note over API,DB: Hits Partial Index: idx_leave_status_pending
    API->>DB: SELECT * FROM leave_requests WHERE status = 'pending'
    API-->>Client: Return Pending Leave Queue
    
    Admin->>Client: Review & Click "Approve" (w/ comment)
    Client->>API: PATCH /leave/{id} { status: "approved", comment }
    API->>DB: UPDATE leave_requests SET status = 'approved', reviewed_by
    API->>Audit: Log action "leave.approved" with actor_id
    API-->>Client: 200 OK (Decision Settled)
    
    Employee->>Client: Focuses tab / Refetches on Focus
    Client-->>Employee: Badge flips to "Approved" with Admin Note
```

### 2. Secure Authentication & Token Rotation Flow

```mermaid
sequenceDiagram
    autonumber
    actor User as 👤 User
    participant App as 🖥️ Next.js Client
    participant Auth as 🔒 Auth API (/auth)
    participant DB as 🗄️ Database

    User->>App: Submits Email & Password
    App->>Auth: POST /auth/login
    Auth->>Auth: Check In-Memory Rate Limiter (Max 10 / min)
    Auth->>DB: Lookup User & Verify Bcrypt Hash
    DB-->>Auth: User Record Validated
    Auth-->>App: Return TokenPair { access_token (15m), refresh_token (7d) }
    App->>App: Store JWT Session securely

    Note over App,Auth: Access Token Expired
    App->>Auth: POST /auth/refresh { refresh_token }
    Auth->>Auth: Decode & Verify Token Type Claim == "refresh"
    Auth-->>App: Return New TokenPair (Full Token Rotation)
```

---

## 📊 Data Model & ER Diagram

```mermaid
erDiagram
    USERS ||--|| PROFILES : "has one (1:1)"
    USERS ||--o{ SALARY_STRUCTURES : "historical revisions (1:N)"
    USERS ||--o{ ATTENDANCE : "daily punches (1:N)"
    USERS ||--o{ LEAVE_REQUESTS : "submits (1:N)"
    USERS ||--o{ AUDIT_LOG : "triggers actions (1:N)"

    USERS {
        int id PK
        string employee_id UK "Index"
        string email UK "Index"
        string password_hash
        enum role "admin | employee"
        boolean is_verified
        datetime created_at
    }

    PROFILES {
        int id PK
        int user_id FK,UK "1-to-1 Cascade"
        string full_name
        string phone
        string address
        string profile_picture_url
        string job_title
        string department
        date date_joined
    }

    SALARY_STRUCTURES {
        int id PK
        int user_id FK
        numeric base_salary "CHECK >= 0"
        jsonb allowances
        jsonb deductions
        date effective_date "UNIQUE(user_id, effective_date)"
    }

    ATTENDANCE {
        int id PK
        int user_id FK "UNIQUE(user_id, date)"
        date date "Index"
        datetime check_in
        datetime check_out "CHECK > check_in"
        enum status "present | absent | half_day | leave"
    }

    LEAVE_REQUESTS {
        int id PK
        int user_id FK
        enum leave_type "paid | sick | unpaid"
        date start_date
        date end_date "CHECK >= start_date"
        string remarks
        enum status "pending | approved | rejected (Partial Index)"
        int reviewed_by FK
        string admin_comment
        datetime created_at
    }

    AUDIT_LOG {
        int id PK
        int actor_id FK "Index"
        string action "Index"
        string target_table
        int target_id
        jsonb metadata_payload
        datetime created_at
    }
```

---

## 🚀 Getting Started

### Prerequisites
- Python 3.12+ with `uv`
- Node.js 20+ with `npm`
- Docker & Docker Compose (or local PostgreSQL 16)

### 1. Start Database (One Command)
```bash
docker-compose up -d
```

### 2. Backend Setup
```bash
cd backend
cp .env.example .env
uv sync --all-groups
uv run python -m app.seed       # Seeds demo users, attendance history, and leaves
uv run uvicorn app.main:app --reload --port 8000
```
API Documentation: **http://localhost:8000/docs**

### 3. Frontend Setup
```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```
Application URL: **http://localhost:3000**

---

## 👥 Demo Accounts

Password for all accounts: **`dayflow123`** *(One-click login buttons available on the login screen)*.

| Role | Email | Scenario |
|---|---|---|
| **Admin (HR)** | `priya.nair@dayflow.in` | Reviews employee directories, manages payroll, approves/rejects leaves, monitors attendance. |
| **Employee** | `meera.iyer@dayflow.in` | Has **not** checked in today (live "Check In" button), applies for leave. |
| **Employee** | `arjun.rao@dayflow.in` | **Already checked in** today (live "Check Out" button), views salary and attendance history. |
| **Employee** | `rohit.desai@dayflow.in` | Has an approved leave covering today, visible in analytics and calendar. |

---

## 🧪 Testing & Quality Assurance

### Run Unit Tests & Security Self-Check
```bash
# Backend pytest suite (13 tests covering auth, attendance, leave workflow, role boundaries)
cd backend && uv run pytest -v

# Security self-check (validates token typing and password hashing)
cd backend && uv run python -m app.security

# Frontend validation (strict TypeScript check & Next.js production build)
cd frontend && npx tsc --noEmit && npm run build
```

### Full-Stack Automated Health Check
```bash
python3 scripts/healthcheck.py
```
Runs 68 automated checks against the live database, API, RBAC, field boundaries, and the full apply-approve loop end-to-end and outputs a timestamped log to `logs/`.

### Local Pre-Push Git Hook
```bash
cp .githooks/pre-push .git/hooks/pre-push
chmod +x .git/hooks/pre-push
```

---

## 🎤 Judge Talk Tracks (30-Second Hooks)

- **Database Design**: *"Salary is a history table, not an overwrite — every attendance row is DB-constrained to one per user per day, and every leave decision is audit-logged with partial indexes on pending queues."*
- **Security**: *"Role checks happen server-side on every route, refresh tokens live in httpOnly cookies, and passwords are bcrypt-hashed — nothing trusts the frontend."*
- **Validation**: *"Every write passes through three layers — Zod on the frontend, Pydantic on the API, and CHECK constraints in Postgres — so bad data can't get in even if one layer has a bug."*
- **Performance & Scalability**: *"The API is fully stateless — JWT-based, no server sessions — so it scales horizontally behind a load balancer with zero code changes, and queries hit partial indexes to avoid table scans."*
- **Testing & CI**: *"Every push runs the full test suite against a real Postgres service container in GitHub Actions before it can reach main — broken code is structurally blocked from merging."*
