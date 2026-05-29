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
  togglePasswordBtn.innerHTML = `<i data-lucide="${isPassword ? 'eye-off' : 'eye'}"></i>`;
  lucide.createIcons();
});

// -------------------------
// Register Form Submission
// -------------------------
registerForm.onsubmit = async (e) => {
  e.preventDefault();

  const fullName = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const role = document.getElementById("role").value.toLowerCase(); // lowercase for consistency
  const password = passwordInput.value;

  // 1️⃣ Validation Logic
  document.getElementById("passwordError").classList.add("hidden");
  if (password.length < 8) {
    document.getElementById("passwordError").classList.remove("hidden");
    return;
  }

  // 2️⃣ Visual Feedback
  submitBtn.disabled = true;
  btnText.innerText = "Creating Account...";

  try {
    // 3️⃣ Backend API call
    const res = await fetch("http://localhost:5000/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: fullName, email, password, role })
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message || "Registration failed");
      submitBtn.disabled = false;
      btnText.innerText = "Create Account";
      return;
    }

    // 4️⃣ Save session in localStorage
    localStorage.setItem(
      "placementor_session",
      JSON.stringify({ token: data.token, user: data.user })
    );

    // 5️⃣ Redirect based on role
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
    submitBtn.disabled = false;
    btnText.innerText = "Create Account";
  }
};

// -------------------------
// Google Auth Logic
// -------------------------
window.onload = async function () {
  if (window.google) {
    try {
      const configRes = await fetch("http://localhost:5000/api/config");
      const config = await configRes.json();
      
      if (config.googleClientId) {
        google.accounts.id.initialize({
          client_id: config.googleClientId,
          callback: handleGoogleCredentialResponse
        });
        
        const googleBtnContainer = document.getElementById("googleBtn");
        if (googleBtnContainer) {
          google.accounts.id.renderButton(
            googleBtnContainer,
            { theme: "outline", size: "large" }
          );
        }
      }
    } catch (err) {
      console.error("Failed to load Google Client ID:", err);
    }
  }
};

async function handleGoogleCredentialResponse(response) {
  try {
    const res = await fetch("http://localhost:5000/api/auth/google", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ token: response.credential })
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message || "Google Login failed");
      return;
    }

    if (data.requireRole) {
      // User doesn't exist, redirect to role selection
      sessionStorage.setItem("google_registration_token", data.registrationToken);
      window.location.href = "select-role.html";
      return;
    }

    // Login successful
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
    console.error("Google Login Error:", err);
    alert("Server error during Google Login. Try again later.");
  }
}

