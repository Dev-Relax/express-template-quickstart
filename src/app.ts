import express, { Application, NextFunction, Request, Response } from "express"
import { connectDatabase } from "./config/database"
import helmet from "helmet"
import cors from "cors"
import cookieParser from "cookie-parser"
import { apiLimiter } from "./middleware/rateLimiter"
import logger from "./utils/logger"
import { authRouter, userRouter } from "./routes"

export const createApp = async (): Promise<Application> => {
  const app = express()

  await connectDatabase()

  /**
   * Security middleware
   */

  app.use(helmet())

  const allowedOrigins = [
    process.env.CLIENT_URL || "http://localhost:3000",
    "http://localhost:3000",
    "https://localhost:3000",
  ]

  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow request with no origin (like mobile or curl)
        if (!origin) return callback(null, true)

        if (allowedOrigins.indexOf(origin) !== -1) {
          callback(null, true)
        } else {
          callback(new Error("Not allowed by CORS"))
        }
      },
      credentials: true, // allow cookie to be sent
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization", "X-CSRF-Token", "X-XSRF-Token"],
    })
  )

  /**
   * Body parsing middleware
   */
  app.use(
    express.json({
      limit: "10mb",
      verify: (req: Request, res: Response, buf: Buffer) => {
        try {
          JSON.parse(buf.toString())
        } catch (e) {
          res.status(400).json({ message: "Invalid JSON" })
          return
        }
      },
    })
  )

  app.use(express.urlencoded({ extended: true, limit: "10mb" }))

  app.use(cookieParser())

  /**
   * Rate limiting middleware
   */

  app.use("/api", apiLimiter)

  /**
   * Application routes
   */

  app.use("/api/auth", authRouter)
  app.use("/api/user", userRouter)

  /**
   * Health check endpoint
   */

  app.get("/health", (req, res) => {
    res.json({
      status: "ok",
      timeStamp: new Date().toISOString(),
    })
  })

  /**
   * Global error handling
   */

  app.use("/{*any}", (req: Request, res: Response) => {
    res.status(404).json({
      message: "Route not found",
      path: req.originalUrl,
    })
  })

  app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    logger.error("Unhandled error:", err)

    if (err.code === "EBADCSRFTOKEN") {
      res.status(403).json({ error: "Invalid CSRF Token" })
      return
    }

    res.status(err.status || 500).json({
      error: process.env.NODE_ENV === "production" ? "Internal server error" : err.message,
    })
  })

  return app
}

process.on("SIGINT", () => {
  logger.warn("🔴......Server stopped......🔴")
  process.exit(0)
})

process.on("SIGTERM", () => {
  logger.info("🔴......Server stopped......🔴")
  process.exit(0)
})

// Handle uncaught exceptions
process.on("uncaughtException", (error: Error) => {
  logger.error("Uncaught Exception:", error)
  process.exit(1)
})

// Handle unhandled promise rejections
process.on("unhandledRejection", (reason: any, promise: Promise<any>) => {
  logger.error("Unhandled Rejection at:", promise, "reason:", reason)
  process.exit(1)
})
