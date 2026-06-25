main
document.addEventListener("DOMContentLoaded", () => {
  if (window.lucide) lucide.createIcons();
  gsap.to("#login-card", { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" });
});

const loginForm        = document.getElementById("loginForm");
const loginBtn         = document.getElementById("loginBtn");
const passwordToggleBtn = document.getElementById("togglePassword");
const btnText          = document.getElementById("btnText");
const passwordField    = document.getElementById("password");
const roleField        = document.getElementById("role");
const emailField       = document.getElementById("email");

// ── Helpers ──────────────────────────────────────────────────────────────────

function showError(field) {
  field.classList.add("is-invalid");
  field.classList.remove("is-valid");
  const parent = field.closest("div");
  const inv = parent?.querySelector(".invalid-feedback");
  const val = parent?.querySelector(".valid-feedback");
  if (inv) inv.style.display = "block";
  if (val) val.style.display = "none";
  field.style.borderColor = "#ef4444";
  field.style.boxShadow   = "0 0 0 2px rgba(239,68,68,0.2)";
}

function showSuccess(field) {
  field.classList.remove("is-invalid");
  field.classList.add("is-valid");
  const parent = field.closest("div");
  const inv = parent?.querySelector(".invalid-feedback");
  const val = parent?.querySelector(".valid-feedback");
  if (inv) inv.style.display = "none";
  if (val) val.style.display = "block";
  field.style.borderColor = "#22c55e";
  field.style.boxShadow   = "0 0 0 2px rgba(34,197,94,0.2)";
}

// ── Per-field rules ───────────────────────────────────────────────────────────

function validateRole(field) {
  if (!field.value) { showError(field); return false; }
  showSuccess(field); return true;
}

function validateEmail(field) {
  const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value.trim());
  if (!field.value.trim() || !ok) { showError(field); return false; }
  showSuccess(field); return true;
}

function validatePassword(field) {
  if (field.value.length < 6) { showError(field); return false; }
  showSuccess(field); return true;
}

// ── Live validation ───────────────────────────────────────────────────────────

roleField?.addEventListener("change", () => validateRole(roleField));
emailField?.addEventListener("input",  () => validateEmail(emailField));
passwordField?.addEventListener("input", () => validatePassword(passwordField));

// ── Password toggle ───────────────────────────────────────────────────────────

passwordToggleBtn?.addEventListener("click", () => {
  const isPassword = passwordField.type === "password";
  passwordField.type = isPassword ? "text" : "password";
  const icon = passwordToggleBtn.querySelector("[data-lucide]");
  if (icon) icon.setAttribute("data-lucide", isPassword ? "eye-off" : "eye");
  if (window.lucide) lucide.createIcons();
});

// ── Submit ────────────────────────────────────────────────────────────────────

loginForm?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const roleOk     = validateRole(roleField);
  const emailOk    = validateEmail(emailField);
  const passwordOk = validatePassword(passwordField);
  if (!roleOk || !emailOk || !passwordOk) return;

// login.js
// -------------------------
// Initialize Lucide & GSAP
// -------------------------
lucide.createIcons();
gsap.to("#login-card", { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" });

// -------------------------
// Elements
// -------------------------
const loginForm = document.getElementById("loginForm");
const loginBtn = document.getElementById("loginBtn");
const btnText = document.getElementById("btnText");
const passwordField = document.getElementById("password");
const toggleBtn = document.getElementById("togglePassword");
const eyeIcon = document.getElementById("eyeIcon");

// -------------------------
// Toast Notification Helper
// -------------------------
function showToast(message, type = "error") {
  const existingToast = document.querySelector(".toast-notification");
  if (existingToast) existingToast.remove();

  const toast = document.createElement("div");
  toast.className = `toast-notification toast-${type}`;
  toast.textContent = message;
  toast.style.cssText = `
    position: fixed; top: 20px; right: 20px; padding: 14px 20px;
    border-radius: 10px; color: #fff; font-size: 14px; font-weight: 500;
    z-index: 10000; opacity: 0; transform: translateX(100%);
    transition: all 0.3s ease; max-width: 320px;
    background: ${type === "error" ? "#ef4444" : "#10b981"};
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  `;
  document.body.appendChild(toast);
  requestAnimationFrame(() => {
    toast.style.opacity = "1";
    toast.style.transform = "translateX(0)";
  });
  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateX(100%)";
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

// -------------------------
// Password Toggle
// -------------------------
toggleBtn.addEventListener("click", () => {
  const isPassword = passwordField.type === "password";
  passwordField.type = isPassword ? "text" : "password";
  eyeIcon.setAttribute("data-lucide", isPassword ? "eye-off" : "eye");
  lucide.createIcons();
});

// -------------------------
// Login Form Submit
// -------------------------
loginForm.addEventListener("submit", async (e) => {
  if (!loginForm.checkValidity()) {
    return;
  }

  e.preventDefault();

  const email = document.getElementById("email")?.value;
  const password = passwordField?.value;
  const role = document.getElementById("role")?.value;

  if (!email || !password || !role) {
    showToast("Please fill all fields!");
    return;
  }
 main

  loginBtn.disabled = true;
  btnText.innerHTML = '<span class="spinner"></span> Authenticating...';

  try {
    const res = await fetch("http://localhost:5000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: emailField.value.trim(),
        password: passwordField.value,
        role: roleField.value,
      }),
    });

    const data = await res.json();
    if (!res.ok) { alert(data.message || "Login failed"); return; }

main
    localStorage.setItem("placementor_session", JSON.stringify({ token: data.token, user: data.user }));

    if (data.user.role === "admin")          window.location.href = "/admin/admin-dashboard.html";
    else if (data.user.role === "recruiter") window.location.href = "/recruiter/recruiter-dashboard.html";
    else                                     window.location.href = "/student/student-dashboard.html";

    if (!res.ok) {
      showToast(data.message || "Login failed. Please check your credentials.");
      return;
    }

    showToast("Login successful! Redirecting...", "success");

    localStorage.setItem(
      "placementor_session",
      JSON.stringify({ token: data.token, user: data.user })
    );

    setTimeout(() => {
      if (data.user.role === "admin") {
        window.location.href = "/frontend/admin/admin-dashboard.html";
      } else if (data.user.role === "recruiter") {
        window.location.href = "/frontend/recruiter/recruiter-dashboard.html";
      } else {
        window.location.href = "/frontend/student/student-dashboard.html";
      }
    }, 800);
main

  } catch (err) {
    console.error("Login Error:", err);
    showToast("Server error. Try again later.");
  } finally {
    setTimeout(() => {
      loginBtn.disabled = false;
      btnText.innerHTML = '<i data-lucide="log-in"></i> <span id="btnText">Sign In</span>';
      lucide.createIcons();
    }, 800);
  }
});
 