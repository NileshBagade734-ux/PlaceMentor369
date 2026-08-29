# Design: AI Resume Builder (Issue #601)

## Architecture Overview

The feature adds one new backend endpoint, one new backend utility function, one new
frontend page, one CSS file, and one JS file. Nothing existing is modified except the
sidebar nav links.

```
frontend/
  student/
    resume-builder.html        ← new authenticated page
  css/
    resume-builder.css         ← new template & layout styles
  js/
    resume-builder.js          ← new page controller

backend/
  controllers/
    studentController.js       ← add buildResume() export (append only)
  routes/
    studentRoutes.js           ← add POST /student/build-resume (append only)
  utils/
    gemini.js                  ← add buildResumeContent() export (append only)
```

---

## Backend

### New Gemini utility — `buildResumeContent(profile, jobContext, refineSection)`

**File:** `backend/utils/gemini.js` (new export, appended to existing file)

```js
/**
 * @param {object} profile      — { name, branch, cgpa, college, skills, roll }
 * @param {object|null} jobContext — { title, company, description, skillsRequired }
 * @param {string|null} refineSection — "summary" | "skills" | "projects" | null
 * @returns {object} — { summary, skills, education, projects, experience, certifications }
 */
export const buildResumeContent = async (profile, jobContext, refineSection)
```

The Gemini prompt instructs the model to:
1. Write a 2–3 sentence ATS-optimised professional summary using the student's actual
   profile fields.
2. Format skills as a clean comma-separated list with the job's required skills
   prioritised at the front (when `jobContext` is provided).
3. Produce a one-line education entry: `<college> | <branch> | CGPA: <cgpa>`.
4. Generate 2–3 realistic project bullet points that reflect the student's skills.
5. Return strict JSON (no markdown fences) matching the `ResumeContent` shape below.

When `refineSection` is set, the prompt only asks for that one section to be rewritten.

**Return shape (`ResumeContent`):**
```json
{
  "summary":        "string",
  "skills":         "string",
  "education":      "string",
  "projects":       ["string"],
  "experience":     "string",
  "certifications": "string"
}
```

---

### New controller export — `buildResume`

**File:** `backend/controllers/studentController.js` (appended)

```
POST /student/build-resume
Auth: verifyToken (JWT required)
Body: {
  jobId?:        string   (optional — MongoDB ObjectId)
  refineSection?: string  (optional — "summary"|"skills"|"projects")
}
```

**Flow:**
1. Load `Student` by `req.user.id`.
2. If `jobId` provided and valid, load the `Job` document for context.
3. Call `buildResumeContent(profile, jobContext, refineSection)`.
4. Return the `ResumeContent` JSON directly (not stored in DB — generation is stateless).
5. Error handling: re-throw Gemini errors with appropriate HTTP status codes (429 → 503,
   500 for others).

---

### New route

**File:** `backend/routes/studentRoutes.js` (one line appended)

```js
router.post("/build-resume", verifyToken, buildResume);
```

---

## Frontend

### Page layout — `frontend/student/resume-builder.html`

Matches the ATS dashboard pattern exactly:
- Fixed sidebar (`w-64`, Lucide icons, same nav links as `ats-dashboard.html`)
- New sidebar entry: `resume-builder.html` with `file-pen` icon, label "Resume Builder"
- `main` with `md:ml-64`, same header pattern
- Mobile nav via `injectMobileNav()`
- Scripts: `config.js`, `mobile-nav.js`, `resume-builder.js`, `html2pdf` CDN

**Three-panel layout (desktop):**
```
┌─────────────────────────────────────────────────────────┐
│  Left control panel (40%)   │  Resume preview (60%)     │
│  ─────────────────────────  │  ─────────────────────── │
│  Template selector cards    │  #resumePreview           │
│  Job tailoring dropdown     │  (live HTML resume)       │
│  Generate / Download btns   │                           │
│  Section refine buttons     │                           │
└─────────────────────────────────────────────────────────┘
```
On mobile (`< md`): stacks vertically — controls above, preview below.

---

### CSS — `frontend/css/resume-builder.css`

**Template classes** (applied to `#resumePreview`):

| Class | Style |
|---|---|
| `.template-classic` | `border-top: 6px solid #4f46e5`; h2 color indigo |
| `.template-modern` | `border-left: 8px solid #06b6d4`; bg `#f8fafc`; h3 bottom border cyan |
| `.template-executive` | `border: 3px solid #111827`; h3 bg `#111827` white text; uppercase letter-spacing |

