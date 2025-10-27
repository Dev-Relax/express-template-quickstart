import { doubleCsrf } from "csrf-csrf"
import { Response, NextFunction } from "express"

/**
 * CSRF protection configuration using csrf-csrf package
 * Generates and validates CSRF tokens to prevent cross-site request forgery
 */
const {
  generateToken, // Function to generate CSRF token
  doubleCsrfProtection, // Middleware to validate CSRF token
} = doubleCsrf({
  getSecret: () => process.env.JWT_ACCESS_SECRET || "csrf-secret", // Secret for signing tokens
  cookieName: "x-csrf-token", // Cookie name for CSRF token
  cookieOptions: {
    sameSite: "strict", // Strict same-site policy
    path: "/", // Cookie available on all paths
    secure: process.env.NODE_ENV === "production", // HTTPS only in production
  },
  size: 64, // Token size in bytes
  ignoredMethods: ["GET", "HEAD", "OPTIONS"], // Methods that don't require CSRF protection
  getTokenFromRequest: (req) => req.headers["x-csrf-token"] as string, // Get token from custom header
})

/**
 * Middleware to validate CSRF tokens on protected routes
 */
export const csrfProtection = doubleCsrfProtection

/**
 * Middleware to generate and attach CSRF token to response
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next function
 */
export const csrfTokenGenerator = (req: any, res: Response, next: NextFunction): void => {
  // Generate CSRF token and attach to request

  const token = generateToken(req, res)
  req.csrfToken = token
  next()
}
