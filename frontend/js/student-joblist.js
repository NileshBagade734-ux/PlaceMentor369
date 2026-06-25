/* ==========================================================
   STORAGE KEYS & TOKEN
========================================================== */
const USER_KEY = "current_user";
const APPLICATION_KEY = "student_applications";

function getToken() {
  const session = JSON.parse(localStorage.getItem("placementor_session"));
  return session?.token || null;
}

/* ==========================================================
   SESSION & DATA
========================================================== */
let studentSession = JSON.parse(localStorage.getItem(USER_KEY)) || {
  name: "Guest Student",
  cgpa: 9.0,
  branch: "Computer Science",
  skills: ["React", "Node.js", "JavaScript"]
};

let skills = [...studentSession.skills];
let appliedJobs = [];
let allAvailableJobs = [];

/* ==========================================================
   DEFAULT JOBS (FALLBACK)
========================================================== */
const defaultJobs = [
  {
    id: "65b1234567890abcdef12345",
    title: "Software Engineer",
    company: "Google",
    cgpa: 8.5,
    branches: ["Computer Science", "Information Technology"],
    deadline: "2/15/2026",
    deadlineRaw: "2026-02-15",
    skills: ["React", "Node.js", "Go"],
    description: "Develop large-scale cloud applications and solve complex infrastructure problems."
  }
];

/* ==========================================================
   INIT FUNCTION
========================================================== */
async function init() {
  const token = getToken();
  if (!token) return alert("Login required");

  // -----------------------------
  // Fetch student profile
  // -----------------------------
  try {
    const profile = await apiRequest("/student/profile", "GET");
    studentSession = {
      name: profile.name || studentSession.name,
      cgpa: profile.cgpa || studentSession.cgpa,
      branch: profile.branch || studentSession.branch,
      skills: profile.skills || studentSession.skills
    };
    skills = [...studentSession.skills];

    const infoTag = document.getElementById("student-info");
    if (infoTag)
      infoTag.innerText = `${studentSession.branch} | ${studentSession.cgpa} CGPA`;
  } catch (err) {
    console.error("Failed to fetch profile:", err);
  }

  // -----------------------------
  // Fetch all approved jobs
  // -----------------------------
  try {
    const jobsData = await apiRequest("/student/jobs", "GET");
    if (jobsData.length > 0) {
      allAvailableJobs = jobsData.map(job => ({
        id: job._id,
        title: job.title,
        company: job.company,
        cgpa: job.cgpa || 0,
        branch: job.branch || [],
        deadline: job.deadline ? new Date(job.deadline).toLocaleDateString() : "Open",
        deadlineRaw: job.deadline || null,
        skills: job.skillsRequired || [],
        description: job.description
      }));
    } else {
      console.warn("No jobs found. Using fallback.");
      allAvailableJobs = defaultJobs;
    }
  } catch (err) {
    console.error("Fetch jobs failed:", err);
    allAvailableJobs = defaultJobs;
  }

  // -----------------------------
  // Fetch applied jobs
  // -----------------------------
  try {
    const apps = await apiRequest("/student/applications", "GET");
    appliedJobs = apps.map(a => a.job._id);
    localStorage.setItem(APPLICATION_KEY, JSON.stringify(appliedJobs));
  } catch (err) {
    console.error("Failed to fetch applied jobs:", err);
    appliedJobs = JSON.parse(localStorage.getItem(APPLICATION_KEY)) || [];
  }

  renderJobList();
  if (window.lucide) lucide.createIcons();
}

/* ==========================================================
   DEADLINE BADGE HELPER
========================================================== */
/**
 * Returns an HTML badge string based on how close the deadline is.
 *  🔴 Closed       — deadline is today or in the past
 *  🟠 Closing Soon — deadline is within the next 3 days
 *  🟢 Active       — deadline is more than 3 days away
 *
 * @param {string|null} deadlineRaw - ISO date string from the API, or null
 * @param {string} deadlineDisplay  - Pre-formatted display string (e.g. "2/15/2026")
 * @returns {string} HTML string for the badge/label
 */
