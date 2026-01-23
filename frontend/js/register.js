// Initialize Lucide icons
lucide.createIcons();

// GSAP Page Entry Animation
gsap.to("#register-card", {
  opacity: 1,
  y: 0,
  duration: 0.8,
  ease: "power3.out"
});

// Password Toggle Logic
const passwordInput = document.getElementById("password");
const togglePasswordBtn = document.getElementById("togglePassword");
const eyeIcon = document.getElementById("eyeIcon");

togglePasswordBtn.addEventListener("click", () => {
  const isPassword = passwordInput.type === "password";
  passwordInput.type = isPassword ? "text" : "password";
  eyeIcon.setAttribute("data-lucide", isPassword ? "eye-off" : "eye");
  lucide.createIcons();
});

// Form Submission & Session Logic
const registerForm = document.getElementById("registerForm");
const submitBtn = document.getElementById("submitBtn");
const btnText = document.getElementById("btnText");

registerForm.onsubmit = (e) => {
  e.preventDefault();

  const fullName = document.getElementById("fullName").value;
  const email = document.getElementById("email").value;
  const role = document.getElementById("role").value;
  const password = passwordInput.value;

  // 1. Validation Logic
  document.getElementById("passwordError").classList.add("hidden");
  
  if (password.length < 8) {
    document.getElementById("passwordError").classList.remove("hidden");
    return;
  }

  // 2. Visual Feedback (Loading State)
  submitBtn.disabled = true;
  btnText.innerText = "Creating Account...";

  // Simulate API Call
  setTimeout(() => {
    // 3. LOGIC: Data Persistence
    // We save the user as "logged in" immediately so they don't have to login again
    const newUser = {
      isLoggedIn: true,
      name: fullName,
      email: email,
      role: role,
      createdAt: new Date().getTime()
    };
    
    localStorage.setItem("placementor_session", JSON.stringify(newUser));

    // 4. LOGIC: Dynamic Redirection
    console.log("Account created. Redirecting role:", role);
    
    // Redirecting to role-specific folders
// Current file: /frontend/register.html

// 4. LOGIC: Dynamic Redirection
    console.log("Account created. Redirecting role:", role);
    
    // We use a relative path WITHOUT the leading dot/slash for maximum compatibility 
    // with local file systems and Live Server.
if (role === "admin") {
    window.location.href = "/admin/admin-dashboard.html"; 
} else if (role === "recruiter") {
    window.location.href = "/frontend/recruiter/recruiter-dashboard.html";
} else {
    window.location.href = "/frontend/student/student-dashboard.html"; 
}

  }, 1500);
};