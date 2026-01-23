function updateDashboard() {
    // 1. Fetch data from your specific keys
    const students = JSON.parse(localStorage.getItem("all_students") || "[]");
    const jobs = JSON.parse(localStorage.getItem("posted_jobs") || "[]");
    const applications = JSON.parse(localStorage.getItem("student_applications") || "[]");

    // 2. Top Stats
    document.getElementById("totalStudents").innerText = students.length;
    document.getElementById("verifiedStudents").innerText = students.filter(s => s.status === 'verified').length;
    document.getElementById("activeJobs").innerText = jobs.filter(j => j.status === 'Active').length;
    
    // Count pending students + jobs with "Pending" status
    const pendingCount = students.filter(s => s.status === 'pending').length + 
                         jobs.filter(j => j.status === 'Pending' || j.status === 'pending').length;
    document.getElementById("pendingApprovals").innerText = pendingCount;

    // 3. Render Pending Students (e.g., Amit Kumar)
    const studentContainer = document.getElementById("pendingStudentsList");
    const pendingStudents = students.filter(s => s.status === 'pending');
    
    studentContainer.innerHTML = pendingStudents.length ? pendingStudents.map(s => `
        <div class="list-item">
            <div>
                <strong>${s.name}</strong>
                <div class="muted">${s.branch} • CGPA: ${s.cgpa}</div>
            </div>
            <button class="btn btn-outline" style="width:auto; padding: 6px 12px;" onclick="location.href='adminverify-student.html'">Review</button>
        </div>
    `).join('') : '<p class="muted center">No pending students</p>';

    // 4. Render Pending Jobs (e.g., Cloud Engineer)
    const jobContainer = document.getElementById("pendingJobsList");
    const pendingJobs = jobs.filter(j => j.status === 'Pending' || j.status === 'pending');

    jobContainer.innerHTML = pendingJobs.length ? pendingJobs.map(j => `
        <div class="list-item">
            <div>
                <strong>${j.title}</strong>
                <div class="muted">${j.company}</div>
            </div>
            <button class="btn btn-outline" style="width:auto; padding: 6px 12px;" onclick="location.href='adminjob-management.html'">Review</button>
        </div>
    `).join('') : '<p class="muted center">No pending jobs</p>';

    // 5. Placement Stats
    const shortlistedCount = applications.filter(a => a.status === 'Shortlisted' || a.status === 'shortlisted').length;
    document.getElementById("totalApplications").innerText = applications.length;
    document.getElementById("shortlisted").innerText = shortlistedCount;
    
    const rate = students.length > 0 ? Math.round((shortlistedCount / students.length) * 100) : 0;
    document.getElementById("successRate").innerText = rate + "%";
}

function logout() {
    if(confirm("Logout from Admin Panel?")) window.location.href = "../login.html";
}

// Run on load and whenever storage changes
document.addEventListener("DOMContentLoaded", updateDashboard);
window.addEventListener('storage', updateDashboard);