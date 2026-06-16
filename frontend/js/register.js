// ==========================
// register.js
// ==========================

// Initialize Lucide icons
lucide.createIcons();

// GSAP Page Entry Animation
gsap.to("#register-card", {
  opacity: 1,
  y: 0,
  duration: 0.8,
  ease: "power3.out"
});

// -------------------------
// Elements
// -------------------------
const registerForm = document.getElementById("registerForm");
const submitBtn = document.getElementById("submitBtn");
const btnText = document.getElementById("btnText");
const passwordInput = document.getElementById("password");
const togglePasswordBtn = document.getElementById("togglePassword");
const eyeIcon = document.getElementById("eyeIcon");

// -------------------------
// Password Toggle
// -------------------------
togglePasswordBtn.addEventListener("click", () => {
  const isPassword = passwordInput.type === "password";
  passwordInput.type = isPassword ? "text" : "password";
  eyeIcon.setAttribute("data-lucide", isPassword ? "eye-off" : "eye");
  lucide.createIcons();
});

// -------------------------
// Register Form Submission
// -------------------------
registerForm.onsubmit = async (e) => {
  e.preventDefault();

  const fullName = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const role = document.getElementById("role").value.toLowerCase();
  const password = passwordInput.value;

  if (password.length < 8) {
    alert("Password must be at least 8 characters.");
    return;
  }

  submitBtn.disabled = true;
  btnText.innerText = "Creating Account...";

  try {
    const data = await apiRequest("/auth/register", "POST", { name: fullName, email, password, role });

    localStorage.setItem(
      "placementor_session",
      JSON.stringify({ token: data.token, user: data.user })
    );

    if (data.user.role === "admin") {
      window.location.href = "/frontend/admin/admin-dashboard.html";
    } else if (data.user.role === "recruiter") {
      window.location.href = "/frontend/recruiter/recruiter-dashboard.html";
    } else {
      window.location.href = "/frontend/student/student-dashboard.html";
    }

  } catch (err) {
    alert(err.message || "Server error. Try again later.");
    console.error("Registration Error:", err);
    submitBtn.disabled = false;
    btnText.innerText = "Create Account";
  }
};

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
