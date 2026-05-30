// config.js
// Centralized API configuration for the PlaceMentor369 frontend.

const CONFIG = {
  API_BASE_URL: window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1" 
    ? "http://localhost:5000/api" 
    : `${window.location.origin}/api`,
  
  // Storage keys helper
  KEYS: {
    TOKEN: "token",
    USER: "user",
    THEME: "theme"
  },

  // Helper function to get auth headers automatically
  getAuthHeaders: () => {
    const token = localStorage.getItem("token");
    return {
      "Content-Type": "application/json",
      ...(token ? { "Authorization": `Bearer ${token}` } : {})
    };
  },

  // Helper to handle API responses and parse/throw errors properly
  handleResponse: async (response) => {
    if (!response.ok) {
      let errorMessage = "An error occurred";
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch (e) {
        // Response wasn't JSON
      }
      throw new Error(errorMessage);
    }
    return response.json();
  },

  // Check authentication status and redirect if necessary
  checkAuthOrRedirect: (allowedRoles = []) => {
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");
    if (!token || !userStr) {
      localStorage.clear();
      window.location.href = "login.html";
      return null;
    }
    
    try {
      const user = JSON.parse(userStr);
      if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
        // Unauthorized role, redirect to their respective home
        if (user.role === "student") window.location.href = "student-dashboard.html";
        else if (user.role === "recruiter") window.location.href = "recruiter-dashboard.html";
        else if (user.role === "admin") window.location.href = "admin-dashboard.html";
        else window.location.href = "login.html";
        return null;
      }
      return user;
    } catch (e) {
      localStorage.clear();
      window.location.href = "login.html";
      return null;
    }
  },

  // Log out helper
  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "login.html";
  }
};

window.CONFIG = CONFIG;
