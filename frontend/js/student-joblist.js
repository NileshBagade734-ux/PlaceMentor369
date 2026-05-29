/* ==========================================================
   STORAGE KEYS & TOKEN
========================================================== */
const API = "http://localhost:5000/api/student";
const USER_KEY = "current_user";
const APPLICATION_KEY = "student_applications";
const RESUME_ANALYSIS_KEY = "resume_analysis_cache";

function getToken() {
  const session = JSON.parse(localStorage.getItem("placementor_session"));
  return session?.token || null;
}

const STOP_WORDS = new Set([
  "the", "and", "for", "with", "your", "from", "that", "this", "into", "about", "role", "team",
  "work", "jobs", "job", "resume", "student", "company", "profile", "skills", "experience", "using",
  "develop", "build", "apply", "candidate", "project", "projects", "software", "engineer", "engineering",
  "manage", "strong", "good", "best", "more", "less", "able", "must", "need", "should", "include",
  "responsibilities", "requirements", "preferred", "nice", "based", "will", "have", "has", "our", "you",
  "we", "they", "their", "have", "been", "were", "are", "was", "into", "such", "also", "including"
]);

const DOMAIN_TIPS = [
  {
    test: /(frontend|ui|ux|react|html|css|javascript|web)/i,
    tips: [
      "Highlight shipped UI features, performance work, and component ownership.",
      "Mention accessible design choices, responsive layouts, and measurable frontend impact."
    ]
  },
  {
    test: /(backend|api|node|express|java|python|database|sql|server)/i,
    tips: [
      "Call out APIs, databases, authentication, and deployment experience.",
      "Include scale, latency, or reliability improvements if you have them."
    ]
  },
  {
    test: /(data|analytics|ml|ai|machine learning|python|power bi|excel)/i,
    tips: [
      "Show datasets, models, dashboards, or analytical outcomes with numbers.",
      "Add tools, methods, and business impact so the recruiter can follow the value quickly."
    ]
  },
  {
    test: /(cloud|devops|aws|azure|docker|kubernetes|ci\/cd|terraform)/i,
    tips: [
      "Mention cloud services, deployments, and automation that improved delivery speed.",
      "Include infrastructure ownership, monitoring, and security-related work where relevant."
    ]
  }
];

let selectedJob = null;
let selectedResumeFile = null;

function normalizeKeyword(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9+#.-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function uniqueList(values) {
  return [...new Set(values.map(normalizeKeyword).filter(Boolean))];
}

