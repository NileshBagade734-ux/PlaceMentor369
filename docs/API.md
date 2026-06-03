# 📡 PlacementorAI REST API Documentation

All API requests should be sent to the backend base URL (default: `http://localhost:5000/api`).

---

## 🔑 Authentication APIs (`/api/auth`)

### 1. Register User
* **Endpoint**: `POST /auth/register`
* **Request Body**:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "student"
}
```
* **Success Response (201 Created)**:
```json
{
  "token": "eyJhbG...",
  "user": {
    "id": "60a7e...",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "student"
  }
}
```

### 2. Login User
* **Endpoint**: `POST /auth/login`
* **Request Body**:
```json
{
  "email": "john@example.com",
  "password": "password123",
  "role": "student"
}
```
* **Success Response (200 OK)**:
```json
{
  "token": "eyJhbG...",
  "user": {
    "id": "60a7e...",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "student"
  }
}
```

---

## 🎓 Student APIs (`/api/student`)
*Protected by JWT. Requires header: `Authorization: Bearer <token>` and role `student`.*

### 1. Get Profile
* **Endpoint**: `GET /student/profile`
* **Success Response (200 OK)**:
```json
{
  "user": "60a7e...",
  "name": "John Doe",
  "roll": "CS-101",
  "branch": "Computer Science",
  "cgpa": 9.2,
  "college": "State Technical University",
  "skills": ["JavaScript", "Node.js", "React"],
  "resume": "https://example.com/resume.pdf"
}
```

### 2. Save/Update Profile
* **Endpoint**: `POST /student/profile`
* **Request Body**:
```json
{
  "name": "John Doe",
  "roll": "CS-101",
  "branch": "Computer Science",
  "cgpa": 9.2,
  "college": "State Technical University",
  "skills": ["JavaScript", "Node.js", "React"],
  "resume": "https://example.com/resume.pdf"
}
```
* **Success Response (200 OK)**:
```json
{
  "message": "Profile saved successfully",
  "student": { ... }
}
```

### 3. Get Active & Approved Jobs
* **Endpoint**: `GET /student/jobs`
* **Success Response (200 OK)**:
```json
[
  {
    "_id": "60a7e...",
    "title": "Software Engineer Intern",
    "company": "Google",
    "branch": ["Computer Science", "Information Technology"],
    "cgpa": 8.5,
    "deadline": "2026-06-30T00:00:00.000Z",
    "skillsRequired": ["React", "Node.js"],
    "description": "..."
  }
]
```

### 4. Apply for a Job
* **Endpoint**: `POST /student/apply/:jobId`
* **Success Response (201 Created)**:
```json
{
  "success": true,
  "message": "Application sent successfully",
  "application": {
    "_id": "60a8b...",
    "student": "60a7e...",
    "job": "60a7e...",
    "status": "pending"
  }
}
```

### 5. Get My Applications
* **Endpoint**: `GET /student/applications`
* **Success Response (200 OK)**:
```json
[
  {
    "_id": "60a8b...",
    "status": "pending",
    "job": {
      "_id": "60a7e...",
      "title": "Software Engineer Intern",
      "company": "Google"
    }
  }
]
```

---

## 🧑‍💼 Recruiter APIs (`/api/recruiter`)
*Protected by JWT. Requires header: `Authorization: Bearer <token>` and role `recruiter`.*

### 1. Post a Job
* **Endpoint**: `POST /recruiter/jobs`
* **Request Body**:
```json
{
  "title": "Frontend Engineer",
  "company": "Stripe",
  "branch": ["Computer Science", "Electrical Engineering"],
  "cgpa": 8.0,
  "skillsRequired": ["React", "Tailwind CSS"],
  "deadline": "2026-07-15",
  "description": "Looking for frontend engineers to build payment UI dashboards."
}
```
* **Success Response (201 Created)**:
```json
{
  "message": "Job posted successfully",
  "job": { ... }
}
```

### 2. View Applicants for Job
* **Endpoint**: `GET /recruiter/jobs/:jobId/applicants`
* **Success Response (200 OK)**:
```json
[
  {
    "_id": "60a8b...",
    "status": "pending",
    "student": {
      "name": "John Doe",
      "email": "john@example.com",
      "branch": "Computer Science",
      "cgpa": 9.2,
      "resume": "https://example.com/resume.pdf"
    }
  }
]
```

### 3. Update Application Status
* **Endpoint**: `PUT /recruiter/applications/:appId`
* **Request Body**:
```json
{
  "status": "shortlisted"
}
```
* **Success Response (200 OK)**:
```json
{
  "message": "Status updated successfully",
  "application": { ... }
}
```
