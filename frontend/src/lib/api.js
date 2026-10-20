/**
 * API client for the IndaureX FastAPI backend.
 * All requests automatically attach the JWT bearer token from localStorage.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/v1";

class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;

  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  // Attach JWT if present
  const token =
    typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(url, {
    ...options,
    headers,
  });

  // Handle non-JSON error responses
  const contentType = res.headers.get("content-type");
  let data;
  if (contentType && contentType.includes("application/json")) {
    data = await res.json();
  } else {
    data = { detail: await res.text() };
  }

  if (!res.ok) {
    let message = "Something went wrong";
    if (typeof data?.detail === "string") {
      message = data.detail;
    } else if (Array.isArray(data?.detail)) {
      message = data.detail.map((d) => d.msg || JSON.stringify(d)).join("; ");
    } else if (data?.detail) {
      message = JSON.stringify(data.detail);
    }
    throw new ApiError(
      message,
      res.status,
      data
    );
  }

  return data;
}

// ─── Auth ───

export async function registerUser({ email, password, company_name }) {
  return request("/auth/register", {
    method: "POST",
    body: JSON.stringify({ email, password, company_name }),
  });
}

export async function loginUser({ email, password }) {
  return request("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

// ─── Dashboard ───

export async function getDashboard() {
  return request("/dashboard");
}

// ─── Twilio ───

export async function saveTwilioConfig({
  account_sid,
  auth_token,
  whatsapp_number,
}) {
  return request("/twilio/config", {
    method: "POST",
    body: JSON.stringify({ account_sid, auth_token, whatsapp_number }),
  });
}

export async function getTwilioConfig() {
  return request("/twilio/config");
}
