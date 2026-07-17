const session = JSON.parse(localStorage.getItem("placementor_session"));

if (!session || !session.token || session.user.role !== "student") {
  window.location.href = "../login.html";
}

const user = session.user;

document.addEventListener("DOMContentLoaded", () => {
  // Initialize Lucide icons
  if (window.lucide) {
    lucide.createIcons();
  }
  
  // Wire up theme toggler
  initTheme();

  // Attach logout handler
  attachLogout();

  // Load ATS Dashboard statistics
  loadAtsDashboard();
});

function initTheme() {
  const themeToggle = document.getElementById("themeToggle");
  const body = document.getElementById("dashboardBody");
  
  if (themeToggle && body) {
    // Initial theme set
    if (localStorage.getItem("theme") === "dark") {
      body.classList.add("dark-mode");
      themeToggle.textContent = "☀️ Light Mode";
    } else {
      body.classList.remove("dark-mode");
      themeToggle.textContent = "🌙 Dark Mode";
    }

    themeToggle.addEventListener("click", () => {
      body.classList.toggle("dark-mode");
      const isDark = body.classList.contains("dark-mode");
      localStorage.setItem("theme", isDark ? "dark" : "light");
      themeToggle.textContent = isDark ? "☀️ Light Mode" : "🌙 Dark Mode";
    });
  } else {
    // Fallback apply
    if (localStorage.getItem("theme") === "dark") {
      document.body.classList.add("dark-mode");
    }
  }
}

function attachLogout() {
  document.getElementById("logoutBtn")?.addEventListener("click", () => {
    localStorage.clear();
    window.location.href = "../login.html";
  });
}

