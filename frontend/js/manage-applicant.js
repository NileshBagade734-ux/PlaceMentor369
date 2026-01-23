function renderTable() {
    const tableBody = document.getElementById("recruiter-table-body");
    
    // CONNECT TO STUDENT DATA
    const applications = JSON.parse(localStorage.getItem("student_applications") || "[]");
    const profile = JSON.parse(localStorage.getItem("student_profile") || "{}");
    const resumePdf = localStorage.getItem("student_resume_pdf");

    if (applications.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="6" class="p-10 text-center text-slate-400 font-medium">No applications found in the system.</td></tr>`;
        return;
    }

    tableBody.innerHTML = applications.map((app, index) => `
        <tr class="hover:bg-slate-50 transition-colors">
            <td class="p-4">
                <div class="font-bold text-slate-800">${profile.name || "Student Profile Missing"}</div>
                <div class="text-xs text-slate-400">${profile.branch || "Unknown Branch"}</div>
            </td>
            <td class="p-4">
                <div class="text-sm font-medium text-slate-700">${app.role}</div>
                <div class="text-[10px] text-slate-400 uppercase tracking-wider">${app.company}</div>
            </td>
            <td class="p-4 text-center font-mono font-bold text-indigo-600">${profile.cgpa || "0.0"}</td>
            <td class="p-4 text-center">
                ${resumePdf ? 
                    `<button onclick="viewResume()" class="text-slate-400 hover:text-indigo-600"><i data-lucide="file-text"></i></button>` : 
                    `<span class="text-slate-200"><i data-lucide="file-x"></i></span>`
                }
            </td>
            <td class="p-4">
                <span class="px-3 py-1 rounded-full text-[10px] font-bold uppercase 
                    ${app.status === 'Shortlisted' ? 'bg-emerald-100 text-emerald-700' : 
                      app.status === 'Rejected' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}">
                    ${app.status}
                </span>
            </td>
            <td class="p-4">
                <div class="flex gap-2">
                    <button onclick="updateAppStatus(${index}, 'Shortlisted')" 
                            class="p-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-600 hover:text-white transition-all">
                        <i data-lucide="check" class="w-4 h-4"></i>
                    </button>
                    <button onclick="updateAppStatus(${index}, 'Rejected')" 
                            class="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition-all">
                        <i data-lucide="x" class="w-4 h-4"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join("");
    
    lucide.createIcons();
}

// THIS FUNCTION UPDATES THE SHARED DATA
window.updateAppStatus = function(index, newStatus) {
    let apps = JSON.parse(localStorage.getItem("student_applications") || "[]");
    apps[index].status = newStatus;
    localStorage.setItem("student_applications", JSON.stringify(apps));
    renderTable(); // Refresh the table instantly
};

window.viewResume = function() {
    const pdf = localStorage.getItem("student_resume_pdf");
    if (!pdf) return alert("No resume uploaded by student.");
    const win = window.open();
    win.document.write(`<iframe src="${pdf}" style="width:100%;height:100vh;border:none;"></iframe>`);
};

document.addEventListener("DOMContentLoaded", renderTable);