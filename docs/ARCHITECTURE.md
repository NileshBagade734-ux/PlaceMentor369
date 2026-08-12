# PlaceMentor369 — System Architecture & Technical Specifications

Welcome to the comprehensive technical documentation for **PlaceMentor369**, an AI-driven placement management and ATS-powered candidate evaluation ecosystem designed for educational institutions, students, and recruiters.

---

## 🏛️ System Overview

PlaceMentor369 is built with a decoupled architecture featuring an Express backend REST API, MongoDB document storage, BullMQ Redis-backed async task queues, Socket.io real-time notifications, and dual frontends (Tailwind/HTML5 traditional client and React modern dashboard).

For detailed API definitions and deployment instructions, refer to:
- 📖 [API REST Endpoint Specification](API_SPECIFICATION.md)
- 🚀 [Production Deployment Runbook](DEPLOYMENT_GUIDE.md)

```mermaid
graph TD
    Client[Frontend Clients - Student / Recruiter / Admin] -->|HTTPS REST API| API Gateway[Express.js Server]
    Client -->|WebSocket| SocketServer[Socket.io Real-Time Server]
    API Gateway -->|Authentication| AuthMiddleware[JWT Auth & RBAC Middleware]
    API Gateway -->|CRUD & Queries| DB[(MongoDB + Mongoose)]
    API Gateway -->|Task Delegation| Queue[BullMQ Task Queue]
    Queue -->|Process Jobs| Worker[AI Task Worker / Gemini Service]
    Worker -->|Push Status| SocketServer
    Worker -->|Update Results| DB
```

---

## 📂 Repository Structure

```
PlaceMentor369/
├── backend/
│   ├── config/             # Database & Redis configuration
│   │   ├── db.js           # Mongoose MongoDB connection
│   │   └── redis.js        # IORedis client configuration
│   ├── controllers/        # Express route business logic
│   │   ├── adminController.js
│   │   ├── analyticsController.js
│   │   ├── authController.js
│   │   ├── recruiterController.js
│   │   └── studentController.js
│   ├── middlewares/        # Custom Express middlewares
│   │   ├── authMiddleware.js      # JWT verification & token parsing
│   │   ├── errorHandler.js        # Global error handling & Mongo error classification
│   │   ├── rateLimiter.js         # API rate limiting
│   │   ├── roleMiddleware.js       # Role-based access control (student, recruiter, admin)
│   │   └── validationMiddleware.js # Input validation helpers
│   ├── models/             # Mongoose Schemas & Data Models
│   │   ├── application.js
│   │   ├── job.js
│   │   ├── notification.js
│   │   ├── student.js
│   │   └── user.js
│   ├── routes/             # Express API Endpoints
│   │   ├── adminRoutes.js
│   │   ├── authRoutes.js
│   │   ├── jobRoutes.js
│   │   ├── recruiterRoutes.js
│   │   └── studentRoutes.js
│   ├── services/           # External service integration (AI, Email, PDF)
│   │   ├── aiService.js           # Google Gemini AI Integration
│   │   └── aiWorker.js            # BullMQ AI Resume processing worker
│   ├── utils/              # Helper utilities
│   │   ├── exporter.js            # CSV / JSON data exporter
│   │   ├── pdfParser.js           # PDF text extraction
│   │   ├── profileValidator.js    # Student profile validation
│   │   └── recommendationEngine.js# Match scoring engine
│   └── server.js           # HTTP & Socket.io server bootstrap
├── docs/
│   └── ARCHITECTURE.md     # Architecture & API Reference
└── frontend/               # Web Application Frontends
```

---

## 🔒 Authentication & Role-Based Access Control (RBAC)

PlaceMentor369 uses JSON Web Tokens (JWT) for stateless authentication. Each request to a protected endpoint must include an `Authorization` header containing a valid Bearer token.

### Roles & Permissions Matrix

| Endpoint Namespace | Allowed Roles | Access Level |
|---|---|---|
| `/api/auth/*` | Public | Authentication (Login/Register) |
| `/api/student/*` | Student | Profile, Applications, AI ATS Evaluation, Skill Gap |
| `/api/recruiter/*` | Recruiter | Job Posting, Applicant Kanban, Bulk Export |
| `/api/admin/*` | Admin | Student Verification, Placement Analytics, Job Approval |

