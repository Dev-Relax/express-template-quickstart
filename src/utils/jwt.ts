import jwt from "jsonwebtoken"

/**
 * JWT token payload interface
 */
export interface TokenPayload {
  userId: string
  email: string
  iat?: number
  exp?: number
}

/**
 * Generates a short-lived access token
 * @param {TokenPayload} payload - User data to encode in token
 * @returns {string} Signed JWT access token
 */
export const generateAccessToken = (payload: TokenPayload): string => {
  // Sign token with access secret and expiry time
  return jwt.sign(payload, process.env.JWT_ACCESS_SECRET || "access-secret", {
    expiresIn: process.env.JWT_ACCESS_EXPIRY || "15m",
  } as jwt.SignOptions)
}

/**
 * Generates a long-lived refresh token
 * @param {TokenPayload} payload - User data to encode in token
 * @returns {string} Signed JWT refresh token
 */
export const generateRefreshToken = (payload: TokenPayload): string => {
  // Sign token with refresh secret and longer expiry time
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET || "refresh-secret", {
    expiresIn: process.env.JWT_REFRESH_EXPIRY || "7d",
  } as jwt.SignOptions)
}

/**
 * Verifies and decodes an access token
 * @param {string} token - JWT access token to verify
 * @returns {TokenPayload} Decoded token payload
 * @throws {Error} If token is invalid or expired
 */
export const verifyAccessToken = (token: string): TokenPayload => {
  // Verify token signature and expiration
  return jwt.verify(token, process.env.JWT_ACCESS_SECRET || "access-secret") as TokenPayload
}

/**
 * Verifies and decodes a refresh token
 * @param {string} token - JWT refresh token to verify
 * @returns {TokenPayload} Decoded token payload
 * @throws {Error} If token is invalid or expired
 */
export const verifyRefreshToken = (token: string): TokenPayload => {
  // Verify token signature and expiration
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET || "refresh-secret") as TokenPayload
}
