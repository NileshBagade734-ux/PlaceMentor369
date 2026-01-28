const API_BASE = "http://localhost:5000/api/admin";

function getToken() {
  const session = JSON.parse(localStorage.getItem("placementor_session"));
  return session?.token;
}

/* =========================
   LOAD & RENDER JOBS
========================= */
async function loadAdminJobs() {
  try {
    const res = await fetch(`${API_BASE}/jobs`, {
      headers: { "Authorization": `Bearer ${getToken()}` }
    });
    if (!res.ok) throw new Error("Failed to fetch jobs");

    const jobs = await res.json();
    renderJobTable(jobs);
  } catch (err) {
    alert("Failed to load jobs");
    console.error(err);
  }
}

/* =========================
   RENDER TABLE
========================= */
function renderJobTable(jobs) {
  const tableBody = document.getElementById("adminJobTableBody");
  if (!jobs.length) {
    tableBody.innerHTML = `<tr><td colspan="6" class="center p-4">No job postings found.</td></tr>`;
    return;
  }

  tableBody.innerHTML = jobs.map(job => {
    const isPending = job.status === "pending";
    return `
      <tr>
        <td>
          <strong>${job.company}</strong><br>
          <small style="color: #64748b;"><i class="fa-solid fa-location-dot"></i> ${job.location || "Remote / On-site"}</small>
        </td>
        <td>${job.title}</td>
        <td class="text-center"><strong>${job.cgpa || "N/A"}</strong></td>
        <td>${job.deadline || 'N/A'}</td>
        <td>
          <span class="badge ${isPending ? 'badge-pending' : 'badge-verified'}">
            ${isPending ? 'Pending Approval' : 'Approved'}
          </span>
        </td>
        <td>
          <div class="action-group">
            ${isPending ? `
              <button onclick="approveJob('${job._id}')" class="btn-action btn-verify">
                <i class="fa-solid fa-check"></i> Approve
              </button>
              <button onclick="deleteJob('${job._id}')" class="btn-action btn-reject">
                <i class="fa-solid fa-xmark"></i> Reject
              </button>
            ` : `<span class="approved-label"><i class="fa-solid fa-circle-check"></i> Published</span>`}
          </div>
        </td>
      </tr>
    `;
  }).join("");
}

/* =========================
   APPROVE / DELETE ACTIONS
========================= */
async function approveJob(id) {
  try {
    const res = await fetch(`${API_BASE}/jobs/${id}/approve`, {
      method: "PATCH",
      headers: { "Authorization": `Bearer ${getToken()}` }
    });
    if (!res.ok) throw new Error("Approval failed");
    loadAdminJobs();
  } catch (err) {
    alert("Job approval failed");
    console.error(err);
  }
}

async function deleteJob(id) {
  if (!confirm("Are you sure you want to reject/delete this job?")) return;
  try {
    const res = await fetch(`${API_BASE}/jobs/${id}`, {
      method: "DELETE",
      headers: { "Authorization": `Bearer ${getToken()}` }
    });
    if (!res.ok) throw new Error("Delete failed");
    loadAdminJobs();
  } catch (err) {
    alert("Job deletion failed");
    console.error(err);
  }
}

/* =========================
   INITIALIZE
========================= */
document.addEventListener("DOMContentLoaded", loadAdminJobs);
