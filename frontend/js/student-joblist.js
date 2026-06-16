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
    deadline: "2026-02-15",
    skills: ["React", "Node.js", "Go"],
    description: "Develop large-scale cloud applications and solve complex infrastructure problems."
  }
];

/* ==========================================================
   ELIGIBILITY HELPER
========================================================== */
function normalizeText(str) {
  return str?.toLowerCase().trim() || "";
}

function checkEligibility(student, job) {
  const eligibleCGPA = (student.cgpa || 0) >= (job.cgpa || 0);
  const eligibleBranch =
    !job.branches || job.branches.length === 0 ||
    job.branches.includes(student.branch);

  const studentSkillsNorm = (student.skills || []).map(normalizeText);
  const matchingSkills = (job.skills || [])
    .filter(s => studentSkillsNorm.includes(normalizeText(s)));

  return {
    eligible: eligibleCGPA && eligibleBranch,
    details: {
      eligibleCGPA,
      eligibleBranch,
      minCGPA: job.cgpa,
      matchingSkills,
      totalSkills: (job.skills || []).length
    }
  };
}

/* ==========================================================
   INIT FUNCTION
========================================================== */
async function init() {
  const token = getToken();
  if (!token) return alert("Login required");

  // Fetch student profile
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

  // Fetch all approved jobs
  try {
    const jobsData = await apiRequest("/student/jobs", "GET");
    if (jobsData.length > 0) {
      allAvailableJobs = jobsData.map(job => ({
        id: job._id,
        title: job.title,
        company: job.company,
        cgpa: job.cgpa || 0,
        branches: job.branch || [],
        deadline: job.deadline ? new Date(job.deadline).toLocaleDateString() : "Open",
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

  // Fetch applied jobs
  try {
    const apps = await apiRequest("/student/applications", "GET");
    appliedJobs = apps.map(a => a.job._id);
    localStorage.setItem(APPLICATION_KEY, JSON.stringify(appliedJobs));
  } catch (err) {
    console.error("Failed to fetch applied jobs:", err);
    appliedJobs = JSON.parse(localStorage.getItem(APPLICATION_KEY)) || [];
  }

  renderJobList();
  setupFilters();
  if (window.lucide) lucide.createIcons();
}

/* ==========================================================
   RENDER JOB LIST
   Accepts an optional filtered array; defaults to allAvailableJobs
========================================================== */
function renderJobList(jobs) {
  const list = document.getElementById("jobs-list");
  if (!list) return;

  const jobsToRender = jobs !== undefined ? jobs : allAvailableJobs;

  if (jobsToRender.length === 0) {
    list.innerHTML = `
      <div class="flex flex-col items-center justify-center py-16 text-slate-400 gap-3">
        <i data-lucide="search-x" class="w-10 h-10 opacity-30"></i>
        <p class="text-sm font-medium">No jobs match your search.</p>
        <button onclick="clearFilters()"
          class="text-indigo-600 text-xs font-semibold hover:underline mt-1">
          Clear filters
        </button>
      </div>`;
    if (window.lucide) lucide.createIcons();
    return;
  }

  list.innerHTML = jobsToRender.map(job => {
    const eligibility = checkEligibility(studentSession, job);
    const isApplied = appliedJobs.includes(job.id);

    return `
      <div onclick="selectJob('${job.id}')"
           id="card-${job.id}"
           class="job-card bg-white p-5 rounded-xl border border-slate-200 cursor-pointer hover:shadow-md transition-all mb-3">
        <div class="flex justify-between items-start mb-2">
          <div>
            <h3 class="font-bold text-slate-900">${job.title}</h3>
            <p class="text-sm text-slate-500">${job.company}</p>
          </div>
          <span class="px-2 py-1 text-[10px] font-bold rounded ${
            eligibility.eligible ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
          }">
            ${eligibility.eligible ? "Eligible ✔" : "Not Eligible ❌"}
          </span>
        </div>
        <div class="flex flex-wrap gap-3 items-center mt-3 text-[10px]">
          <span class="text-slate-400 uppercase font-medium">Deadline: ${job.deadline}</span>
          <span class="text-indigo-600 font-bold bg-indigo-50 px-2 py-0.5 rounded">Min CGPA: ${job.cgpa}</span>
          <span class="text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
            Branches: ${job.branches?.join(", ") || "Any"}
          </span>
        </div>
      </div>
    `;
  }).join("");

  if (window.lucide) lucide.createIcons();
}

/* ==========================================================
   SEARCH & FILTER LOGIC
========================================================== */
function applyFilters() {
  const query  = (document.getElementById("job-search")?.value || "").trim().toLowerCase();
  const branch = (document.getElementById("branch-filter")?.value || "").toLowerCase();

  const filtered = allAvailableJobs.filter(job => {
    const matchesSearch =
      !query ||
      job.title.toLowerCase().includes(query) ||
      job.company.toLowerCase().includes(query);

    const matchesBranch =
      !branch ||
      (job.branches || []).some(b => b.toLowerCase() === branch);

    return matchesSearch && matchesBranch;
  });

  // Update results count label
  const countEl = document.getElementById("filter-count");
  if (countEl) {
    countEl.textContent = (query || branch)
      ? `${filtered.length} of ${allAvailableJobs.length} jobs`
      : "";
  }

  renderJobList(filtered);
}

window.clearFilters = function () {
  const searchEl = document.getElementById("job-search");
  const branchEl = document.getElementById("branch-filter");
  if (searchEl) searchEl.value = "";
  if (branchEl) branchEl.value = "";

  const countEl = document.getElementById("filter-count");
  if (countEl) countEl.textContent = "";

  renderJobList();
};

function setupFilters() {
  document.getElementById("job-search")?.addEventListener("input", applyFilters);
  document.getElementById("branch-filter")?.addEventListener("change", applyFilters);
  document.getElementById("clear-filters")?.addEventListener("click", clearFilters);
}

/* ==========================================================
   SELECT JOB DETAIL
========================================================== */
window.selectJob = function (id) {
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

  const eligibility = checkEligibility(studentSession, job);
  const isApplied = appliedJobs.includes(job.id);

  const requirementItems = [
    {
      label: eligibility.details.eligibleCGPA
        ? "CGPA requirement met"
        : `Minimum CGPA required: ${eligibility.details.minCGPA}`,
      passed: eligibility.details.eligibleCGPA
    },
    {
      label: eligibility.details.eligibleBranch
        ? "Branch eligible"
        : "Branch not eligible",
      passed: eligibility.details.eligibleBranch
    }
  ];

  detailPane.innerHTML = `
    <div class="animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div class="flex justify-between items-start mb-8">
        <div>
          <h1 class="text-4xl font-black text-slate-900 mb-2">${job.title}</h1>
          <p class="text-xl text-indigo-600 font-semibold">${job.company}</p>
          <p class="text-sm text-slate-500 mt-2">
            Branch: ${job.branches?.join(", ") || "Any"} • Min CGPA: ${job.cgpa}
          </p>
        </div>
        <div class="flex flex-col gap-3 w-full md:w-auto">
          <span class="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${
            eligibility.eligible ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
          }">
            ${eligibility.eligible ? "Eligible ✔" : "Not Eligible ❌"}
          </span>
          <button
            onclick="handleApply('${job.id}')"
            class="px-10 py-4 rounded-xl font-bold text-white shadow-lg transition-all ${
              isApplied
                ? "bg-slate-300 cursor-not-allowed"
                : eligibility.eligible
                ? "bg-indigo-600 hover:bg-indigo-700 hover:-translate-y-1 active:scale-95"
                : "bg-orange-500 hover:bg-orange-600"
            }"
            ${isApplied ? "disabled" : ""}>
            ${isApplied ? "Application Sent" : "Apply Now"}
          </button>
          <a
            href="../student/skill-gap.html?jobId=${job.id}"
            class="flex items-center justify-center gap-2 px-10 py-3 rounded-xl font-semibold
                   text-indigo-600 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 transition-all text-sm">
            📊 Skill Gap Analysis
          </a>
          ${!eligibility.eligible && !isApplied ? `
            <p class="text-sm text-rose-600 bg-rose-50 border border-rose-100 rounded-xl p-3 mt-2">
              You may not meet all job requirements.
            </p>
          ` : ""}
        </div>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <div class="p-6 bg-slate-50 rounded-2xl border border-slate-100">
          <p class="text-xs font-bold text-slate-400 uppercase mb-3">Eligibility Breakdown</p>
          <ul class="space-y-3">
            ${requirementItems.map(item => `
              <li class="flex items-center gap-3 text-sm ${item.passed ? "text-emerald-700" : "text-rose-600"}">
                <span class="w-6 h-6 flex items-center justify-center rounded-full bg-white border
                  ${item.passed ? "border-emerald-200" : "border-rose-200"}">
                  ${item.passed ? "✔" : "✖"}
                </span>
                <span>${item.label}</span>
              </li>
            `).join("")}
          </ul>
        </div>
        <div class="p-6 bg-slate-50 rounded-2xl border border-slate-100">
          <p class="text-xs font-bold text-slate-400 uppercase mb-3">Matching Skills</p>
          <p class="text-sm text-slate-500 mb-3">
            ${job.skills?.length
              ? `${eligibility.details.matchingSkills.length} of ${eligibility.details.totalSkills} required skills matched`
              : "No specific skills listed"}.
          </p>
          <div class="flex flex-wrap gap-2">
            ${job.skills.map(skill => {
              const matched = eligibility.details.matchingSkills.includes(normalizeText(skill));
              return `<span class="px-2 py-1 text-xs rounded-lg border ${
                matched
                  ? "bg-green-50 border-green-200 text-green-700 font-bold"
                  : "bg-white border-slate-200 text-slate-400"
              }">${skill}</span>`;
            }).join("")}
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
  const token = getToken();
  if (!token) { alert("Login required"); return; }
  if (!jobId)  { alert("Invalid Job ID"); return; }

  const job = allAvailableJobs.find(j => j.id === jobId);
  const eligibility = job ? checkEligibility(studentSession, job) : null;

  if (job && !eligibility.eligible) {
    const proceed = window.confirm(
      "You may not meet all job requirements. Do you want to continue with this application?"
    );
    if (!proceed) return;
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