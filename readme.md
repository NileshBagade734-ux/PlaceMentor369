# PlacementorAI - Full-Stack Placement Management System

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE.md)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-brightgreen.svg)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-4.4%2B-green.svg)](https://www.mongodb.com/)
[![Express.js](https://img.shields.io/badge/Express-5.x-lightgrey.svg)](https://expressjs.com/)

PlacementorAI is a role-based placement management platform designed to simplify campus recruitment workflows using a clean architecture and AI-guided assistance.
The system clearly separates **Students, Recruiters, and Admins** to ensure security, transparency, and real-world usability.

---

## Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/KGFCH2/PlaceMentor369.git
cd PlaceMentor369

# 2. Set up environment variables
cp backend/.env.example backend/.env
# Edit backend/.env with your MongoDB connection string and JWT secret

# 3. Install dependencies
npm install
cd backend && npm install && cd ..

# 4. Start the backend server
cd backend
npm run dev
```

The backend runs on `http://localhost:5000`.

---

## Project Overview

PlacementorAI helps educational institutions and recruiters manage placements efficiently by:

- Showing students only **eligible and approved jobs**
- Allowing recruiters to **manage applicants fairly**
- Giving admins **complete control and oversight**
- Using AI only for **guidance**, not decision-making

---

## User Roles & Responsibilities

### Student

- Register & login securely
- Create and manage profile (CGPA, branch, skills, resume)
- View approved & eligible jobs
- Apply to jobs (creates application records)
- Track application status (read-only)
- Get AI guidance for:
  - Resume improvement
  - Interview preparation
  - Career and skill advice

> Students cannot update or delete applications.

### Recruiter

- Register & login
- Post job openings
- View applicants for their jobs
- Update application status (Shortlisted / Rejected)
- Follow best hiring practices with AI guidance

> Recruiters cannot apply to jobs.

### Admin

- Login via platform-provided credentials
- Verify students and recruiters
- Approve or reject job postings
- Monitor platform-wide metrics and statistics
- Maintain governance and platform integrity

> Admins cannot create or update applications.

---

## Core System Rule

> **Students create applications**
> **Recruiters update application status**
> **Admins only observe and approve**

This strict separation avoids bugs, conflicts, and unauthorized actions.

---

## AI Usage & Governance

- AI is **advisory only**
- AI never:
  - Logs users in
  - Stores credentials
  - Applies to jobs
  - Shortlists or rejects candidates
- All decisions are **human-driven**
- AI explains workflows in simple language

---

## Tech Stack

### Frontend

| Technology | Purpose |
|------------|---------|
| HTML5 | Semantic markup |
| CSS3 | Styling with custom properties |
| JavaScript (ES6+) | Interactive logic |
| Tailwind CSS | Utility-first styling |
| Lucide Icons | Modern icon set |
| GSAP | Animations |

### Backend

| Technology | Purpose |
|------------|---------|
| Node.js | Runtime environment |
| Express.js 5.x | Web framework |
| MongoDB | Database |
| Mongoose | ODM for MongoDB |
| JWT | Authentication |
| bcryptjs | Password hashing |
| express-validator | Input validation |

---

## Project Structure

```
PlaceMentor369/
├── backend/
│   ├── config/          # Database & environment config
│   ├── controllers/     # Request handlers
│   ├── middlewares/     # Auth, validation, error handling
│   ├── models/          # Mongoose schemas
│   ├── routes/          # API route definitions
│   ├── utils/           # Helper functions
│   ├── server.js        # Express app entry point
│   └── seed.js          # Database seeder
├── frontend/
│   ├── admin/           # Admin dashboard pages
│   ├── recruiter/       # Recruiter dashboard pages
│   ├── student/         # Student dashboard pages
│   ├── css/             # Stylesheets
│   ├── js/              # JavaScript modules
│   ├── utils/           # Shared frontend utilities
│   ├── index.html       # Landing page
│   ├── login.html       # Login page
│   └── register.html    # Registration page
├── SECURITY.md          # Security policy
├── Contributing.md      # Contribution guidelines
└── readme.md            # Project documentation
```

---

## Environment Variables

Create a `.env` file in the `backend/` directory:

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Server port | `5000` |
| `MONGO_URI` | MongoDB connection string | `mongodb://localhost:27017/placementorai` |
| `JWT_SECRET` | Secret key for JWT signing | `your-secret-key` |
| `FRONTEND_URL` | Allowed CORS origin | `http://localhost:5500` |
| `NODE_ENV` | Environment mode | `development` |

> Copy `backend/.env.example` to get started: `cp backend/.env.example backend/.env`

---

## API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login with credentials |

### Student (Protected)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/student/profile` | Get student profile |
| PUT | `/api/student/profile` | Update student profile |
| GET | `/api/student/jobs` | Get eligible jobs |
| GET | `/api/student/applications` | Get applications |
| POST | `/api/student/apply` | Apply to a job |

### Recruiter (Protected)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/recruiter/jobs` | Create job posting |
| GET | `/api/recruiter/jobs` | Get recruiter's jobs |
| GET | `/api/recruiter/applications` | Get applicants |
| PUT | `/api/recruiter/applications/:id` | Update application status |

### Admin (Protected)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/stats` | Get platform statistics |
| GET | `/api/admin/users` | List all users |
| PUT | `/api/admin/users/:id/verify` | Verify a user |
| GET | `/api/admin/jobs` | List all job postings |
| PUT | `/api/admin/jobs/:id/approve` | Approve/reject a job |

---

## Contributing

We welcome contributions! Please read our [Contributing Guide](Contributing.md) for details on our code of conduct and the process for submitting pull requests.

### Development Workflow

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Make your changes
4. Commit with a descriptive message: `git commit -m "feat: add your feature"`
5. Push to your fork: `git push origin feature/your-feature-name`
6. Open a Pull Request

---

## Security

Please read our [Security Policy](SECURITY.md) for information on how to report security vulnerabilities.

---

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

---

Built with by the PlaceMentor369 Team