function tokenizeKeywords(text) {
  const rawTokens = String(text || "").match(/[a-zA-Z][a-zA-Z0-9.+#-]{1,}/g) || [];
  return uniqueList(rawTokens.filter(token => !STOP_WORDS.has(token.toLowerCase())));
}

function getTargetRoleLabel() {
  if (!selectedJob) return "General placement readiness";
  return `${selectedJob.title} · ${selectedJob.company}`;
}

function updateResumeTargetLabel() {
  const targetRole = document.getElementById("resume-target-role");
  if (targetRole) targetRole.textContent = getTargetRoleLabel();
}

function getJobKeywords(job) {
  if (!job) {
    return uniqueList([
      ...COMMON_ATS_KEYWORDS,
      "education",
      "projects",
      "internship",
      "achievements",
      "communication"
    ]);
  }

  const jobSkills = Array.isArray(job.skills) ? job.skills : [];
  const titleKeywords = tokenizeKeywords(job.title || "");
  const descriptionKeywords = tokenizeKeywords(job.description || "").filter(keyword => keyword.length > 3);

  return uniqueList([
    ...COMMON_ATS_KEYWORDS,
    ...jobSkills,
    ...titleKeywords,
    ...descriptionKeywords
  ]).slice(0, 24);
}

const COMMON_ATS_KEYWORDS = [
  "resume",
  "summary",
  "objective",
  "education",
  "experience",
  "projects",
  "skills",
  "internship",
  "certification",
  "achievement",
  "leadership",
  "communication",
  "problem solving",
  "teamwork"
];

function classifyScore(score) {
  if (score >= 85) return { label: "Excellent", tone: "#34d399" };
  if (score >= 70) return { label: "Strong", tone: "#60a5fa" };
  if (score >= 50) return { label: "Needs polish", tone: "#fbbf24" };
  return { label: "Needs work", tone: "#fb7185" };
}

function getDomainTips(job) {
  const referenceText = `${job?.title || ""} ${job?.description || ""}`;
  const matched = DOMAIN_TIPS.find(item => item.test.test(referenceText));
  return matched ? matched.tips : [
    "Tailor the top summary and key projects to the exact role you are targeting.",
    "Quantify outcomes where possible so the resume reads like evidence, not just responsibilities."
  ];
}

function buildResumeAdvice(text, job) {
  const readableText = String(text || "");
  const normalizedText = normalizeKeyword(readableText);
  const jobKeywords = getJobKeywords(job);

  const matchedKeywords = [];
  const missingKeywords = [];

  jobKeywords.forEach(keyword => {
    if (normalizedText.includes(keyword)) {
      matchedKeywords.push(keyword);
    } else {
      missingKeywords.push(keyword);
    }
  });

  const wordCount = readableText.trim() ? readableText.trim().split(/\s+/).length : 0;
  const hasContact = /\b[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}\b/i.test(readableText) || /linkedin|github|portfolio|phone|mobile|contact/i.test(readableText);
  const hasSummary = /\b(summary|profile|objective|about me)\b/i.test(readableText);
  const hasEducation = /\b(education|academic|qualification)\b/i.test(readableText);
  const hasExperience = /\b(experience|internship|work experience|employment)\b/i.test(readableText);
  const hasProjects = /\b(project|projects)\b/i.test(readableText);
  const hasSkills = /\b(skills|technical skills|core skills)\b/i.test(readableText);
  const hasBullets = /(^|\n)\s*[-*•]/m.test(readableText);
  const hasNumbers = /\b\d+\b/.test(readableText);

  let score = 24;
  const coverage = jobKeywords.length ? matchedKeywords.length / jobKeywords.length : 0;
  score += Math.round(coverage * 44);
  if (hasContact) score += 8;
  if (hasSummary) score += 4;
  if (hasEducation) score += 4;
  if (hasExperience) score += 4;
  if (hasProjects) score += 4;
  if (hasSkills) score += 4;
  if (hasBullets) score += 4;
  if (hasNumbers) score += 4;

  if (wordCount < 180) score -= 10;
  if (wordCount > 1200) score -= 4;
  if (!hasContact) score -= 8;
  if (!hasBullets) score -= 4;
  if (!hasSummary) score -= 3;

  score = Math.max(0, Math.min(100, Math.round(score)));

  const recommendations = [];
  if (!hasContact) recommendations.push("Add a clear email, phone number, and LinkedIn or GitHub link at the top.");
  if (!hasSummary) recommendations.push("Add a 2 to 3 line summary that names the role you want and the value you bring.");
  if (!hasEducation) recommendations.push("Include an education section so recruiters can quickly confirm eligibility.");
  if (!hasExperience && !hasProjects) recommendations.push("Add projects or internship experience to show practical work beyond coursework.");
  if (!hasSkills) recommendations.push("Create a dedicated skills section with tools, languages, and frameworks that match the role.");
  if (!hasBullets) recommendations.push("Use bullet points for achievements so the resume is easy to scan.");
  if (!hasNumbers) recommendations.push("Add metrics, percentages, or counts to make accomplishments more credible.");

  if (missingKeywords.length) {
    recommendations.push(`Work these role keywords into the summary or project bullets: ${missingKeywords.slice(0, 6).join(", ")}.`);
  }

  const formattingTips = [];
  if (wordCount < 250) formattingTips.push("Your resume is very short. Add projects, internships, or certifications to build substance.");
  if (wordCount > 900) formattingTips.push("The resume is long. Trim repeated details and keep the strongest evidence near the top.");
  if (!hasBullets) formattingTips.push("Switch dense paragraphs into bullet points for faster ATS and recruiter scanning.");
  if (hasBullets && !hasNumbers) formattingTips.push("Attach numbers to bullets where possible. Impact is easier to understand than general claims.");
  if (formattingTips.length === 0) formattingTips.push("Formatting looks balanced. Keep the layout consistent and avoid unusual tables or graphics.");

  return {
    score,
    level: classifyScore(score),
    matchedKeywords,
    missingKeywords,
    recommendations,
    formattingTips,
    domainTips: getDomainTips(job),
    wordCount,
    coverage: Math.round(coverage * 100)
  };
}

function setAnalyzerStatus(message) {
  const status = document.getElementById("resume-analysis-status");
  if (status) status.textContent = message;
}

function setMetricValue(elementId, value) {
  const element = document.getElementById(elementId);
  if (element) element.textContent = value;
}

function renderKeywordChips(keywords, type, emptyLabel) {
  if (!keywords.length) {
    return `<p class="analysis-note">${emptyLabel}</p>`;
  }

  return `<div class="keyword-chip-group">${keywords
    .slice(0, 12)
    .map(keyword => `<span class="keyword-chip ${type}">${keyword}</span>`)
    .join("")}</div>`;
}

function renderAnalysisList(items) {
  if (!items.length) {
    return `<p class="analysis-note">Nothing to flag right now.</p>`;
  }

  return `<ul class="analysis-list">${items.map(item => `<li>${item}</li>`).join("")}</ul>`;
}

function updateScoreBadge(score, label, color) {
  const scoreBadge = document.getElementById("resume-score-pill");
  if (!scoreBadge) return;

  scoreBadge.textContent = `${score}/100`;
  scoreBadge.style.color = color;
  scoreBadge.style.borderColor = color;
  scoreBadge.style.boxShadow = `0 0 0 1px ${color}22`;
  scoreBadge.title = label;
}

function renderResumeAnalysis(result, fileName) {
  const output = document.getElementById("resume-analysis-output");
  if (!output) return;

  setMetricValue("resume-match-pill", String(result.matchedKeywords.length));
  setMetricValue("resume-missing-pill", String(result.missingKeywords.length));
  updateScoreBadge(result.score, result.level.label, result.level.tone);
  setAnalyzerStatus(`${result.level.label} match`);

  output.innerHTML = `
    <div class="analysis-panel">
      <div class="analysis-summary">
        <div>
          <p class="text-[11px] font-semibold uppercase tracking-[0.24em] text-indigo-200">${fileName}</p>
          <h3 class="mt-1 text-lg font-semibold text-white">ATS score ${result.score}/100 · ${result.level.label}</h3>
          <p class="mt-2 text-slate-300">Coverage: ${result.coverage}% of target keywords matched across the resume.</p>
        </div>
        <div class="analysis-score-badge" style="border-color:${result.level.tone}; color:${result.level.tone}; box-shadow:0 0 0 1px ${result.level.tone}22;">
          ${result.score}/100
          <small>${result.level.label}</small>
        </div>
      </div>

      <div class="analysis-grid">
        <section class="analysis-card">
          <h4>Matched keywords</h4>
          ${renderKeywordChips(result.matchedKeywords, "matched", "No target keywords detected yet.")}
        </section>
        <section class="analysis-card">
          <h4>Missing keywords</h4>
          ${renderKeywordChips(result.missingKeywords, "missing", "The resume already covers the target keywords.")}
        </section>
        <section class="analysis-card">
          <h4>Formatting tips</h4>
          ${renderAnalysisList(result.formattingTips)}
        </section>
        <section class="analysis-card">
          <h4>Resume recommendations</h4>
          ${renderAnalysisList(result.recommendations)}
        </section>
        <section class="analysis-card" style="grid-column: 1 / -1;">
          <h4>Domain-specific guidance</h4>
          ${renderAnalysisList(result.domainTips)}
        </section>
      </div>

      <p class="analysis-note">ATS compatibility is only a guidance layer. Keep the final review human-controlled before applying.</p>
    </div>
  `;

  localStorage.setItem(
    RESUME_ANALYSIS_KEY,
    JSON.stringify({ fileName, result, targetRole: getTargetRoleLabel(), savedAt: new Date().toISOString() })
  );
}

function readFileAsText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("Unable to read the file."));
    reader.readAsText(file);
  });
}

