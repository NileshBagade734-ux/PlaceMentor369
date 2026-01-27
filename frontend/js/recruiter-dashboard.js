const API_URL = "http://localhost:5000/api/recruiter/jobs";

// Get token from localStorage
const token = localStorage.getItem("token"); // ya jo frontend me login ke time save kiya tha

async function initDashboard() {
    try {
        const res = await fetch(API_URL, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        });

        if (res.status === 403) {
            alert("⚠️ Access Forbidden! Login again.");
            return window.location.href = "login.html";
        }

        let allJobs = [];
        if (res.ok) {
            allJobs = await res.json(); // backend se jobs array
        } else {
            console.warn("No jobs found in DB. Using fallback.");
            allJobs = JSON.parse(localStorage.getItem("all_jobs") || "[]");
        }

        // Get applications
        const allApplications = JSON.parse(localStorage.getItem("student_applications") || "[]");

        // Stats
        const jobsCount = allJobs.length;
        const appsCount = allApplications.length;
        const shortlistedCount = allApplications.filter(app => app.status === "Shortlisted").length;

        if(document.getElementById("count-jobs")) document.getElementById("count-jobs").textContent = jobsCount;
        if(document.getElementById("count-apps")) document.getElementById("count-apps").textContent = appsCount;
        if(document.getElementById("count-shortlisted")) document.getElementById("count-shortlisted").textContent = shortlistedCount;

        // Render
        renderJobs(allJobs, allApplications);

    } catch (err) {
        console.error("Error fetching jobs:", err);
    }
}

function renderJobs(jobs, apps) {
    const container = document.getElementById("jobs-container");
    if (!container) return;

    if (jobs.length === 0) {
        container.innerHTML = `<div class="text-center py-10 border-2 border-dashed border-slate-200 rounded-xl">
            <p class="text-slate-400">You haven't posted any jobs yet.</p>
        </div>`;
        return;
    }

    container.innerHTML = [...jobs].reverse().map(job => {
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
                        <button onclick="deleteJob('${job._id}')" class="text-slate-400 hover:text-red-500 p-2 transition-colors">
                            <i data-lucide="trash-2" class="w-5 h-5"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join("");

    if (window.lucide) lucide.createIcons();
}

window.deleteJob = async function(jobId) {
    if(!confirm("Are you sure you want to delete this job posting?")) return;

    try {
        const res = await fetch(`http://localhost:5000/api/recruiter/jobs/${jobId}`, {
            method: "DELETE",
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (!res.ok) throw new Error("Failed to delete job");

        initDashboard();
    } catch (err) {
        console.error(err);
        alert("Failed to delete job. Try again.");
    }
};

window.viewApplicants = function(jobTitle) {
    localStorage.setItem("filter_job_title", jobTitle);
    location.href = 'manage-applicants.html';
};

document.addEventListener("DOMContentLoaded", initDashboard);
