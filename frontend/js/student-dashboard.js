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
  const list = document.getElementById("applications-list");
  if (list) {
    list.innerHTML = `
      <div class="p-4 border-b border-slate-100 space-y-2">
        <div class="skeleton w-1/3 h-5"></div>
        <div class="skeleton w-1/4 h-4"></div>
      </div>
      <div class="p-4 border-b border-slate-100 space-y-2">
        <div class="skeleton w-1/2 h-5"></div>
        <div class="skeleton w-1/3 h-4"></div>
      </div>
    `;
  }
  try {
    const res = await fetch(`${API_BASE}/student/applications`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const data = await res.json();

    if (!res.ok) {
      const message = data?.message || "Failed to load applications";
      if (res.status === 400 && message.toLowerCase().includes("profile")) {
        alert("Please complete your student profile first.");
        window.location.href = "../student/student-profile.html";
        return;
      }
      throw new Error(message);
    }

    if (!Array.isArray(data)) {
      throw new Error("Unexpected response format");
    }

    localStorage.setItem(APPLICATION_KEY, JSON.stringify(data));
    updateStats(data);
    renderDashboardTable(data);

  } catch (err) {
    console.error("Dashboard error:", err);
    alert(err.message || "Failed to load applications. Please refresh.");
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
    list.innerHTML = `
      <div class="p-8 text-center flex flex-col items-center justify-center">
        <div class="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600 mb-3">
          <i data-lucide="inbox" class="w-6 h-6"></i>
        </div>
        <h4 class="font-semibold text-slate-800 mb-1">No Applications Yet</h4>
        <p class="text-sm text-slate-500 max-w-xs mb-4">You haven't applied to any jobs yet. Start exploring active job postings.</p>
        <a href="../student/student-joblist.html" class="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-2 rounded-lg text-sm transition">
          Browse Jobs
        </a>
      </div>
    `;
    lucide.createIcons();
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
