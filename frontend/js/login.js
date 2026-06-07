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
const emailField = document.getElementById("email");
const roleField = document.getElementById("role");
const errorDisplay = document.getElementById("errorMessage");

// -------------------------
// Helper: Show Error
// -------------------------
const showError = (message) => {
  errorDisplay.innerText = message;
  errorDisplay.classList.remove("hidden");
};

// -------------------------
// Helper: Clear Error
// -------------------------
const clearError = () => {
  errorDisplay.innerText = "";
  errorDisplay.classList.add("hidden");
};

// Clear error on input
[emailField, passwordField, roleField].forEach(field => {
  field?.addEventListener("input", clearError);
});
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

  if (!loginForm.checkValidity()) {
    return; // validation.js will handle UI
  }

  const email = emailField?.value;
  const password = passwordField?.value;
  const role = roleField?.value;

  if (!email || !password || !role) {
    return showError("Please fill all fields!");
  }

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
      showError(data.message || "Login failed");
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
    
    // Firebase Error Code Map
    const errorMessages = {
      "auth/user-not-found": "No account found with this email.",
      "auth/wrong-password": "Incorrect password. Please try again.",
      "auth/invalid-email": "The email address is badly formatted.",
      "auth/too-many-requests": "Too many failed attempts. Please try again later.",
      "auth/network-request-failed": "Network error. Please check your connection.",
      "auth/invalid-credential": "Invalid email or password.",
      "auth/configuration-not-found": "Server configuration error. Contact support.",
    };

    const code = err.code || (err.message && err.message.includes("auth/") ? err.message : null);
    const message = errorMessages[code] || "Server error. Try again later.";
    
    showError(message);
  } finally {
    loginBtn.disabled = false;
    btnText.innerText = "Sign In";
  }
});
