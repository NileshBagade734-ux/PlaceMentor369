# Tasks: AI Resume Builder (Issue #601)

## Task List

- [ ] 1. Add `buildResumeContent` to `backend/utils/gemini.js`
- [ ] 2. Add `buildResume` controller to `backend/controllers/studentController.js`
- [ ] 3. Register `POST /student/build-resume` in `backend/routes/studentRoutes.js`
- [ ] 4. Create `frontend/css/resume-builder.css`
- [ ] 5. Create `frontend/js/resume-builder.js`
- [ ] 6. Create `frontend/student/resume-builder.html`
- [ ] 7. Add "Resume Builder" nav entry to all existing student sidebar pages

---

## Task Details

### Task 1 — `buildResumeContent` in `backend/utils/gemini.js`

Append a new exported function after the existing `analyzeResume` export.

**What to implement:**
- Function signature: `export const buildResumeContent = async (profile, jobContext, refineSection)`
- Build a Gemini prompt that instructs the model to return a JSON object with keys:
  `summary`, `skills`, `education`, `projects` (array), `experience`, `certifications`
- When `jobContext` is provided, the prompt asks Gemini to tailor `summary` and `skills`
  to match the job's title, company, description, and required skills
- When `refineSection` is set to a section name, the prompt asks Gemini to rewrite only
  that section and return the same full JSON shape (other fields can be empty strings)
- Reuse the same retry + error handling pattern as `analyzeResume`
- Return the parsed JSON object

**Completion criteria:** Function is exported, prompt produces valid JSON, existing
`analyzeResume` is unchanged.

---

### Task 2 — `buildResume` in `backend/controllers/studentController.js`

Append a new exported async function after `getAtsDashboard`.

**What to implement:**
- Extract optional `jobId` and `refineSection` from `req.body`
- Load `Student` via `Student.findOne({ user: req.user.id })`; return 400 if not found
- If `jobId` is provided and valid ObjectId, load `Job.findById(jobId)`; silently ignore
  if not found (treat as no tailoring)
- Build `profile` object: `{ name, branch, cgpa, college, skills, roll }`
- Build `jobContext` object from the job document (or `null`)
- Call `buildResumeContent(profile, jobContext, refineSection)`
- Return `res.status(200).json(content)`
- Catch block: if error message contains "429" → `res.status(503)`, otherwise `res.status(500)`

**Completion criteria:** Endpoint responds with `ResumeContent` JSON; 401 if no token;
400 if no student profile.

---

### Task 3 — Route registration in `backend/routes/studentRoutes.js`

Append after the existing `ats-dashboard` route:
```js
import { ..., buildResume } from "../controllers/studentController.js";
// add to imports above, then:
router.post("/build-resume", verifyToken, buildResume);
```

**Completion criteria:** `POST /api/student/build-resume` returns 401 without token and
200 with valid token + profile.

---

### Task 4 — `frontend/css/resume-builder.css`

Create the stylesheet with:
- `.resume-builder-layout` — two-column CSS grid (40% / 60%) on `md+`, stacked on mobile
- `.template-card` — cursor pointer, rounded border, hover lift, `.active` border color
- `.template-classic`, `.template-modern`, `.template-executive` — template-specific
  styles matching the design spec
- `.resume-preview` — white bg, shadow, padding, `font-family: Georgia, serif` for print
  fidelity
- `.section-loading` — `@keyframes pulse` opacity animation
- `.section-refine-overlay` — absolute positioned card with Accept/Dismiss buttons,
  indigo border, white bg, shadow
- `.refine-btn` — small inline button, indigo text, hover bg, hidden in `@media print`
- `@media print` block that hides sidebar, control panel, and refine buttons

**Completion criteria:** All classes defined; responsive breakpoint works; print styles
hide UI chrome.

---

### Task 5 — `frontend/js/resume-builder.js`

Implement the page controller with the state and functions defined in the design doc.

**What to implement:**

**State variables:** `profileData`, `jobsData`, `resumeContent`, `originalContent`,
`selectedTemplate`

**`init()`** (runs on `DOMContentLoaded`):
- Read session from `localStorage("placementor_session")`; redirect to `../login.html`
  if missing or role !== "student"
