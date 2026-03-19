
import {createLogger, format, transports} from "winston"
import LokiTransport from "winston-loki";


const isProduction = process.env.NODE_ENV === "production";

export const logger = createLogger({
  level: isProduction ? "info" : "debug",
  
  format: format.combine(
    format.timestamp(),
    format.errors({ stack: true }), // captures stack traces
    format.json()                   // structured JSON logs
  ),

  defaultMeta: {
    service: "nodejs-app",          // appears in every log
    version: process.env.APP_VERSION || "1.0.0",
  },

  transports: [
    // Console (for local dev)
    new transports.Console({
      format: format.combine(
        format.colorize(),
        format.simple()
      ),
    }),

    // Loki (for production)
    new LokiTransport({
      host: process.env.LOKI_HOST || "http://loki:3100",
      labels: {
        app: "nodejs-app",
        env: process.env.NODE_ENV || "development",
      },
      json: true,
      format: format.json(),
      onConnectionError: (err) => console.error("Loki error:", err),
    }),
  ],
});
