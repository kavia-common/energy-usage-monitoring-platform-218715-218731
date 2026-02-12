import { apiRequest } from "./apiClient";

// PUBLIC_INTERFACE
export async function listAlerts() {
  /** Fetch alert rules. */
  return apiRequest("/alerts", { method: "GET" });
}

// PUBLIC_INTERFACE
export async function createAlert(alertRule) {
  /** Create an alert rule. */
  return apiRequest("/alerts", { method: "POST", body: alertRule });
}

// PUBLIC_INTERFACE
export async function updateAlert(alertId, patch) {
  /** Update an alert rule. */
  return apiRequest(`/alerts/${encodeURIComponent(alertId)}`, { method: "PUT", body: patch });
}

// PUBLIC_INTERFACE
export async function deleteAlert(alertId) {
  /** Delete an alert rule. */
  return apiRequest(`/alerts/${encodeURIComponent(alertId)}`, { method: "DELETE" });
}
