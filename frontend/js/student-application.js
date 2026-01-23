function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });
}

function renderApplications() {
    const tableBody = document.getElementById("applicationsTable");
    const applications = JSON.parse(localStorage.getItem("student_applications") || "[]");

    tableBody.innerHTML = "";

    if (applications.length === 0) {
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

    applications.slice().reverse().forEach(app => {
        const status = (app.status || "Applied").toLowerCase();

        tableBody.innerHTML += `
            <tr>
                <td>${app.company}</td>
                <td>${app.role}</td>
                <td>${formatDate(app.date)}</td>
                <td>
                    <span class="status ${status}">
                        ${app.status || "Applied"}
                    </span>
                </td>
            </tr>
        `;
    });
}

function navigate(page) {
    window.location.href = page;
}

function logout() {
    localStorage.removeItem("placementor_session");
    window.location.href = "../login.html";
}

document.addEventListener("DOMContentLoaded", renderApplications);
