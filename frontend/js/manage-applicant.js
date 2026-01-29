/*********************************
 * CONFIG
 *********************************/
const API = "http://localhost:5000/api/recruiter";

// Session & token
const session = JSON.parse(localStorage.getItem("placementor_session"));
const token = session?.token;
const jobId = localStorage.getItem("filter_job_id"); // MUST match dashboard key

/*********************************
 * SESSION & JOB GUARD
 *********************************/
if (!session || !token || session.user?.role !== "recruiter") {
  alert("Session invalid. Please login again.");
  window.location.href = "login.html";
}

if (!jobId) {
  alert("No job selected. Please select a job first.");
  window.location.href = "recruiter-dashboard.html";
}

/*********************************
 * INIT
 *********************************/
document.addEventListener("DOMContentLoaded", loadApplicants);

/*********************************
 * LOAD APPLICANTS
 *********************************/
async function loadApplicants() {
  const tableBody = document.getElementById("recruiter-table-body");

  try {
    const res = await fetch(`${API}/jobs/${jobId}/applicants`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (res.status === 401 || res.status === 403) {
      alert("Session expired. Login again.");
      return window.location.href = "login.html";
    }

    if (!res.ok) throw new Error("Failed to fetch applicants");

    const apps = await res.json();
    renderTable(apps);

  } catch (err) {
    console.error("Applicants load error:", err);
    tableBody.innerHTML = `
      <tr>
        <td colspan="6" class="p-6 text-center text-slate-400">
          Failed to load applicants
        </td>
      </tr>
    `;
  }
}

/*********************************
 * RENDER TABLE
 *********************************/
function renderTable(apps) {
  const tableBody = document.getElementById("recruiter-table-body");

  if (!Array.isArray(apps) || apps.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="6" class="p-6 text-center text-slate-400">
          No applicants yet
        </td>
      </tr>
    `;
    return;
  }

  tableBody.innerHTML = apps.map(app => {
    const status = app.status || "Pending";

    const statusClass =
      status === "Shortlisted"
        ? "bg-emerald-100 text-emerald-700"
        : status === "Rejected"
        ? "bg-red-100 text-red-700"
        : "bg-blue-100 text-blue-700";

    return `
      <tr class="hover:bg-slate-50 transition-colors">
        <td class="p-4 font-medium">${app.student?.name || "N/A"}</td>
        <td class="p-4 text-sm text-slate-600">${app.job?.title || "N/A"}</td>
        <td class="p-4 text-center">${app.student?.cgpa ?? "N/A"}</td>
        <td class="p-4 text-center">
          ${app.student?.resume
            ? `<a href="${app.student.resume}" target="_blank" class="text-indigo-600 hover:underline">View</a>`
            : "N/A"}
        </td>
        <td class="p-4">
          <span class="px-3 py-1 rounded-full text-[10px] font-bold uppercase ${statusClass}">
            ${status}
          </span>
        </td>
        <td class="p-4 flex gap-2 items-center">
          <button
            onclick="updateStatus('${app._id}', 'Shortlisted')"
            class="p-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-600 hover:text-white">
            ✔
          </button>
          <button
            onclick="updateStatus('${app._id}', 'Rejected')"
            class="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-600 hover:text-white">
            ✖
          </button>
        </td>
      </tr>
    `;
  }).join("");
}

/*********************************
 * UPDATE APPLICATION STATUS
 *********************************/
async function updateStatus(applicationId, status) {
  try {
    const res = await fetch(`${API}/applications/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ applicationId, status })
    });

    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.message || "Status update failed");
    }

    // ✅ Refresh applicants table after status change
    await loadApplicants(); // yeh function phir se backend se applicants fetch karega

  } catch (err) {
    console.error("Update status error:", err);
    alert("❌ Failed to update application status: " + err.message);
  }
}