- `Promise.all([loadProfile(), loadJobs()])`
- Populate `#jobSelect` dropdown with fetched jobs (value = job._id)
- Enable `#generateBtn`

**`loadProfile()`**: `apiRequest("/student/profile", "GET")` → store in `profileData`

**`loadJobs()`**: `apiRequest("/student/jobs", "GET")` → store in `jobsData`

**`generateResume()`** (called by Generate button):
- Disable button, show spinner
- `const jobId = document.getElementById("jobSelect").value || null`
- `await apiRequest("/student/build-resume", "POST", { jobId })`
- Store result → `resumeContent = result; originalContent = { ...result }`
- `renderPreview(resumeContent)`
- Enable Download button, show section Refine buttons

**`renderPreview(content)`**:
- Build resume HTML string using `profileData` + `content`
- Each section has a `data-section` attribute and a `.refine-btn`
- Set `#resumePreview.innerHTML`; apply active template class
- Call `lucide.createIcons()` and re-bind Refine button listeners

**`changeTemplate(name)`**: toggle template class on `#resumePreview`; update card
active state

**`tailorResume()`** (called on `#jobSelect` change):
- If `resumeContent` is null, call `generateResume()` first
- Call `buildResumeContent` via `POST /student/build-resume` with `{ jobId }`
- Update `resumeContent`; `renderPreview()`; show `#clearTailoringBtn`

**`clearTailoring()`**: restore `resumeContent = { ...originalContent }`; `renderPreview()`

**`refineSection(sectionName)`**:
- Show loading state on section
- `POST /student/build-resume` with `{ refineSection: sectionName }`
- Show overlay with suggestion text + Accept / Dismiss buttons

**`downloadPDF()`**: use `html2pdf` with `{ filename, margin, image, html2canvas, jsPDF }`
options; temporarily hide `.refine-btn` elements before export

**Error handling:** all async functions wrapped in try/catch; errors shown via
`showToast(message, "error")`

**`showToast(message, type)`**: same implementation as in `student-profile.js`

**Completion criteria:** All six user stories work end-to-end in the browser.

---

### Task 6 — `frontend/student/resume-builder.html`

Create the authenticated page following the `ats-dashboard.html` layout pattern exactly.

**Required elements:**
- `<head>`: Tailwind CDN, Lucide CDN, Font Awesome CDN, `../css/resume-builder.css`
- Sidebar with all nav links including new Resume Builder entry (active)
- Logout button at sidebar bottom
- Main content area with:
  - Page header: "AI Resume Builder" title + subtitle
  - Left panel (`#controlPanel`):
    - Template selector (3 cards: Classic, Modern, Executive)
    - Job tailoring dropdown (`#jobSelect`) with placeholder option
    - `#generateBtn` "✨ Generate Resume" (disabled until profile loads)
    - `#clearTailoringBtn` "Clear tailoring" (hidden by default)
    - `#downloadBtn` "⬇ Download PDF" (disabled until resume generated)
  - Right panel:
    - `#resumePreview` div (empty placeholder text initially)
- Scripts: `../js/config.js`, `../js/mobile-nav.js`, `../js/resume-builder.js`,
  `html2pdf` CDN (`https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js`)
- `injectMobileNav` call with Resume Builder included in the list

**Completion criteria:** Page loads, redirects unauthenticated users, renders all UI
elements, is responsive.

---

### Task 7 — Sidebar nav updates across student pages

Add the Resume Builder sidebar link and mobile nav entry to these six files:

- `frontend/student/student-dashboard.html`
- `frontend/student/student-profile.html`
- `frontend/student/student-joblist.html`
- `frontend/student/student-application.html`
- `frontend/student/ats-dashboard.html`
- `frontend/student/prep-dashboard.html`

**Sidebar insertion** (after the ATS Dashboard `<a>` tag in each file):
```html
<a href="./resume-builder.html" class="sidebar-item">
  <i data-lucide="file-pen" class="w-4 h-4"></i> Resume Builder
</a>
```

**Mobile nav insertion** (append to `injectMobileNav` array in each file):
```js
{ href: './resume-builder.html', icon: 'file-pen', label: 'Resume Builder' }
```

**Completion criteria:** Resume Builder link appears in sidebar and mobile nav on all
student pages.
