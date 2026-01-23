/* /* ==========================================================
   SHARED KEYS & CONFIG
   ========================================================== */
const JOBS_KEY = "all_jobs";
const APPLICATION_KEY = "student_applications";
const USER_KEY = "current_user"; 

const branchesList = ["Computer Science", "Information Technology", "Electronics", "Mechanical", "Civil", "Electrical"];
const skillsSet = new Set();

/* ---------------- DOM ELEMENTS ---------------- */
const branchesContainer = document.getElementById("branchesContainer");
const skillsContainer = document.getElementById("skillsContainer");
const skillInput = document.getElementById("skillInput");
const jobForm = document.getElementById("jobForm");

/* ==========================================================
   RECRUITER LOGIC: JOB POSTING
   ========================================================== */
function initBranches() {
    if (!branchesContainer) return;
    branchesContainer.innerHTML = "";
    branchesList.forEach(branch => {
        const div = document.createElement("div");
        div.className = "flex items-center gap-2 bg-slate-50 p-2 rounded-lg border border-slate-100";
        div.innerHTML = `
            <input type="checkbox" name="branch" value="${branch}" class="w-4 h-4 accent-indigo-600">
            <span class="text-sm text-slate-700 font-medium">${branch}</span>
        `;
        branchesContainer.appendChild(div);
    });
}

// Skill Badge Management
if (document.getElementById("addSkillBtn")) {
    document.getElementById("addSkillBtn").addEventListener("click", () => {
        const skill = skillInput.value.trim();
        if (skill && !skillsSet.has(skill)) {
            skillsSet.add(skill);
            skillInput.value = "";
            renderSkills();
        }
    });

    skillInput.addEventListener("keypress", e => {
        if (e.key === "Enter") {
            e.preventDefault();
            document.getElementById("addSkillBtn").click();
        }
    });
}

function renderSkills() {
    if (!skillsContainer) return;
    skillsContainer.innerHTML = "";
    skillsSet.forEach(skill => {
        const badge = document.createElement("span");
        badge.className = "flex items-center gap-2 bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-sm font-semibold border border-indigo-100";
        badge.innerHTML = `
            ${skill} 
            <button type="button" class="hover:text-red-500 transition-colors">
                <i data-lucide="x" class="w-3 h-3"></i>
            </button>
        `;
        badge.querySelector("button").onclick = () => { skillsSet.delete(skill); renderSkills(); };
        skillsContainer.appendChild(badge);
    });
    if (window.lucide) lucide.createIcons();
}

// Handle Job Submission
if (jobForm) {
    jobForm.addEventListener("submit", e => {
        e.preventDefault();

        const selectedBranches = Array.from(document.querySelectorAll('input[name="branch"]:checked')).map(cb => cb.value);
        if (selectedBranches.length === 0) return alert("Select at least one branch!");

        const newJob = {
            id: "job_" + Date.now(),
            title: document.getElementById("title").value,
            company: document.getElementById("company").value,
            description: document.getElementById("description").value,
            cgpa: parseFloat(document.getElementById("cgpa").value) || 0,
            deadline: document.getElementById("deadline").value,
            branches: selectedBranches,
            skills: Array.from(skillsSet),
            postedDate: new Date().toISOString(),
            applicants: 0,
            status: "pending" 
        };

        const existingJobs = JSON.parse(localStorage.getItem(JOBS_KEY) || "[]");
        existingJobs.unshift(newJob);
        localStorage.setItem(JOBS_KEY, JSON.stringify(existingJobs));

        alert("✅ Job submitted for approval!");
        window.location.href = "recruiter-dashboard.html";
    });
}

/* ==========================================================
   ADMIN LOGIC: APPROVAL SYSTEM
   ========================================================== */
