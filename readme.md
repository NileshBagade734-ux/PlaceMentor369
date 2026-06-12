# 🎯 PlacementorAI – Full-Stack Placement Management System

PlacementorAI is a role-based placement management platform designed to simplify campus recruitment workflows using a clean architecture and AI-guided assistance.  
The system clearly separates **Students, Recruiters, and Admins** to ensure security, transparency, and real-world usability.

---

## 🚀 Project Overview

PlacementorAI helps educational institutions and recruiters manage placements efficiently by:

- Showing students only **eligible and approved jobs**
- Allowing recruiters to **manage applicants fairly**
- Giving admins **complete control and oversight**
- Using AI only for **guidance**, not decision-making

---

## 👥 User Roles & Responsibilities

### 🎓 Student
- Register & login securely
- Create and manage profile (CGPA, branch, skills, resume)
- View approved & eligible jobs
- Apply to jobs (creates application records)
- Track application status (read-only)
- Get AI guidance for:
  - Resume improvement
  - Interview preparation
  - Career and skill advice

❌ Students cannot update or delete applications.

---

### 🧑‍💼 Recruiter
- Register & login
- Post job openings
- View applicants for their jobs
- Update application status (Shortlisted / Rejected)
- Follow best hiring practices with AI guidance

❌ Recruiters cannot apply to jobs.

---

### 🛡️ Admin
- Login via platform-provided credentials
- Verify students and recruiters
- Approve or reject job postings
- Monitor platform-wide metrics and statistics
- Maintain governance and platform integrity

❌ Admins cannot create or update applications.

---

## 🔐 Core System Rule

> **Students create applications**  
> **Recruiters update application status**  
> **Admins only observe and approve**

This strict separation avoids bugs, conflicts, and unauthorized actions.

---

## 🤖 AI Usage & Governance

- AI is **advisory only**
- AI never:
  - Logs users in
  - Stores credentials
  - Applies to jobs
  - Shortlists or rejects candidates
- All decisions are **human-driven**
- AI explains workflows in simple language

---

## 🧭 Navigation
- [**File Instructions**](INSTRUCTIONS.md) - Detailed overview of the project structure and file principles.
- [**Contributing**](Contributing.md) - Guidelines for open-source contributions.
- [**Security Policy**](SECURITY.md) - Reporting vulnerabilities.

---

## 🚀 Tech Stack

### Frontend
- HTML, CSS, JavaScript
- Tailwind CSS
- Lucide Icons

### Backend
- Node.js
- Express.js
- MongoDB + Mongoose
- JWT Authentication

---

## 📁 Project Folder Structure

### Backend (Server Side)

```txt
backend/
│
├── config/
│   ├── db.js                    # MongoDB connection
│   └── env.js                   # Environment variables
│
├── models/
│   ├── User.js                  # Base user model
│   ├── Student.js               # Student profile
│   ├── Recruiter.js             # Recruiter profile
│   ├── Job.js                   # Job postings
│   └── Application.js           # Job applications
│
├── controllers/
│   ├── authController.js        # Login & registration
│   ├── adminController.js       # Admin operations
│   ├── recruiterController.js   # Job & applicant management
│   └── studentController.js     # Jobs, applications, profile
│
├── routes/
│   ├── authRoutes.js            # /api/auth/*
│   ├── adminRoutes.js           # /api/admin/*
│   ├── recruiterRoutes.js       # /api/recruiter/*
│   └── studentRoutes.js         # /api/student/*
│
├── middlewares/
│   ├── authMiddleware.js        # JWT verification
│   └── roleMiddleware.js        # Role-based access
│
├── utils/
│   ├── jwt.js                   # Token utilities
│   └── response.js              # Standard API responses
│
├── app.js                       # Express app configuration
└── server.js                    # Server entry point


Frontend (Client Side)

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
│   ├── admin/
│   ├── recruiter/
│   ├── student/
│   ├── auth/
│   └── global.css
│
├── js/
│   ├── admin/
│   ├── recruiter/
│   ├── student/
│   ├── auth/
│   └── utils/api.js             # Common API handler
│
├── index.html                   # Landing page
├── login.html                   # Login page
└── register.html                # Registration page

⚙️ Environment Variables

Create a .env file in the backend root:

MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
PORT=5000


.env and node_modules are included in .gitignore for security.

▶️ Run the Project Locally
# Install backend dependencies
npm install

# Start backend server
npm run dev


Backend runs on:

http://localhost:5000
```
---

## 👥 Contributors

Thanks to all the amazing people who contributed to this project ❤️

<a href="https://github.com/NileshBagade734-ux/PlaceMentor369/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=NileshBagade734-ux/PlaceMentor369" />
</a>


## ⭐ Project Support

<p align="center">
  <a href="https://github.com/NileshBagade734-ux/PlaceMentor369/stargazers">
    <img alt="Stars" src="https://img.shields.io/github/stars/NileshBagade734-ux/PlaceMentor369?style=social">
  </a>

  <a href="https://github.com/NileshBagade734-ux/PlaceMentor369/network/members">
    <img alt="Forks" src="https://img.shields.io/github/forks/NileshBagade734-ux/PlaceMentor369?style=social">
  </a>
</p>
## 🌐 Live Demo
- **Live Site:** https://place-mentor369.vercel.app

