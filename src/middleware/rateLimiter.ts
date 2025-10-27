import rateLimit from "express-rate-limit"

/**
 * Rate limiter for authentication routes
 * Prevents brute force attacks by limiting login/register attempts
 * 5 requests per 15 minutes per IP
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes window
  max: 5, // Maximum 5 requests per window
  message: "Too many authentication attempts, please try again later",
  standardHeaders: true, // Return rate limit info in RateLimit-* headers
  legacyHeaders: false, // Disable X-RateLimit-* headers
})

/**
 * General API rate limiter
 * Protects against API abuse and DoS attacks
 * 100 requests per 15 minutes per IP
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes window
  max: 100, // Maximum 100 requests per window
  message: "Too many requests, please try again later",
  standardHeaders: true,
  legacyHeaders: false,
})
