document.addEventListener("DOMContentLoaded", () => {
  const roleForm = document.getElementById("roleForm");
  const submitRoleBtn = document.getElementById("submitRoleBtn");
  const btnText = document.getElementById("btnText");

  roleForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    const role = document.getElementById("role").value;
    const registrationToken = sessionStorage.getItem("google_registration_token");

    if (!registrationToken) {
      alert("Session expired or invalid. Please try logging in with Google again.");
      window.location.href = "login.html";
      return;
    }

    if (!role) {
      alert("Please select a role");
      return;
    }

    // Set loading state
    const originalText = btnText.innerText;
    btnText.innerText = "Processing...";
    submitRoleBtn.disabled = true;

    try {
      const response = await fetch("http://localhost:5000/api/auth/google/complete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ registrationToken, role }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Registration failed");
      }

      // Success - save session and clear temp token
      sessionStorage.removeItem("google_registration_token");
      
      const sessionData = {
        token: data.token,
        user: data.user
      };
      localStorage.setItem("placementor_session", JSON.stringify(sessionData));

      // Redirect based on role
      if (data.user.role === "student") {
        window.location.href = "student/student-dashboard.html";
      } else if (data.user.role === "recruiter") {
        window.location.href = "recruiter/recruiter-dashboard.html";
      } else if (data.user.role === "admin") {
        window.location.href = "admin/admin-dashboard.html";
      } else {
        window.location.href = "index.html";
      }

    } catch (err) {
      alert(err.message);
      btnText.innerText = originalText;
      submitRoleBtn.disabled = false;
    }
  });
});
