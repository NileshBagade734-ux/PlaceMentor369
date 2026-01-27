const API_BASE = "http://localhost:5000/api";
const APPLICATION_KEY = "student_applications";

const session = JSON.parse(localStorage.getItem("placementor_session"));

if (!session || !session.token || session.user.role !== "student") {
  window.location.href = "../login.html";
}

const token = session.token;
const user = session.user;

document.addEventListener("DOMContentLoaded", () => {
  lucide.createIcons();
  initDashboard();
});

async function initDashboard() {
  showWelcome();
  await loadApplications();
  attachLogout();
}

function showWelcome() {
  const el = document.getElementById("welcome-msg");
  if (el) el.innerText = `Welcome back, ${user?.name || "Student"}!`;
}

async function loadApplications() {
  try {
    const res = await fetch(`${API_BASE}/student/applications`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const data = await res.json();

    if (!res.ok || !Array.isArray(data)) {
      throw new Error("Invalid response");
    }

    localStorage.setItem(APPLICATION_KEY, JSON.stringify(data));
    updateStats(data);
    renderDashboardTable(data);

  } catch (err) {
    console.error("Dashboard error:", err);
    alert("Failed to load applications. Please refresh.");
  }
}

function updateStats(apps) {
  document.getElementById("stat-applied").innerText = apps.length;
  document.getElementById("stat-shortlisted").innerText =
    apps.filter(a => a?.status?.toUpperCase() === "SHORTLISTED").length;
}

function renderDashboardTable(apps) {
  const list = document.getElementById("applications-list");
  if (!list) return;

  if (apps.length === 0) {
    list.innerHTML = `<div class="p-6 text-center text-slate-400">No applications yet 🚀</div>`;
    return;
  }

  list.innerHTML = apps.slice(0, 3).map(app => `
    <div class="flex justify-between p-4">
      <div>
        <p class="font-semibold">${app.job?.title || "Untitled Job"}</p>
        <p class="text-xs text-slate-500">${app.job?.company || "Company"}</p>
      </div>
      <span class="text-xs font-bold">${(app.status || "Pending").toUpperCase()}</span>
    </div>
  `).join("");

  lucide.createIcons();
}

function attachLogout() {
  document.getElementById("logoutBtn")?.addEventListener("click", () => {
    localStorage.clear();
    window.location.href = "../login.html";
  });
}
