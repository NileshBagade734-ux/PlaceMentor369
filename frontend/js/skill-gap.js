/* =============================================
   Skill Gap Analysis — Frontend Logic
   Endpoint: GET /api/student/skill-gap/:jobId
============================================= */

const API_BASE = "http://localhost:5000/api/student";

/* ---- Auth ---- */
function getSession() {
  const session = JSON.parse(localStorage.getItem("placementor_session"));
  if (!session || !session.token || session.user?.role !== "student") return null;
  return session;
}

const session = getSession();
if (!session) {
  alert("Login required!");
  window.location.href = "../login.html";
}

const token = session.token;

/* ---- Grab jobId from URL query param ---- */
const params = new URLSearchParams(window.location.search);
const jobId = params.get("jobId");

/* ---- DOM refs ---- */
const loadingState     = document.getElementById("loading-state");
const errorState       = document.getElementById("error-state");
const errorMsg         = document.getElementById("error-msg");
const analysisContent  = document.getElementById("analysis-content");

/* ---- Helpers ---- */

/**
 * Animate the SVG score ring from 0 to the target value.
 * The circle has r=60, so circumference = 2π×60 ≈ 376.99
 */
function animateRing(score) {
  const circumference = 376.99;
  const fill = document.getElementById("score-ring-fill");
  const number = document.getElementById("score-number");
  const bar = document.getElementById("score-bar");

  // Colour the ring by score tier
  let colour = "#ef4444"; // red
  if (score >= 85) colour = "#22c55e";
  else if (score >= 65) colour = "#6366f1";
  else if (score >= 40) colour = "#f59e0b";

  fill.setAttribute("stroke", colour);
  bar.style.backgroundColor = colour;

  // Trigger transition after a tiny delay so the initial state renders
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      const offset = circumference - (score / 100) * circumference;
      fill.style.strokeDashoffset = offset;
      bar.style.width = score + "%";
    });
  });

  // Count-up animation for the number
  let current = 0;
  const step = Math.ceil(score / 60); // ~1s at 60fps
  const timer = setInterval(() => {
    current = Math.min(current + step, score);
    number.textContent = current + "%";
    if (current >= score) clearInterval(timer);
  }, 16);
}

function getReadinessClass(color) {
  const map = { green: "readiness-green", blue: "readiness-blue", yellow: "readiness-yellow", red: "readiness-red" };
  return map[color] || "readiness-red";
}

/** Build a single recommendation card */
function buildRecCard(rec) {
  const iconMap = {
    "Free Course": "🎓",
    "Documentation": "📖",
    "Official Docs": "📄",
    "Official Tutorial": "🔗",
    "Interactive": "🕹️",
    "Free Tutorial": "📝",
    "Free Book": "📚",
    "Course": "🎓",
    "Roadmap": "🗺️",
    "Free Guide": "📋",
    "Search": "🔍"
  };
  const icon = iconMap[rec.type] || "📖";

  return `
    <div class="rec-card">
      <div class="rec-icon">${icon}</div>
      <div class="flex-1 min-w-0">
        <p class="font-semibold text-slate-800 text-sm">${escapeHtml(rec.skill)}</p>
        <p class="text-xs text-slate-500 mt-0.5">${escapeHtml(rec.platform)}
          <span class="ml-1 px-1.5 py-0.5 bg-slate-100 rounded text-slate-400 text-[10px]">${escapeHtml(rec.type)}</span>
        </p>
        <a href="${escapeHtml(rec.url)}" target="_blank" rel="noopener noreferrer" class="rec-link">
          Start Learning <i data-lucide="external-link" class="w-3 h-3"></i>
        </a>
      </div>
    </div>
  `;
}

