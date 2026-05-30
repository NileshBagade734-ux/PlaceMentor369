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
  passwordToggleBtn.innerHTML = `<i data-lucide="${isPassword ? 'eye-off' : 'eye'}"></i>`;
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

  const email = document.getElementById("email")?.value;
  const password = passwordField?.value;
  const role = document.getElementById("role")?.value;

  if (!email || !password || !role) {
    return alert("Please fill all fields!");
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
      alert(data.message || "Login failed");
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
    console.error("Login Error:", err);
    alert("Server error. Try again later.");
  } finally {
    loginBtn.disabled = false;
    btnText.innerText = "Sign In";
  }
});

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

