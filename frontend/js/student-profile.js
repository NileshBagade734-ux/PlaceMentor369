// ============================
// CONSTANTS & SESSION
// ============================
const SESSION_KEY = "placementor_session";

function getSession() {
    const session = JSON.parse(localStorage.getItem(SESSION_KEY));
    if (!session || !session.token || session.user.role !== "student") return null;
    return session;
}

const session = getSession();
if (!session) {
    showToast("Login required!", "error");
    setTimeout(() => {
        window.location.href = "../login.html";
    }, 1500);
}

const { token, user } = session;

// ============================
// SOCKET.IO CONNECTION (Phase 4)
// ============================
let socket = null;
let isSocketConnected = false;

if (window.io && user && user.id) {
    socket = io("http://localhost:5000");

    socket.on("connect", () => {
        console.log("🔌 Connected to Socket.io server successfully.");
        isSocketConnected = true;
        socket.emit("register", user.id);
    });

    socket.on("disconnect", () => {
        console.log("🔌 Disconnected from Socket.io server.");
        isSocketConnected = false;
    });

    socket.on("ai-completed", async (data) => {
        console.log("🚀 Live Event received: 'ai-completed':", data);
        
        document.getElementById("resumeLoadingOverlay")?.remove();
        isProcessingResume = false;
        if (saveBtn) saveBtn.disabled = false;
        const resetBtn = document.getElementById("resetProfileBtn");
        if (resetBtn) resetBtn.disabled = false;

        showToast("🎯 Real-time Sync: " + (data.message || "AI Analysis Complete!"), "success");
        await loadProfile();
    });
}

// ============================
// PROFILE ELEMENTS
// ============================
const firstNameInput = document.getElementById("firstName");
const lastNameInput = document.getElementById("lastName");
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
const resumeError = document.getElementById("resumeError");

const saveBtn = document.getElementById("saveBtn");
const completionBar = document.getElementById("completionBar");
const completionText = document.getElementById("completionText");
const completionMessage = document.getElementById("completionMessage");

// ============================
// STATE
// ============================
let skills = [];
let resumeBase64 = null;
let isProcessingResume = false;

// ============================
// UTILITY FUNCTIONS
// ============================
function updateCompletion() {
    const branchVal = branchSelect.value ? branchSelect.value.trim().toLowerCase() : "";
    const isBranchValid = branchVal !== "" && branchVal !== "select branch" && branchVal !== "choose your branch";

    const cgpaVal = parseFloat(cgpaInput.value) || 0;
    const isCgpaValid = cgpaVal > 0;

    const filled = [
        firstNameInput.value.trim(),
        lastNameInput.value.trim(),
        isBranchValid ? branchSelect.value : "",
        isCgpaValid ? cgpaInput.value : "",
        skills.length > 0,
        resumeBase64
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
function showResumeError(message) {
    resumeError.textContent = message;
    resumeError.classList.remove("hidden");
}

function clearResumeError() {
    resumeError.textContent = "";
    resumeError.classList.add("hidden");
}

// ============================
// RESUME LOGIC
// ============================
resumeInput?.addEventListener("change", (e) => {
    clearResumeError();

    const file = e.target.files[0];

    if (!file) return;

    if (file.type !== "application/pdf") {
        showResumeError("Only PDF resumes are allowed.");
        resumeInput.value = "";
        return;
    }

    const MAX_SIZE = 2 * 1024 * 1024;

    if (file.size > MAX_SIZE) {
        showResumeError("Resume size must be under 2MB.");
        resumeInput.value = "";
        return;
    }

    const reader = new FileReader();

    reader.onload = () => {
        resumeBase64 = reader.result;
        showResumeUI(file.name);
        updateCompletion();
    };

    reader.readAsDataURL(file);
});

function showResumeUI(name) {
    resumeActions.classList.remove("hidden");
    resumeFileName.textContent = name || "Saved_Resume.pdf";
}

viewPdfBtn?.addEventListener("click", (e) => {
    e.preventDefault();
    if (!resumeBase64) return;
    const win = window.open();
    win.document.write(`<iframe src="${resumeBase64}" style="width:100%;height:100vh" frameborder="0"></iframe>`);
});

removeResumeBtn?.addEventListener("click", () => {
    resumeBase64 = null;
    resumeInput.value = "";
    resumeActions.classList.add("hidden");
    clearResumeError();
    updateCompletion();
});

// ============================
// LOAD PROFILE FROM BACKEND
// ============================
async function loadProfile() {
    try {
        const profile = await apiRequest("/student/profile", "GET");

        const nameParts = (profile.name || "").trim().split(/\s+/);
        firstNameInput.value = nameParts[0] || "";
        lastNameInput.value = nameParts.slice(1).join(" ") || "";
        cgpaInput.value = profile.cgpa || "";

        Array.from(branchSelect.options).forEach(o => {
            if (o.value === profile.branch || o.text === profile.branch) o.selected = true;
        });

        skills = (profile.skills || []).map(s => ({ name: s, level: "Intermediate" }));
        renderSkills();

        if (profile.resume) {
            resumeBase64 = profile.resume;
            showResumeUI("Saved_Resume.pdf");
        }
    } catch (err) {
        console.error(err);
        showToast("Failed to load profile", "error");
    } finally {
        updateCompletion();
    }
}

// ============================
// SAVE PROFILE
// ============================
saveBtn?.addEventListener("click", async () => {
    const payload = {
        name: `${firstNameInput.value.trim()} ${lastNameInput.value.trim()}`.trim(),
        roll: "",
        branch: branchSelect.value,
        cgpa: parseFloat(cgpaInput.value) || 0,
        college: "GH Raisoni",
        skills: skills.map(s => s.name),
        resume: resumeBase64
    };

    try {
        saveBtn.innerText = "Saving...";
        saveBtn.disabled = true;

        await apiRequest("/student/profile", "PATCH", payload);

        showToast("✅ Profile saved successfully!", "success");
    } catch (err) {
        console.error(err);
        showToast("❌ Save failed", "error");
    } finally {
        saveBtn.innerText = "Save Profile Changes";
        saveBtn.disabled = false;
    }
});

// ============================
// RESET PROFILE LOGIC
// ============================
const resetProfileBtn = document.getElementById("resetProfileBtn");
resetProfileBtn?.addEventListener("click", async () => {
    if (!confirm("Are you sure you want to completely clear and reset all your profile details and resume?")) return;

    resetProfileBtn.disabled = true;
    resetProfileBtn.innerText = "Resetting...";

    try {
        const res = await fetch(`${API_BASE}/profile`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
                name: "",
                roll: "",
                branch: "",
                cgpa: 0,
                college: "",
                skills: [],
                resume: ""
            })
        });

        if (!res.ok) {
            const errData = await res.json().catch(() => ({}));
            throw new Error(errData.message || "Reset failed");
        }

        // Clear UI inputs
        firstNameInput.value = "";
        lastNameInput.value = "";
        cgpaInput.value = "";
        branchSelect.value = "";
        skills = [];
        renderSkills();

        // Clear Resume UI
        resumeBase64 = null;
        resumeInput.value = "";
        resumeActions.classList.add("hidden");
        updateCompletion();

        showToast("🧹 Profile and Resume reset successfully!", "success");
    } catch (err) {
        console.error("Reset Profile Error:", err);
        showToast("❌ Reset failed: " + err.message, "error");
    } finally {
        resetProfileBtn.disabled = false;
        resetProfileBtn.innerText = "Reset Profile Data";
    }
});
// ============================
"use strict";

