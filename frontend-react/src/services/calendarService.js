const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const getToken = () => localStorage.getItem("token") || localStorage.getItem("authToken") || "";

const buildHeaders = (json = true) => {
  const headers = {};

  if (json) {
    headers["Content-Type"] = "application/json";
  }

  const token = getToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
};

const handleResponse = async (response) => {
  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload.message || "Request failed");
  }

  return payload;
};

const buildQueryString = (params = {}) => {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && String(value).trim() !== "") {
      query.set(key, value);
    }
  });

  return query.toString();
};

export const fetchCalendarEvents = async (params = {}) => {
  const query = buildQueryString(params);
  const response = await fetch(`${API_BASE}/calendar/events${query ? `?${query}` : ""}`, {
    headers: buildHeaders(false)
  });

  return handleResponse(response);
};

export const createCalendarEvent = async (payload) => {
  const response = await fetch(`${API_BASE}/calendar/events`, {
    method: "POST",
    headers: buildHeaders(),
    body: JSON.stringify(payload)
  });

  return handleResponse(response);
};

export const updateCalendarEvent = async (eventId, payload) => {
  const response = await fetch(`${API_BASE}/calendar/events/${eventId}`, {
    method: "PUT",
    headers: buildHeaders(),
    body: JSON.stringify(payload)
  });

  return handleResponse(response);
};

export const deleteCalendarEvent = async (eventId) => {
  const response = await fetch(`${API_BASE}/calendar/events/${eventId}`, {
    method: "DELETE",
    headers: buildHeaders(false)
  });

  return handleResponse(response);
};