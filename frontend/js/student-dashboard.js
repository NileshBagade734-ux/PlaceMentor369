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
    const profile = await apiRequest("/student/profile", "GET");

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
  try {
    const data = await apiRequest("/student/applications", "GET");

    localStorage.setItem(APPLICATION_KEY, JSON.stringify(data));
    updateStats(data);
    renderDashboardTable(data);
    renderRecentlyAppliedCompanies(data);
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
    list.innerHTML = `<div class="p-6 text-center text-slate-400">No applications yet 🚀</div>`;
    return;
  }

  list.innerHTML = apps.slice(0, 3).map(app => {
    const status = (app.status || "Pending").toLowerCase().replace(/\s+/g, "-");
    const appliedDate = app.createdAt
      ? new Date(app.createdAt).toLocaleDateString()
      : "N/A";

    return `
    <div class="flex justify-between p-4 border-b border-slate-200">
      <div>
        <p class="font-semibold">${app.job?.title || "Untitled Job"}</p>
        <p class="text-xs text-slate-500">${app.job?.company || "Company"}</p>
        <p class="text-xs text-slate-400">Applied: ${appliedDate}</p>
      </div>
      <span class="status-badge status-${status}">
        ${app.status ? app.status.toUpperCase() : "PENDING"}
      </span>
    </div>
  `;
  }).join("");

  lucide.createIcons();
}

function renderRecentlyAppliedCompanies(apps) {

  const container = document.getElementById("recent-companies-list");

  if (!container) return;

  if (apps.length === 0) {

    container.innerHTML = `
      <div class="text-slate-400 text-center col-span-full">
        No recently applied companies 🚀
      </div>
    `;

    return;
  }

  container.innerHTML = apps.slice(0, 4).map(app => {

    const company = app.job?.company || "Unknown Company";

    const status = app.status || "Pending";

    const appliedDate = app.createdAt
      ? new Date(app.createdAt).toLocaleDateString()
      : "N/A";

    return `
      <div class="company-card">

        <div class="company-header">

          <div class="company-logo">
            ${company.charAt(0)}
          </div>

          <div>
            <h4 class="company-name">${company}</h4>

            <p class="company-date">
              Applied: ${appliedDate}
            </p>
          </div>

        </div>

        <span class="company-status status-${status.toLowerCase()}">
          ${status}
        </span>

      </div>
    `;
  }).join("");
}
function attachLogout() {
  document.getElementById("logoutBtn")?.addEventListener("click", () => {
    localStorage.clear();
    window.location.href = "../login.html";
  });
}
