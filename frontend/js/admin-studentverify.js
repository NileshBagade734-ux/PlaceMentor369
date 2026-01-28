const API_BASE = "http://localhost:5000/api/admin";

/* =========================
   SESSION / TOKEN
========================= */
function getToken() {
  const session = JSON.parse(localStorage.getItem("placementor_session"));
  return session?.token;
}

/* =========================
   LOCAL DATA
========================= */
let studentsData = []; // local copy of all students

/* =========================
   LOAD STUDENTS FROM BACKEND
========================= */
async function loadStudents() {
  try {
    const res = await fetch(`${API_BASE}/students`, {
      headers: { "Authorization": `Bearer ${getToken()}` }
    });
    if (!res.ok) throw new Error("Failed to fetch students");

    studentsData = await res.json(); // save locally
    renderStudentTable();
    renderPendingStudentsList();
  } catch (err) {
    console.error(err);
    alert("Failed to load students");
  }
}

/* =========================
   RENDER STUDENT TABLE
========================= */
function renderStudentTable() {
  const tableBody = document.getElementById("studentTable");
  if (!tableBody) return;

  if (!studentsData.length) {
    tableBody.innerHTML = `<tr><td colspan="7" class="center p-4">No students found</td></tr>`;
    return;
  }

  tableBody.innerHTML = studentsData.map(student => {
    const status = student.status || "pending";

    return `
      <tr>
        <td><strong>${student.name}</strong></td>
        <td>${student.roll || "N/A"}</td>
        <td>${student.branch}</td>
        <td>${student.cgpa}</td>
        <td>
          ${student.resume ? `<a href="${student.resume}" target="_blank"><i class="fa-solid fa-file-pdf"></i> View</a>` : "N/A"}
        </td>
        <td>
          <span class="badge ${status === "verified" ? "badge-verified" : status === "rejected" ? "badge-rejected" : "badge-pending"}">
            ${status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        </td>
        <td>
          ${status === "pending" ? `
            <button class="btn-action btn-verify" onclick="verifyStudent('${student._id}')">Verify</button>
            <button class="btn-action btn-reject" onclick="rejectStudent('${student._id}')">Reject</button>
          ` : '<span style="color:#16a34a;font-size:12px;"><i class="fa-solid fa-circle-check"></i> Approved</span>'}
        </td>
      </tr>
    `;
  }).join("");
}

/* =========================
   VERIFY / REJECT STUDENT
========================= */
async function verifyStudent(id) {
  try {
    const res = await fetch(`${API_BASE}/students/${id}/verify`, {
      method: "PATCH",
      headers: { 
        "Authorization": `Bearer ${getToken()}`,
        "Content-Type": "application/json"
      }
    });

    const data = await res.json();
    console.log("Verify response:", data);

    if (!res.ok) throw new Error(data.message || "Failed to verify student");

    // ✅ update locally without refetch
    studentsData = studentsData.map(s => s._id === id ? { ...s, status: "verified" } : s);
    renderStudentTable();
    renderPendingStudentsList();

    // Refresh dashboard stats if available
    if (typeof loadDashboard === "function") {
      await loadDashboard();
    }

  } catch (err) {
    console.error("Verification failed:", err);
    alert("Verification failed: " + err.message);
  }
}

async function rejectStudent(id) {
  if (!confirm("Are you sure you want to reject this student?")) return;

  try {
    const res = await fetch(`${API_BASE}/students/${id}/reject`, {
      method: "PATCH",
      headers: { 
        "Authorization": `Bearer ${getToken()}`,
        "Content-Type": "application/json"
      }
    });

    const data = await res.json();
    console.log("Reject response:", data);

    if (!res.ok) throw new Error(data.message || "Failed to reject student");

    // ✅ update locally without refetch
    studentsData = studentsData.map(s => s._id === id ? { ...s, status: "rejected" } : s);
    renderStudentTable();
    renderPendingStudentsList();

    if (typeof loadDashboard === "function") {
      await loadDashboard();
    }

  } catch (err) {
    console.error("Rejection failed:", err);
    alert("Rejection failed: " + err.message);
  }
}

/* =========================
   PENDING STUDENTS LIST (Dashboard Sidebar)
========================= */
function renderPendingStudentsList() {
  const pendingContainer = document.getElementById("pendingStudentsList");
  if (!pendingContainer) return;

  const pendingStudents = studentsData.filter(s => s.status === "pending");

  pendingContainer.innerHTML = pendingStudents.length
    ? pendingStudents.map(s => `
        <div class="list-item">
          <strong>${s.name}</strong>
          <div class="muted">${s.branch} • CGPA: ${s.cgpa}</div>
          <button class="btn btn-outline" onclick="verifyStudent('${s._id}')">Verify</button>
        </div>
      `).join('')
    : '<p class="muted center">No pending students</p>';
}

/* =========================
   INITIALIZE
========================= */
document.addEventListener("DOMContentLoaded", () => {
  loadStudents();
});