async function extractResumeText(file) {
  const extension = (file.name.split(".").pop() || "").toLowerCase();

  if (extension === "pdf") {
    if (!window.pdfjsLib) throw new Error("PDF parsing library is unavailable.");
    const buffer = await file.arrayBuffer();
    const pdf = await window.pdfjsLib.getDocument({ data: buffer }).promise;
    let text = "";

    for (let pageIndex = 1; pageIndex <= pdf.numPages; pageIndex += 1) {
      const page = await pdf.getPage(pageIndex);
      const content = await page.getTextContent();
      text += content.items.map(item => item.str).join(" ") + "\n";
    }

    return text;
  }

  if (extension === "docx") {
    if (!window.mammoth) throw new Error("DOCX parsing library is unavailable.");
    const buffer = await file.arrayBuffer();
    const result = await window.mammoth.extractRawText({ arrayBuffer: buffer });
    return result.value || "";
  }

  if (extension === "doc") {
    const buffer = await file.arrayBuffer();
    try {
      const decoder = new TextDecoder("windows-1252");
      return decoder.decode(buffer).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, " ");
    } catch {
      const decoder = new TextDecoder();
      return decoder.decode(buffer).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, " ");
    }
  }

  return readFileAsText(file);
}

async function analyzeSelectedResume() {
  const fileInput = document.getElementById("resume-file");
  if (!fileInput || !fileInput.files || !fileInput.files[0]) {
    setAnalyzerStatus("Please choose a resume file first");
    alert("Please upload a resume file first.");
    return;
  }

  selectedResumeFile = fileInput.files[0];
  setAnalyzerStatus("Analyzing resume...");

  try {
    const text = await extractResumeText(selectedResumeFile);
    const result = buildResumeAdvice(text, selectedJob);
    renderResumeAnalysis(result, selectedResumeFile.name);
  } catch (error) {
    console.error("Resume analysis error:", error);
    setAnalyzerStatus("Analysis failed");
    const output = document.getElementById("resume-analysis-output");
    if (output) {
      output.innerHTML = `
        <div class="analysis-note">
          We could not extract text from this file. Please upload a PDF, DOCX, TXT file, or a simpler DOC file export so the analyzer can read the contents.
        </div>
      `;
    }
  }
}

