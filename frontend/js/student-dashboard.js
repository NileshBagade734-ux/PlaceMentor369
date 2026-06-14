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

  loadTheme();

  initDashboard();

  setupThemeToggle();

});

async function initDashboard() {
  showWelcome();
  await loadApplications();
  await loadProfileCompletion();
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

    if (!res.ok) {
      const message = data?.message || "Failed to load applications";
      if (res.status === 400 && message.toLowerCase().includes("profile")) {
        showToast("Please complete your student profile first.", "warning");
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
    showToast(err.message || "Failed to load applications.", "error");
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

async function loadProfileCompletion() {
  try {
    const res = await fetch(`${API_BASE}/student/profile`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error("Failed to fetch profile");
    const profile = await res.json();

    const filled = [
      profile.name,
      profile.roll,
      profile.branch,
      profile.cgpa,
      profile.skills && profile.skills.length > 0,
      profile.resume
    ].filter(Boolean).length;

    const percent = Math.floor((filled / 6) * 100);

    const label = document.getElementById("completion-label");
    const bar = document.getElementById("progress-bar");
    if (label) label.textContent = percent + "%";
    if (bar) bar.style.width = percent + "%";
  } catch (err) {
    console.error("Profile completion error:", err);
  }
}

function attachLogout() {
  document.getElementById("logoutBtn")?.addEventListener("click", () => {
    localStorage.clear();
    window.location.href = "../login.html";
  });
}
// =====================================
// DARK MODE SYSTEM
// =====================================

const THEME_KEY = "placementor_theme";

function setupThemeToggle() {

  const themeBtn = document.getElementById("themeToggle");

  themeBtn?.addEventListener("click", () => {

    const isDark =
      document.body.classList.contains("dark-mode");

    if (isDark) {

      disableDarkMode();

    } else {

      enableDarkMode();

    }

  });

}

function enableDarkMode() {

  document.body.classList.add("dark-mode");

  localStorage.setItem(THEME_KEY, "dark");

  updateThemeButton(true);

}

function disableDarkMode() {

  document.body.classList.remove("dark-mode");

  localStorage.setItem(THEME_KEY, "light");

  updateThemeButton(false);

}

function loadTheme() {

  const savedTheme =
    localStorage.getItem(THEME_KEY);

  if (savedTheme === "dark") {

    enableDarkMode();

  }

}

function updateThemeButton(isDark) {

  const btn =
    document.getElementById("themeToggle");

  if (!btn) return;

  btn.innerText =
    isDark ? "☀️ Light Mode" : "🌙 Dark Mode";

}
