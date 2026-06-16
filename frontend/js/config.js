/**
 * Centralized API configuration for the frontend.
 *
 * Change API_BASE_URL here to point to your backend server.
 * For production, set this to your deployed backend URL.
 */
const API_BASE_URL = "http://localhost:5000/api";

/**
 * Make an authenticated API request.
 * @param {string} endpoint - API endpoint (e.g., "/auth/login")
 * @param {string} method - HTTP method (GET, POST, PUT, DELETE)
 * @param {object|null} body - Request body (will be JSON-stringified)
 * @returns {Promise<object>} Parsed JSON response
 */
async function apiRequest(endpoint, method = "GET", body = null) {
  const session = localStorage.getItem("placementor_session");
  const token = session ? JSON.parse(session).token : null;

  const options = {
    method,
    headers: { "Content-Type": "application/json" },
  };

  if (token) {
    options.headers["Authorization"] = `Bearer ${token}`;
  }

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, options);

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Request failed" }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  return response.json();
}
