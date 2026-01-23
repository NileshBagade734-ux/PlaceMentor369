// Initialize Lucide Icons
lucide.createIcons();

// 1. Entrance Animation (GSAP)
gsap.to("#login-card", {
  opacity: 1,
  y: 0,
  duration: 0.8,
  ease: "power3.out"
});

// 2. Password Visibility Logic
const passwordField = document.getElementById("password");
const toggleBtn = document.getElementById("togglePassword");
const eyeIcon = document.getElementById("eyeIcon");

toggleBtn.addEventListener("click", () => {
  const isPassword = passwordField.type === "password";
  passwordField.type = isPassword ? "text" : "password";
  
  // Update Lucide Icon dynamically
  eyeIcon.setAttribute('data-lucide', isPassword ? 'eye-off' : 'eye');
  lucide.createIcons();
});

// 3. Login Submission & Redirection Logic
const loginForm = document.getElementById("loginForm");
const loginBtn = document.getElementById("loginBtn");
const btnText = document.getElementById("btnText");

loginForm.addEventListener("submit", (e) => {
  e.preventDefault();
  
  const email = document.getElementById("email").value;
  const role = document.getElementById("userRole").value;

  // Visual Feedback: Loading State
  loginBtn.disabled = true;
  btnText.innerText = "Authenticating...";

  // Simulation: Wait 1.2 seconds for "processing"
  setTimeout(() => {
    // FEATURE: Session Persistence
    // Store user info in LocalStorage so Dashboards can verify access
    const session = {
      isLoggedIn: true,
      userEmail: email,
      userRole: role,
      loginTime: new Date().getTime()
    };
    localStorage.setItem("placementor_session", JSON.stringify(session));

    // FEATURE: Role-Based Redirection
    // Directing the user to the correct sub-folder based on their role
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
  }, 1200);
});