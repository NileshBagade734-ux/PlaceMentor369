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
    const res = await fetch(`${API_BASE_URL}/student/profile`, {
      headers: { Authorization: `Bearer ${session.token}` }
    });
    if (!res.ok) return;
    const profile = await res.json();
    if (!profile) return;

    // ── Evaluate each field ──────────────────────────────────────────────────
    const isBranchFilled =
      profile.branch &&
      profile.branch.trim() !== "" &&
      profile.branch.trim().toLowerCase() !== "select branch" &&
      profile.branch.trim().toLowerCase() !== "choose your branch";

    const nameParts = (profile.name || "").trim().split(/\s+/);
    const hasFirstName = !!(nameParts[0] && nameParts[0].trim());
    const hasLastName  = !!(nameParts[1] && nameParts[1].trim());

    const fields = [
      { key: "firstName", label: "First Name",        done: hasFirstName },
      { key: "lastName",  label: "Last Name",         done: hasLastName  },
      { key: "branch",    label: "Branch / Department", done: !!isBranchFilled },
      { key: "cgpa",      label: "CGPA",              done: !!(profile.cgpa && profile.cgpa > 0) },
      { key: "skills",    label: "Skills",            done: !!(profile.skills && profile.skills.length > 0) },
      { key: "resume",    label: "Resume Upload",     done: !!profile.resume },
    ];

    const filled  = fields.filter(f => f.done).length;
    const total   = fields.length;
    const percent = Math.floor((filled / total) * 100);

    // ── Update progress bar ──────────────────────────────────────────────────
    const bar = document.getElementById("progress-bar");
    const label = document.getElementById("completion-label");
    const statusText = document.getElementById("completion-status-text");
    const tip = document.getElementById("completion-tip");
    const cta = document.getElementById("completion-cta");

    if (bar) {
      bar.style.width = percent + "%";
      // Colour: red 0–40 %, orange 41–79 %, green 80–99 %, indigo 100 %
      if (percent === 100) {
        bar.className = "h-full rounded-full transition-all duration-1000 bg-indigo-600 progress-bar-glow";
      } else if (percent >= 80) {
        bar.className = "h-full rounded-full transition-all duration-1000 bg-emerald-500 progress-bar-glow";
      } else if (percent >= 41) {
        bar.className = "h-full rounded-full transition-all duration-1000 bg-orange-400 progress-bar-glow";
      } else {
        bar.className = "h-full rounded-full transition-all duration-1000 bg-red-400 progress-bar-glow";
      }
    }

    if (label) {
      label.textContent = percent + "%";
      label.className = percent === 100
        ? "text-2xl font-extrabold text-emerald-600"
        : percent >= 80
        ? "text-2xl font-extrabold text-emerald-500"
        : percent >= 41
        ? "text-2xl font-extrabold text-orange-500"
        : "text-2xl font-extrabold text-red-500";
    }

    if (statusText) {
      statusText.textContent =
        percent === 100 ? "Profile complete 🎉" :
        percent >= 80   ? "Almost there!"       :
        percent >= 41   ? "Good progress"        :
                          "Getting started";
    }

    // Tip: highlight the first missing field
    const firstMissing = fields.find(f => !f.done);
    if (tip) {
      tip.textContent = percent === 100
        ? "Your profile is fully complete. Great work!"
        : firstMissing
        ? `Next: add your ${firstMissing.label.toLowerCase()}`
        : "";
    }

    // Hide CTA when complete
    if (cta) {
      cta.style.display = percent === 100 ? "none" : "inline-flex";
    }

    // ── Render checklist ─────────────────────────────────────────────────────
    const checklist = document.getElementById("completion-checklist");
    if (checklist) {
      checklist.innerHTML = fields.map(f => `
        <div class="checklist-item ${f.done ? "checklist-item--done" : "checklist-item--pending"}">
          <span class="checklist-icon">
            ${f.done
              ? `<svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>`
              : `<svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="9"/></svg>`
            }
          </span>
          <span class="checklist-label">${f.label}</span>
          ${!f.done ? `<span class="checklist-badge">Missing</span>` : ""}
        </div>
      `).join("");
    }

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
