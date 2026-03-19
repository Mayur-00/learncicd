
import { logger } from "./logger.js";
import { httpActiveRequests, httpRequestDuration, httpRequestTotal } from "./metrics.js";

export const observabilityMiddleware = (
  req,
  res,
  next
) => {
  const start = Date.now();
  httpActiveRequests.inc();

  // Normalize route — avoids high cardinality
  // e.g. /users/123 → /users/:id
  const route = req.route?.path || req.path;

  res.on("finish", () => {
    const duration = (Date.now() - start) / 1000;
    const labels = {
      method: req.method,
      route,
      status_code: res.statusCode.toString(),
    };

   
    httpRequestTotal.inc(labels);
    httpRequestDuration.observe(labels, duration);
    httpActiveRequests.dec();

    // ─── LOG EVERY REQUEST ─────────────────────
    const logData = {
      method: req.method,
      route,
      status: res.statusCode,
      duration_ms: Math.round(duration * 1000),
      ip: req.ip,
      user_agent: req.headers["user-agent"],
      user_id: req.user?.id || "", // if you have auth
      request_id: req.headers["x-request-id"],
    };

    if (res.statusCode >= 500) {
      logger.error("Request failed", logData);
    } else if (res.statusCode >= 400) {
      logger.warn("Client error", logData);
    } else {
      logger.info("Request completed", logData);
    }
  });

  next();
};