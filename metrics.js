import client from "prom-client";

// Auto collects: CPU, memory, event loop, GC
const register = new client.Registry();
client.collectDefaultMetrics({ register });

// ─── HTTP METRICS ───────────────────────────────

// RED: Rate — total requests
export const httpRequestTotal = new client.Counter({
  name: "http_requests_total",
  help: "Total number of HTTP requests",
  labelNames: ["method", "route", "status_code"],
  registers: [register],
});

// RED: Duration — response time
export const httpRequestDuration = new client.Histogram({
  name: "http_request_duration_seconds",
  help: "HTTP request duration in seconds",
  labelNames: ["method", "route", "status_code"],
  buckets: [0.01, 0.05, 0.1, 0.3, 0.5, 1, 2, 5], // in seconds
  registers: [register],
});

// Active requests right now
export const httpActiveRequests = new client.Gauge({
  name: "http_active_requests",
  help: "Number of active HTTP requests",
  registers: [register],
});

// ─── DATABASE METRICS ───────────────────────────

export const dbQueryDuration = new client.Histogram({
  name: "db_query_duration_seconds",
  help: "Database query duration",
  labelNames: ["operation", "collection", "status"],
  buckets: [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1],
  registers: [register],
});

export const dbConnectionPool = new client.Gauge({
  name: "db_connection_pool_size",
  help: "Current DB connection pool size",
  labelNames: ["state"], // active, idle, waiting
  registers: [register],
});

// ─── BUSINESS METRICS ───────────────────────────

export const userSignups = new client.Counter({
  name: "user_signups_total",
  help: "Total user signups",
  labelNames: ["plan"], // free, pro, enterprise
  registers: [register],
});

export const orderValue = new client.Histogram({
  name: "order_value_rupees",
  help: "Value of orders placed",
  buckets: [100, 500, 1000, 5000, 10000, 50000],
  registers: [register],
});

export { register };