const API_BASE = "http://localhost:5000/api/admin";

/* =========================
   SESSION / TOKEN
========================= */
function getToken() {
  const session = JSON.parse(localStorage.getItem("placementor_session"));
  return session?.token;
}

/* =========================
   LOAD DASHBOARD STATS
========================= */
async function loadDashboard() {
  try {
    const res = await fetch(`${API_BASE}/dashboard`, {
      headers: { Authorization: `Bearer ${getToken()}` }
    });

    if (!res.ok) throw new Error("Dashboard fetch failed");

    const data = await res.json();

    // TOP STATS
    document.getElementById("totalStudents").innerText = data.totalStudents;
    document.getElementById("verifiedStudents").innerText = data.verifiedStudents;
    document.getElementById("activeJobs").innerText = data.activeJobs;
    document.getElementById("pendingApprovals").innerText = data.pendingApprovals;

    // PLACEMENT STATS
    document.getElementById("totalApplications").innerText = data.totalApplications;
    document.getElementById("shortlisted").innerText = data.shortlisted;
    document.getElementById("successRate").innerText = data.successRate + "%";

    // LOAD SIDEBAR LISTS
    await loadPendingStudents();
    await loadPendingJobs();

  } catch (err) {
    console.error("Dashboard load failed:", err);
    alert("Admin access denied or server error");
    window.location.href = "../login.html";
  }
}

/* =========================
   LOAD PENDING STUDENTS
========================= */
async function loadPendingStudents() {
  try {
    const res = await fetch(`${API_BASE}/students`, {
      headers: { Authorization: `Bearer ${getToken()}` }
    });

    const students = await res.json();
    const pending = students.filter(s => s.status === "pending");

    const container = document.getElementById("pendingStudentsList");
    if (!container) return;

    container.innerHTML = pending.length
      ? pending.map(s => `
          <div class="list-item">
            <strong>${s.name}</strong>
            <div class="muted">${s.branch} • CGPA: ${s.cgpa}</div>
          </div>
        `).join("")
      : `<p class="muted center">No pending students</p>`;

  } catch (err) {
    console.error("Pending students load failed:", err);
  }
}

/* =========================
   LOAD PENDING JOBS
========================= */
async function loadPendingJobs() {
  try {
    const res = await fetch(`${API_BASE}/jobs`, {
      headers: { Authorization: `Bearer ${getToken()}` }
    });

    const jobs = await res.json();
    const pendingJobs = jobs.filter(j => j.status === "pending");

    const container = document.getElementById("pendingJobsList");
    if (!container) return;

    container.innerHTML = pendingJobs.length
      ? pendingJobs.map(j => `
          <div class="list-item">
            <strong>${j.title}</strong>
            <div class="muted">${j.recruiter?.company || "Company"}</div>
          </div>
        `).join("")
      : `<p class="muted center">No pending jobs</p>`;

  } catch (err) {
    console.error("Pending jobs load failed:", err);
  }
}

/* =========================
   REAL-TIME REFRESH LISTENER
========================= */
window.addEventListener("storage", (event) => {
  if (event.key === "dashboard_refresh") {
    loadDashboard();
  }
});

/* =========================
   LOGOUT
========================= */
function logout() {
  if (confirm("Logout from Admin Panel?")) {
    localStorage.removeItem("placementor_session");
    window.location.href = "../login.html";
  }
}

/* =========================
   INITIALIZE
========================= */
document.addEventListener("DOMContentLoaded", () => {
  loadDashboard();
});
