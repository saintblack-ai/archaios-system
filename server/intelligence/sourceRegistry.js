export const SOURCE_REGISTRY = [
  {
    key: "usgs-earthquakes",
    name: "USGS Earthquake Hazards",
    type: "official-public",
    category: "science",
    url: "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/significant_day.geojson",
    freshnessMinutes: 90,
    enabled: true
  },
  {
    key: "nasa-donki",
    name: "NASA DONKI Space Weather",
    type: "official-public",
    category: "space",
    url: "https://api.nasa.gov/DONKI/notifications?type=all",
    freshnessMinutes: 720,
    enabled: true
  },
  {
    key: "openai-status",
    name: "OpenAI Status",
    type: "official-status",
    category: "ai",
    url: "https://status.openai.com/api/v2/summary.json",
    freshnessMinutes: 30,
    enabled: true
  },
  {
    key: "cloudflare-status",
    name: "Cloudflare Status",
    type: "official-status",
    category: "infrastructure",
    url: "https://www.cloudflarestatus.com/api/v2/summary.json",
    freshnessMinutes: 30,
    enabled: true
  },
  {
    key: "vercel-status",
    name: "Vercel Status",
    type: "official-status",
    category: "infrastructure",
    url: "https://www.vercel-status.com/api/v2/summary.json",
    freshnessMinutes: 30,
    enabled: true
  },
  {
    key: "supabase-status",
    name: "Supabase Status",
    type: "official-status",
    category: "infrastructure",
    url: "https://status.supabase.com/api/v2/summary.json",
    freshnessMinutes: 30,
    enabled: true
  },
  {
    key: "internal-archaios",
    name: "ARCHAIOS Internal Health",
    type: "internal",
    category: "archaios",
    url: null,
    freshnessMinutes: 15,
    enabled: true
  }
];

export function getSource(key) {
  return SOURCE_REGISTRY.find((source) => source.key === key) || null;
}
