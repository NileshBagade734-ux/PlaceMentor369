/* ==========================================================
   DATE FORMATTER
========================================================== */
function formatDate(dateString) {
    if (!dateString) return "—";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });
}

/* ==========================================================
   RENDER APPLICATIONS TABLE (FETCH FROM BACKEND)
========================================================== */
async function renderApplications() {
    const tableBody = document.getElementById("applicationsTable");
    if (!tableBody) return;

    try {
        // Get token
        const token = JSON.parse(localStorage.getItem("placementor_session"))?.token;
        if (!token) {
            tableBody.innerHTML = `<tr><td colspan="4" style="text-align:center; padding:40px; color:#64748b;">Login required.</td></tr>`;
            return;
        }

        // Fetch applications from backend
        const res = await fetch("http://localhost:5000/api/student/applications", {
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (!res.ok) throw new Error("Failed to fetch applications");

        const applications = await res.json();

        tableBody.innerHTML = "";

        // Empty state
        if (!Array.isArray(applications) || applications.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="4" style="text-align:center; padding:40px; color:#64748b;">
                        <i class="fas fa-folder-open" style="font-size:2rem;"></i><br/>
                        No applications yet.
                    </td>
                </tr>
            `;
            return;
        }

        // Render latest applications first
        applications.slice().reverse().forEach(app => {
            const statusText = app.status || "Pending";
            const statusClass = statusText.toLowerCase();

            tableBody.innerHTML += `
                <tr>
                    <td>${app.job?.company || "—"}</td>
                    <td>${app.job?.title || "—"}</td>
                    <td>${formatDate(app.appliedAt || app.date)}</td>
                    <td>
                        <span class="status ${statusClass}">
                            ${statusText}
                        </span>
                    </td>
                </tr>
            `;
        });

        // Save to localStorage (optional cache)
        localStorage.setItem("student_applications", JSON.stringify(applications));

    } catch (err) {
        console.error("Error fetching applications:", err);
        tableBody.innerHTML = `<tr><td colspan="4" style="text-align:center; padding:40px; color:#f87171;">Failed to load applications.</td></tr>`;
    }
}

/* ==========================================================
   PAGE NAVIGATION
========================================================== */
function navigate(page) {
    window.location.href = page;
}

/* ==========================================================
   LOGOUT
========================================================== */
function logout() {
    localStorage.removeItem("placementor_session");
    localStorage.removeItem("student_applications");
    window.location.href = "../login.html";
}

/* ==========================================================
   INIT
========================================================== */
document.addEventListener("DOMContentLoaded", renderApplications);
