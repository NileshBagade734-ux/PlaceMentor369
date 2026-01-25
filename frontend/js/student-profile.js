/* ==========================================================
 * FRONTEND: Safe Session & Token Handling for Placementor
 ==========================================================*/

// Storage keys
const SESSION_KEY = "placementor_session";
const USER_KEY = "current_user";
const APPLICATION_KEY = "student_applications";
const JOBS_KEY = "all_jobs";

// Safe token retrieval
function getToken() {
    const session = JSON.parse(localStorage.getItem(SESSION_KEY));
    if (!session || !session.token) return null;
    return session.token;
}

// Safe user retrieval
function getUser() {
    const session = JSON.parse(localStorage.getItem(SESSION_KEY));
    return session?.user || null;
}

let token = getToken();
let user = getUser();

let studentSession = JSON.parse(localStorage.getItem(USER_KEY)) || {
    name: "",
    branch: "",
    cgpa: 0,
    skills: []
};

let skills = [...studentSession.skills.map(s => ({ name: s, level: "Intermediate" }))];
let resumeBase64 = localStorage.getItem("student_resume_pdf") || null;
let appliedJobs = JSON.parse(localStorage.getItem(APPLICATION_KEY)) || [];
let allAvailableJobs = [];

/* ==========================================================
 * SKILLS LOGIC
 ==========================================================*/
function renderSkills() {
    const skillsContainer = document.getElementById('skillsContainer');
    if (!skillsContainer) return;

    skillsContainer.innerHTML = '';
    skills.forEach((skill, index) => {
        const tag = document.createElement('div');
        tag.className = 'flex items-center bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full text-sm font-medium border border-blue-100';
        tag.innerHTML = `
            ${skill.name} <span class="ml-1 opacity-60 text-[10px]">(${skill.level})</span>
            <button onclick="removeSkill(${index})" class="ml-2 hover:text-red-500">
                <i class="fas fa-times"></i>
            </button>
        `;
        skillsContainer.appendChild(tag);
    });
    updateCompletion();
}

function addSkill() {
    const skillInput = document.getElementById('skillInput');
    const skillLevelSelect = document.getElementById('skillLevel');
    const val = skillInput.value.trim();
    if (!val || skills.some(s => s.name.toLowerCase() === val.toLowerCase())) return;

    skills.push({ name: val, level: skillLevelSelect.value });
    skillInput.value = '';
    renderSkills();
}

window.removeSkill = function(index) {
    skills.splice(index, 1);
    renderSkills();
}

/* ==========================================================
 * RESUME LOGIC
 ==========================================================*/
const resumeInput = document.getElementById('resumeInput');
const resumeActions = document.getElementById('resumeActions');
const resumeFileName = document.getElementById('resumeFileName');
const viewPdfBtn = document.getElementById('viewPdfBtn');
const removeResumeBtn = document.getElementById('removeResumeBtn');

resumeInput?.addEventListener('change', function () {
    const file = this.files[0];
    if (!file || file.type !== "application/pdf") return;

    if (file.size > 2 * 1024 * 1024) {
        alert("PDF must be under 2MB");
        return;
    }

    const reader = new FileReader();
    reader.onload = e => {
        resumeBase64 = e.target.result;
        localStorage.setItem("student_resume_pdf", resumeBase64);
        showResumeUI(file.name);
        updateCompletion();
    };
    reader.readAsDataURL(file);
});

function showResumeUI(name) {
    if (!resumeActions || !resumeFileName) return;
    resumeActions.classList.remove('hidden');
    resumeFileName.textContent = name || "Saved_Resume.pdf";
}

viewPdfBtn?.addEventListener('click', e => {
    e.preventDefault();
    if (!resumeBase64) return;

    const win = window.open();
    win.document.write(`<iframe src="${resumeBase64}" style="width:100%;height:100vh" frameborder="0"></iframe>`);
});

removeResumeBtn?.addEventListener('click', () => {
    resumeBase64 = null;
    localStorage.removeItem("student_resume_pdf");
    resumeInput.value = "";
    resumeActions.classList.add('hidden');
    updateCompletion();
});

/* ==========================================================
 * PROFILE COMPLETION BAR
 ==========================================================*/
function updateCompletion() {
    const bar = document.getElementById('completionBar');
    const text = document.getElementById('completionText');
    const msg = document.getElementById('completionMessage');

    const fields = [
        document.getElementById('fullName')?.value.trim(),
        document.getElementById('rollNumber')?.value.trim(),
        document.getElementById('branch')?.value,
        document.getElementById('cgpa')?.value,
        skills.length > 0,
        resumeBase64 !== null
    ];

    const percent = Math.floor((fields.filter(Boolean).length / fields.length) * 100);

    if (bar) bar.style.width = percent + "%";
    if (text) text.textContent = percent + "%";
    if (msg) msg.innerHTML = percent === 100
        ? '<span class="text-green-600 font-bold">✔ Profile Complete</span>'
        : 'Complete all fields to unlock jobs';

    localStorage.setItem("profile_completion", percent);
}

/* ==========================================================
 * SAVE PROFILE TO BACKEND
 ==========================================================*/
