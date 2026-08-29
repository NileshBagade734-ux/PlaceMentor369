# PlaceMentor369 REST API Specification

This document provides detailed API request and response structures for all major endpoints supported by the PlaceMentor369 Express backend.

## Base URL
- Local Development: `http://localhost:5000/api`
- Production: `/api` (hosted under same domain)

---

## 1. Authentication Endpoints (`/auth`)

### 1.1 Register User
- **Endpoint**: `POST /auth/register`
- **Description**: Creates a new student, recruiter, or administrator account.
- **Request Headers**:
  - `Content-Type: application/json`
- **Request Body**:
  ```json
  {
    "name": "Jane Doe",
    "email": "jane@example.com",
    "password": "securepassword123",
    "role": "student"
  }
  ```
  *Note: Role must be one of: `student`, `recruiter`, `admin`.*
- **Success Response (201 Created)**:
  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "603d21b9b6e82c40c83a1234",
      "name": "Jane Doe",
      "email": "jane@example.com",
      "role": "student"
    }
  }
  ```

### 1.2 Login User
- **Endpoint**: `POST /auth/login`
- **Description**: Log in with existing credentials to obtain a JWT token.
- **Request Body**:
  ```json
  {
    "email": "jane@example.com",
    "password": "securepassword123",
    "role": "student"
  }
  ```
- **Success Response (200 OK)**:
  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "603d21b9b6e82c40c83a1234",
      "name": "Jane Doe",
      "email": "jane@example.com",
      "role": "student"
    }
  }
  ```

---

## 2. Student Endpoints (`/student`)
All requests require the `Authorization` header with a bearer token.

### 2.1 Get Student Profile
- **Endpoint**: `GET /student/profile`
- **Headers**:
  - `Authorization: Bearer <TOKEN>`
- **Success Response (200 OK)**:
  ```json
  {
    "_id": "603d21b9b6e82c40c83a1234",
    "name": "Jane Doe",
    "email": "jane@example.com",
    "cgpa": 9.2,
    "branch": "Computer Science",
    "skills": ["React", "Node.js", "MongoDB", "Express"],
    "isVerified": true
  }
  ```

### 2.2 Get Approved Jobs
- **Endpoint**: `GET /student/jobs`
- **Description**: Lists all active job positions that have been approved by the Placement Officer (Admin).
- **Headers**:
  - `Authorization: Bearer <TOKEN>`
- **Success Response (200 OK)**:
  ```json
  [
    {
      "_id": "603d22eab6e82c40c83a5678",
      "title": "Backend Engineer",
      "company": "Google",
      "cgpa": 8.5,
      "branch": ["Computer Science", "Information Technology"],
      "skillsRequired": ["Node.js", "Go", "Docker"],
      "deadline": "2026-06-30T00:00:00.000Z",
      "description": "Develop and maintain critical back-end cloud microservices."
    }
  ]
  ```

---

## 3. Recruiter Endpoints (`/recruiter`)

### 3.1 Post a New Job
- **Endpoint**: `POST /recruiter/post-job`
- **Description**: Creates a new job posting. New posts start in a `pending` state until approved by admin.
- **Headers**:
  - `Authorization: Bearer <TOKEN>`
- **Request Body**:
  ```json
  {
    "title": "Frontend Engineer Intern",
    "company": "Netflix",
    "cgpa": 8.0,
    "branch": ["Computer Science"],
    "skillsRequired": ["React", "CSS", "Tailwind"],
    "deadline": "2026-07-15",
    "description": "Build premium, fluid interactive streaming UI components."
  }
  ```
- **Success Response (201 Created)**:
  ```json
  {
    "message": "Job posted successfully! Pending admin approval.",
    "job": {
      "_id": "603d240bb6e82c40c83a9999",
      "title": "Frontend Engineer Intern",
      "company": "Netflix",
      "cgpa": 8.0,
      "status": "pending"
    }
  }
  ```
