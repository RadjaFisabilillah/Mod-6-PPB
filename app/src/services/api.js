import { BACKEND_URL } from "./config.js";
// Catatan: useAuth tidak dapat diimpor langsung karena Api adalah modul non-komponen.
// Token harus diteruskan dari komponen yang menggunakannya.

async function request(path, options = {}) {
  if (!BACKEND_URL) {
    throw new Error("BACKEND_URL is not set in app.json");
  }

  // Ambil token dari options dan hapus dari object options agar tidak ikut ke fetch
  const token = options.token;
  delete options.token;

  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`; // Tambahkan header Authorization
  }

  const response = await fetch(`${BACKEND_URL}${path}`, {
    headers,
    ...options,
  });

  if (!response.ok) {
    // Memberikan pesan error yang lebih informatif untuk masalah otorisasi
    if (response.status === 401) {
      throw new Error("Unauthorized: Invalid or missing login token.");
    }
    const message = await response.text();
    throw new Error(message || `Request failed with status ${response.status}`);
  }

  return response.status === 204 ? null : response.json();
}

export const Api = {
  // --- PAGINATION FEATURE: Added page and limit arguments ---
  getSensorReadings(page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    return request(`/api/readings?limit=${limit}&offset=${offset}`);
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
  createThreshold(payload, token) {
    // REQUIRES TOKEN
    return request("/api/thresholds", {
      method: "POST",
      body: JSON.stringify(payload),
      token, // Pass token to request function
    });
  },
  // --- FITUR BARU: HAPUS SATU DATA THRESHOLD ---
  deleteThreshold(id, token) {
    // REQUIRES TOKEN
    return request(`/api/thresholds/${id}`, {
      method: "DELETE",
      token, // Pass token to request function
    });
  },
  // --- FITUR BARU: HAPUS SEMUA DATA THRESHOLD ---
  clearThresholds(token) {
    // REQUIRES TOKEN
    return request("/api/thresholds/clear", {
      method: "DELETE",
      token, // Pass token to request function
    });
  },
};
