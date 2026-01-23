// ===============================
// STATE MANAGEMENT
// ===============================
let skills = []; // [{ name, level }]
let resumeBase64 = localStorage.getItem("student_resume_pdf") || null;

// ===============================
// DOM ELEMENTS
// ===============================
const container = document.getElementById('skillsContainer');
const skillInput = document.getElementById('skillInput');
const skillLevelSelect = document.getElementById('skillLevel');
const resumeInput = document.getElementById('resumeInput');
const resumeActions = document.getElementById('resumeActions');
const resumeFileName = document.getElementById('resumeFileName');
const viewPdfBtn = document.getElementById('viewPdfBtn');
const removeResumeBtn = document.getElementById('removeResumeBtn');
const saveBtn = document.getElementById('saveBtn');

// ===============================
// SKILLS LOGIC
// ===============================
function renderSkills() {
  container.innerHTML = '';

  skills.forEach((skill, index) => {
    const tag = document.createElement('div');
    tag.className =
      'flex items-center bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full text-sm font-medium border border-blue-100';

    tag.innerHTML = `
      ${skill.name}
      <span class="ml-1 opacity-60 text-[10px]">(${skill.level})</span>
      <button onclick="removeSkill(${index})" class="ml-2 hover:text-red-500">
        <i class="fas fa-times"></i>
      </button>
    `;

    container.appendChild(tag);
  });

  updateCompletion();
}

function addSkill() {
  const val = skillInput.value.trim();

  if (!val) return;
  if (skills.some(s => s.name.toLowerCase() === val.toLowerCase())) return;

  skills.push({
    name: val,
    level: skillLevelSelect.value
  });

  skillInput.value = '';
  renderSkills();
}

function removeSkill(index) {
  skills.splice(index, 1);
  renderSkills();
}

// ===============================
// RESUME / PDF LOGIC
// ===============================
resumeInput.addEventListener('change', function () {
  const file = this.files[0];

  if (!file || file.type !== "application/pdf") return;

  if (file.size > 2 * 1024 * 1024) {
    alert("Please upload a PDF under 2MB.");
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
  resumeActions.classList.remove('hidden');
  resumeFileName.textContent = name || "Saved_Resume.pdf";
}

viewPdfBtn.addEventListener('click', e => {
  e.preventDefault();
  if (!resumeBase64) return;

  const win = window.open();
  win.document.write(`
    <title>Resume Preview</title>
    <body style="margin:0;background:#525659">
      <iframe src="${resumeBase64}" style="width:100%;height:100vh" frameborder="0"></iframe>
    </body>
 `);
});

removeResumeBtn.addEventListener('click', () => {
  resumeBase64 = null;
  localStorage.removeItem("student_resume_pdf");
  resumeInput.value = "";
  resumeActions.classList.add('hidden');
  updateCompletion();
});

// ===============================
// PROFILE COMPLETION LOGIC
// ===============================
function updateCompletion() {
  const bar = document.getElementById('completionBar');
  const text = document.getElementById('completionText');
  const msg = document.getElementById('completionMessage');

  const fields = [
    document.getElementById('fullName').value.trim(),
    document.getElementById('rollNumber').value.trim(),
    document.getElementById('branch').value,
    document.getElementById('cgpa').value,
    skills.length > 0,
    resumeBase64 !== null
  ];

  const filled = fields.filter(Boolean).length;
  const percent = Math.floor((filled / fields.length) * 100);

  bar.style.width = percent + "%";
  text.textContent = percent + "%";

  if (percent === 100) {
    bar.className = "h-full bg-green-500 transition-all duration-700";
    msg.innerHTML =
      '<span class="text-green-600 font-bold"><i class="fas fa-check-circle"></i> Profile complete! Ready to apply.</span>';
  } else {
    bar.className = "h-full bg-blue-600 transition-all duration-700";
    msg.textContent =
      "Complete all fields to unlock job applications.";
  }

  localStorage.setItem("profile_completion", percent);
}

// ===============================
// SAVE PROFILE (FINAL – ELIGIBILITY SAFE)
// ===============================
saveBtn.addEventListener('click', () => {
  const branchSelect = document.getElementById('branch');
  const branchName =
    branchSelect.options[branchSelect.selectedIndex].text;

  const profileData = {
    name: document.getElementById('fullName').value,
    roll: document.getElementById('rollNumber').value,
    branch: branchName,              // TEXT (not CSE code)
    cgpa: parseFloat(document.getElementById('cgpa').value) || 0,
    skills: skills.map(s => s.name)  // Simple array for matching
  };

  localStorage.setItem("student_profile", JSON.stringify(profileData));

  const original = saveBtn.innerHTML;
  saveBtn.innerHTML = '<i class="fas fa-check"></i> Profile Saved!';
  saveBtn.classList.replace('bg-blue-600', 'bg-green-600');
  saveBtn.disabled = true;

  setTimeout(() => {
    saveBtn.innerHTML = original;
    saveBtn.classList.replace('bg-green-600', 'bg-blue-600');
    saveBtn.disabled = false;
  }, 2000);
});

// ===============================
// INPUT LISTENERS
// ===============================
['fullName', 'rollNumber', 'branch', 'cgpa'].forEach(id => {
  document.getElementById(id).addEventListener('input', updateCompletion);
});

// ===============================
// INITIAL LOAD
// ===============================
document.addEventListener('DOMContentLoaded', () => {
  const saved = JSON.parse(localStorage.getItem("student_profile"));

  if (saved) {
    document.getElementById('fullName').value = saved.name || "";
    document.getElementById('rollNumber').value = saved.roll || "";
    document.getElementById('cgpa').value = saved.cgpa || "";

    const options = document.getElementById('branch').options;
    for (let i = 0; i < options.length; i++) {
      if (options[i].text === saved.branch) {
        options[i].selected = true;
        break;
      }
    }

    skills = (saved.skills || []).map(s => ({ name: s, level: "Intermediate" }));
    renderSkills();
  }

  if (resumeBase64) showResumeUI("Saved_Resume.pdf");
  updateCompletion();
});
