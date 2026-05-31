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
const passwordToggleBtn = document.getElementById("togglePassword");
const eyeIcon = document.getElementById("eyeIcon");

// -------------------------
// Password Toggle
// -------------------------
passwordToggleBtn.addEventListener("click", () => {
  const isPassword = passwordField.type === "password";
  passwordField.type = isPassword ? "text" : "password";
  eyeIcon.setAttribute("data-lucide", isPassword ? "eye-off" : "eye");
  lucide.createIcons();
});

// -------------------------
// Login Form Submit
// -------------------------
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const isValid = window.ValidationUtils.validateForm(loginForm, [
    { id: 'role', type: 'empty' },
    { id: 'email', type: 'email' },
    { id: 'password', type: 'empty' } // Password in login doesn't strictly need complexity check, but we can use 'empty' or 'password'. We'll use 'empty' so they aren't blocked if they somehow have an old simple password. Wait, let's use 'empty' for login password, 'email' for email, 'empty' for role.
  ]);

  if (!isValid) return;

  const email = document.getElementById("email")?.value.trim();
  const password = passwordField?.value.trim();
  const role = document.getElementById("role")?.value;

  loginBtn.disabled = true;
  btnText.innerText = "Authenticating...";

  try {
    const res = await fetch("http://localhost:5000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, role })
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message || "Login failed");
      return;
    }

    localStorage.setItem(
      "placementor_session",
      JSON.stringify({ token: data.token, user: data.user })
    );

    if (data.user.role === "admin") {
      window.location.href = "/admin/admin-dashboard.html";
    } else if (data.user.role === "recruiter") {
      window.location.href = "/recruiter/recruiter-dashboard.html";
    } else {
      window.location.href = "/student/student-dashboard.html";
    }

  } catch (err) {
    console.error("Login Error:", err);
    alert("Server error. Try again later.");
  } finally {
    loginBtn.disabled = false;
    btnText.innerText = "Sign In";
  }
});