---

## 📡 Complete REST API Reference

### 1. Auth Endpoints (`/api/auth`)
- **`POST /api/auth/register`** — Register a new student or recruiter user.
- **`POST /api/auth/login`** — Authenticate user credentials and return JWT token.

### 2. Student Endpoints (`/api/student`)
- **`GET /api/student/profile`** — Fetch current logged-in student profile.
- **`PATCH /api/student/profile`** — Update student profile (academics, skills, social links, portfolio projects).
- **`GET /api/student/jobs`** — List all approved placement job drives.
- **`POST /api/student/apply/:jobId`** — Submit job application with candidate resume.
- **`GET /api/student/applications`** — List student's application history and status.
- **`GET /api/student/skill-gap/:jobId`** — Compute AI-driven skill gap score against job requirements.
- **`GET /api/student/ats-dashboard`** — Fetch ATS evaluation metrics and feedback history.
- **`POST /api/student/upload-resume`** — Upload resume PDF for async BullMQ processing & Gemini AI ATS analysis.

### 3. Recruiter Endpoints (`/api/recruiter`)
- **`GET /api/recruiter/dashboard`** — Recruiter dashboard metrics (jobs posted, candidate counts).
- **`POST /api/recruiter/jobs`** — Post a new job placement drive.
- **`GET /api/recruiter/jobs`** — Fetch jobs created by logged-in recruiter.
- **`DELETE /api/recruiter/jobs/:id`** — Remove a job post.
- **`GET /api/recruiter/applications`** — Fetch candidate applications across posted jobs.
- **`GET /api/recruiter/applications/export`** — Export applicant list to CSV format.
- **`PATCH /api/recruiter/applications/status`** — Bulk/single update applicant Kanban pipeline status (`Applied`, `Screening`, `Interviewing`, `Offered`, `Rejected`).

### 4. Admin Endpoints (`/api/admin`)
- **`GET /api/admin/dashboard`** — High-level platform statistics.
- **`GET /api/admin/analytics`** — Deep placement analytics and department metrics.
- **`GET /api/admin/analytics/placement-metrics`** — Aggregated placement trends and company performance.
- **`GET /api/admin/students`** — List all registered students for verification.
- **`PATCH /api/admin/students/:id/verify`** — Mark student account as verified.
- **`PATCH /api/admin/students/:id/reject`** — Reject student verification status.
- **`GET /api/admin/jobs`** — List pending job postings requiring admin review.
- **`PATCH /api/admin/jobs/:id/approve`** — Approve job posting for student visibility.
- **`DELETE /api/admin/jobs/:id`** — Remove non-compliant job postings.

---

## ⚡ Background Tasks & Async Workflows

Expensive operations like PDF extraction and Google Gemini AI ATS evaluations are offloaded to **BullMQ** worker queues backed by Redis to ensure sub-100ms API response times.

1. **Upload Trigger**: Student submits resume PDF via `/api/student/upload-resume`.
2. **Queueing**: The API controller enqueues a job into BullMQ and immediately responds to the client.
3. **Worker Processing**: `aiWorker.js` picks up the job, extracts text via `pdfParser.js`, and requests evaluation from `aiService.js`.
4. **Socket Notification**: Upon completion, a Socket.io event `ai-completed` is emitted directly to the student's active browser socket.

---

## 🛡️ Error Handling Architecture

The backend implements a centralized error handling architecture (`middlewares/errorHandler.js`):
- **`AppError`**: Custom error class with status code and operational error flags.
- **MongoDB Error Classification**:
  - `CastError` ➔ HTTP 400 (`INVALID_FIELD`)
  - `11000 Duplicate Key` ➔ HTTP 409 (`DUPLICATE_ENTRY`)
  - `ValidationError` ➔ HTTP 422 (`VALIDATION_ERROR`)
- **JWT Errors**: Automatic conversion of expired or corrupted tokens to HTTP 401 with standard JSON structure.
- **404 Catch-All**: Standardized JSON fallback for unmapped routes.
