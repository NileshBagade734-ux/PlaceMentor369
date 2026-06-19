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
    const data = await apiRequest("/admin/dashboard", "GET");

    document.getElementById("totalStudents").innerText = data.totalStudents;
    document.getElementById("verifiedStudents").innerText = data.verifiedStudents;
    document.getElementById("activeJobs").innerText = data.activeJobs;
    document.getElementById("pendingApprovals").innerText = data.pendingApprovals;

    document.getElementById("totalApplications").innerText = data.totalApplications;
    document.getElementById("shortlisted").innerText = data.shortlisted;
    document.getElementById("successRate").innerText = data.successRate + "%";

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
    const students = await apiRequest("/admin/students", "GET");

    const pending = students.filter(s => s.status === "pending");

    const container = document.getElementById("pendingStudentsList");
    if (!container) return;

    container.innerHTML = pending.length
      ? pending.map(s => `
          <div class="list-item">
            <strong>${s.name}</strong>
            <div class="muted">${s.branch} • CGPA: ${s.cgpa}</div>
            <button class="btn btn-outline" onclick="verifyStudent('${s._id}')">Verify</button>
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
    const jobs = await apiRequest("/admin/jobs", "GET");
    const pendingJobs = jobs.filter(j => j.status === "pending");

    const container = document.getElementById("pendingJobsList");
    if (!container) return;

    container.innerHTML = pendingJobs.length
      ? pendingJobs.map(j => `
          <div class="list-item">
            <strong>${j.title}</strong>
            <div class="muted">${j.recruiter?.company || "Company"}</div>
            <button class="btn btn-outline" onclick="approveJob('${j._id}')">Approve</button>
          </div>
        `).join("")
      : `<p class="muted center">No pending jobs</p>`;

  } catch (err) {
    console.error("Pending jobs load failed:", err);
  }
}

/* =========================
   VERIFY STUDENT
========================= */
async function verifyStudent(id) {
  try {
    await apiRequest(`/admin/students/${id}/verify`, "PATCH");
    await loadDashboard();
  } catch (err) {
    console.error(err);
    alert("Failed to verify student: " + err.message);
  }
}

/* =========================
   APPROVE JOB
========================= */
async function approveJob(id) {
  try {
    await apiRequest(`/admin/jobs/${id}/approve`, "PATCH");
    await loadDashboard();
  } catch (err) {
    console.error(err);
    alert("Failed to approve job: " + err.message);
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
"use strict";

document.addEventListener("DOMContentLoaded", () => {
  loadDashboard();
});
