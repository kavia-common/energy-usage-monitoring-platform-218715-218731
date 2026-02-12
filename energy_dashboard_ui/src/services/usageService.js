import { apiRequest } from "./apiClient";

// PUBLIC_INTERFACE
export async function getOverview() {
  /** Fetch high-level dashboard metrics (today usage, active devices, alerts, etc.). */
  return apiRequest("/dashboard/overview", { method: "GET" });
}

// PUBLIC_INTERFACE
export async function getLiveUsage(deviceId) {
  /** Fetch latest usage snapshot for a device (fallback for when WS is disconnected). */
  const q = deviceId ? `?device_id=${encodeURIComponent(deviceId)}` : "";
  return apiRequest(`/usage/live${q}`, { method: "GET" });
}

// PUBLIC_INTERFACE
export async function getUsageSeries({ deviceId, range = "24h" }) {
  /** Fetch time-series for charts (range: 1h, 24h, 7d, 30d). */
  const q = new URLSearchParams();
  if (deviceId) q.set("device_id", deviceId);
  if (range) q.set("range", range);
  return apiRequest(`/usage/series?${q.toString()}`, { method: "GET" });
}
