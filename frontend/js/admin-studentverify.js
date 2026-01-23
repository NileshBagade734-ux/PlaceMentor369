// adminverify-student.js

function renderStudentTable() {
    const tableBody = document.getElementById("studentTable");
    
    // 1. Fetch Real Student Profile from LocalStorage
    const realProfile = JSON.parse(localStorage.getItem("student_profile"));
    const isVerified = localStorage.getItem("profile_verified") === "true";
    
    // 2. Sample Mock Data combined with Real Data
    let students = [
      
    ];

    if (realProfile) {
        students.unshift({
            id: "current_user",
            name: realProfile.name,
            rollNo: realProfile.roll || "N/A",
            branch: realProfile.branch,
            cgpa: realProfile.cgpa,
            verified: isVerified
        });
    }

    tableBody.innerHTML = students.map(student => `
        <tr>
            <td><strong>${student.name}</strong></td>
            <td>${student.rollNo}</td>
            <td>${student.branch}</td>
            <td>${student.cgpa}</td>
            <td>
                <a href="#" class="resume-link" onclick="openResume()">
                    <i class="fa-solid fa-file-pdf"></i> View
                </a>
            </td>
            <td>
                <span class="badge ${student.verified ? 'badge-verified' : 'badge-pending'}">
                    ${student.verified ? 'Verified' : 'Pending'}
                </span>
            </td>
            <td>
                ${!student.verified ? `
                    <button class="btn-action btn-verify" onclick="verifyStudent('${student.id}')">Verify</button>
                    <button class="btn-action btn-reject" onclick="rejectStudent('${student.name}')">Reject</button>
                ` : '<span style="color: #16a34a; font-size: 12px;"><i class="fa-solid fa-circle-check"></i> Approved</span>'}
            </td>
        </tr>
    `).join("");
}

// ACTION: VERIFY
window.verifyStudent = function(id) {
    if (id === "current_user") {
        localStorage.setItem("profile_verified", "true");
    }
    alert("Verification successful! Student can now apply for jobs.");
    renderStudentTable();
};

// ACTION: VIEW RESUME
window.openResume = function() {
    const resume = localStorage.getItem("student_resume_pdf");
    if (resume) {
        const win = window.open();
        win.document.write(`<iframe src="${resume}" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>`);
    } else {
        alert("No resume uploaded for this student.");
    }
};

window.rejectStudent = function(name) {
    confirm(`Are you sure you want to reject ${name}'s profile?`);
};

document.addEventListener("DOMContentLoaded", renderStudentTable);