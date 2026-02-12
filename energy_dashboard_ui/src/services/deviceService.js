import { apiRequest } from "./apiClient";

// PUBLIC_INTERFACE
export async function listDevices() {
  /** Fetch all devices for the current user. */
  return apiRequest("/devices", { method: "GET" });
}

// PUBLIC_INTERFACE
export async function createDevice(device) {
  /** Create a new device. */
  return apiRequest("/devices", { method: "POST", body: device });
}

// PUBLIC_INTERFACE
export async function updateDevice(deviceId, patch) {
  /** Update an existing device. */
  return apiRequest(`/devices/${encodeURIComponent(deviceId)}`, { method: "PUT", body: patch });
}

// PUBLIC_INTERFACE
export async function deleteDevice(deviceId) {
  /** Delete an existing device. */
  return apiRequest(`/devices/${encodeURIComponent(deviceId)}`, { method: "DELETE" });
}
