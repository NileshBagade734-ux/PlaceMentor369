/* ==========================================================
   STORAGE KEYS & TOKEN
========================================================== */
const API = "http://localhost:5000/api/student";
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
let bookmarkedJobIds = [];

// Combined filter state
let searchQuery = "";
let selectedRole = "";
let selectedCompany = "";
let selectedLocation = "";
let selectedSkill = "";
let selectedType = "";
let selectedTab = "all"; // "all" or "saved"

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
    location: "Bangalore, India",
    salary: "₹24 LPA",
    employmentType: "Full-Time",
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
    const resProfile = await fetch("http://localhost:5000/api/student/profile", {
      headers: { "Authorization": `Bearer ${token}` }
    });

    if (resProfile.ok) {
      const profile = await resProfile.json();
      studentSession = {
        name: profile.name || studentSession.name,
        cgpa: profile.cgpa || studentSession.cgpa,
        branch: profile.branch || studentSession.branch,
        skills: profile.skills || studentSession.skills
      };
      skills = [...studentSession.skills];
    }

    const infoTag = document.getElementById("student-info");
    if (infoTag)
      infoTag.innerText = `${studentSession.branch} | ${studentSession.cgpa} CGPA`;
  } catch (err) {
    console.error("Failed to fetch profile:", err);
  }

  // -----------------------------
  // Fetch bookmarks
  // -----------------------------
  await fetchBookmarks();

  // -----------------------------
  // Fetch all approved jobs
  // -----------------------------
  try {
    const resJobs = await fetch("http://localhost:5000/api/student/jobs", {
      headers: { "Authorization": `Bearer ${token}` }
    });
    const jobsData = await resJobs.json();
    if (resJobs.ok && jobsData.length > 0) {
      allAvailableJobs = jobsData.map(job => ({
        id: job._id,
        title: job.title,
        company: job.company,
        cgpa: job.cgpa || 0,
        branches: job.branch || [],
        deadline: job.deadline ? new Date(job.deadline).toLocaleDateString() : "Open",
        skills: job.skillsRequired || [],
        description: job.description,
        location: job.location || "Remote",
        salary: job.salary || "Not Specified",
        employmentType: job.employmentType || "Full-Time"
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
    const resApps = await fetch("http://localhost:5000/api/student/applications", {
      headers: { "Authorization": `Bearer ${token}` }
    });

    if (resApps.ok) {
      const apps = await resApps.json();
      appliedJobs = apps.map(a => a.job?._id || a.job);
      localStorage.setItem(APPLICATION_KEY, JSON.stringify(appliedJobs));
    } else {
      appliedJobs = JSON.parse(localStorage.getItem(APPLICATION_KEY)) || [];
    }
  } catch (err) {
    console.error("Failed to fetch applied jobs:", err);
    appliedJobs = JSON.parse(localStorage.getItem(APPLICATION_KEY)) || [];
  }

  // Set up search and filters DOM listeners
  const searchInput = document.getElementById("search-input");
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      searchQuery = e.target.value;
      renderJobList();
    });
  }

  populateFilters();
  renderJobList();
  if (window.lucide) lucide.createIcons();
}

/* ==========================================================
   FETCH BOOKMARKS
========================================================== */
async function fetchBookmarks() {
  const token = getToken();
  if (!token) return;
  try {
    const res = await fetch("http://localhost:5000/api/student/bookmarks", {
      headers: { "Authorization": `Bearer ${token}` }
    });
    if (res.ok) {
      const bookmarks = await res.json();
      bookmarkedJobIds = bookmarks.map(b => b._id || b.id || b);
    }
  } catch (err) {
    console.error("Failed to fetch bookmarks:", err);
  }
}

/* ==========================================================
   TOGGLE BOOKMARK
========================================================== */
window.toggleBookmark = async function(jobId) {
  const token = getToken();
  if (!token) return alert("Login required");

  try {
    const res = await fetch(`http://localhost:5000/api/student/jobs/${jobId}/bookmark`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      }
    });

    const data = await res.json();
    if (res.ok) {
      if (data.bookmarked) {
        bookmarkedJobIds.push(jobId);
      } else {
        bookmarkedJobIds = bookmarkedJobIds.filter(id => id !== jobId);
      }
      
      // Re-render
      renderJobList();
      
      // Update details panel if open for this job
      const detailPane = document.getElementById("job-details");
      if (detailPane && !detailPane.classList.contains("hidden")) {
        const activeCard = document.getElementById(`card-${jobId}`);
        if (activeCard && activeCard.classList.contains("border-indigo-500")) {
          selectJob(jobId);
        }
      }
    } else {
      alert(data.message || "Failed to toggle bookmark");
    }
  } catch (err) {
    console.error("Bookmark toggle error:", err);
    alert("Error updating bookmark");
  }
};