function getDeadlineBadge(deadlineRaw, deadlineDisplay) {
  if (!deadlineRaw) {
    return `<span class="text-[10px] text-slate-400 uppercase font-medium">Deadline: Open</span>`;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const deadline = new Date(deadlineRaw);
  deadline.setHours(0, 0, 0, 0);

  const diffMs = deadline - today;
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) {
    // Deadline is today or already passed
    return `<span class="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded-full bg-red-100 text-red-700">
      🔴 Closed
    </span>`;
  } else if (diffDays <= 3) {
    // Closing within 3 days
    return `<span class="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded-full bg-orange-100 text-orange-700">
      🟠 Closing Soon · ${deadlineDisplay}
    </span>`;
  } else {
    // More than 3 days remaining
    return `<span class="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded-full bg-green-100 text-green-700">
      🟢 Active · ${deadlineDisplay}
    </span>`;
  }
}

/* ==========================================================
   RENDER JOB LIST
========================================================== */
function renderJobList() {
  const list = document.getElementById("jobs-list");
  if (!list) return;

  const studentCGPA = studentSession.cgpa || 0;
  const studentBranch = studentSession.branch || "";

  list.innerHTML = allAvailableJobs
    .map(job => {
      // ✅ Eligibility logic fixed
      const isEligible =
        studentCGPA >= (job.cgpa || 0) &&
        (!job.branches || job.branches.length === 0 || job.branches.includes(studentBranch));

      const isApplied = appliedJobs.includes(job.id);

      return `
        <div onclick="selectJob('${job.id}')"
             id="card-${job.id}"
             class="job-card bg-white p-5 rounded-xl border border-slate-200 cursor-pointer hover:shadow-md transition-all mb-3">
            <div class="flex justify-between items-start mb-2">
                <h3 class="font-bold text-slate-900">${job.title}</h3>
                <span class="px-2 py-1 text-[10px] font-bold rounded ${
                  isEligible ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                }">
                    ${isEligible ? "ELIGIBLE" : "INELIGIBLE"}
                </span>
            </div>
            <p class="text-sm text-slate-500">${job.company}</p>
            <div class="flex justify-between items-center mt-3">
                ${getDeadlineBadge(job.deadlineRaw, job.deadline)}
                <p class="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">REQ: ${job.cgpa}</p>
            </div>
        </div>
      `;
    })
    .join("");
}