const saveBtn = document.getElementById('saveBtn');
saveBtn?.addEventListener('click', async () => {
    if (!token) return alert("Login required to save profile");

    const branchSelect = document.getElementById('branch');
    const branchName = branchSelect?.options[branchSelect.selectedIndex].text || "";

    const payload = {
        name: document.getElementById('fullName')?.value.trim() || "",
        roll: document.getElementById('rollNumber')?.value.trim() || "",
        branch: branchName,
        cgpa: parseFloat(document.getElementById('cgpa')?.value) || 0,
        college: "GH Raisoni",
        skills: skills.map(s => s.name),
        resume: resumeBase64
    };

    try {
        saveBtn.innerHTML = "Saving...";
        saveBtn.disabled = true;

        const res = await fetch("http://localhost:5000/api/student/profile", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        });

        if (!res.ok) throw new Error("Save failed");

        localStorage.setItem("student_profile", JSON.stringify(payload));
        saveBtn.innerHTML = "✔ Saved";

        setTimeout(() => {
            saveBtn.innerHTML = "Save Profile";
            saveBtn.disabled = false;
        }, 2000);
    } catch (err) {
        alert("Save failed ❌");
        saveBtn.disabled = false;
        saveBtn.innerHTML = "Save Profile";
        console.error(err);
    }
});

/* ==========================================================
 * INITIALIZE PROFILE DATA & JOBS
 ==========================================================*/
document.addEventListener("DOMContentLoaded", async () => {
    // Load profile from localStorage
    document.getElementById('fullName').value = studentSession.name || "";
    document.getElementById('rollNumber').value = studentSession.roll || "";
    document.getElementById('cgpa').value = studentSession.cgpa || "";
    
    const branchOptions = document.getElementById('branch')?.options || [];
    for (let i = 0; i < branchOptions.length; i++) {
        if (branchOptions[i].text === studentSession.branch) {
            branchOptions[i].selected = true;
            break;
        }
    }

    renderSkills();
    if (resumeBase64) showResumeUI("Saved_Resume.pdf");
    updateCompletion();

    if (!token) return;

    try {
        // Fetch profile
        const resProfile = await fetch("http://localhost:5000/api/student/profile", {
            headers: { "Authorization": `Bearer ${token}` }
        });
        if (resProfile.ok) {
            const profile = await resProfile.json();
            document.getElementById('fullName').value = profile.name || "";
            document.getElementById('rollNumber').value = profile.roll || "";
            document.getElementById('cgpa').value = profile.cgpa || "";

            for (let i = 0; i < branchOptions.length; i++) {
                if (branchOptions[i].text === profile.branch) {
                    branchOptions[i].selected = true;
                    break;
                }
            }

            skills = (profile.skills || []).map(s => ({ name: s, level: "Intermediate" }));
            renderSkills();

            if (profile.resume) {
                resumeBase64 = profile.resume;
                localStorage.setItem("student_resume_pdf", resumeBase64);
                showResumeUI("Saved_Resume.pdf");
            }
        }

        // Fetch jobs
        const resJobs = await fetch("http://localhost:5000/api/student/jobs", {
            headers: { "Authorization": `Bearer ${token}` }
        });
        const data = await resJobs.json();
        allAvailableJobs = data.jobs || [];

    } catch(err){
        console.error("Initialization failed", err);
    }

    renderJobList();
});

/* ==========================================================
 * JOB LIST + APPLY LOGIC
 ==========================================================*/
function renderJobList() {
    const list = document.getElementById("jobs-list");
    if (!list) return;

    list.innerHTML = allAvailableJobs.map(job => {
        const isEligible = studentSession.cgpa >= job.cgpa && job.branches.includes(studentSession.branch);
        return `
            <div onclick="selectJob('${job.id}')" id="card-${job.id}" class="job-card bg-white p-5 rounded-xl border border-slate-200 cursor-pointer hover:shadow-md transition-all mb-3">
                <div class="flex justify-between items-start mb-2">
                    <h3 class="font-bold text-slate-900">${job.title}</h3>
                    <span class="px-2 py-1 text-[10px] font-bold rounded ${isEligible ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}">
                        ${isEligible ? "ELIGIBLE" : "INELIGIBLE"}
                    </span>
                </div>
                <p class="text-sm text-slate-500">${job.company}</p>
            </div>
        `;
    }).join("");
}

window.selectJob = function(id) {
    const job = allAvailableJobs.find(j => j.id === id);
    if (!job) return;

    const detailPane = document.getElementById("job-details");
    if (!detailPane) return;

    const isApplied = appliedJobs.some(app => app.id === job.id);
    const isEligible = studentSession.cgpa >= job.cgpa && job.branches.includes(studentSession.branch);

    detailPane.innerHTML = `
        <h1 class="text-2xl font-bold">${job.title}</h1>
        <p>${job.company}</p>
        <p>${job.description}</p>
        <button onclick="handleApply('${job.id}')" ${isApplied || !isEligible ? "disabled" : ""}>
            ${isApplied ? "Application Sent" : !isEligible ? "Criteria Not Met" : "Apply Now"}
        </button>
    `;
};

window.handleApply = async function(jobId) {
    if (!token) return alert("Login required to apply");

    const job = allAvailableJobs.find(j => j.id === jobId);
    if (!job) return;

    try {
        const res = await fetch(`http://localhost:5000/api/student/apply/${jobId}`, {
            method: "POST",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` }
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Apply failed");

        alert(`✅ Application Sent to ${job.company}!`);

        // Refresh applied jobs
        const resApps = await fetch("http://localhost:5000/api/student/applications", {
            headers: { "Authorization": `Bearer ${token}` }
        });
        appliedJobs = resApps.ok ? await resApps.json() : [];
        localStorage.setItem(APPLICATION_KEY, JSON.stringify(appliedJobs));

        window.selectJob(jobId);
    } catch(err){
        console.error(err);
        alert(err.message);
    }
};
