// ==========================
// register.js
// ==========================

document.addEventListener("DOMContentLoaded", () => {

  // Initialize Lucide icons
  if (window.lucide) lucide.createIcons();

  // GSAP Page Entry Animation
  if (window.gsap) {
    gsap.to("#register-card", { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" });
  } else {
    const card = document.getElementById("register-card");
    if (card) { card.style.opacity = "1"; card.style.transform = "none"; }
  }

  const registerForm = document.getElementById("registerForm");
  const submitBtn = document.getElementById("submitBtn");
  const btnText = document.getElementById("btnText");
  const passwordInput = document.getElementById("password");
  const togglePasswordBtn = document.getElementById("togglePassword");
  const eyeIcon = document.getElementById("eyeIcon");

  // Password Toggle
  togglePasswordBtn?.addEventListener("click", () => {
    const isPassword = passwordInput.type === "password";
    passwordInput.type = isPassword ? "text" : "password";
    if (eyeIcon) eyeIcon.setAttribute("data-lucide", isPassword ? "eye-off" : "eye");
    if (window.lucide) lucide.createIcons();
  });

  // Register Form Submission
  registerForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    e.stopImmediatePropagation();

    const fullName = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const role = document.getElementById("role").value.toLowerCase();
    const password = passwordInput.value;

    if (!fullName || !email || !role || !password) {
      return alert("Please fill all fields.");
    }
    if (password.length < 8) {
      return alert("Password must be at least 8 characters.");
    }

    submitBtn.disabled = true;
    btnText.innerText = "Creating Account...";

    try {
      const res = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: fullName, email, password, role })
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Registration failed");
        return;
      }

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
      alert("Server error. Try again later.");
      console.error("Registration Error:", err);
    } finally {
      submitBtn.disabled = false;
      btnText.innerText = "Create Account";
    }
  });

});
