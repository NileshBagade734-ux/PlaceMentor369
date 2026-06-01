const API_BASE = "http://localhost:5000/api";

export async function apiRequest(endpoint, method = "GET", body) {
  // 1. Safely parse the nested token from the main session object
  const session = JSON.parse(localStorage.getItem("placementor_session"));
  
  // 2. Fallback to standalone token string to prevent breaking any other views
  const token = session?.token || localStorage.getItem("token");

  const res = await fetch(API_BASE + endpoint, {
    method,
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: body ? JSON.stringify(body) : null
  });

  return res.json();
}
