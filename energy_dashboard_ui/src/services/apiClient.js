/**
 * Lightweight REST client for the Energy API.
 * Uses fetch and provides consistent error handling.
 */

const DEFAULT_API_BASE_URL = "http://localhost:3001";

function getApiBaseUrl() {
  return process.env.REACT_APP_API_BASE_URL || DEFAULT_API_BASE_URL;
}

function getToken() {
  try {
    return localStorage.getItem("auth_token");
  } catch {
    return null;
  }
}

async function parseJsonSafe(res) {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return { raw: text };
  }
}


// PUBLIC_INTERFACE
export async function apiRequest(path, { method = "GET", body, headers = {} } = {}) {
  /** Perform an API request to the backend with optional JSON body and auth token. */
  const url = `${getApiBaseUrl()}${path.startsWith("/") ? path : `/${path}`}`;

  const token = getToken();
  const finalHeaders = {
    Accept: "application/json",
    ...headers,
  };

  let finalBody = body;
  if (body && typeof body === "object" && !(body instanceof FormData)) {
    finalHeaders["Content-Type"] = "application/json";
    finalBody = JSON.stringify(body);
  }

  if (token) {
    finalHeaders.Authorization = `Bearer ${token}`;
  }

  let res;
  try {
    res = await fetch(url, { method, headers: finalHeaders, body: finalBody });
  } catch (e) {
    throw new Error("Network error: could not reach server");
  }

  const payload = await parseJsonSafe(res);

  if (!res.ok) {
    const msg =
      (payload && (payload.detail || payload.message)) ||
      `Request failed with status ${res.status}`;
    const err = new Error(msg);
    err.status = res.status;
    err.payload = payload;
    throw err;
  }

  return payload;
}

// PUBLIC_INTERFACE
export function setAuthToken(token) {
  /** Save auth token to localStorage. */
  localStorage.setItem("auth_token", token);
}

// PUBLIC_INTERFACE
export function clearAuthToken() {
  /** Clear auth token from localStorage. */
  localStorage.removeItem("auth_token");
}

// PUBLIC_INTERFACE
export function getAuthToken() {
  /** Get auth token from localStorage. */
  return getToken();
}
