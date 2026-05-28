// ============================
// CONSTANTS & SESSION
// ============================
const API_BASE = "http://localhost:5000/api/student";
const UPLOADS_BASE = "http://localhost:5000/uploads/resumes";
const SESSION_KEY = "placementor_session";

function getSession() {
    const session = JSON.parse(localStorage.getItem(SESSION_KEY));
    if (!session || !session.token || session.user.role !== "student") return null;
    return session;
}

const session = getSession();
if (!session) {
    alert("Login required!");
    window.location.href = "../login.html";
}

const { token, user } = session;

// ============================
// PROFILE ELEMENTS
// ============================
const fullNameInput = document.getElementById("fullName");
const rollInput = document.getElementById("rollNumber");
const branchSelect = document.getElementById("branch");
const cgpaInput = document.getElementById("cgpa");

const skillsContainer = document.getElementById("skillsContainer");
const skillInput = document.getElementById("skillInput");
const skillLevelSelect = document.getElementById("skillLevel");

const resumeInput = document.getElementById("resumeInput");
const resumeActions = document.getElementById("resumeActions");
const resumeFileName = document.getElementById("resumeFileName");
const viewPdfBtn = document.getElementById("viewPdfBtn");
const removeResumeBtn = document.getElementById("removeResumeBtn");

const saveBtn = document.getElementById("saveBtn");
const completionBar = document.getElementById("completionBar");
const completionText = document.getElementById("completionText");
const completionMessage = document.getElementById("completionMessage");

// ============================
// STATE
// ============================
let skills = [];
let savedResumeFilename = null; // filename stored in DB

// ============================
// UTILITY FUNCTIONS
// ============================
function updateCompletion() {
    const filled = [
        fullNameInput.value.trim(),
        rollInput.value.trim(),
        branchSelect.value,
        cgpaInput.value,
        skills.length > 0,
        savedResumeFilename
    ].filter(Boolean).length;

    const percent = Math.floor((filled / 6) * 100);
    completionBar.style.width = percent + "%";
    completionText.textContent = percent + "%";
    completionMessage.innerHTML = percent === 100
        ? '<span class="text-green-600 font-bold">✔ Profile Complete</span>'
        : 'Complete all fields to unlock jobs';
}

// ============================
// SKILLS LOGIC
// ============================
function renderSkills() {
    skillsContainer.innerHTML = "";
    skills.forEach((s, i) => {
        const tag = document.createElement("div");
        tag.className = 'flex items-center bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full text-sm font-medium border border-blue-100';
        tag.innerHTML = `
            ${s.name} <span class="ml-1 opacity-60 text-[10px]">(${s.level})</span>
            <button onclick="removeSkill(${i})" class="ml-2 hover:text-red-500">
                <i class="fas fa-times"></i>
            </button>
        `;
        skillsContainer.appendChild(tag);
    });
    updateCompletion();
}

window.addSkill = function () {
    const val = skillInput.value.trim();
    if (!val || skills.some(s => s.name.toLowerCase() === val.toLowerCase())) return;
    skills.push({ name: val, level: skillLevelSelect.value });
    skillInput.value = "";
    renderSkills();
}

window.removeSkill = function (i) {
    skills.splice(i, 1);
    renderSkills();
}

// ============================
// RESUME LOGIC
// ============================
resumeInput?.addEventListener("change", async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const ext = file.name.split(".").pop().toLowerCase();
    if (!["pdf", "doc", "docx"].includes(ext)) {
        return alert("Only PDF, DOC, or DOCX files are allowed.");
    }
    if (file.size > 5 * 1024 * 1024) {
        return alert("File size must be under 5MB.");
    }

    const formData = new FormData();
    formData.append("resume", file);

    try {
        resumeFileName.textContent = "Uploading...";
        resumeActions.classList.remove("hidden");

        const res = await fetch(`${API_BASE}/resume`, {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
            body: formData
        });

        if (!res.ok) throw new Error("Upload failed");

        const data = await res.json();
        savedResumeFilename = data.filename;
        showResumeUI(file.name);
        updateCompletion();
    } catch (err) {
        console.error(err);
        alert("❌ Resume upload failed. Please try again.");
        resumeActions.classList.add("hidden");
    }
});

function showResumeUI(displayName) {
    resumeActions.classList.remove("hidden");
    resumeFileName.textContent = displayName || savedResumeFilename || "resume";

    // Update view button to open the actual file URL
    if (savedResumeFilename) {
        viewPdfBtn.onclick = (e) => {
            e.preventDefault();
            window.open(`${UPLOADS_BASE}/${savedResumeFilename}`, "_blank");
        };
    }
}

removeResumeBtn?.addEventListener("click", () => {
    savedResumeFilename = null;
    resumeInput.value = "";
    resumeActions.classList.add("hidden");
    updateCompletion();
});

// ============================
// LOAD PROFILE FROM BACKEND
// ============================
async function loadProfile() {
    try {
        const res = await fetch(`${API_BASE}/profile`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error("Failed to fetch profile");
        const profile = await res.json();

        fullNameInput.value = profile.name || "";
        rollInput.value = profile.roll || "";
        cgpaInput.value = profile.cgpa || "";

        Array.from(branchSelect.options).forEach(o => {
            if (o.value === profile.branch) o.selected = true;
        });

        skills = (profile.skills || []).map(s => ({ name: s, level: "Intermediate" }));
        renderSkills();

        if (profile.resume) {
            // Could be a filename (new) or a legacy base64/URL (old)
            const isUrl = profile.resume.startsWith("http");
            const isBase64 = profile.resume.startsWith("data:");
            if (!isUrl && !isBase64) {
                savedResumeFilename = profile.resume;
                showResumeUI(profile.resume);
            } else if (isUrl) {
                const resumeUrlInput = document.getElementById("resumeUrl");
                if (resumeUrlInput) resumeUrlInput.value = profile.resume;
            }
        }
    } catch (err) {
        console.error(err);
        alert("Failed to load profile");
    } finally {
        updateCompletion();
    }
}

// ============================
// SAVE PROFILE
// ============================
saveBtn?.addEventListener("click", async () => {
    const resumeUrlInput = document.getElementById("resumeUrl");
    const payload = {
        name: fullNameInput.value.trim(),
        roll: rollInput.value.trim(),
        branch: branchSelect.value,
        cgpa: parseFloat(cgpaInput.value) || 0,
        college: "GH Raisoni",
        skills: skills.map(s => s.name),
        resume: savedResumeFilename || (resumeUrlInput ? resumeUrlInput.value.trim() : "") || ""
    };

    try {
        saveBtn.innerText = "Saving...";
        saveBtn.disabled = true;

        const res = await fetch(`${API_BASE}/profile`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        });

        if (!res.ok) throw new Error("Save failed");

        alert("✅ Profile saved successfully!");
    } catch (err) {
        console.error(err);
        alert("❌ Save failed");
    } finally {
        saveBtn.innerText = "Save Profile Changes";
        saveBtn.disabled = false;
    }
});

// ============================
// INIT
// ============================
document.addEventListener("DOMContentLoaded", () => {
    loadProfile();
});