document.addEventListener("DOMContentLoaded", () => {
    loadProfile();

    // Attach dynamic input listeners to update profile completion in real-time
    firstNameInput?.addEventListener("input", updateCompletion);
    lastNameInput?.addEventListener("input", updateCompletion);
    branchSelect?.addEventListener("change", updateCompletion);
    cgpaInput?.addEventListener("input", updateCompletion);
});

// ============================
// PREMIUM TOAST SYSTEM
// ============================
function showToast(message, type = "success") {
    let container = document.getElementById("toast-container");
    if (!container) {
        container = document.createElement("div");
        container.id = "toast-container";
        container.className = "fixed top-5 right-5 z-[9999] flex flex-col gap-3 max-w-sm w-full px-4 md:px-0";
        document.body.appendChild(container);
    }

    const toast = document.createElement("div");
    const isSuccess = type === "success";
    
    toast.className = `flex items-start gap-3 p-4 rounded-xl border backdrop-blur-md shadow-xl transition-all duration-300 transform translate-x-full opacity-0 ${
        isSuccess 
        ? "bg-white/95 border-emerald-100 shadow-emerald-100/50" 
        : "bg-white/95 border-rose-100 shadow-rose-100/50"
    }`;
    
    const successIcon = `<svg class="w-5 h-5 text-emerald-500 flex-shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>`;
    const errorIcon = `<svg class="w-5 h-5 text-rose-500 flex-shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>`;
    const closeIcon = `<svg class="w-4 h-4 text-slate-400 hover:text-slate-600 transition" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"></path></svg>`;

    toast.innerHTML = `
        ${isSuccess ? successIcon : errorIcon}
        <div class="flex-1 text-sm font-semibold text-slate-800 leading-relaxed">${message}</div>
        <button class="flex-shrink-0 focus:outline-none ml-1">${closeIcon}</button>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.classList.remove("translate-x-full", "opacity-0");
        toast.classList.add("translate-x-0", "opacity-100");
    }, 50);

    toast.querySelector("button").addEventListener("click", () => {
        closeToast(toast);
    });

    setTimeout(() => {
        closeToast(toast);
    }, 4000);
}

function closeToast(toast) {
    if (!toast.parentNode) return;
    toast.classList.remove("translate-x-0", "opacity-100");
    toast.classList.add("translate-x-full", "opacity-0");
    setTimeout(() => {
        toast.remove();
    }, 300);
}
