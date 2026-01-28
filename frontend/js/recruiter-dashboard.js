/*********************************
 * CONFIG
 *********************************/
const API_URL = "http://localhost:5000/api/recruiter/jobs";

// Get session and token
const session = JSON.parse(localStorage.getItem("placementor_session"));
if (!session || !session.token || session.user.role !== "recruiter") {
  alert("Session invalid. Please login again.");
  window.location.href = "login.html";
}
const token = session.token;

/*********************************
 * INIT DASHBOARD
 *********************************/
document.addEventListener("DOMContentLoaded", initDashboard);

async function initDashboard() {
  try {
    // Fetch all jobs posted by recruiter
    const res = await fetch(API_URL, {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      }
    });

    if (res.status === 401 || res.status === 403) {
      alert("Session expired or access denied. Login again.");
      return window.location.href = "login.html";
    }

    const jobs = await res.json();

    // Load all student applications from localStorage (or empty array)
    const allApplications = JSON.parse(localStorage.getItem("student_applications") || "[]");

    // Stats
    const jobsCount = jobs.length;
    const appsCount = allApplications.length;
    const shortlistedCount = allApplications.filter(a => a.status === "Shortlisted").length;

    // Update stats in DOM
    if (document.getElementById("count-jobs")) document.getElementById("count-jobs").textContent = jobsCount;
    if (document.getElementById("count-apps")) document.getElementById("count-apps").textContent = appsCount;
    if (document.getElementById("count-shortlisted")) document.getElementById("count-shortlisted").textContent = shortlistedCount;

    // Render jobs in dashboard
    renderJobs(jobs, allApplications);

  } catch (err) {
    console.error("Error initializing dashboard:", err);
    alert("Failed to load dashboard. Refresh the page.");
  }
}

/*********************************
 * RENDER JOBS
 *********************************/
function renderJobs(jobs, apps) {
  const container = document.getElementById("jobs-container");
  if (!container) return;

  if (!Array.isArray(jobs) || jobs.length === 0) {
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
    // Count applications for this job
    const specificApps = apps.filter(a => a.job?._id === job._id).length;
    const badge = statusColors[job.status?.toLowerCase()] || "bg-slate-50 text-slate-600 border-slate-200";

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
            <button onclick="viewApplicants('${job._id}')" class="bg-white border border-slate-200 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-slate-50 shadow-sm transition-colors">
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

  // Render lucide icons
  if (window.lucide) lucide.createIcons();
}

/*********************************
 * DELETE JOB
 *********************************/
window.deleteJob = async function(jobId) {
  if(!confirm("Are you sure you want to delete this job?")) return;

  try {
    const res = await fetch(`${API_URL}/${jobId}`, {
      method: "DELETE",
      headers: { 
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });

    if (!res.ok) throw new Error("Failed to delete job");

    initDashboard();
  } catch (err) {
    console.error("Delete job error:", err);
    alert("Failed to delete job. Try again.");
  }
};

/*********************************
 * VIEW APPLICANTS
 *********************************/
window.viewApplicants = function(jobId) {
    console.log("Storing jobId:", jobId)
  localStorage.setItem("filter_job_id", jobId);
  location.href = "manage-applicant.html";
};