function escapeHtml(str) {
  return String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Build the eligibility check-list row */
function buildEligRow(passed, label) {
  return `
    <div class="flex items-center gap-3 p-3 rounded-xl border ${passed ? "bg-emerald-50 border-emerald-100" : "bg-rose-50 border-rose-100"}">
      <span class="w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold
        ${passed ? "bg-emerald-600 text-white" : "bg-rose-600 text-white"}">
        ${passed ? "✓" : "✕"}
      </span>
      <span class="text-sm font-medium ${passed ? "text-emerald-800" : "text-rose-700"}">${escapeHtml(label)}</span>
    </div>
  `;
}

/* ---- Render the full analysis ---- */
function renderAnalysis(data) {
  const { job, student, analysis } = data;

  /* Job banner */
  document.getElementById("job-title").textContent    = job.title;
  document.getElementById("job-company").textContent  = job.company;

  /* Readiness badge */
  const badge = document.getElementById("readiness-badge");
  badge.textContent = `${analysis.readiness.icon} ${analysis.readiness.label}`;
  badge.className = `readiness-badge ${getReadinessClass(analysis.readiness.color)}`;
  document.getElementById("readiness-advice").textContent = analysis.readiness.advice;

  /* Score ring + bar */
  animateRing(analysis.matchScore);

  /* Quick stats */
  document.getElementById("stat-matched").textContent = analysis.matchedSkills.length;
  document.getElementById("stat-missing").textContent = analysis.missingSkills.length;

  const cgpaEl = document.getElementById("stat-cgpa");
  cgpaEl.textContent = analysis.cgpaMet ? "✓ Met" : "✕ Below";
  cgpaEl.className   = `value ${analysis.cgpaMet ? "text-emerald-600" : "text-rose-600"}`;

  const branchEl = document.getElementById("stat-branch");
  branchEl.textContent = analysis.branchEligible ? "✓ Eligible" : "✕ Ineligible";
  branchEl.className   = `value text-sm ${analysis.branchEligible ? "text-emerald-600" : "text-rose-600"}`;

  /* Student skills */
  const studentSkillsList = document.getElementById("student-skills-list");
  if (student.skills && student.skills.length > 0) {
    studentSkillsList.innerHTML = student.skills.map(s =>
      `<span class="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full text-xs">${escapeHtml(s)}</span>`
    ).join("");
  } else {
    studentSkillsList.innerHTML = `<span class="text-slate-400 italic text-xs">No skills added yet — <a href="student-profile.html" class="text-indigo-500 hover:underline">add them in your profile</a></span>`;
  }

  /* Matched skills */
  const matchedEl = document.getElementById("matched-skills");
  if (analysis.matchedSkills.length > 0) {
    matchedEl.innerHTML = analysis.matchedSkills.map(s =>
      `<span class="skill-badge matched"><span>✓</span>${escapeHtml(s)}</span>`
    ).join("");
  } else {
    matchedEl.innerHTML = `<span class="text-sm text-slate-400 italic">None of your skills matched — check your profile</span>`;
  }

  /* Missing skills */
  const missingEl = document.getElementById("missing-skills");
  if (analysis.missingSkills.length > 0) {
    missingEl.innerHTML = analysis.missingSkills.map(s =>
      `<span class="skill-badge missing"><span>✕</span>${escapeHtml(s)}</span>`
    ).join("");
  } else {
    missingEl.innerHTML = `<span class="text-sm text-emerald-600 font-medium">🎉 You have all the required skills!</span>`;
  }

  /* Learning recommendations */
  const recList = document.getElementById("recommendations-list");
  const recCount = document.getElementById("rec-count");
  if (analysis.recommendations.length > 0) {
    recCount.textContent = `${analysis.recommendations.length} resource${analysis.recommendations.length !== 1 ? "s" : ""}`;
    recList.innerHTML = `<div class="grid grid-cols-1 md:grid-cols-2 gap-3">
      ${analysis.recommendations.map(buildRecCard).join("")}
    </div>`;
  } else {
    recCount.textContent = "0 resources";
    recList.innerHTML = `
      <div class="state-box">
        <span class="icon">🎉</span>
        <p class="font-semibold text-slate-600">No missing skills — you're all set!</p>
      </div>`;
  }

  /* Eligibility breakdown */
  const eligEl = document.getElementById("eligibility-breakdown");
  const cgpaLabel = analysis.cgpaMet
    ? `CGPA requirement met (yours: ${student.cgpa}, required: ${job.minCGPA})`
    : `CGPA below requirement (yours: ${student.cgpa}, required: ${job.minCGPA})`;

  const branchLabel = analysis.branchEligible
    ? `Branch eligible (${student.branch || "—"})`
    : `Branch not eligible for this job (eligible: ${job.branches.length ? job.branches.join(", ") : "Any"})`;

  const skillLabel = analysis.totalRequired > 0
    ? `${analysis.matchedSkills.length} of ${analysis.totalRequired} required skills matched`
    : "No specific skills listed for this job";

  eligEl.innerHTML = [
    buildEligRow(analysis.cgpaMet, cgpaLabel),
    buildEligRow(analysis.branchEligible, branchLabel),
    buildEligRow(analysis.matchedSkills.length === analysis.totalRequired || analysis.totalRequired === 0, skillLabel)
  ].join("");

  /* Apply button */
  const applyBtn = document.getElementById("apply-btn");
  applyBtn.addEventListener("click", () => handleApply(job.id));

  /* Reveal content */
  loadingState.classList.add("hidden");
  analysisContent.classList.remove("hidden");

  /* Re-initialise Lucide icons for dynamically added content */
  if (window.lucide) lucide.createIcons();
}

/* ---- Apply logic ---- */
async function handleApply(jobId) {
  const applyBtn = document.getElementById("apply-btn");
  applyBtn.disabled = true;
  applyBtn.innerHTML = `<i data-lucide="loader" class="w-4 h-4 animate-spin"></i> Applying…`;
  if (window.lucide) lucide.createIcons();

  try {
    const res = await fetch(`${API_BASE}/apply/${jobId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Apply failed");
    alert("✅ Applied successfully!");
    applyBtn.innerHTML = `<i data-lucide="check" class="w-4 h-4"></i> Application Sent`;
    applyBtn.className = applyBtn.className.replace("bg-indigo-600 hover:bg-indigo-700", "bg-slate-300 cursor-not-allowed");
  } catch (err) {
    alert(err.message || "Failed to apply.");
    applyBtn.disabled = false;
    applyBtn.innerHTML = `<i data-lucide="send" class="w-4 h-4"></i> Apply for This Job`;
  }
  if (window.lucide) lucide.createIcons();
}

/* ---- Fetch and bootstrap ---- */
async function init() {
  if (!jobId) {
    loadingState.classList.add("hidden");
    errorMsg.textContent = "No job selected. Please go back and choose a job.";
    errorState.classList.remove("hidden");
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/skill-gap/${jobId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();

    if (!res.ok) throw new Error(data.message || "Failed to load analysis");

    renderAnalysis(data);
  } catch (err) {
    console.error("Skill gap fetch error:", err);
    loadingState.classList.add("hidden");
    errorMsg.textContent = err.message || "Failed to load skill gap analysis.";
    errorState.classList.remove("hidden");
  }
}

/* ---- Logout ---- */
document.getElementById("logoutBtn")?.addEventListener("click", () => {
  localStorage.clear();
  window.location.href = "../login.html";
});

/* ---- Run ---- */
document.addEventListener("DOMContentLoaded", () => {
  if (window.lucide) lucide.createIcons();
  init();
});
