# PlaceMentor369 — API REST Endpoints Specification

This document provides a reference for the REST APIs provided by the PlaceMentor369 backend service.

---

## 🔐 Authentication & Headers

All protected endpoints require a Bearer token in the `Authorization` header:

```http
Authorization: Bearer <JWT_TOKEN>
X-Request-ID: <OPTIONAL_CORRELATION_ID>
```

---

## 🔑 Authentication Routes (`/api/auth`)

### 1. Register User
- **POST** `/api/auth/register`
- **Body**:
  ```json
  {
    "name": "Jane Student",
    "email": "jane@example.com",
    "password": "Password123",
    "role": "student"
  }
  ```
- **Response** `201 Created`:
  ```json
  {
    "success": true,
    "user": { "id": "...", "name": "Jane Student", "email": "...", "role": "student" },
    "token": "JWT_TOKEN"
  }
  ```

### 2. Login User
- **POST** `/api/auth/login`
- **Body**:
  ```json
  {
    "email": "jane@example.com",
    "password": "Password123",
    "role": "student"
  }
  ```
- **Response** `200 OK`

---

## 📄 ATS Resume Evaluation (`/api/ats`)

### Evaluate Resume Text or Job Match
- **POST** `/api/ats/evaluate`
- **Headers**: `Authorization: Bearer <TOKEN>`
- **Body**:
  ```json
  {
    "resumeText": "Experienced Software Engineer with proficiency in React, Node.js, and MongoDB...",
    "jobId": "65b2a7d4e..."
  }
  ```
- **Response** `200 OK`:
  ```json
  {
    "success": true,
    "data": {
      "overallScore": 88,
      "keywordScore": 90,
      "formatScore": 85,
      "wordCount": 420,
      "matchedSkills": ["Node.js", "React", "MongoDB"],
      "missingSkills": ["Docker"],
      "recommendations": [...]
    }
  }
  ```

---

## 💼 Recruiter Endpoints (`/api/recruiter`)

### Export Applicants List
- **GET** `/api/recruiter/export?format=csv&jobId=65b2a7...`
- **Headers**: `Authorization: Bearer <RECRUITER_TOKEN>`
- **Response**: File download stream (`text/csv` or `application/json`)

---

## 🔔 Notifications (`/api/notifications`)

### Get Unread Notifications
- **GET** `/api/notifications`
- **Headers**: `Authorization: Bearer <TOKEN>`
- **Response** `200 OK`:
  ```json
  {
    "success": true,
    "notifications": [...],
    "unreadCount": 3
  }
  ```
