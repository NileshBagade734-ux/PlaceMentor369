const APPLICATION_KEY = "student_applications";

const session = JSON.parse(localStorage.getItem("placementor_session"));

if (!session || !session.token || session.user.role !== "student") {
  window.location.href = "../login.html";
}

const user = session.user;

document.addEventListener("DOMContentLoaded", () => {
  lucide.createIcons();
  initDashboard();
});

async function initDashboard() {
  showWelcome();
  await loadApplications();
  await loadProfileCompletion();
  attachLogout();
}

async function loadProfileCompletion() {
  try {
    const res = await fetch(`${API_BASE}/student/profile`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) return;
    const profile = await res.json();

    if (!profile) return;

    const isBranchFilled = profile.branch && 
                           profile.branch.trim() !== "" && 
                           profile.branch.trim().toLowerCase() !== "select branch" && 
                           profile.branch.trim().toLowerCase() !== "choose your branch";

    const nameParts = (profile.name || "").trim().split(/\s+/);
    const hasFirstName = nameParts[0] && nameParts[0].trim() !== "";
    const hasLastName = nameParts[1] && nameParts[1].trim() !== "";

    const filled = [
      hasFirstName ? "true" : "",
      hasLastName ? "true" : "",
      isBranchFilled ? profile.branch.trim() : "",
      profile.cgpa && profile.cgpa > 0 ? "true" : "",
      profile.skills && profile.skills.length > 0 ? "true" : "",
      profile.resume ? "true" : ""
    ].filter(Boolean).length;

    const percent = Math.floor((filled / 6) * 100);

    const bar = document.getElementById("progress-bar");
    const label = document.getElementById("completion-label");
    if (bar) bar.style.width = percent + "%";
    if (label) label.textContent = percent + "%";
  } catch (err) {
    console.error("Error loading profile completion:", err);
  }
}

function showWelcome() {
  const el = document.getElementById("welcome-msg");
  if (el) el.innerText = `Welcome back, ${user?.name || "Student"}!`;
}

async function loadApplications() {
  const data = await apiRequest("/student/applications", "GET");

  localStorage.setItem(APPLICATION_KEY, JSON.stringify(data));
  updateStats(data);
  renderDashboardTable(data);
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
