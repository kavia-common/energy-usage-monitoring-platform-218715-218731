import { apiRequest, clearAuthToken, setAuthToken, getAuthToken } from "./apiClient";

/**
 * NOTE:
 * The current backend OpenAPI spec available in this workspace only exposes GET / (health).
 * This service is implemented to match typical FastAPI auth patterns and will show
 * helpful errors until the backend exposes these endpoints.
 */

function guessEmailFromToken() {
  const token = getAuthToken();
  if (!token) return null;
  // No JWT decoding without a library; keep it simple.
  return "user@local";
}

// PUBLIC_INTERFACE
export async function login({ email, password }) {
  /** Log in user; expects backend to return { access_token } or { token }. */
  const payload = await apiRequest("/auth/login", {
    method: "POST",
    body: { email, password },
  });

  const token = payload?.access_token || payload?.token;
  if (!token) {
    throw new Error("Login succeeded but no token was returned by server");
  }
  setAuthToken(token);

  return {
    token,
    user: { email },
  };
}

// PUBLIC_INTERFACE
export async function register({ email, password }) {
  /** Register user; expects backend to return { access_token } or require separate login. */
  const payload = await apiRequest("/auth/register", {
    method: "POST",
    body: { email, password },
  });

  const token = payload?.access_token || payload?.token;
  if (token) {
    setAuthToken(token);
  }

  return {
    token: token || null,
    user: { email },
  };
}

// PUBLIC_INTERFACE
export async function logout() {
  /** Log out user locally (and optionally on server). */
  try {
    // Best-effort server-side logout if present.
    await apiRequest("/auth/logout", { method: "POST" });
  } catch {
    // ignore
  } finally {
    clearAuthToken();
  }
}

// PUBLIC_INTERFACE
export function getCurrentUser() {
  /** Get a best-effort current user model from stored token. */
  const token = getAuthToken();
  if (!token) return null;
  const email = guessEmailFromToken();
  return { email, tokenPresent: true };
}
