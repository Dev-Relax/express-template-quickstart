import { Response, NextFunction } from "express"
import { verifyAccessToken } from "../utils/jwt"
import logger from "../utils/logger"
import User from "../models/User"
import { AuthRequest } from "../types/auth"

/**
 * Authentication middleware to verify JWT access tokens
 * Extracts token from Authorization header and validates it
 * @param {AuthRequest} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next function
 */
export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Get Authorization header from request
    const authHeader = req.headers.authorization

    // Check if header exists and has Bearer scheme
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({ error: "No token provided" })
      return
    }

    // Extract token from "Bearer <token>" format
    const token = authHeader.substring(7)

    // Verify and decode the token
    const decoded = verifyAccessToken(token)

    const user = await User.findById(decoded.userId).select(
      "-password, -refreshToken, -refreshHistory"
    )

    if (!user) {
      res.status(401).json({ message: "Unauthorized" })
      return
    }

    // Attach user info to request object for downstream handlers
    req.user = {
      id: user._id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt,
    }

    // Continue to next middleware
    next()
  } catch (error) {
    // Log authentication failures
    logger.error("Authentication error:", error)
    res.status(401).json({ error: "Invalid or expired token" })
  }
}
