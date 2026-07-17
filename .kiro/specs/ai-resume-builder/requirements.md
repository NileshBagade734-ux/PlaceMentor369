# Requirements: AI Resume Builder (Issue #601)

## Overview

Build an authenticated, AI-powered resume builder page for logged-in students. It
generates a professional, ATS-friendly resume from the student's saved profile in one
click, supports three visual templates, allows job-specific tailoring, and exports the
final resume as a PDF — all integrated cleanly into the existing PlacementorAI student
portal.

---

## User Stories

### US-1 One-Click Generation
**As a** student with a saved profile,
**I want to** generate a professional resume from my profile data with a single click,
**So that** I don't have to manually fill in any forms.

**Acceptance Criteria:**
- Clicking "Generate Resume" fetches the student's profile (name, branch, CGPA, college,
  skills) via the existing `/student/profile` endpoint.
- The resume preview is populated immediately with that data.
- If the profile is incomplete (missing name, branch, or skills), a clear inline warning
  is shown and the user is linked to `/student/student-profile.html`.
- The button shows a loading spinner during generation and is disabled to prevent
  double-clicks.

---

### US-2 Multiple ATS Templates
**As a** student,
**I want to** choose from multiple resume templates,
**So that** my resume has a professional look that suits the role I'm targeting.

**Acceptance Criteria:**
- Three templates are available: **Classic** (indigo top border), **Modern** (cyan left
  accent), **Executive** (dark monochrome).
- Template thumbnails are shown as clickable cards with a visual active state.
- Switching templates re-renders the preview instantly without re-fetching data.
- All three templates produce clean, ATS-parsable HTML with clearly labelled section
  headings (no tables, no multi-column layouts inside sections).

---

### US-3 Job-Specific Tailoring
**As a** student browsing jobs,
**I want to** tailor my resume to a specific job description,
**So that** my resume matches the keywords and requirements the recruiter expects.

**Acceptance Criteria:**
- A dropdown lists all approved jobs fetched from `/student/jobs`.
- When a job is selected, the page calls a new backend endpoint
  `POST /student/build-resume` with the student profile and job context.
- Gemini AI rewrites the professional summary and skill highlights to reflect the job's
  requirements.
- The updated content replaces the relevant resume sections in the preview.
- A "Clear tailoring" control restores the original generated content.
- If no job is selected, the resume is generated without tailoring.

---

### US-4 PDF Export
**As a** student,
**I want to** download my resume as a PDF,
**So that** I can submit it to job applications outside the platform.

**Acceptance Criteria:**
- A "Download PDF" button triggers a client-side PDF export of the resume preview using
  `html2pdf.js` (already referenced in the existing `resume-builder.html`).
- The exported file is named `<StudentName>_Resume.pdf`.
- PDF export is disabled (greyed out) until a resume has been generated.
- The export captures the selected template's styling faithfully.

---

### US-5 Regenerate / Refine Sections
**As a** student,
**I want to** regenerate or refine individual resume sections using AI,
**So that** I can improve specific parts without re-generating the whole document.

**Acceptance Criteria:**
- Each resume section (Summary, Skills, Projects) shows a small "✨ Refine" button.
- Clicking it calls `POST /student/build-resume` with a `refineSection` flag and the
  section name.
- The AI returns an improved version of that section only.
- The user can accept or dismiss the suggestion before it replaces the current content.
- A loading indicator is shown on the section during AI processing.

---

### US-6 Authenticated Access
**As a** student,
**I want** the resume builder to be part of my authenticated student portal,
**So that** my profile data is secure and always up to date.

**Acceptance Criteria:**
- The page lives at `frontend/student/resume-builder.html` and requires a valid JWT
  session (same pattern as other student pages).
- Unauthenticated visitors are redirected to `../login.html`.
- The page is linked in the student sidebar and mobile nav under the label
  **"Resume Builder"** with a `file-pen` Lucide icon.
- The existing public `frontend/resume-builder.html` is left untouched.

---

## Non-Functional Requirements

| # | Requirement |
|---|-------------|
| NFR-1 | Backend AI calls use the existing `analyzeResume` / Gemini pattern with retry logic. |
| NFR-2 | The new backend endpoint respects the existing rate limiter middleware. |
| NFR-3 | All new files follow the `.editorconfig` rules: LF line endings, 2-space indent, final newline. |
| NFR-4 | The page is responsive — sidebar collapses on mobile, layout stacks vertically below `md`. |
| NFR-5 | PDF export is client-side only (no server-side PDF lib required). |
| NFR-6 | Gemini API errors (429, 503) surface as user-friendly toast messages, not raw errors. |
| NFR-7 | The feature does not modify any existing endpoints, models, or pages. |
