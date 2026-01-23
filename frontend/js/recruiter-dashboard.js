/* ==========================================================
   CONFIG: Use the same key across all files
   ========================================================== */
const JOBS_KEY = "all_jobs"; 
const APPLICATIONS_KEY = "student_applications";

/**
 * RECRUITER DASHBOARD LOGIC
 */
function initDashboard() {
    // 1. Fetch data using the correct SHARED key
    const allJobs = JSON.parse(localStorage.getItem(JOBS_KEY) || "[]");
    const allApplications = JSON.parse(localStorage.getItem(APPLICATIONS_KEY) || "[]");

    // 2. Calculate Stats
    const jobsCount = allJobs.length;
    const appsCount = allApplications.length;
    const shortlistedCount = allApplications.filter(app => app.status === "Shortlisted").length;

    // 3. Update Stats UI
    if(document.getElementById("count-jobs")) document.getElementById("count-jobs").textContent = jobsCount;
    if(document.getElementById("count-apps")) document.getElementById("count-apps").textContent = appsCount;
    if(document.getElementById("count-shortlisted")) document.getElementById("count-shortlisted").textContent = shortlistedCount;

    // 4. Render Jobs List
    renderJobs(allJobs, allApplications);
}

function renderJobs(jobs, apps) {
    const container = document.getElementById("jobs-container");
    if (!container) return;
    
    if (jobs.length === 0) {
        container.innerHTML = `
            <div class="text-center py-10 border-2 border-dashed border-slate-200 rounded-xl">
                <p class="text-slate-400">You haven't posted any jobs yet.</p>
            </div>`;
        return;
    }

    // Show latest jobs first
    container.innerHTML = [...jobs].reverse().map(job => {
        // Count applications for this specific job
        const specificApps = apps.filter(a => a.role === job.title && a.company === job.company).length;

        return `
            <div class="flex items-center justify-between p-5 border border-slate-100 rounded-xl hover:border-indigo-200 hover:bg-indigo-50/30 transition-all">
                <div>
                    <h4 class="font-bold text-slate-800">${job.title}</h4>
                    <p class="text-sm text-slate-500">
                        <span class="capitalize">${job.status || 'Pending'}</span> • ${job.location || 'Remote'}
                    </p>
                </div>
                <div class="flex items-center gap-6">
                    <div class="text-right">
                        <p class="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Applicants</p>
                        <p class="text-xl font-bold text-slate-700">${specificApps}</p>
                    </div>
                    <div class="flex gap-2">
                        <button onclick="viewApplicants('${job.title}')" class="bg-white border border-slate-200 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-slate-50 shadow-sm transition-colors">
                            Manage
                        </button>
                        <button onclick="deleteJob('${job.id}')" class="text-slate-400 hover:text-red-500 p-2 transition-colors">
                            <i data-lucide="trash-2" class="w-5 h-5"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join("");

    if (window.lucide) lucide.createIcons();
}

/**
 * DELETE JOB
 */
window.deleteJob = function(jobId) {
    if(!confirm("Are you sure you want to delete this job posting?")) return;
    
    let jobs = JSON.parse(localStorage.getItem(JOBS_KEY) || "[]");
    jobs = jobs.filter(j => j.id !== jobId);
    localStorage.setItem(JOBS_KEY, JSON.stringify(jobs));
    
    initDashboard(); // Refresh UI
};

window.viewApplicants = function(jobTitle) {
    localStorage.setItem("filter_job_title", jobTitle);
    location.href = 'manage-applicants.html';
}

// Run on load
document.addEventListener("DOMContentLoaded", initDashboard);