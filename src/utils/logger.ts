import winston from "winston"

/**
 * Winston logger instance configured for application logging
 * Logs to files and console (in development)
 */
const logger = winston.createLogger({
  // Set log level based on environment
  level: process.env.NODE_ENV === "production" ? "info" : "debug",

  // Configure log format with timestamps and error stack traces
  format: winston.format.combine(
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
  ),

  // Define log file transports
  transports: [
    // Log errors to separate file
    new winston.transports.File({ filename: "logs/error.log", level: "error" }),
    // Log all levels to combined file
    new winston.transports.File({ filename: "logs/combined.log" }),
  ],
})

/**
 * Add console logging in non-production environments
 */
if (process.env.NODE_ENV !== "production") {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(winston.format.colorize(), winston.format.simple()),
    })
  )
}

export default logger
