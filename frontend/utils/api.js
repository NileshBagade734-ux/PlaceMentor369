const API_BASE = "http://localhost:5000/api";

export async function fetchWithAuth(url, options = {}) {
  // 1. Safely parse the nested token from the main session object
  const session = JSON.parse(localStorage.getItem("placementor_session"));
  
  // 2. Fallback to standalone token string to prevent breaking any other views
  const token = session?.token || localStorage.getItem("token");

  options.headers = options.headers || {};
  if (token) {
    options.headers["Authorization"] = `Bearer ${token}`;
  }

  if (options.body && !options.headers["Content-Type"]) {
    options.headers["Content-Type"] = "application/json";
  }

  const response = await fetch(url, options);

  if (response.status === 401 || response.status === 403) {
    localStorage.removeItem("placementor_session");
    localStorage.removeItem("token");
    alert("Your session has expired or you are unauthorized. Please log in again.");
    
    const path = window.location.pathname;
    if (path.includes("/admin/") || path.includes("/recruiter/") || path.includes("/student/")) {
      window.location.href = "../login.html";
    } else {
      if (path.includes("/frontend/")) {
        window.location.href = "/frontend/login.html";
      } else {
        window.location.href = "/login.html";
      }
    }
    return new Promise(() => {});
  }

  return response;
}

export async function apiRequest(endpoint, method = "GET", body) {
  const options = {
    method,
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const res = await fetchWithAuth(API_BASE + endpoint, options);

  return res.json();
}