/* ==========================================================
   DYNAMIC FILTERS POPULATION
========================================================== */
function populateFilters() {
  const filterRole = document.getElementById("filter-role");
  const filterCompany = document.getElementById("filter-company");
  const filterLocation = document.getElementById("filter-location");
  const filterSkill = document.getElementById("filter-skill");

  if (!allAvailableJobs.length) return;

  const roles = new Set();
  const companies = new Set();
  const locations = new Set();
  const skillsSet = new Set();

  allAvailableJobs.forEach(job => {
    if (job.title) roles.add(job.title);
    if (job.company) companies.add(job.company);
    if (job.location) locations.add(job.location);
    if (Array.isArray(job.skills)) {
      job.skills.forEach(s => skillsSet.add(s));
    }
  });

  if (filterRole) {
    filterRole.innerHTML = '<option value="">All Roles</option>' + 
      Array.from(roles).sort().map(r => `<option value="${r}">${r}</option>`).join("");
  }

  if (filterCompany) {
    filterCompany.innerHTML = '<option value="">All Companies</option>' + 
      Array.from(companies).sort().map(c => `<option value="${c}">${c}</option>`).join("");
  }

  if (filterLocation) {
    filterLocation.innerHTML = '<option value="">All Locations</option>' + 
      Array.from(locations).sort().map(l => `<option value="${l}">${l}</option>`).join("");
  }

  if (filterSkill) {
    filterSkill.innerHTML = '<option value="">All Skills</option>' + 
      Array.from(skillsSet).sort().map(s => `<option value="${s}">${s}</option>`).join("");
  }
}

/* ==========================================================
   UI CONTROLS FOR FILTERS & TABS
========================================================== */
window.toggleFiltersPanel = function() {
  const panel = document.getElementById("filters-panel");
  if (panel) {
    panel.classList.toggle("hidden");
  }
};

window.setTab = function(tabName) {
  selectedTab = tabName;
  const tabAllBtn = document.getElementById("tab-all");
  const tabSavedBtn = document.getElementById("tab-saved");

  if (tabName === "all") {
    tabAllBtn.className = "flex-1 py-2 text-xs font-semibold rounded-xl bg-indigo-600 text-white shadow-sm transition-all border border-transparent";
    tabSavedBtn.className = "flex-1 py-2 text-xs font-semibold rounded-xl bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:text-indigo-600 transition-all flex items-center justify-center gap-1.5 shadow-sm";
  } else {
    tabAllBtn.className = "flex-1 py-2 text-xs font-semibold rounded-xl bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:text-indigo-600 transition-all border border-transparent shadow-sm";
    tabSavedBtn.className = "flex-1 py-2 text-xs font-semibold rounded-xl bg-indigo-600 text-white shadow-sm transition-all flex items-center justify-center gap-1.5 border border-transparent animate-in pulse duration-300";
  }

  renderJobList();
};

window.applyFilters = function() {
  const filterRole = document.getElementById("filter-role");
  const filterCompany = document.getElementById("filter-company");
  const filterLocation = document.getElementById("filter-location");
  const filterSkill = document.getElementById("filter-skill");
  const filterTypeRadios = document.getElementsByName("filter-type");

  if (filterRole) selectedRole = filterRole.value;
  if (filterCompany) selectedCompany = filterCompany.value;
  if (filterLocation) selectedLocation = filterLocation.value;
  if (filterSkill) selectedSkill = filterSkill.value;

  if (filterTypeRadios) {
    for (const radio of filterTypeRadios) {
      if (radio.checked) {
        selectedType = radio.value;
        break;
      }
    }
  }

  // Update filter dot indicator
  const dot = document.getElementById("active-filters-dot");
  if (dot) {
    const hasFilters = selectedRole || selectedCompany || selectedLocation || selectedSkill || selectedType;
    if (hasFilters) dot.classList.remove("hidden");
    else dot.classList.add("hidden");
  }

  renderJobList();
};

