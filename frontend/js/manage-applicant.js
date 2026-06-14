/*********************************
 * CONFIG
 *********************************/
const API = "http://localhost:5000/api/recruiter";

// Session & token
const session = JSON.parse(localStorage.getItem("placementor_session"));
const token = session?.token;

/*********************************
 * SESSION GUARD
 *********************************/
if (!session || !token || session.user?.role !== "recruiter") {
  alert("Session invalid. Please login again.");
  window.location.href = "login.html";
}

let applicantFetchController = null;
let applicantFetchSequence = 0;

/*********************************
 * INIT
 *********************************/
document.addEventListener("DOMContentLoaded", () => {
  const jobId = localStorage.getItem("filter_job_id"); // optional: filter per job
  loadApplicants(jobId);
});

/*********************************
 * LOAD ALL APPLICANTS
 *********************************/
async function loadApplicants(jobId = null) {
  const tableBody = document.getElementById("recruiter-table-body");

  if (applicantFetchController) {
    applicantFetchController.abort();
  }

  const currentFetchId = ++applicantFetchSequence;
  applicantFetchController = new AbortController();

  try {
    let url = `${API}/applications`;
    if (jobId) url += `?jobId=${jobId}`; // backend should optionally filter by jobId

    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
      signal: applicantFetchController.signal,
    });

    if (res.status === 401 || res.status === 403) {
      alert("Session expired. Login again.");
      return (window.location.href = "login.html");
    }

    if (!res.ok) throw new Error("Failed to fetch applicants");

    const apps = await res.json();
    if (currentFetchId !== applicantFetchSequence) return;

    renderTable(apps.filter(app => app.student && app.job)); // safety filter
  } catch (err) {
    if (err.name === "AbortError") return;
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

  if (!apps.length) {
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
    const status = app.status || "applied";

    const statusClass =
      status.toLowerCase() === "shortlisted"
        ? "bg-emerald-100 text-emerald-700"
        : status.toLowerCase() === "rejected"
        ? "bg-red-100 text-red-700"
        : "bg-blue-100 text-blue-700";

    return `
      <tr>
        <td class="p-4 font-medium">${app.student.name}</td>
        <td class="p-4">${app.job.title}</td>
        <td class="p-4 text-center">${app.student.cgpa ?? "N/A"}</td>
        <td class="p-4 text-center">
          ${
            app.student.resume
              ? `<a href="${app.student.resume}" target="_blank" class="text-indigo-600 hover:underline">View</a>`
              : "N/A"
          }
        </td>
        <td class="p-4">
          <span class="px-3 py-1 rounded-full text-xs font-bold ${statusClass}">
            ${status}
          </span>
        </td>
        <td class="p-4 flex gap-2">
          <button onclick="updateStatus('${app._id}', 'shortlisted')" class="p-2 bg-emerald-50 text-emerald-600 rounded hover:bg-emerald-600 hover:text-white">✔</button>
          <button onclick="updateStatus('${app._id}', 'rejected')" class="p-2 bg-red-50 text-red-600 rounded hover:bg-red-600 hover:text-white">✖</button>
        </td>
      </tr>
    `;
  }).join("");
}

/*********************************
 * UPDATE APPLICATION STATUS
 *********************************/
async function updateStatus(applicationId, status) {
  if (!applicationId) {
    alert("❌ Invalid application selected.");
    return;
  }

  try {
    const res = await fetch(`${API}/applications/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ applicationId, status }),
    });

    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.message || "Failed to update status");
    }

    // Reload table immediately with latest request state
    const jobId = localStorage.getItem("filter_job_id");
    await loadApplicants(jobId);
  } catch (err) {
    console.error("Update status error:", err);
    alert("❌ Failed to update status: " + err.message);
  }
}

/*********************************
 * EXPORT TO CSV
 *********************************/
document.getElementById("export-csv-btn")?.addEventListener("click", async () => {
  try {
    const jobId = localStorage.getItem("filter_job_id");
    let url = `${API}/applications/export`;
    if (jobId) url += `?jobId=${jobId}`;

    // Add visual feedback
    const btn = document.getElementById("export-csv-btn");
    const originalText = btn.innerHTML;
    btn.innerHTML = `<i data-lucide="loader-2" class="animate-spin"></i> Exporting...`;
    btn.disabled = true;

    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.message || "Failed to export");
    }

    // Get filename from Content-Disposition header if possible
    const contentDisposition = res.headers.get("Content-Disposition");
    let filename = "applicants.csv";
    if (contentDisposition && contentDisposition.includes("filename=")) {
      filename = contentDisposition.split("filename=")[1].replace(/"/g, "");
    }

    // Convert response to Blob and trigger download
    const blob = await res.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = downloadUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(downloadUrl);
    document.body.removeChild(a);

    // Restore button
    btn.innerHTML = originalText;
    btn.disabled = false;
    lucide.createIcons(); // re-init icons

  } catch (err) {
    console.error("Export error:", err);
    alert("❌ Failed to export CSV: " + err.message);
    
    // Restore button
    const btn = document.getElementById("export-csv-btn");
    btn.innerHTML = `<i data-lucide="download"></i> Export to CSV`;
    btn.disabled = false;
    lucide.createIcons();
  }
});
