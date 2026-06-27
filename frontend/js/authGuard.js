(function () {
  const sessionStr = localStorage.getItem("placementor_session");
  let isAuthenticated = false;
  let userRole = null;

  if (sessionStr) {
    try {
      const session = JSON.parse(sessionStr);
      if (session && session.token && session.user && session.user.role) {
        isAuthenticated = true;
        userRole = session.user.role;
      }
    } catch (e) {
      console.error("Error parsing session in authGuard", e);
    }
  }

  // Redirect helper to route back to login.html reliably
  const redirectToLogin = () => {
    localStorage.removeItem("placementor_session");
    localStorage.removeItem("token");
    
    const path = window.location.pathname;
    // Since all dashboard pages are nested exactly one folder deep (admin/, recruiter/, student/),
    // relative paths are highly reliable for local files (file://) and different domains.
    if (path.includes("/admin/") || path.includes("/recruiter/") || path.includes("/student/")) {
      window.location.href = "../login.html";
    } else {
      if (path.includes("/frontend/")) {
        window.location.href = "/frontend/login.html";
      } else {
        window.location.href = "/login.html";
      }
    }
  };

  if (!isAuthenticated) {
    redirectToLogin();
    return;
  }

  // Check if user is accessing a folder that matches their role
  const path = window.location.pathname.toLowerCase();
  let isAuthorized = true;

  if (path.includes("/admin/") && userRole !== "admin") {
    isAuthorized = false;
  } else if (path.includes("/recruiter/") && userRole !== "recruiter") {
    isAuthorized = false;
  } else if (path.includes("/student/") && userRole !== "student") {
    isAuthorized = false;
  }

  if (!isAuthorized) {
    redirectToLogin();
  }
})();
