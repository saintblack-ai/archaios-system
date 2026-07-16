import { apiRequest } from "../lib/api";

async function requestSitrep(path) {
  return apiRequest(path);
}

export async function fetchLatestSitrep() {
  return requestSitrep("/api/sitrep/latest");
}

export async function fetchSitrepSources() {
  return requestSitrep("/api/sitrep/sources");
}

export async function fetchSitrepMap(filters = {}) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value) params.set(key, value);
  });
  const query = params.toString();
  return requestSitrep(`/api/sitrep/map${query ? `?${query}` : ""}`);
}
