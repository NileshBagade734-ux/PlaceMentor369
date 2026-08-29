/**
 * Centralized API configuration for the frontend.
 *
 * Change API_BASE_URL here to point to your backend server.
 * For production, set this to your deployed backend URL.
 */
const API_BASE_URL = "http://localhost:5000/api";

/**
 * Centralized fetch wrapper that handles authentication and interception.
 * @param {string} url - Target URL
 * @param {object} options - Fetch options
 * @returns {Promise<Response>} The fetch Response object
 */
async function fetchWithAuth(url, options = {}) {
  const session = localStorage.getItem("placementor_session");
  const token = session ? JSON.parse(session).token : null;

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
    // Return a pending promise to prevent further execution in the client script
    return new Promise(() => {});
  }

  return response;
}

/**
 * Make an authenticated API request.
 * @param {string} endpoint - API endpoint (e.g., "/auth/login")
 * @param {string} method - HTTP method (GET, POST, PUT, DELETE)
 * @param {object|null} body - Request body (will be JSON-stringified)
 * @returns {Promise<object>} Parsed JSON response
 */
async function apiRequest(endpoint, method = "GET", body = null) {
  const options = {
    method,
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetchWithAuth(`${API_BASE_URL}${endpoint}`, options);

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Request failed" }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  return response.json();
}