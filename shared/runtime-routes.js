export const FRONTEND_CANONICAL_API_ROUTES = Object.freeze([
  { method: "GET", path: "/api/health", owner: "runtime" },
  { method: "GET", path: "/api/admin/dashboard", owner: "dashboard" },
  { method: "GET", path: "/api/alerts", owner: "alerts" },
  { method: "DELETE", path: "/api/alerts", owner: "alerts" },
  { method: "GET", path: "/api/platform/dashboard", owner: "dashboard" },
  { method: "GET", path: "/api/sitrep/latest", owner: "sitrep" },
  { method: "GET", path: "/api/sitrep/map", owner: "sitrep" },
  { method: "GET", path: "/api/sitrep/sources", owner: "sitrep" },
  { method: "GET", path: "/api/subscription", owner: "billing" },
  { method: "POST", path: "/api/cta-click", owner: "marketing" },
  { method: "POST", path: "/api/leads", owner: "marketing" },
  { method: "POST", path: "/api/stripe/checkout", owner: "billing" },
  { method: "POST", path: "/api/stripe/customer_portal", owner: "billing" },
  { method: "POST", path: "/api/stripe/customer-portal", owner: "billing" },
  { method: "POST", path: "/api/stripe/portal", owner: "billing" }
]);

export const WORKER_CANONICAL_API_ROUTES = Object.freeze([
  { method: "GET", path: "/api/health" },
  { method: "GET", path: "/api/version" },
  { method: "GET", path: "/api/status" },
  { method: "GET", path: "/api/agents/health" },
  { method: "GET", path: "/api/agents/status" },
  { method: "GET", path: "/api/pricing" },
  { method: "GET", path: "/api/admin/dashboard" },
  { method: "GET", path: "/api/alerts" },
  { method: "DELETE", path: "/api/alerts" },
  { method: "GET", path: "/api/platform/dashboard" },
  { method: "GET", path: "/api/sitrep" },
  { method: "GET", path: "/api/sitrep/latest" },
  { method: "GET", path: "/api/sitrep/events" },
  { method: "GET", path: "/api/sitrep/health" },
  { method: "GET", path: "/api/sitrep/map" },
  { method: "GET", path: "/api/sitrep/research" },
  { method: "GET", path: "/api/sitrep/sources" },
  { method: "POST", path: "/api/sitrep/refresh" },
  { method: "POST", path: "/api/sitrep/research" },
  { method: "GET", path: "/api/subscription" },
  { method: "POST", path: "/api/cta-click" },
  { method: "POST", path: "/api/leads" },
  { method: "POST", path: "/api/stripe/checkout" },
  { method: "POST", path: "/api/stripe/customer_portal" },
  { method: "POST", path: "/api/stripe/customer-portal" },
  { method: "POST", path: "/api/stripe/portal" },
  { method: "POST", path: "/api/stripe/webhook" }
]);

export function routeKey(route) {
  return `${String(route.method || "GET").toUpperCase()} ${route.path}`;
}
