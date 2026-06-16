# 🎯 PlacementorAI – Full-Stack Placement Management System

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE.md)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-brightgreen.svg)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-4.4%2B-green.svg)](https://www.mongodb.com/)
[![Express.js](https://img.shields.io/badge/Express-5.x-lightgrey.svg)](https://expressjs.com/)

PlacementorAI is a role-based placement management platform designed to simplify campus recruitment workflows using a clean architecture and AI-guided assistance.

The system clearly separates **Students, Recruiters, and Admins** to ensure security, transparency, and real-world usability.

---

# 🚀 Project Overview

PlacementorAI helps educational institutions and recruiters manage placements efficiently by:

- Showing students only **eligible and approved jobs**
- Allowing recruiters to **manage applicants fairly**
- Giving admins **complete control and oversight**
- Using AI only for **guidance**, not decision-making

---

# ⚡ Quick Start

```bash
# Clone repository
git clone https://github.com/KGFCH2/PlaceMentor369.git

cd PlaceMentor369

# Install dependencies
npm install

cd backend
npm install

# Create environment file
cp .env.example .env

# Start backend
npm run dev
```

Backend runs on:

```txt
http://localhost:5000
```

---

# 👥 User Roles & Responsibilities

## 🎓 Student

- Register & login securely
- Create and manage profile (CGPA, branch, skills, resume)
- View approved & eligible jobs
- Apply to jobs
- Track application status (read-only)
- Get AI guidance for:
  - Resume improvement
  - Interview preparation
  - Career and skill advice

❌ Students cannot update or delete applications.

---

## 🧑‍💼 Recruiter

- Register & login
- Post job openings
- View applicants for their jobs
- Update application status
  - Shortlisted
  - Rejected
- Follow best hiring practices with AI guidance

❌ Recruiters cannot apply to jobs.

---

## 🛡️ Admin

- Login via platform-provided credentials
- Verify students and recruiters
- Approve or reject job postings
- Monitor platform-wide metrics
- Maintain platform governance

❌ Admins cannot create or update applications.

---

# 🔐 Core System Rule

> Students create applications  
> Recruiters update application status  
> Admins only observe and approve

This strict separation avoids bugs, conflicts, and unauthorized actions.

---

# 🤖 AI Usage & Governance

- AI is advisory only
- AI never:
  - Logs users in
  - Stores credentials
  - Applies to jobs
  - Shortlists candidates
  - Rejects candidates
- All decisions remain human-driven
- AI provides explanations and guidance only

---

# 🛠️ Tech Stack

## Frontend

| Technology | Purpose |
|------------|----------|
| HTML5 | Semantic markup |
| CSS3 | Styling |
| JavaScript (ES6+) | Client-side logic |
| Tailwind CSS | UI styling |
| Lucide Icons | Icons |
| GSAP | Animations |

## Backend

| Technology | Purpose |
|------------|----------|
| Node.js | Runtime |
| Express.js | API framework |
| MongoDB | Database |
| Mongoose | ODM |
| JWT | Authentication |
| bcryptjs | Password hashing |
| express-validator | Validation |
| BullMQ | Background jobs |
| Redis | Queue processing |
| Socket.IO | Real-time notifications |

---

# 📁 Project Folder Structure

## Backend

```txt
backend/
│
├── config/
│   ├── db.js
│   ├── env.js
│   └── redis.js
│
├── controllers/
│   ├── authController.js
│   ├── adminController.js
│   ├── recruiterController.js
│   └── studentController.js
│
├── middlewares/
│   ├── authMiddleware.js
│   ├── roleMiddleware.js
│   ├── errorHandler.js
│   └── errorMiddleware.js
│
├── models/
│   ├── User.js
│   ├── Student.js
│   ├── Recruiter.js
│   ├── Job.js
│   └── Application.js
│
├── routes/
│   ├── authRoutes.js
│   ├── adminRoutes.js
│   ├── recruiterRoutes.js
│   └── studentRoutes.js
│
├── workers/
│   └── aiWorker.js
│
├── utils/
│   ├── jwt.js
│   ├── response.js
│   └── AppError.js
│
├── seed.js
├── app.js
└── server.js
```

## Frontend

```txt
frontend/
│
├── admin/
│   ├── admin-dashboard.html
│   ├── admin-managejob.html
│   └── admin-studentverify.html
│
├── recruiter/
│   ├── recruiter-dashboard.html
│   ├── postjob.html
│   └── manage-applicant.html
│
├── student/
│   ├── student-dashboard.html
│   ├── student-joblist.html
│   ├── student-application.html
│   └── student-profile.html
│
├── css/
├── js/
├── utils/
│
├── index.html
├── login.html
└── register.html
```

---

# ⚙️ Environment Variables

Create a `.env` file inside `backend/`.

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
FRONTEND_URL=http://localhost:5500
NODE_ENV=development
```

Example:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/placementorai
JWT_SECRET=mySuperSecretKey
FRONTEND_URL=http://localhost:5500
NODE_ENV=development
```

---

# 📡 API Endpoints

## Authentication

| Method | Endpoint |
|----------|----------|
| POST | /api/auth/register |
| POST | /api/auth/login |

## Student

| Method | Endpoint |
|----------|----------|
| GET | /api/student/profile |
| PATCH | /api/student/profile |
| GET | /api/student/jobs |
| POST | /api/student/apply/:jobId |
| GET | /api/student/applications |
| POST | /api/student/upload-resume |
| GET | /api/student/skill-gap/:jobId |

## Recruiter

| Method | Endpoint |
|----------|----------|
| POST | /api/recruiter/jobs |
| GET | /api/recruiter/jobs |
| GET | /api/recruiter/applications |
| PATCH | /api/recruiter/applications/:id |

## Admin

| Method | Endpoint |
|----------|----------|
| GET | /api/admin/stats |
| GET | /api/admin/users |
| PATCH | /api/admin/users/:id/verify |
| GET | /api/admin/jobs |
| PATCH | /api/admin/jobs/:id/approve |

---

# 🤝 Contributing

1. Fork the repository
2. Create a branch

```bash
git checkout -b feature/my-feature
```

3. Commit changes

```bash
git commit -m "feat: add new feature"
```

4. Push changes

```bash
git push origin feature/my-feature
```

5. Open a Pull Request

---

# 🔒 Security

- JWT authentication
- Password hashing with bcrypt
- Role-based authorization
- Input validation
- Protected API routes
- Environment variable protection

---

# 📄 License

This project is licensed under the MIT License.

---

## ❤️ Built by PlaceMentor369 Team

Making placement management smarter with AI-assisted workflows.