/*********************************
 * RECRUITER DASHBOARD JS
 *********************************/

// Get session & token
//const session = JSON.parse(localStorage.getItem("placementor_session"));
////if (!session || !session.token || session.user.role !== "recruiter") {
//  alert("Session invalid. Please login again.");
//  window.location.href = "login.html";
//}
//const token = session.token;
const token = "";

// ---------------- INIT ----------------
"use strict";

document.addEventListener("DOMContentLoaded", initDashboard);

async function initDashboard() {
  try {
    const jobs = await apiRequest("/recruiter/jobs", "GET");
    const applications = await apiRequest("/recruiter/applications", "GET");

    const jobsCount = jobs.length;
    const appsCount = applications.length;
    const shortlistedCount = applications.filter(
      a => a.status?.toLowerCase() === "shortlisted"
    ).length;

    document.getElementById("count-jobs").textContent = jobsCount;
    document.getElementById("count-apps").textContent = appsCount;
    document.getElementById("count-shortlisted").textContent = shortlistedCount;

    renderJobs(jobs, applications);

  } catch (err) {
    console.error("Dashboard error:", err);
    alert("Failed to load dashboard. Refresh the page.");
  }
}

// ---------------- RENDER JOBS ----------------
function renderJobs(jobs, apps) {
  const container = document.getElementById("jobs-container");
  if (!container) return;

  if (!jobs.length) {
    container.innerHTML = `
      <div class="text-center py-10 border-2 border-dashed border-slate-200 rounded-xl">
        <p class="text-slate-400">You haven't posted any jobs yet.</p>
      </div>
    `;
    return;
  }

  const statusColors = {
    pending: "bg-amber-50 text-amber-600 border-amber-100",
    approved: "bg-emerald-50 text-emerald-600 border-emerald-100",
    rejected: "bg-rose-50 text-rose-600 border-rose-100"
  };

  container.innerHTML = [...jobs].reverse().map(job => {
    const specificApps = apps.filter(a => a.job?._id === job._id).length;
    const today = new Date();
    const deadline = new Date(job.deadline);
 
    const isExpired = deadline < today;

    const jobStatus = isExpired ? "Inactive" : "Active";

    const expiryColor = isExpired
    ? "text-red-500"
    : "text-green-600";  
    const badge = statusColors[job.status?.toLowerCase()] || "bg-slate-50 text-slate-600 border-slate-200";

    return `
      <div class="flex items-center justify-between p-5 border border-slate-100 rounded-xl hover:border-indigo-200 hover:bg-indigo-50/30 transition-all">
        <div>
          <h4 class="font-bold text-slate-800">${job.title}</h4>
          <p class="text-sm text-slate-500">
          <span class="${expiryColor} font-semibold">
          ${jobStatus}
          </span>
          • ${job.location || 'Remote'}
          </p>

        <p class="text-xs mt-1 ${expiryColor}">
        Deadline: ${deadline.toLocaleDateString()}
      </p>
        </div>

        <div class="flex items-center gap-6">
          <div class="text-right">
            <p class="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Applicants</p>
            <p class="text-xl font-bold text-slate-700">${specificApps}</p>
          </div>
          <div class="flex gap-2">
            <button onclick="viewApplicants('${job._id}')" class="bg-white border border-slate-200 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-slate-50 shadow-sm transition-colors">
              Manage
            </button>
            <button onclick="editJob('${job._id}')" 
           class="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors">
           Edit
          </button>
            <button onclick="deleteJob('${job._id}')" class="text-slate-400 hover:text-red-500 p-2 transition-colors">
              <i data-lucide="trash-2" class="w-5 h-5"></i>
            </button>
          </div>
        </div>
      </div>
    `;
  }).join("");

  // Render lucide icons
  if (window.lucide) lucide.createIcons();
}

// ---------------- DELETE JOB ----------------
window.deleteJob = async function(jobId) {
  if(!confirm("Are you sure you want to delete this job?")) return;

  try {
    await apiRequest(`/recruiter/jobs/${jobId}`, "DELETE");
    initDashboard();
  } catch (err) {
    console.error("Delete job error:", err);
    alert("Failed to delete job. Try again.");
  }
}

// ---------------- EDIT JOB ----------------
window.editJob = function(jobId) {
  localStorage.setItem("edit_job_id", jobId);
  location.href = "postjob.html";
}

// ---------------- VIEW APPLICANTS ----------------
window.viewApplicants = function(jobId) {
  localStorage.setItem("filter_job_id", jobId);
  location.href = "manage-applicant.html";
}