async function loadAtsDashboard() {
  const loading = document.getElementById("loadingState");
  const noResume = document.getElementById("noResumeState");
  const content = document.getElementById("dashboardContent");

  try {
    const res = await fetch(`${API_BASE_URL}/student/ats-dashboard`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${session.token}`,
        "Content-Type": "application/json"
      }
    });

    if (!res.ok) {
      if (res.status === 401) {
        localStorage.clear();
        window.location.href = "../login.html";
        return;
      }
      throw new Error("Failed to load ATS dashboard data.");
    }

    const data = await res.json();

    // Check if the student has a resume uploaded or atsScore exists
    if (!data.resume || data.atsScore === undefined || data.atsScore === null) {
      loading.classList.add("hidden");
      noResume.classList.remove("hidden");
      content.classList.add("hidden");
      return;
    }

    // Hide loader and show content
    loading.classList.add("hidden");
    noResume.classList.add("hidden");
    content.classList.remove("hidden");

    // Render components
    renderAtsScore(data.atsScore, data.resumeAnalysis);
    renderSectionAnalysis(data.sectionAnalysis);
    renderMissingSkills(data.missingSkills);
    renderSuggestions(data.improvementSuggestions);
    renderRoadmap(data.aiRoadmap);

    // Re-trigger Lucide icons for injected HTML
    if (window.lucide) {
      lucide.createIcons();
    }

  } catch (err) {
    console.error("ATS Dashboard Error:", err);
    loading.classList.add("hidden");
    noResume.classList.remove("hidden");
    content.classList.add("hidden");
    // Show user-friendly message inside the no-resume element
    const noResumeTitle = noResume.querySelector("h3");
    const noResumeDesc = noResume.querySelector("p");
    if (noResumeTitle && noResumeDesc) {
      noResumeTitle.textContent = "Unable to load ATS details";
      noResumeDesc.textContent = "There was an error communicating with the backend. Please check your connection or try re-uploading your resume.";
    }
  }
}

function renderAtsScore(score, analysisText) {
  const scoreText = document.getElementById("scoreText");
  const circle = document.getElementById("scoreProgressCircle");
  const badge = document.getElementById("scoreBadge");
  const summary = document.getElementById("atsSummaryText");

  // Animate text counter
  let currentScore = 0;
  const interval = setInterval(() => {
    if (currentScore >= score) {
      scoreText.textContent = score;
      clearInterval(interval);
    } else {
      currentScore++;
      scoreText.textContent = currentScore;
    }
  }, 12);

  // Animate circular ring
  // Circumference = 2 * PI * r = 2 * 3.14159 * 40 = 251.2
  const maxDashOffset = 251.2;
  const offset = maxDashOffset - (maxDashOffset * score) / 100;
  circle.style.strokeDashoffset = offset;

  // Set badge and circle color based on score range
  if (score >= 85) {
    badge.textContent = "Excellent Match";
    badge.className = "px-3 py-1 rounded-full text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 mt-2 mb-4";
    circle.style.stroke = "#10b981"; // Emerald-500
  } else if (score >= 70) {
    badge.textContent = "Strong Foundation";
    badge.className = "px-3 py-1 rounded-full text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 mt-2 mb-4";
    circle.style.stroke = "#3b82f6"; // Blue-500
  } else if (score >= 50) {
    badge.textContent = "Needs Work";
    badge.className = "px-3 py-1 rounded-full text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 mt-2 mb-4";
    circle.style.stroke = "#f59e0b"; // Amber-500
  } else {
    badge.textContent = "Critical Fixes Needed";
    badge.className = "px-3 py-1 rounded-full text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 mt-2 mb-4";
    circle.style.stroke = "#ef4444"; // Red-500
  }

  // Set summary analysis text
  summary.textContent = analysisText || "Your resume presents solid baseline layout formatting. Update the suggested sections below to maximize scoring criteria.";
}

function renderSectionAnalysis(analysis) {
  const container = document.getElementById("sectionsChecklist");
  if (!container) return;

  const sectionKeys = [
    { key: "contactInformation", label: "Contact Details" },
    { key: "education", label: "Education" },
    { key: "skills", label: "Skills Section" },
    { key: "projects", label: "Projects Details" },
    { key: "experience", label: "Work Experience" },
    { key: "achievements", label: "Achievements" },
    { key: "certifications", label: "Certifications" }
  ];

  if (!analysis) {
    container.innerHTML = `<p class="col-span-2 text-slate-400 text-sm">No section details found.</p>`;
    return;
  }

  container.innerHTML = sectionKeys.map(sec => {
    const detail = analysis[sec.key] || { status: "Missing", suggestions: "Section not found or lacks headers." };
    
    // Config icons/badge design per status
    let statusClass = "";
    let iconHTML = "";
    
    if (detail.status === "Present") {
      statusClass = "checklist-item--done";
      iconHTML = `<div class="checklist-icon"><i data-lucide="check-circle" class="w-4 h-4 text-emerald-600"></i></div>`;
    } else if (detail.status === "Weak") {
      statusClass = "checklist-item--pending";
      iconHTML = `<div class="checklist-icon"><i data-lucide="alert-triangle" class="w-4 h-4 text-amber-600"></i></div>`;
    } else {
      statusClass = "checklist-item--pending bg-rose-50 border-rose-200 text-rose-800";
      iconHTML = `<div class="checklist-icon bg-rose-100 text-rose-600"><i data-lucide="x-circle" class="w-4 h-4 text-rose-600"></i></div>`;
    }

    // Let's create an expandable card for each section
    return `
      <div class="section-card border border-slate-200 bg-white rounded-xl p-4 flex flex-col justify-between shadow-sm hover:shadow-md transition-all duration-200">
        <div class="flex items-start justify-between gap-2 mb-2">
          <div class="flex items-center gap-2">
            ${iconHTML}
            <h4 class="font-bold text-slate-800 text-sm">${sec.label}</h4>
          </div>
          <span class="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
            detail.status === 'Present' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
            detail.status === 'Weak' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
            'bg-rose-50 text-rose-700 border border-rose-200'
          }">
            ${detail.status}
          </span>
        </div>
        <p class="text-slate-500 text-xs mt-1 leading-relaxed line-clamp-2 hover:line-clamp-none transition-all duration-300">
          ${detail.suggestions || 'Format looks correct and parsing headers are intact.'}
        </p>
      </div>
    `;
  }).join("");
}

function renderMissingSkills(skills) {
  const container = document.getElementById("missingSkillsContainer");
  if (!container) return;

  if (!skills || skills.length === 0) {
    container.innerHTML = `
      <div class="flex flex-col items-center justify-center py-6 text-center w-full">
        <i data-lucide="sparkles" class="w-8 h-8 text-emerald-500 mb-2"></i>
        <p class="text-sm text-slate-500 font-medium">All essential skills found!</p>
      </div>
    `;
    return;
  }

  container.innerHTML = skills.map(skill => `
    <span class="px-3 py-1.5 bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 transition-all rounded-full text-xs font-semibold flex items-center gap-1.5">
      <i data-lucide="plus" class="w-3.5 h-3.5"></i> ${skill}
    </span>
  `).join("");
}

function renderSuggestions(suggestions) {
  const container = document.getElementById("improvementSuggestionsList");
  if (!container) return;

  if (!suggestions || suggestions.length === 0) {
    container.innerHTML = `
      <li class="flex items-center gap-2 text-slate-500 italic text-sm">
        <i data-lucide="check" class="w-4 h-4 text-emerald-500"></i> No additional changes suggested.
      </li>
    `;
    return;
  }

  container.innerHTML = suggestions.map(sug => `
    <li class="flex items-start gap-3 bg-slate-50 p-3 rounded-lg border border-slate-100 hover:border-slate-200 transition-all text-xs text-slate-700 leading-relaxed shadow-sm">
      <i data-lucide="arrow-right-circle" class="w-4 h-4 text-indigo-600 mt-0.5 flex-shrink-0"></i>
      <span>${sug}</span>
    </li>
  `).join("");
}

function renderRoadmap(roadmap) {
  const container = document.getElementById("aiRoadmapContainer");
  if (!container) return;

  if (!roadmap || roadmap.length === 0) {
    container.innerHTML = `
      <p class="col-span-3 text-slate-400 text-sm text-center py-6">
        No roadmap steps loaded yet. Update your skills in the profile page to generate a personalized learning roadmap.
      </p>
    `;
    return;
  }

  container.innerHTML = roadmap.map((step, idx) => `
    <div class="bg-gradient-to-br from-indigo-50/50 to-white border border-indigo-100 rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between relative overflow-hidden">
      <!-- Decorative background step number -->
      <span class="absolute -right-2 -bottom-4 text-6xl font-black text-slate-100/60 select-none">${idx + 1}</span>
      
      <div class="z-10">
        <span class="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold mb-4 shadow-md shadow-indigo-100">
          ${idx + 1}
        </span>
        <h4 class="font-bold text-slate-800 text-sm mb-2">Step ${idx + 1}</h4>
        <p class="text-xs text-slate-600 leading-relaxed">
          ${step}
        </p>
      </div>
    </div>
  `).join("");
}
