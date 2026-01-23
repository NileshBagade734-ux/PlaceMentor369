/* ==========================================================
   SHARED STORAGE KEYS
   ========================================================== */
const JOBS_KEY = "all_jobs";            
const RECRUITER_RAW_KEY = "posted_jobs"; 
const USER_KEY = "current_user";        
const APPLICATION_KEY = "student_applications";

/* ==========================================================
   STUDENT PROFILE (FETCH FROM LOCALSTORAGE OR MOCK)
   ========================================================== */
const studentSession = JSON.parse(localStorage.getItem(USER_KEY)) || {
    name: "Guest Student",
    cgpa: 9.0,
    branch: "Computer Science",
    skills: ["React", "Node.js", "JavaScript"]
};

const defaultJobs = [
    {
        id: "job_01",
        title: "Software Engineer",
        company: "Google",
        cgpa: 8.5,
        branches: ["Computer Science", "Information Technology"],
        deadline: "2026-02-15",
        skills: ["React", "Node.js", "Go"],
        description: "Develop large-scale cloud applications and solve complex infrastructure problems."
    }
];

let allAvailableJobs = [];
let appliedJobs = JSON.parse(localStorage.getItem(APPLICATION_KEY)) || [];

/* ==========================================================
   CORE LOGIC: INITIALIZATION
   ========================================================== */
function init() {
    // 1. Update UI Profile Header
    const infoTag = document.getElementById("student-info");
    if (infoTag) infoTag.innerText = `${studentSession.branch} | ${studentSession.cgpa} CGPA`;

    // 2. Fetch and Normalize Data
    const approvedJobs = JSON.parse(localStorage.getItem(JOBS_KEY) || "[]");
    const recruiterRaw = JSON.parse(localStorage.getItem(RECRUITER_RAW_KEY) || "[]");

    const normalize = (j) => ({
        id: j.id || `job_${Math.random()}`,
        title: j.title || "Untitled Role",
        company: j.company || "Unknown Company",
        cgpa: parseFloat(j.cgpa || j.cutoff || j.cgpaCutoff || 0),
        branches: j.branches || [],
        deadline: j.deadline || "TBD",
        skills: j.skills || [],
        description: j.description || j.desc || "No description provided."
    });

    // Merge everything (Recruiter posts + Admin approved + Defaults)
    const combined = [...approvedJobs, ...recruiterRaw, ...defaultJobs];
    const uniqueMap = new Map();
    combined.forEach(j => uniqueMap.set(j.id, normalize(j)));
    allAvailableJobs = Array.from(uniqueMap.values());

    renderList();
    if (window.lucide) lucide.createIcons();
}

/* ==========================================================
   UI COMPONENT: JOB LIST RENDER (LEFT SIDE)
   ========================================================== */
function renderList() {
    const list = document.getElementById("jobs-list");
    if (!list) return;

    list.innerHTML = allAvailableJobs.map(job => {
        const isEligible = studentSession.cgpa >= job.cgpa && job.branches.includes(studentSession.branch);

        return `
            <div onclick="selectJob('${job.id}')"
                id="card-${job.id}"
                class="job-card bg-white p-5 rounded-xl border border-slate-200 cursor-pointer hover:shadow-md transition-all mb-3">
                <div class="flex justify-between items-start mb-2">
                    <h3 class="font-bold text-slate-900">${job.title}</h3>
                    <span class="px-2 py-1 text-[10px] font-bold rounded 
                        ${isEligible ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}">
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
    }).join("");
}

/* ==========================================================
   UI COMPONENT: JOB DETAIL VIEW (RIGHT SIDE)
   ========================================================== */
window.selectJob = function(id) {
    const job = allAvailableJobs.find(j => j.id === id);
    const detailPane = document.getElementById("job-details");
    const emptyState = document.getElementById("empty-state");

    if (!detailPane || !job) return;

    // Toggle Active State visuals
    document.querySelectorAll(".job-card").forEach(c => {
        c.classList.remove("border-indigo-500", "bg-indigo-50", "ring-1", "ring-indigo-500");
    });
    const selectedCard = document.getElementById(`card-${id}`);
    if (selectedCard) selectedCard.classList.add("border-indigo-500", "bg-indigo-50", "ring-1", "ring-indigo-500");

    // Switch view from Empty State to Content
    if (emptyState) emptyState.classList.add("hidden");
    detailPane.classList.remove("hidden");

    const isApplied = appliedJobs.some(app => app.id === job.id);
    const isEligible = studentSession.cgpa >= job.cgpa && job.branches.includes(studentSession.branch);

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
                    class="px-10 py-4 rounded-xl font-bold text-white shadow-lg transition-all
                    ${isApplied ? "bg-slate-300 cursor-not-allowed" : !isEligible ? "bg-red-400 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700 hover:-translate-y-1 active:scale-95"}">
                    ${isApplied ? "Application Sent" : !isEligible ? "Criteria Not Met" : "Apply Now"}
                </button>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                <div class="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                    <p class="text-xs font-bold text-slate-400 uppercase mb-2">Requirement Check</p>
                    <p class="text-xl font-bold ${studentSession.cgpa >= job.cgpa ? "text-green-600" : "text-red-500"}">
                        Target: ${job.cgpa}+ (Yours: ${studentSession.cgpa})
                    </p>
                </div>

                <div class="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                    <p class="text-xs font-bold text-slate-400 uppercase mb-2">Matching Skills</p>
                    <div class="flex flex-wrap gap-2">
                        ${job.skills.map(skill => {
                            const hasSkill = studentSession.skills.includes(skill);
                            return `
                            <span class="px-2 py-1 text-xs rounded-lg border
                                ${hasSkill ? "bg-green-50 border-green-200 text-green-700 font-bold" : "bg-white border-slate-200 text-slate-400"}">
                                ${skill}
                            </span>`;
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
   LOGIC: APPLY HANDLER
   ========================================================== */
window.handleApply = function(jobId) {
    const job = allAvailableJobs.find(j => j.id === jobId);
    if (!job || appliedJobs.some(app => app.id === jobId)) return;

    const application = {
        id: job.id,
        company: job.company,
        role: job.title,
        appliedAt: new Date().toISOString(),
        status: "Pending"
    };

    appliedJobs.push(application);
    localStorage.setItem(APPLICATION_KEY, JSON.stringify(appliedJobs));

    alert(`✅ Application Sent to ${job.company}!`);
    selectJob(jobId); // Refresh detail view to show "Application Sent"
};

document.addEventListener("DOMContentLoaded", init);