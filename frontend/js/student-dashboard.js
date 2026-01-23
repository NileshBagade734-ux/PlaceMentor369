/*********************************
 * CONSTANTS
 *********************************/
const APPLICATION_KEY = "student_applications";

/*********************************
 * INIT
 *********************************/
document.addEventListener("DOMContentLoaded", () => {
    lucide.createIcons();
    initDashboard();
});

/*********************************
 * DASHBOARD INIT
 *********************************/
function initDashboard() {
    /* 1️⃣ User Session */
    const session = JSON.parse(localStorage.getItem("placementor_session"));
    const welcomeMsg = document.getElementById("welcome-msg");

    if (session && welcomeMsg) {
        welcomeMsg.innerText = `Welcome back, ${session.name || "Student"}!`;
    }

    /* 2️⃣ Load Applications */
    const apps = JSON.parse(localStorage.getItem(APPLICATION_KEY)) || [];

    /* 3️⃣ Stat Cards */
    const appliedEl =
        document.getElementById("stat-applied") ||
        document.getElementById("totalAppsCount");

    const shortlistedEl =
        document.getElementById("stat-shortlisted") ||
        document.getElementById("shortlistedCount");

    if (appliedEl) appliedEl.innerText = apps.length;

    if (shortlistedEl) {
        shortlistedEl.innerText =
            apps.filter(a => a.status === "Shortlisted").length;
    }

    /* 4️⃣ Profile Completion */
    const completion = localStorage.getItem("profile_completion") || "0";
    const label = document.getElementById("completion-label");
    const bar = document.getElementById("progress-bar");

    if (label) label.innerText = completion + "%";
    if (bar) {
        setTimeout(() => {
            bar.style.width = completion + "%";
        }, 300);
    }

    /* 5️⃣ Recent Applications */
    renderDashboardTable(apps);
}

/*********************************
 * RENDER RECENT APPLICATIONS
 * (Auto supports card OR table)
 *********************************/
function renderDashboardTable(apps) {
    const list =
        document.getElementById("applications-list") ||
        document.getElementById("recentApplicationsTable");

    if (!list) return;

    if (apps.length === 0) {
        list.innerHTML = `
            <div class="p-10 text-center text-slate-400 text-sm">
                No applications found. Start applying today!
            </div>
        `;
        return;
    }

    const recent = [...apps]
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 3);

    const statusColors = {
        Pending: "bg-amber-50 text-amber-600 border-amber-100",
        Shortlisted: "bg-emerald-50 text-emerald-600 border-emerald-100",
        Rejected: "bg-rose-50 text-rose-600 border-rose-100"
    };

    list.innerHTML = recent
        .map(app => {
            const formattedDate = new Date(app.date).toLocaleDateString(
                "en-IN",
                { day: "numeric", month: "short" }
            );

            const badge =
                statusColors[app.status] ||
                "bg-slate-50 text-slate-600 border-slate-200";

            /* CARD VIEW */
            if (list.id === "applications-list") {
                return `
                <div class="flex items-center justify-between p-4 hover:bg-slate-50 transition">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center">
                            <i data-lucide="briefcase" class="w-5 h-5 text-indigo-500"></i>
                        </div>
                        <div>
                            <p class="text-sm font-semibold text-slate-900">${app.role}</p>
                            <p class="text-xs text-slate-500">${app.company}</p>
                        </div>
                    </div>
                    <div class="text-right">
                        <p class="text-[10px] text-slate-400 mb-1">${formattedDate}</p>
                        <span class="text-[10px] px-2 py-0.5 rounded-full font-bold border ${badge}">
                            ${app.status.toUpperCase()}
                        </span>
                    </div>
                </div>
                `;
            }

            /* TABLE VIEW */
            return `
            <tr class="border-b border-slate-50 hover:bg-slate-50 transition">
                <td class="p-4">
                    <div class="flex items-center gap-3">
                        <div class="w-8 h-8 bg-indigo-50 rounded flex items-center justify-center">
                            <i data-lucide="briefcase" class="w-4 h-4 text-indigo-500"></i>
                        </div>
                        <div>
                            <p class="text-sm font-semibold text-slate-900">${app.role}</p>
                            <p class="text-[11px] text-slate-500">${app.company}</p>
                        </div>
                    </div>
                </td>
                <td class="p-4 text-xs text-slate-500">${formattedDate}</td>
                <td class="p-4 text-right">
                    <span class="text-[10px] px-2 py-1 rounded-full font-bold border ${badge}">
                        ${app.status.toUpperCase()}
                    </span>
                </td>
            </tr>
            `;
        })
        .join("");

    lucide.createIcons();
}

/*********************************
 * LOGOUT
 *********************************/
const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) {
    logoutBtn.addEventListener("click", e => {
        e.preventDefault();
        localStorage.removeItem("placementor_session");
        window.location.href = "../login.html";
    });
}