/* ==========================================================
   SELECT JOB DETAIL
========================================================== */
window.selectJob = function(id) {
  const job = allAvailableJobs.find(j => j.id === id);
  const detailPane = document.getElementById("job-details");
  const emptyState = document.getElementById("empty-state");
  if (!detailPane || !job) return;

  document.querySelectorAll(".job-card").forEach(c =>
    c.classList.remove("border-indigo-500", "bg-indigo-50", "ring-1", "ring-indigo-500")
  );

  const selectedCard = document.getElementById(`card-${id}`);
  if (selectedCard)
    selectedCard.classList.add("border-indigo-500", "bg-indigo-50", "ring-1", "ring-indigo-500");

  if (emptyState) emptyState.classList.add("hidden");
  detailPane.classList.remove("hidden");

  const studentCGPA = studentSession.cgpa || 0;
  const studentBranch = studentSession.branch || "";
  const isEligible =
    studentCGPA >= (job.cgpa || 0) &&
    (!job.branches || job.branches.length === 0 || job.branches.includes(studentBranch));
  const isApplied = appliedJobs.includes(job.id);

  detailPane.innerHTML = `
    <div class="animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div class="flex justify-between items-start mb-8">
        <div>
          <h1 class="text-4xl font-black text-slate-900 mb-2">${job.title}</h1>
          <p class="text-xl text-indigo-600 font-semibold">${job.company}</p>
        </div>
        <button
          onclick="handleApply('${job.id}')"
          ${isApplied || !isEligible ? "disabled" : ""}
          class="px-10 py-4 rounded-xl font-bold text-white shadow-lg transition-all ${
            isApplied
              ? "bg-slate-300 cursor-not-allowed"
              : !isEligible
              ? "bg-red-400 cursor-not-allowed"
              : "bg-indigo-600 hover:bg-indigo-700 hover:-translate-y-1 active:scale-95"
          }">
<div class="flex gap-3 items-start">
  <button
    onclick="handleApply('${job.id}')"
    ${isApplied || !isEligible ? "disabled" : ""}
    class="px-10 py-4 rounded-xl font-bold text-white shadow-lg transition-all ${
      isApplied
        ? "bg-slate-300 cursor-not-allowed"
        : !isEligible
        ? "bg-red-400 cursor-not-allowed"
        : "bg-indigo-600 hover:bg-indigo-700 hover:-translate-y-1 active:scale-95"
    }">
    ${
      isApplied
        ? "Application Sent"
        : !isEligible
        ? "Criteria Not Met"
        : "Apply Now"
    }
  </button>

  <a
    href="../student/skill-gap.html?jobId=${job.id}"
    class="flex items-center justify-center gap-2 px-10 py-3 rounded-xl font-semibold text-indigo-600 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 transition-all text-sm">
    📊 Skill Gap Analysis
  </a>

  ${
    !isEligible && !isApplied
      ? `
      <p class="text-sm text-rose-600 bg-rose-50 border border-rose-100 rounded-xl p-3 mt-2">
        You may not meet all job requirements.
      </p>
      `
      : ""
  }
</div>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div class="p-6 bg-slate-50 rounded-2xl border border-slate-100">
          <p class="text-xs font-bold text-slate-400 uppercase mb-2">Requirement Check</p>
          <p class="text-xl font-bold ${isEligible ? "text-green-600" : "text-red-500"}">
            Target: ${job.cgpa}+ (Yours: ${studentSession.cgpa})
          </p>
        </div>
        <div class="p-6 bg-slate-50 rounded-2xl border border-slate-100">
          <p class="text-xs font-bold text-slate-400 uppercase mb-2">Application Deadline</p>
          <div class="mt-1 text-sm font-semibold">
            ${getDeadlineBadge(job.deadlineRaw, job.deadline)}
          </div>
        </div>
        <div class="p-6 bg-slate-50 rounded-2xl border border-slate-100">
          <p class="text-xs font-bold text-slate-400 uppercase mb-2">Matching Skills</p>
          <div class="flex flex-wrap gap-2">
            ${job.skills.map(skill => `<span class="px-2 py-1 text-xs rounded-lg border ${
              skills.includes(skill)
                ? "bg-green-50 border-green-200 text-green-700 font-bold"
                : "bg-white border-slate-200 text-slate-400"
            }">${skill}</span>`).join("")}
          </div>
        </div>
      </div>
      <div class="prose max-w-none">
        <h3 class="text-lg font-bold mb-4 flex items-center gap-2 text-slate-800">
          <i data-lucide="info" class="w-5 h-5 text-indigo-500"></i> Role Description
        </h3>
        <p class="text-slate-600 text-lg leading-relaxed">${job.description}</p>
      </div>
    </div>
  `;

  if (window.lucide) lucide.createIcons();
};

/* ==========================================================
   HANDLE APPLY
========================================================== */
window.handleApply = async function (jobId) {
  console.log("🆔 jobId received:", jobId);

  const token = getToken(); // ✅ FIX

  if (!token) {
    alert("Login required");
    return;
  }

  if (!jobId) {
    alert("Invalid Job ID");
    return;
  }

  try {
    await apiRequest(`/student/apply/${jobId}`, "POST");
    alert("✅ Applied successfully");
    appliedJobs.push(jobId);
    localStorage.setItem(APPLICATION_KEY, JSON.stringify(appliedJobs));
  } catch (err) {
    console.error("Apply Error:", err);
    alert(err.message);
  }
};


/* ==========================================================
   DOM READY INIT
========================================================== */
document.addEventListener("DOMContentLoaded", init);
