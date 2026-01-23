/* ==========================================================
   SHARED DATABASE KEYS
   ========================================================== */
const JOBS_KEY = "all_jobs";

/* ==========================================================
   ADMIN: LOAD & MANAGE JOBS
   ========================================================== */
function loadAdminJobs() {
    const tableBody = document.getElementById("adminJobTableBody");
    if (!tableBody) return;

    const jobs = JSON.parse(localStorage.getItem(JOBS_KEY) || "[]");

    if (jobs.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="6" class="text-center p-4">No job postings found.</td></tr>`;
        return;
    }

    tableBody.innerHTML = jobs.map(job => {
        const isPending = job.status === "pending";
        const branches = job.branches || [];
        
        return `
            <tr>
                <td>
                    <strong>${job.company}</strong><br>
                    <small style="color: #64748b;"><i class="fa-solid fa-location-dot"></i> Remote / On-site</small>
                </td>
                <td>${job.title}</td>
                <td class="text-center"><strong>${job.cgpa}</strong></td>
                <td>${job.deadline || 'N/A'}</td>
                <td>
                    <span class="badge ${isPending ? 'badge-pending' : 'badge-verified'}">
                        ${isPending ? 'Pending Approval' : 'Verified'}
                    </span>
                </td>
                <td>
                    <div class="action-group">
                        ${isPending ? `
                            <button onclick="changeStatus('${job.id}', 'approved')" class="btn-action btn-verify">
                                <i class="fa-solid fa-check"></i> Approve
                            </button>
                            <button onclick="removeJob('${job.id}')" class="btn-action btn-reject">
                                <i class="fa-solid fa-xmark"></i> Reject
                            </button>
                        ` : `
                            <span class="approved-label">
                                <i class="fa-solid fa-circle-check"></i> Published
                            </span>
                        `}
                    </div>
                </td>
            </tr>
        `;
    }).join("");
}

/* ==========================================================
   ADMIN ACTIONS
   ========================================================== */
window.changeStatus = function(id, newStatus) {
    let jobs = JSON.parse(localStorage.getItem(JOBS_KEY) || "[]");
    jobs = jobs.map(j => j.id == id ? { ...j, status: newStatus } : j);
    localStorage.setItem(JOBS_KEY, JSON.stringify(jobs));
    loadAdminJobs();
};

window.removeJob = function(id) {
    if(!confirm("Are you sure you want to reject/delete this job posting?")) return;
    let jobs = JSON.parse(localStorage.getItem(JOBS_KEY) || "[]");
    jobs = jobs.filter(j => j.id != id);
    localStorage.setItem(JOBS_KEY, JSON.stringify(jobs));
    loadAdminJobs();
};

window.resetDatabase = function() {
    if (!confirm("⚠️ This will permanently delete all recruiter postings. Continue?")) return;
    localStorage.removeItem(JOBS_KEY);
    loadAdminJobs();
};

/* ==========================================================
   INITIALIZE
   ========================================================== */
document.addEventListener("DOMContentLoaded", loadAdminJobs);