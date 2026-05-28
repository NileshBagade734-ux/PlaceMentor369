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
   WITHDRAW APPLICATION
========================================================== */
async function withdrawApplication(id) {

    const confirmWithdraw = confirm(
        "Are you sure you want to withdraw this application?"
    );

    if (!confirmWithdraw) return;

    try {

        const session = JSON.parse(
            localStorage.getItem("placementor_session")
        );

        const token = session?.token;

        const response = await fetch(
            `http://localhost:5000/api/student/application/${id}/withdraw`,
            {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        const data = await response.json();

        if (response.ok) {
            alert("Application withdrawn successfully");
            renderApplications();
        } else {
            alert(data.message || "Withdrawal failed");
        }

    } catch (error) {
        console.error(error);
        alert("Server error");
    }
}

/* ==========================================================
   RENDER APPLICATIONS TABLE
========================================================== */
async function renderApplications() {

    const tableBody = document.getElementById("applicationsTable");

    if (!tableBody) return;

    try {

        const session = JSON.parse(
            localStorage.getItem("placementor_session")
        );

        const token = session?.token;

        if (!token) {

            tableBody.innerHTML = `
                <tr>
                    <td colspan="5" style="text-align:center;padding:40px;">
                        Login required
                    </td>
                </tr>
            `;

            return;
        }

        const res = await fetch(
            "http://localhost:5000/api/student/applications",
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        const applications = await res.json();

        tableBody.innerHTML = "";

        if (!applications.length) {

            tableBody.innerHTML = `
                <tr>
                    <td colspan="5" style="text-align:center;padding:40px;">
                        No applications found
                    </td>
                </tr>
            `;

            return;
        }

        applications.reverse().forEach(app => {

            const isReviewed =
                app.status === "shortlisted" ||
                app.status === "rejected";

            const showWithdraw =
                !isReviewed &&
                !app.isWithdrawn;

            const statusText = app.isWithdrawn
                ? "Withdrawn"
                : (app.status || "Pending");

            const statusClass = app.isWithdrawn
                ? "withdrawn"
                : (app.status || "pending").toLowerCase();

            tableBody.innerHTML += `
                <tr>
                    <td>${app.job?.company || "—"}</td>

                    <td>${app.job?.title || "—"}</td>

                    <td>${formatDate(app.createdAt)}</td>

                    <td>
                        <span class="status ${statusClass}">
                            ${statusText}
                        </span>
                    </td>

                    <td>
                        ${
                            showWithdraw
                            ? `
                                <button
                                    class="withdraw-btn"
                                    onclick="withdrawApplication('${app._id}')"
                                >
                                    Withdraw
                                </button>
                              `
                            : `
                                <span style="color:gray;">
                                    —
                                </span>
                              `
                        }
                    </td>
                </tr>
            `;
        });

    } catch (err) {

        console.error("Error:", err);

        tableBody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align:center;padding:40px;color:red;">
                    Failed to load applications
                </td>
            </tr>
        `;
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

    window.location.href = "../login.html";
}

/* ==========================================================
   INIT
========================================================== */
document.addEventListener(
    "DOMContentLoaded",
    renderApplications
);