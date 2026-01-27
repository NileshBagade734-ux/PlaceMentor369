/* ========================================================== 
   CONFIG & CONSTANTS
========================================================== */
const branchesList = [
  "Computer Science",
  "Information Technology",
  "Electronics",
  "Mechanical",
  "Civil",
  "Electrical"
];

const skillsSet = new Set();

/* ==========================================================
   DOM ELEMENTS
========================================================== */
const branchesContainer = document.getElementById("branchesContainer");
const skillsContainer = document.getElementById("skillsContainer");
const skillInput = document.getElementById("skillInput");
const jobForm = document.getElementById("jobForm");
const addSkillBtn = document.getElementById("addSkillBtn");

/* ==========================================================
   INIT BRANCH CHECKBOXES
========================================================== */
function initBranches() {
  if (!branchesContainer) return;

  branchesContainer.innerHTML = "";
  branchesList.forEach(branch => {
    const div = document.createElement("div");
    div.className =
      "flex items-center gap-2 bg-slate-50 p-2 rounded-lg border border-slate-100";

    div.innerHTML = `
      <input type="checkbox" name="branch" value="${branch}" class="w-4 h-4 accent-indigo-600">
      <span class="text-sm text-slate-700 font-medium">${branch}</span>
    `;

    branchesContainer.appendChild(div);
  });
}

/* ==========================================================
   SKILLS MANAGEMENT
========================================================== */
if (addSkillBtn) {
  addSkillBtn.addEventListener("click", () => {
    const skill = skillInput.value.trim();
    if (!skill) return;

    if (!skillsSet.has(skill)) {
      skillsSet.add(skill);
      skillInput.value = "";
      renderSkills();
    } else {
      alert("Skill already added!");
    }
  });

  skillInput.addEventListener("keypress", e => {
    if (e.key === "Enter") {
      e.preventDefault();
      addSkillBtn.click();
    }
  });
}

function renderSkills() {
  if (!skillsContainer) return;

  skillsContainer.innerHTML = "";

  skillsSet.forEach(skill => {
    const badge = document.createElement("span");
    badge.className =
      "flex items-center gap-2 bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-sm font-semibold border border-indigo-100";

    badge.innerHTML = `
      ${skill}
      <button type="button" class="hover:text-red-500 transition-colors">
        <i data-lucide="x" class="w-3 h-3"></i>
      </button>
    `;

    badge.querySelector("button").onclick = () => {
      skillsSet.delete(skill);
      renderSkills();
    };

    skillsContainer.appendChild(badge);
  });

  if (window.lucide) lucide.createIcons();
}

/* ==========================================================
   JOB POST SUBMISSION
========================================================== */
if (jobForm) {
  jobForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const selectedBranches = Array.from(
      document.querySelectorAll('input[name="branch"]:checked')
    ).map(cb => cb.value);

    if (selectedBranches.length === 0) {
      return alert("Select at least one branch!");
    }

    // ✅ Get session from localStorage
    const session = JSON.parse(localStorage.getItem("placementor_session"));
    console.log("Session:", session);

    if (!session || !session.token) {
      return alert("Unauthorized! Please login first.");
    }

    if (session.user.role !== "recruiter") {
      return alert("Unauthorized! Please login as a recruiter.");
    }

    // ✅ Prepare payload
    const payload = {
      title: document.getElementById("title")?.value.trim(),
      company: document.getElementById("company")?.value.trim(),
      description: document.getElementById("description")?.value.trim(),
      skillsRequired: Array.from(skillsSet),
      cgpa: parseFloat(document.getElementById("cgpa")?.value) || 0,
      deadline: document.getElementById("deadline")?.value,
      branches: selectedBranches,
      location: document.getElementById("location")?.value || "Remote",
      salary: document.getElementById("salary")?.value || ""
    };

    try {
      const res = await fetch("http://localhost:5000/api/recruiter/jobs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (res.ok) {
        alert("✅ Job posted successfully!");
        window.location.href = "recruiter-dashboard.html";
      } else {
        console.error("Job post failed:", data);
        alert(data.message || "Job post failed. Check console for details.");
      }
    } catch (err) {
      console.error("Job Post Error:", err);
      alert("Server error. Try again later.");
    }
  });
}

/* ==========================================================
   GLOBAL INIT
========================================================== */
document.addEventListener("DOMContentLoaded", () => {
  initBranches();
  renderSkills();
  if (window.lucide) lucide.createIcons();
});
