const API = "http://localhost:5000/api/recruiter";
const token = localStorage.getItem("token");
const jobId = localStorage.getItem("jobId");

async function loadApplicants() {
  try {
    const res = await fetch(`${API}/jobs/${jobId}/applicants`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!res.ok) throw new Error("Failed to fetch applicants");

    const apps = await res.json();
    renderTable(apps);
  } catch (err) {
    console.error("Applicants load error:", err);
    const tableBody = document.getElementById("recruiter-table-body");
    tableBody.innerHTML = `<tr><td colspan="5" style="text-align:center;">Error loading applicants</td></tr>`;
  }
}

function renderTable(apps) {
  const tableBody = document.getElementById("recruiter-table-body");

  if (apps.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="5" style="text-align:center;">No applicants yet</td>
      </tr>
    `;
    return;
  }

  tableBody.innerHTML = apps.map(app => `
    <tr class="hover:bg-slate-50 transition-colors">
      <td>${app.student.name}</td>
      <td>${app.student.email}</td>
      <td>${app.student.branch || "N/A"}</td>
      <td>
        <span class="px-3 py-1 rounded-full text-[10px] font-bold uppercase 
          ${app.status === 'Shortlisted' ? 'bg-emerald-100 text-emerald-700' :
            app.status === 'Rejected' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}">
          ${app.status}
        </span>
      </td>
      <td class="flex gap-2">
        <button onclick="updateStatus('${app._id}', 'Shortlisted')" 
          class="p-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-600 hover:text-white transition-all">
          ✔
        </button>
        <button onclick="updateStatus('${app._id}', 'Rejected')" 
          class="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition-all">
          ✖
        </button>
      </td>
    </tr>
  `).join("");
}

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

    if (!res.ok) throw new Error("Failed to update status");

    loadApplicants(); // refresh table instantly
  } catch (err) {
    console.error("Update status error:", err);
    alert("Failed to update status");
  }
}

document.addEventListener("DOMContentLoaded", loadApplicants);
