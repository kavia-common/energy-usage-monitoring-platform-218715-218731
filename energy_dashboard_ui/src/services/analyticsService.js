import { apiRequest } from "./apiClient";

// PUBLIC_INTERFACE
export async function getInsights({ range = "7d" } = {}) {
  /** Fetch analytics insights for a time range. */
  const q = new URLSearchParams();
  q.set("range", range);
  return apiRequest(`/analytics/insights?${q.toString()}`, { method: "GET" });
}
