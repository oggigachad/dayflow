# 🌊 Dayflow — Modern Human Resource Management System

<div align="center">

<p align="center">
  <strong>Every workday, perfectly aligned.</strong>
</p>

<p align="center">
  A high-performance, enterprise-grade HRMS designed to unify workforce management, smart attendance tracking, leave lifecycle orchestration, automated payroll processing, and real-time organizational analytics.
</p>

[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688.svg?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18.3-61DAFB.svg?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791.svg?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org)
[![Python](https://img.shields.io/badge/Python-3.12+-3776AB.svg?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4-646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED.svg?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)](LICENSE)

[Key Features](#-key-features) • [System Architecture](#-system-architecture) • [Workflows & Sequence](#-core-workflows) • [Data Model](#-data-model--er-diagram) • [API Reference](#-api-specification) • [Quickstart](#-getting-started)

---

</div>

## 📌 Executive Overview

Modern organizations struggle with fragmented HR tooling: attendance is tracked on spreadsheets, leave approvals get buried in email threads, and payroll calculations require error-prone manual reconciliation.

**Dayflow** consolidates the entire employee lifecycle into an intuitive, ultra-responsive digital ecosystem:
- **Zero-Friction Self-Service**: Employees can check in/out with 1-click, request leaves with automatic validation, inspect compensation structures, and download certified payslips.
- **Unified HR Command Center**: HR leaders and administrators gain full visibility over team availability, instant approval queues, automated batch payroll execution, and live headcount metrics.
- **Enterprise-Ready Foundation**: Built with asynchronous Python (FastAPI), strict relational modeling (PostgreSQL + SQLAlchemy 2.0), cryptographic token rotation (JWT + Bcrypt), and component-driven React architecture.

---

## ✨ Key Features

### 👔 For HR Officers & Administrators
- **Executive Analytics Dashboard**: Live metrics for total headcount, real-time presence rate, on-leave employees, and pending approval queues.
- **Workforce Directory & Profile Control**: Centralized repository of employee profiles, departments, job titles, manager hierarchies, and emergency contacts.
- **Leave Request Resolution Engine**: Instant approval/rejection workflows with administrative comments and automated employee notification triggers.
- **Automated Payroll Engine**: Configurable base salary, allowances, and statutory deductions with instant 1-click batch disbursement processing.
- **Company-Wide Attendance Matrix**: Daily and weekly drill-down views covering all staff members with status categorization (*Present*, *Absent*, *Half-day*, *On Leave*).

### 👨‍💻 For Employees
- **Self-Service Check-In / Check-Out**: Real-time daily attendance punch with automated timestamping and status calculation.
- **Leave Application Center**: Comprehensive multi-type leave bookings (*Paid*, *Sick*, *Unpaid*) with calendar pickers and instant status updates.
- **Transparent Payroll & Payslips**: Real-time view of earnings breakdown (Gross, Allowances, Deductions, Net Pay) with on-demand CSV payslip export.
- **Personal Profile & Vault**: Editable contact information, emergency contacts, employment data, and digital document repository.

---

## 🏗️ System Architecture

Dayflow is built following a clean layered architecture that separates presentation, API routing, domain business logic, and relational persistence.

```mermaid
flowchart TB
    subgraph ClientTier["Client Tier (Browser / Frontend)"]
        UI["React 18 SPA (Vite Engine)"]
        State["React Context & State Management"]
        Anime["Motion Engine (Anime.js / GSAP)"]
        UI --> State
        UI --> Anime
    end

    subgraph GatewayTier["API Gateway & Security Layer"]
        CORS["CORS Middleware"]
        AuthMid["JWT Bearer Authentication & Claims Parser"]
        RBAC["Role-Based Access Guard (Admin vs Employee)"]
    end

    subgraph ServiceTier["Backend Application Services (FastAPI ASGI)"]
        AuthSvc["Auth Service\n(Signup, Login, Token Rotation)"]
        ProfileSvc["Profile & Employee Service"]
        AttendanceSvc["Attendance Engine"]
        LeaveSvc["Leave Approval Workflow"]
        PayrollSvc["Payroll & Batch Disbursement"]
        AnalyticsSvc["Live KPI Analytics Engine"]
        DocSvc["Document Vault & Notifications"]
    end

    subgraph DataTier["Data Persistence Tier"]
        ORM["SQLAlchemy 2.0 ORM & Connection Pool"]
        DB[(PostgreSQL 16 Engine\nRelational Database)]
    end

    ClientTier -->|HTTP / REST + JSON| CORS
    CORS --> AuthMid
    AuthMid --> RBAC
    RBAC --> ServiceTier
    ServiceTier --> ORM
    ORM --> DB
```

---

## 🔄 Core Workflows

### 1. Leave Application & Approval Lifecycle

```mermaid
sequenceDiagram
    autonumber
    actor Employee as 👨‍💼 Employee
    participant Client as 🖥️ Dayflow Portal
    participant API as ⚡ FastAPI Backend
    participant DB as 🗄️ PostgreSQL
    actor Admin as 👔 HR Admin

    Employee->>Client: Select Leave Type, Date Range & Remarks
    Client->>API: POST /leave (JWT Authenticated)
    API->>DB: INSERT into leave_requests (status: PENDING)
    API-->>Client: 201 Created (Leave Request Registered)
    
    Admin->>Client: Opens Admin Approval Dashboard
    Client->>API: GET /leave/all
    API->>DB: SELECT * FROM leave_requests WHERE status = 'pending'
    API-->>Client: Return Pending Leave Queue
    
    Admin->>Client: Review & Click "Approve" (w/ optional comment)
    Client->>API: PUT /leave/{id}/status (status: APPROVED)
    API->>DB: UPDATE leave_requests SET status = 'approved'
    API->>DB: INSERT into notifications (user_id, message)
    API-->>Client: 200 OK (Workflow Synchronized)
    
    Employee->>Client: Refreshes Dashboard / Receives Notification
    Client-->>Employee: Displays Approved Leave Status & Updated Balance
```

### 2. Secure Authentication & Token Rotation Flow

```mermaid
sequenceDiagram
    autonumber
    actor User as 👤 User
    participant App as 🖥️ Frontend Client
    participant Auth as 🔒 Auth API (/auth)
    participant Store as 🗄️ Database

    User->>App: Submits Email & Password
    App->>Auth: POST /auth/login
    Auth->>Store: Lookup User & Verify Bcrypt Hash
    Store-->>Auth: User Record Validated
    Auth-->>App: Return TokenPair { access_token, refresh_token }
    App->>App: Store JWT Session securely in Storage

    Note over App,Auth: Access Token Expired (Short-lived)
    App->>Auth: POST /auth/refresh { refresh_token }
    Auth->>Auth: Decode & Verify Refresh Token Claims
    Auth-->>App: Return New TokenPair (Full Token Rotation)
```

---

## 📊 Data Model & ER Diagram

The database schema is normalized with strict foreign key constraints, cascading deletions, and indexed lookups for rapid querying.

```mermaid
erDiagram
    USERS ||--|| PROFILES : "has one"
    USERS ||--o| SALARY_STRUCTURES : "has one"
    USERS ||--o{ ATTENDANCE : "logs daily"
    USERS ||--o{ LEAVE_REQUESTS : "submits"
    USERS ||--o{ DOCUMENTS : "owns"
    USERS ||--o{ NOTIFICATIONS : "receives"

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
        int user_id FK,UK "1-to-1"
        string full_name
        string phone
        string address
        string job_title
        string department
        date date_joined
        date date_of_birth
        string work_location
        string employment_type
        string employment_status
    }

    SALARY_STRUCTURES {
        int id PK
        int user_id FK,UK "1-to-1"
        numeric base_salary
        jsonb allowances
        jsonb deductions
        date effective_date
    }

    ATTENDANCE {
        int id PK
        int user_id FK
        date date "Index"
        datetime check_in
        datetime check_out
        enum status "present | absent | half_day | leave"
    }

    LEAVE_REQUESTS {
        int id PK
        int user_id FK
        enum leave_type "paid | sick | unpaid"
        date start_date
        date end_date
        string remarks
        enum status "pending | approved | rejected"
        string admin_comment
        datetime created_at
    }

    DOCUMENTS {
        int id PK
        int user_id FK
        string document_type
        string file_name
        string file_size
        datetime created_at
    }

    NOTIFICATIONS {
        int id PK
        int user_id FK "nullable for broadcast"
        string title
        string message
        string type "info | alert | success"
        datetime created_at
    }
```

---

## 🛠️ Technology Stack

| Domain | Technology | Purpose & Implementation |
| :--- | :--- | :--- |
| **Frontend Framework** | **React 18 (Vite)** | Reactive single-page application with modular portal components |
| **UI Styling & Animation** | **Custom CSS Tokens, Anime.js, GSAP** | Fluid animations, glassmorphic cards, responsive dark-mode styling |
| **Backend Framework** | **FastAPI (Python 3.12+)** | Asynchronous, auto-documenting OpenAPI REST engine |
| **ORM & Database Tooling**| **SQLAlchemy 2.0 + Psycopg3** | Declarative relational mapping with schema auto-initialization |
| **Database** | **PostgreSQL 16 (Alpine)** | ACID-compliant relational storage with JSONB dynamic pay structures |
| **Security & Auth** | **PyJWT + Passlib / Bcrypt** | Cryptographic hash verification, dual-token access/refresh lifecycle |
| **Containerization** | **Docker & Docker Compose** | Reproducible multi-environment database container orchestration |

---

## 📡 API Specification

The API is fully documented via interactive Swagger UI at `http://localhost:8000/docs`.

### Authentication & Identification (`/auth`)
| Method | Endpoint | Description | Access Level |
| :--- | :--- | :--- | :--- |
| `POST` | `/auth/signup` | Register new employee / admin profile | Public |
| `POST` | `/auth/login` | Authenticate and obtain JWT token pair | Public |
| `POST` | `/auth/refresh` | Rotate access and refresh tokens | Public |
| `GET` | `/auth/me` | Retrieve currently authenticated user context | Authenticated |

### Profile & Employee Management (`/profile`, `/employees`)
| Method | Endpoint | Description | Access Level |
| :--- | :--- | :--- | :--- |
| `GET` | `/profile/me` | Fetch detailed personal profile | Authenticated |
| `PUT` | `/profile/me` | Update phone, address, and profile details | Authenticated |
| `GET` | `/employees` | List all registered staff with profiles | Admin Only |
| `GET` | `/employees/{id}` | Inspect specific employee 360° record | Admin Only |

### Smart Attendance (`/attendance`)
| Method | Endpoint | Description | Access Level |
| :--- | :--- | :--- | :--- |
| `POST` | `/attendance/check-in` | Record employee daily check-in | Employee |
| `POST` | `/attendance/check-out` | Record employee check-out timestamp | Employee |
| `GET` | `/attendance/my` | View personal attendance history & log | Employee |
| `GET` | `/attendance/all` | Query organization-wide attendance records | Admin Only |

### Leave & Time-Off Lifecycle (`/leave`)
| Method | Endpoint | Description | Access Level |
| :--- | :--- | :--- | :--- |
| `POST` | `/leave` | Submit a new time-off request | Employee |
| `GET` | `/leave/my` | List employee's personal leave requests | Employee |
| `GET` | `/leave/all` | Inspect all pending and past leave applications | Admin Only |
| `PUT` | `/leave/{id}/status` | Approve or reject request with audit comment | Admin Only |

### Payroll & Compensation Engine (`/payroll`, `/analytics`)
| Method | Endpoint | Description | Access Level |
| :--- | :--- | :--- | :--- |
| `GET` | `/payroll/me` | View personal salary structure and net pay | Employee |
| `GET` | `/payroll/{user_id}` | Inspect employee compensation breakdown | Admin Only |
| `PUT` | `/payroll/{user_id}` | Adjust base salary, allowances, and deductions | Admin Only |
| `POST`| `/payroll/batch-process` | Execute full payroll disbursement run | Admin Only |
| `GET` | `/payroll/{id}/payslip-download`| Generate and download official payslip | Authenticated |
| `GET` | `/analytics/summary` | Real-time counts (headcount, present, on leave)| Admin Only |

---

## 🚀 Getting Started

### Prerequisites
- **Python 3.12+** ([Install Python](https://www.python.org/downloads/))
- **Node.js 18+ & npm** ([Install Node.js](https://nodejs.org/))
- **Docker & Docker Compose** ([Install Docker Desktop](https://www.docker.com/products/docker-desktop/))

---

### Step 1: Clone & Configure Environment

```bash
git clone https://github.com/your-org/dayflow-hrms.git
cd dayflow-hrms
```

#### Backend Environment (`backend/.env`)
Create `backend/.env` (or copy from `backend/.env.example`):
```env
DATABASE_URL=postgresql+psycopg://postgres:postgres@localhost:5432/dayflow
JWT_SECRET_KEY=change-this-to-a-super-secret-key-min-32-chars-long
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

---

### Step 2: Start PostgreSQL Database

Launch the containerized PostgreSQL database using Docker Compose:

```bash
docker compose up -d
```

Verify that the database is healthy:
```bash
docker compose ps
```

---

### Step 3: Run the FastAPI Backend

Open a terminal in the `backend` folder:

```bash
cd backend

# Install dependencies (using pip or uv)
pip install -e .
# or: uv sync

# Start the development server with live reload
uvicorn app.main:app --reload --port 8000
```

> 💡 **API Healthcheck**: Verify backend status by visiting `http://localhost:8000/health` (Returns `{"status": "ok"}`).  
> 📖 **Interactive API Docs**: Explore all endpoints at `http://localhost:8000/docs`.

---

### Step 4: Run the React Frontend

Open a new terminal in the `frontend` folder:

```bash
cd frontend

# Install Node modules
npm install

# Start the Vite development server
npm run dev
```

Visit **`http://localhost:5173`** in your browser to launch the Dayflow Portal!

---

## 🔒 Role-Based Access Control (RBAC) Matrix

Dayflow enforces strict multi-tenant boundary checks across all endpoints and UI views:

| Feature / Module | 👨‍💼 Regular Employee | 👔 HR Officer / Admin |
| :--- | :---: | :---: |
| Self Check-In / Check-Out | ✅ | ✅ |
| View Personal Attendance Log | ✅ | ✅ |
| View All Employees' Attendance | ❌ *(403 Forbidden)* | ✅ |
| Submit Leave Request | ✅ | ✅ |
| Approve / Reject Leave Requests | ❌ *(403 Forbidden)* | ✅ |
| View Personal Salary Breakdown | ✅ *(Read Only)* | ✅ |
| Modify Salary & Deductions | ❌ *(403 Forbidden)* | ✅ |
| Batch Process Payroll Run | ❌ *(403 Forbidden)* | ✅ |
| View Organization Live Analytics | ❌ *(403 Forbidden)* | ✅ |
| Access Global Employee Directory | ❌ | ✅ |

---

## 🔮 Roadmap & Future Horizons

- [ ] **AI-Powered Attendance Insights**: Anomaly detection for recurring absenteeism patterns and overtime forecasting.
- [ ] **Automated Multi-Tier Leave Escalations**: Multi-level managerial approval hierarchies for enterprise organizations.
- [ ] **Direct Payment Gateway Integration**: Automated direct-deposit bank transfers via Stripe / Razorpay Payroll APIs.
- [ ] **Slack & Microsoft Teams Bot**: Clock in/out and review pending leave approvals directly inside chat channels.
- [ ] **Biometric & Geo-fencing Integration**: Mobile GPS check-in verification for field and hybrid workforces.

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

<div align="center">
  <sub>Built with precision and care for high-performing teams.</sub>
</div>