**Section refine overlay:** `.section-refine-overlay` — absolute positioned suggestion
box with Accept / Dismiss buttons.

**Loading shimmer:** `.section-loading` — pulse animation on section text while AI
refinement is in progress.

---

### JS — `frontend/js/resume-builder.js`

**State:**
```js
let profileData = null;      // loaded from /student/profile
let jobsData = [];           // loaded from /student/jobs
let resumeContent = null;    // current ResumeContent object
let originalContent = null;  // copy before tailoring (for "Clear tailoring")
let selectedTemplate = "classic";
```

**Init flow (`DOMContentLoaded`):**
1. Validate JWT session — redirect to `../login.html` if missing.
2. `Promise.all([fetchProfile(), fetchJobs()])` — populate job dropdown.
3. Enable the Generate button.

**`generateResume()`:**
1. Show spinner on button.
2. Call `POST /student/build-resume` (no jobId, no refineSection).
3. Store result in `resumeContent` and `originalContent`.
4. Call `renderPreview(resumeContent)`.
5. Enable Download and per-section Refine buttons.

**`tailorResume(jobId)`** (called on job dropdown change):
1. If no `resumeContent` yet, auto-trigger `generateResume()` first.
2. Call `POST /student/build-resume` with `{ jobId }`.
3. Store result in `resumeContent` (keep `originalContent` unchanged).
4. Call `renderPreview(resumeContent)`.
5. Show "Clear tailoring" link.

**`refineSection(sectionName)`:**
1. Show `.section-loading` on that section.
2. Call `POST /student/build-resume` with `{ refineSection: sectionName }`.
3. Show `.section-refine-overlay` with the AI suggestion.
4. On Accept: merge into `resumeContent`, call `renderPreview()`.
5. On Dismiss: remove overlay, restore section.

**`renderPreview(content)`:**
- Injects HTML into `#resumePreview` using the `content` object and the student's raw
  profile data (name, contact, CGPA).
- Applies the active template class.
- Calls `lucide.createIcons()` after injection.

**`downloadPDF()`:**
- Uses `html2pdf().set({ filename: `${name}_Resume.pdf`, ... }).from(element).save()`.
- Temporarily removes Refine buttons from the cloned element before export so they don't
  appear in the PDF.

**`changeTemplate(name)`:**
- Removes all template classes from `#resumePreview`, adds the new one.
- Updates the active state on template cards.

---

## Sidebar Updates

The following pages need "Resume Builder" added to their sidebar nav and `injectMobileNav`
call. This is the only change to existing files:

- `frontend/student/student-dashboard.html`
- `frontend/student/student-profile.html`
- `frontend/student/student-joblist.html`
- `frontend/student/student-application.html`
- `frontend/student/ats-dashboard.html`
- `frontend/student/prep-dashboard.html`

New sidebar entry (inserted after ATS Dashboard):
```html
<a href="./resume-builder.html" class="sidebar-item">
  <i data-lucide="file-pen" class="w-4 h-4"></i> Resume Builder
</a>
```

New mobile nav entry:
```js
{ href: './resume-builder.html', icon: 'file-pen', label: 'Resume Builder' }
```

---

## Data Flow Diagram

```
Student clicks "Generate Resume"
        │
        ▼
frontend/js/resume-builder.js
  POST /api/student/build-resume
        │
        ▼
backend/controllers/studentController.js → buildResume()
  ├── GET Student from MongoDB
  ├── GET Job from MongoDB (if jobId provided)
  └── call buildResumeContent(profile, jobContext, refineSection)
            │
            ▼
        backend/utils/gemini.js → buildResumeContent()
            │  Gemini API (gemini-flash-latest)
            │  Returns ResumeContent JSON
            ▼
  res.json(ResumeContent)
        │
        ▼
frontend: renderPreview(content)
  └── inject HTML into #resumePreview
        │
        ▼
Student clicks "Download PDF"
  └── html2pdf.js → <StudentName>_Resume.pdf
```

---

## What Is Not Changing

- `backend/models/student.js` — no new fields needed (resume content is stateless)
- `frontend/resume-builder.html` — public page left untouched
- All existing routes and controllers — only appending new exports
- `backend/utils/gemini.js` — only appending `buildResumeContent`, not modifying `analyzeResume`