function bindResumeAnalyzer() {
  const fileInput = document.getElementById("resume-file");
  const analyzeBtn = document.getElementById("analyze-resume-btn");
  const fileHint = document.getElementById("resume-file-hint");

  if (fileInput && !fileInput.dataset.bound) {
    fileInput.addEventListener("change", () => {
      selectedResumeFile = fileInput.files?.[0] || null;
      if (fileHint) {
        fileHint.textContent = selectedResumeFile ? `Selected: ${selectedResumeFile.name}` : "No file selected yet.";
      }
      setAnalyzerStatus(selectedResumeFile ? "Ready to analyze" : "Waiting for a file");
    });
    fileInput.dataset.bound = "true";
  }

  if (analyzeBtn && !analyzeBtn.dataset.bound) {
    analyzeBtn.addEventListener("click", analyzeSelectedResume);
    analyzeBtn.dataset.bound = "true";
  }

  updateResumeTargetLabel();
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
        branch: job.branch || [],
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

  // -----------------------------
  // Fetch applied jobs
  // -----------------------------
  try {
    const resApps = await fetch("http://localhost:5000/api/student/applications", {
      headers: { "Authorization": `Bearer ${token}` }
    });

    if (resApps.ok) {
      const apps = await resApps.json();
      appliedJobs = apps.map(a => a.job._id);
      localStorage.setItem(APPLICATION_KEY, JSON.stringify(appliedJobs));
    } else {
      appliedJobs = JSON.parse(localStorage.getItem(APPLICATION_KEY)) || [];
    }
  } catch (err) {
    console.error("Failed to fetch applied jobs:", err);
    appliedJobs = JSON.parse(localStorage.getItem(APPLICATION_KEY)) || [];
  }

  renderJobList();
  if (window.lucide) lucide.createIcons();
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
                <p class="text-[10px] text-slate-400 uppercase font-medium">Deadline: ${job.deadline}</p>
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

  selectedJob = job;
  updateResumeTargetLabel();

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
          ${isApplied ? "Application Sent" : !isEligible ? "Criteria Not Met" : "Apply Now"}
        </button>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <div class="p-6 bg-slate-50 rounded-2xl border border-slate-100">
          <p class="text-xs font-bold text-slate-400 uppercase mb-2">Requirement Check</p>
          <p class="text-xl font-bold ${isEligible ? "text-green-600" : "text-red-500"}">
            Target: ${job.cgpa}+ (Yours: ${studentSession.cgpa})
          </p>
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

      <div class="mt-10 rounded-2xl border border-slate-200 bg-slate-50 p-6">
        <div class="flex flex-col gap-2 md:flex-row md:items-center md:justify-between mb-4">
          <div>
            <p class="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Resume guidance</p>
            <h3 class="text-lg font-semibold text-slate-900">Use this analyzer before you hit apply</h3>
          </div>
          <p class="text-sm text-slate-500">This score is advisory and can be rerun after every resume change.</p>
        </div>
        <ul class="analysis-list analysis-list--dark">
          <li>Upload your current resume, review the missing keywords, and update the file before applying.</li>
          <li>The analyzer weights the selected job title, skills, and description so the feedback is role-aware.</li>
          <li>Keep the final hiring decision human-controlled. The score is guidance, not an approval gate.</li>
        </ul>
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

    alert("✅ Applied successfully");

    // Optional: prevent re-apply instantly
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
document.addEventListener("DOMContentLoaded", async () => {
  await init();
  bindResumeAnalyzer();
});
