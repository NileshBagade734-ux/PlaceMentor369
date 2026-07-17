// Central API Handler Service for PlaceMentor369

const API_BASE_URL = "http://localhost:5000/api";

/**
 * Common fetch utility with automatic token setup & error parsing.
 * @param {string} endpoint - API path (e.g. '/auth/login', '/student/profile')
 * @param {object} options - Fetch option overrides (method, body, headers)
 * @returns {Promise<any>}
 */
export async function fetchAPI(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  // Retrieve token from localStorage session
  let token = "";
  try {
    const sessionStr = localStorage.getItem("placementor_session");
    if (sessionStr) {
      const session = JSON.parse(sessionStr);
      token = session.token || "";
    }
  } catch (err) {
    console.error("Failed to parse token from local storage:", err);
  }

  // Set default headers
  const headers = {
    "Content-Type": "application/json",
    ...options.headers
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const fetchOptions = {
    ...options,
    headers
  };

  try {
    const response = await fetch(url, fetchOptions);
    
    // Parse JSON safely
    let data;
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      data = await response.json();
    } else {
      data = { message: await response.text() };
    }

    if (!response.ok) {
      throw new Error(data.message || `HTTP Error: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error(`API request error on [${url}]:`, error);
    throw error;
  }
}