window.clearAllFilters = function() {
  const filterRole = document.getElementById("filter-role");
  const filterCompany = document.getElementById("filter-company");
  const filterLocation = document.getElementById("filter-location");
  const filterSkill = document.getElementById("filter-skill");
  const filterTypeRadios = document.getElementsByName("filter-type");
  const searchInput = document.getElementById("search-input");

  if (filterRole) filterRole.value = "";
  if (filterCompany) filterCompany.value = "";
  if (filterLocation) filterLocation.value = "";
  if (filterSkill) filterSkill.value = "";
  if (searchInput) searchInput.value = "";

  if (filterTypeRadios) {
    filterTypeRadios[0].checked = true; // "All"
  }

  searchQuery = "";
  selectedRole = "";
  selectedCompany = "";
  selectedLocation = "";
  selectedSkill = "";
  selectedType = "";

  const dot = document.getElementById("active-filters-dot");
  if (dot) dot.classList.add("hidden");

  renderJobList();
};

/* ==========================================================
   RENDER JOB LIST
========================================================== */
function renderJobList() {
  const list = document.getElementById("jobs-list");
  const countBadge = document.getElementById("jobs-count");
  if (!list) return;

  const filteredJobs = allAvailableJobs.filter(job => {
    // 1. Saved Tab Filter
    if (selectedTab === 'saved' && !bookmarkedJobIds.includes(job.id)) return false;

    // 2. Search Keyword Matching
    if (searchQuery) {
      const q = searchQuery.toLowerCase().trim();
      const matchTitle = job.title?.toLowerCase().includes(q);
      const matchCompany = job.company?.toLowerCase().includes(q);
      const matchDesc = job.description?.toLowerCase().includes(q);
      const matchLoc = job.location?.toLowerCase().includes(q);
      const matchSkills = job.skills?.some(s => s.toLowerCase().includes(q));
      if (!matchTitle && !matchCompany && !matchDesc && !matchLoc && !matchSkills) return false;
    }

    // 3. Select Dropdowns
    if (selectedRole && job.title !== selectedRole) return false;
    if (selectedCompany && job.company !== selectedCompany) return false;
    if (selectedLocation && job.location !== selectedLocation) return false;
    if (selectedSkill) {
      const matched = job.skills?.some(s => s.toLowerCase().trim() === selectedSkill.toLowerCase().trim());
      if (!matched) return false;
    }

    // 4. Employment Type
    if (selectedType && job.employmentType !== selectedType) return false;

    return true;
  });

  if (countBadge) {
    countBadge.innerText = `${filteredJobs.length} item${filteredJobs.length === 1 ? '' : 's'}`;
  }

  if (filteredJobs.length === 0) {
    list.innerHTML = `
      <div class="flex flex-col items-center justify-center p-12 text-slate-400 text-center bg-white border border-slate-200 rounded-xl mt-4 shadow-sm animate-in fade-in duration-300">
        <i data-lucide="search-code" class="w-10 h-10 mb-3 opacity-30 text-indigo-500"></i>
        <p class="font-medium text-slate-700 text-sm">No opportunities match your criteria</p>
        <p class="text-xs text-slate-400 mt-1">Try resetting filters or search terms</p>
        <button onclick="clearAllFilters()" class="mt-4 px-3.5 py-1.5 text-xs bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-lg font-bold transition-all shadow-sm">Reset All Filters</button>
      </div>
    `;
    if (window.lucide) lucide.createIcons();
    return;
  }

  list.innerHTML = filteredJobs
    .map(job => {
      const eligibility = checkEligibility(studentSession, job);
      const isApplied = appliedJobs.includes(job.id);
      const isBookmarked = bookmarkedJobIds.includes(job.id);

      return `
        <div onclick="selectJob('${job.id}')"
             id="card-${job.id}"
             class="job-card bg-white p-5 rounded-xl border border-slate-200 cursor-pointer hover:shadow-md transition-all relative">
            <div class="flex justify-between items-start gap-4 mb-2">
                <div>
                  <h3 class="font-bold text-slate-900 line-clamp-1">${job.title}</h3>
                  <p class="text-xs text-slate-500 font-semibold">${job.company}</p>
                </div>
                <div class="flex items-center gap-1.5 flex-shrink-0">
                  <button onclick="event.stopPropagation(); toggleBookmark('${job.id}')" 
                          class="bookmark-btn p-1.5 rounded-lg border border-slate-100 hover:border-amber-200 hover:bg-amber-50 text-slate-400 hover:text-amber-500 transition-all flex items-center justify-center bg-white">
                    <i data-lucide="star" class="w-4 h-4 ${isBookmarked ? 'fill-amber-400 stroke-amber-400 text-amber-400' : 'text-slate-400'}"></i>
                  </button>
                  <span class="px-2 py-1 text-[9px] font-bold rounded ${
                    eligibility.eligible ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-rose-50 text-rose-700 border border-rose-100"
                  }">
                      ${eligibility.eligible ? "Eligible ✔" : "Not Eligible ❌"}
                  </span>
                </div>
            </div>
            
            <div class="flex flex-wrap gap-2 items-center mt-3 text-[10px] text-slate-500 font-medium">
                <span class="px-2 py-0.5 rounded-md font-bold ${job.employmentType === 'Internship' ? 'bg-indigo-50 text-indigo-600' : 'bg-teal-50 text-teal-600'}">${job.employmentType}</span>
                <span class="flex items-center gap-1"><i data-lucide="map-pin" class="w-3 h-3 text-slate-400"></i> ${job.location}</span>
                <span class="flex items-center gap-1"><i data-lucide="dollar-sign" class="w-3 h-3 text-slate-400"></i> ${job.salary}</span>
            </div>

            <div class="flex flex-wrap gap-3 items-center mt-3 pt-3 border-t border-slate-100 text-[10px]">
                <span class="text-slate-400 font-medium">Deadline: ${job.deadline}</span>
                <span class="text-indigo-600 font-bold bg-indigo-50 px-2 py-0.5 rounded">Min CGPA: ${job.cgpa}</span>
                <span class="text-slate-700 bg-slate-100 px-2 py-0.5 rounded line-clamp-1">Branches: ${job.branches?.join(", ") || "Any"}</span>
            </div>
        </div>
      `;
    })
    .join("");

  if (window.lucide) lucide.createIcons();
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

  const eligibility = checkEligibility(studentSession, job);
  const isApplied = appliedJobs.includes(job.id);
  const isBookmarked = bookmarkedJobIds.includes(job.id);

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
        : `Branch not eligible`,
      passed: eligibility.details.eligibleBranch
    }
  ];

  detailPane.innerHTML = `
    <div class="animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div class="flex flex-col md:flex-row justify-between items-start gap-6 mb-8">
        <div class="flex-1">
          <div class="flex flex-wrap items-center gap-2.5 mb-2.5">
            <span class="px-2.5 py-1 text-xs font-bold rounded-lg ${job.employmentType === 'Internship' ? 'bg-indigo-50 text-indigo-600 border border-indigo-100' : 'bg-teal-50 text-teal-600 border border-teal-100'}">${job.employmentType}</span>
            <span class="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-bold ${
              eligibility.eligible
                ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                : "bg-rose-50 text-rose-700 border border-rose-100"
            }">
              ${eligibility.eligible ? "Eligible ✔" : "Not Eligible ❌"}
            </span>
          </div>
          <h1 class="text-3xl font-black text-slate-900 tracking-tight leading-none mb-2">${job.title}</h1>
          <p class="text-lg text-indigo-600 font-semibold mb-3">${job.company}</p>
          <div class="flex flex-wrap gap-4 text-sm text-slate-500 font-medium">
            <span class="flex items-center gap-1.5"><i data-lucide="map-pin" class="w-4 h-4 text-slate-400"></i> ${job.location}</span>
            <span class="flex items-center gap-1.5"><i data-lucide="dollar-sign" class="w-4 h-4 text-slate-400"></i> ${job.salary}</span>
            <span class="flex items-center gap-1.5"><i data-lucide="calendar" class="w-4 h-4 text-slate-400"></i> Deadline: ${job.deadline}</span>
          </div>
        </div>
        <div class="flex items-center gap-2.5 w-full md:w-auto">
          <button
            onclick="toggleBookmark('${job.id}')"
            class="p-4 rounded-xl border ${isBookmarked ? 'border-amber-300 bg-amber-50 text-amber-500' : 'border-slate-200 bg-white text-slate-400 hover:text-amber-500 hover:border-amber-200 hover:bg-amber-50'} transition-all flex items-center justify-center shadow-sm">
            <i data-lucide="star" class="w-5 h-5 ${isBookmarked ? 'fill-amber-400 stroke-amber-400' : ''}"></i>
          </button>
          <button
            onclick="handleApply('${job.id}')"
            class="flex-1 md:flex-none px-8 py-4 rounded-xl font-bold text-white shadow-md transition-all ${
              isApplied
                ? "bg-slate-300 cursor-not-allowed text-slate-500 shadow-none"
                : eligibility.eligible
                ? "bg-indigo-600 hover:bg-indigo-700 hover:-translate-y-0.5 active:scale-95 shadow-indigo-100"
                : "bg-orange-500 hover:bg-orange-600 hover:-translate-y-0.5 active:scale-95"
            }"
            ${isApplied ? "disabled" : ""}>
            ${isApplied ? "Application Sent" : "Apply Now"}
          </button>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div class="p-6 bg-slate-50 rounded-2xl border border-slate-100">
          <p class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Eligibility Breakdown</p>
          <ul class="space-y-3">
            ${requirementItems.map(item => `
              <li class="flex items-center gap-3 text-sm ${item.passed ? "text-emerald-700 font-semibold" : "text-rose-600 font-semibold"}">
                <span class="w-6 h-6 flex items-center justify-center rounded-full bg-white border ${item.passed ? "border-emerald-200 text-emerald-500" : "border-rose-200 text-rose-500"}">
                  ${item.passed ? "✔" : "✖"}
                </span>
                <span>${item.label}</span>
              </li>
            `).join("")}
          </ul>
        </div>
        <div class="p-6 bg-slate-50 rounded-2xl border border-slate-100">
          <p class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Matching Skills</p>
          <p class="text-sm text-slate-500 mb-3">${job.skills?.length ? `${eligibility.details.matchingSkills.length} of ${eligibility.details.totalSkills} required skills matched` : "No specific skills listed"}.</p>
          <div class="flex flex-wrap gap-2">
            ${job.skills.map(skill => {
              const matched = eligibility.details.matchingSkills.includes(normalizeText(skill));
              return `<span class="px-2.5 py-1 text-xs rounded-lg border ${matched ? "bg-green-50 border-green-200 text-green-700 font-bold" : "bg-white border-slate-200 text-slate-400"}">${skill}</span>`;
            }).join("")}
          </div>
        </div>
      </div>

      <div class="prose max-w-none">
        <h3 class="text-lg font-bold mb-3 flex items-center gap-2 text-slate-800">
          <i data-lucide="info" class="w-5 h-5 text-indigo-500"></i> Role Description
        </h3>
        <p class="text-slate-600 text-base leading-relaxed bg-slate-50 p-6 rounded-2xl border border-slate-100 whitespace-pre-wrap">${job.description}</p>
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

  const token = getToken();

  if (!token) {
    alert("Login required");
    return;
  }

  if (!jobId) {
    alert("Invalid Job ID");
    return;
  }

  const job = allAvailableJobs.find((j) => j.id === jobId);
  const eligibility = job ? checkEligibility(studentSession, job) : null;

  if (job && !eligibility.eligible) {
    const proceed = window.confirm(
      "You may not meet all job requirements. Do you want to continue with this application?"
    );
    if (!proceed) return;
  }

  try {
    const res = await fetch(`${API}/apply/${jobId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      }
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Apply failed");
    }

    alert("✅ Applied successfully! Redirecting to applications tracker...");

    // Update locally
    appliedJobs.push(jobId);
    localStorage.setItem(APPLICATION_KEY, JSON.stringify(appliedJobs));

    // Redirect to application dashboard
    window.location.href = "student-application.html";

  } catch (err) {
    console.error("Apply Error:", err);
    alert(err.message);
  }
};

/* ==========================================================
   DOM READY INIT
========================================================== */
document.addEventListener("DOMContentLoaded", init);
