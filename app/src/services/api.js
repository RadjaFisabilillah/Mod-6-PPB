import { BACKEND_URL } from "./config.js";

async function request(path, options = {}) {
  if (!BACKEND_URL) {
    throw new Error("BACKEND_URL is not set in app.json");
  }

  const response = await fetch(`${BACKEND_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Request failed with status ${response.status}`);
  }

  return response.status === 204 ? null : response.json();
}

export const Api = {
  getSensorReadings() {
    return request("/api/readings");
  },
  // --- FITUR BARU: HAPUS SATU DATA SENSOR ---
  deleteSensorReading(id) {
    return request(`/api/readings/${id}`, {
      method: "DELETE",
    });
  },
  // --- FITUR BARU: HAPUS SEMUA DATA SENSOR ---
  clearSensorReadings() {
    return request("/api/readings/clear", {
      method: "DELETE",
    });
  },

  getThresholds() {
    return request("/api/thresholds");
  },
  createThreshold(payload) {
    return request("/api/thresholds", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  // --- FITUR BARU: HAPUS SATU DATA THRESHOLD ---
  deleteThreshold(id) {
    return request(`/api/thresholds/${id}`, {
      method: "DELETE",
    });
  },
  // --- FITUR BARU: HAPUS SEMUA DATA THRESHOLD ---
  clearThresholds() {
    return request("/api/thresholds/clear", {
      method: "DELETE",
    });
  },
};
