const API_BASE = "http://localhost:5000/api";
const APPLICATION_KEY = "student_applications";

/*********************************
 * SESSION CHECK
 *********************************/
const session = JSON.parse(localStorage.getItem("placementor_session"));
console.log("Session:", session);
console.log("Token:", session?.token);

if (!session || !session.token || session.user.role !== "student") {
  window.location.href = "../login.html";
}

const token = session.token;
const user = session.user;

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
async function initDashboard() {
  showWelcome();
  await loadApplications();
  attachLogout();
}

/*********************************
 * SHOW WELCOME MESSAGE
 *********************************/
function showWelcome() {
  const welcomeMsg = document.getElementById("welcome-msg");
  if (welcomeMsg) {
    welcomeMsg.innerText = `Welcome back, ${user?.name || "Student"}!`;
  }
}

/*********************************
 * LOAD APPLICATIONS
 *********************************/
async function loadApplications() {
  try {
    const res = await fetch(`${API_BASE}/student/applications`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to fetch applications");

    localStorage.setItem(APPLICATION_KEY, JSON.stringify(data));

    updateStats(data);
    renderDashboardTable(data);
  } catch (err) {
    console.error("Dashboard error:", err);
    alert("Failed to load applications. Please refresh.");
  }
}

/*********************************
 * UPDATE STATS
 *********************************/
function updateStats(apps) {
  const applied = Array.isArray(apps) ? apps.length : 0;
  const shortlisted = Array.isArray(apps)
    ? apps.filter(a => a?.status === "Shortlisted").length
    : 0;

  document.getElementById("stat-applied").innerText = applied;
  document.getElementById("stat-shortlisted").innerText = shortlisted;

  const completion = user?.profileCompleted ? 100 : 60;
  const label = document.getElementById("completion-label");
  const bar = document.getElementById("progress-bar");

  if (label) label.innerText = completion + "%";
  if (bar) bar.style.width = completion + "%";
}

/*********************************
 * RENDER DASHBOARD LIST
 *********************************/
function renderDashboardTable(apps) {
  const list = document.getElementById("applications-list");
  if (!list) return;

  if (!Array.isArray(apps) || apps.length === 0) {
    list.innerHTML = `
      <div class="p-10 text-center text-slate-400 text-sm">
        No applications yet. Start applying 🚀
      </div>
    `;
    return;
  }

  const statusColors = {
    PENDING: "bg-amber-50 text-amber-600 border-amber-100",
    SHORTLISTED: "bg-emerald-50 text-emerald-600 border-emerald-100",
    REJECTED: "bg-rose-50 text-rose-600 border-rose-100"
  };

  list.innerHTML = apps.slice(0, 3).map(app => {
    if (!app || !app.job) return "";

    const job = app.job;
    const rawStatus = app.status || "Pending";
    const status = rawStatus.toUpperCase();

    const badge =
      statusColors[status] ||
      "bg-slate-50 text-slate-600 border-slate-200";

    return `
      <div class="flex items-center justify-between p-4 hover:bg-slate-50 transition">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center">
            <i data-lucide="briefcase" class="w-5 h-5 text-indigo-500"></i>
          </div>
          <div>
            <p class="text-sm font-semibold text-slate-900">
              ${job.title || "Untitled Job"}
            </p>
            <p class="text-xs text-slate-500">
              ${job.company || "Unknown Company"}
            </p>
          </div>
        </div>

        <span class="text-[10px] px-2 py-0.5 rounded-full font-bold border ${badge}">
          ${status}
        </span>
      </div>
    `;
  }).join("");

  lucide.createIcons();
}

/*********************************
 * LOGOUT
 *********************************/
function attachLogout() {
  const logoutBtn = document.getElementById("logoutBtn");
  if (!logoutBtn) return;

  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("placementor_session");
    localStorage.removeItem(APPLICATION_KEY);
    window.location.href = "../login.html";
  });
}