function loadAdminJobs() {
    const tableBody = document.getElementById("adminJobTableBody");
    if (!tableBody) return;

    const jobs = JSON.parse(localStorage.getItem(JOBS_KEY) || "[]");
    if (jobs.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="5" class="text-center p-4">No jobs found.</td></tr>`;
        return;
    }

    tableBody.innerHTML = jobs.map(job => {
        const isPending = job.status === "pending";
        return `
            <tr class="border-b hover:bg-slate-50">
                <td class="p-3"><strong>${job.company}</strong><br><small class="text-slate-500">${job.title}</small></td>
                <td class="p-3 text-sm">${job.branches.join(", ")}</td>
                <td class="p-3 text-center font-medium">${job.cgpa}</td>
                <td class="p-3">
                    <span class="px-2 py-1 rounded text-xs font-bold ${isPending ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}">
                        ${job.status.toUpperCase()}
                    </span>
                </td>
                <td class="p-3">
                    <div class="flex gap-2">
                        ${isPending ? `
                            <button onclick="changeStatus('${job.id}', 'approved')" class="bg-indigo-600 text-white px-3 py-1 rounded text-sm hover:bg-indigo-700">Approve</button>
                            <button onclick="removeJob('${job.id}')" class="bg-red-50 text-red-600 px-3 py-1 rounded text-sm hover:bg-red-100">Reject</button>
                        ` : `<span class="text-green-600 text-sm font-semibold flex items-center gap-1">✅ Published</span>`}
                    </div>
                </td>
            </tr>
        `;
    }).join("");
}

window.changeStatus = function(id, newStatus) {
    let jobs = JSON.parse(localStorage.getItem(JOBS_KEY) || "[]");
    jobs = jobs.map(j => j.id == id ? {...j, status: newStatus} : j);
    localStorage.setItem(JOBS_KEY, JSON.stringify(jobs));
    loadAdminJobs();
};

window.removeJob = function(id) {
    if(!confirm("Are you sure to delete/reject this job?")) return;
    let jobs = JSON.parse(localStorage.getItem(JOBS_KEY) || "[]");
    jobs = jobs.filter(j => j.id != id);
    localStorage.setItem(JOBS_KEY, JSON.stringify(jobs));
    loadAdminJobs();
};

/* ==========================================================
   STUDENT LOGIC: ELIGIBILITY & VIEW
   ========================================================== */
function loadStudentView() {
    const listContainer = document.getElementById("jobs-list");
    if (!listContainer) return;

    const currentStudent = JSON.parse(localStorage.getItem(USER_KEY)) || { name:"Guest", cgpa:0, branch:"None", skills:[] };
    const allJobs = JSON.parse(localStorage.getItem(JOBS_KEY) || "[]");
    const approvedJobs = allJobs.filter(j => j.status === "approved");

    if (approvedJobs.length === 0) {
        listContainer.innerHTML = `<div class="text-center p-10 text-slate-400">No approved jobs yet.</div>`;
        return;
    }

    listContainer.innerHTML = approvedJobs.map(job => {
        const branchMatch = job.branches.includes(currentStudent.branch);
        const cgpaMatch = parseFloat(currentStudent.cgpa) >= parseFloat(job.cgpa);
        const isEligible = branchMatch && cgpaMatch;

        return `
            <div class="job-card border-2 p-5 mb-4 rounded-2xl transition-all ${isEligible ? 'border-green-100 bg-white shadow-sm' : 'border-slate-100 bg-slate-50 opacity-75'}">
                <div class="flex justify-between items-start mb-2">
                    <div>
                        <h3 class="font-bold text-lg text-slate-800">${job.title}</h3>
                        <p class="text-indigo-600 font-medium">${job.company}</p>
                    </div>
                    <span class="px-3 py-1 rounded-full text-[10px] font-bold tracking-wider ${isEligible ? 'bg-green-500 text-white' : 'bg-slate-300 text-slate-600'}">
                        ${isEligible ? 'ELIGIBLE' : 'NOT ELIGIBLE'}
                    </span>
                </div>
                <div class="grid grid-cols-2 gap-4 mt-4 text-sm">
                    <div class="text-slate-600">
                        <span class="block text-[10px] uppercase text-slate-400">Required CGPA</span>
                        <strong>${job.cgpa}</strong>
                    </div>
                    <div class="text-slate-600">
                        <span class="block text-[10px] uppercase text-slate-400">Your CGPA</span>
                        <strong class="${cgpaMatch ? 'text-green-600' : 'text-red-600'}">${currentStudent.cgpa}</strong>
                    </div>
                </div>
                ${isEligible 
                    ? `<button onclick="applyForJob('${job.id}')" class="w-full mt-4 bg-indigo-600 text-white py-2 rounded-xl font-bold hover:bg-indigo-700">Apply Now</button>`
                    : `<p class="mt-4 text-xs text-red-500 italic text-center">You do not meet the criteria.</p>`}
            </div>
        `;
    }).join("");
}

window.applyForJob = function(jobId) {
    const user = JSON.parse(localStorage.getItem(USER_KEY));
    if (!user) return alert("Please log in as a student to apply.");

    const apps = JSON.parse(localStorage.getItem(APPLICATION_KEY) || "[]");
    
    // Check if already applied
    if (apps.some(a => a.jobId === jobId && a.studentEmail === user.email)) {
        return alert("You have already applied for this job.");
    }

    apps.push({
        jobId: jobId,
        studentEmail: user.email,
        studentName: user.name,
        appliedDate: new Date().toISOString()
    });

    localStorage.setItem(APPLICATION_KEY, JSON.stringify(apps));
    alert("🚀 Application submitted successfully!");
};

/* ==========================================================
   GLOBAL INIT
   ========================================================== */
document.addEventListener("DOMContentLoaded", () => {
    initBranches();
    loadAdminJobs();
    loadStudentView();
    if (window.lucide) lucide.createIcons();
});