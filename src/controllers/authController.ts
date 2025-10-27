import { verifyRefreshToken } from "./../utils/jwt"
import User from "../models/User"
import { Response } from "express"
import { generateAccessToken, generateRefreshToken } from "../utils/jwt"
import logger from "../utils/logger"
import { AuthRequest } from "../types/auth"

/**
 * Register a new user
 * Creates user, generates tokens, sets refresh token cookie
 * @route POST /api/auth/register
 * @param {AuthRequest} req - Express request with user data
 * @param {Response} res - Express response
 * @returns
 */
export const register = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { email, password, name } = req.body

    // check if user already exist
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      res.status(409).json({ error: "User with this email already exists" })
      return
    }

    // create new user (password will be hashed in pre-save method)
    const newUser = await User.create({ email, password, name })

    // generate access token
    const accessToken = generateAccessToken({
      userId: newUser._id.toString(),
      email: newUser.email,
    })

    // generate refresh token
    const refreshToken = generateRefreshToken({
      userId: newUser._id.toString(),
      email: newUser.email,
    })

    // store refresh token in database to prevent reuse
    newUser.refreshToken?.push({
      token: refreshToken,
      createdAt: new Date(),
      lastUsedAt: new Date(),
    })
    await newUser.save()

    // Set refresh token as httpOnly cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // HTTPS only in production
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    })

    logger.info(`User registered: ${email}`)

    res.status(201).json({
      message: "User registered succesfully",
      accessToken,
      user: {
        id: newUser._id,
        email: newUser.email,
        name: newUser.name,
      },
    })
  } catch (e) {
    logger.error("Registration error:", e)
    res.status(500).json({ error: "Internal server error" })
  }
}

/**
 * Authenticates user and generates tokens
 * Verifies credentials, sets refresh token cookie
 * @route POST /api/auth/login
 * @param {AuthRequest} req - Express request with credentials
 * @param {Response} res - Express response
 */
export const login = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body

    const user = await User.findOne({ email }).select("+ password")

    if (!user || !(await user.comparePassword(password))) {
      res.status(401).json({
        error: "Invalid credentials",
      })
      return
    }

    const accessToken = generateAccessToken({
      userId: user._id.toString(),
      email: user.email,
    })
    const refreshToken = generateRefreshToken({
      userId: user._id.toString(),
      email: user.email,
    })

    user.refreshToken?.push({ token: refreshToken, createdAt: new Date(), lastUsedAt: new Date() })
    await user.save()

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // HTTPS only in production
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    })

    logger.info(`User logged in: ${email}`)

    res.json({
      message: "Login successfuly",
      accessToken,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
      },
    })
  } catch (e) {
    logger.error("Login error:", e)
    res.status(500).json({
      error: "Internal server error",
    })
  }
}

/**
 * Refreshes access token using refresh token from cookie
 * Validates refresh token and generates new token pair
 * @route POST /api/auth/refresh
 * @param {AuthRequest} req - Express request
 * @param {Response} res - Express response
 */
export const refresh = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const refreshToken = req.cookies.refreshToken

    if (!refreshToken) {
      res.status(401).json({
        error: "No refresh token provided",
      })
      return
    }

    const decoded = verifyRefreshToken(refreshToken)

    const user = await User.findById(decoded.userId)
    if (!user) {
      res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      })
      res.status(403).json({ message: "User not found." })
      return
    }

    const tokenData = user.refreshToken?.find((tokenObj) => tokenObj.token === refreshToken)
    if (!tokenData) {
      const recentlyUsed = user.refreshHistory?.find(
        (t) => Date.now() - t.lastUsedAt.getTime() < 30 * 1000
      )

      if (recentlyUsed) {
        // Grace reuse period
        logger.info(`Grace reuse of refresh token for user: ${user.name} (${user.email})`)
      } else {
        res.clearCookie("refreshToken", {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
        })

        const decodedExpiry = new Date((decoded.iat || 0) * 1000 + 7 * 24 * 60 * 60 * 1000)
        if (decodedExpiry < new Date()) {
          // token is older than 7 days
          res.status(401).json({ message: "Session expired. Please log in again." })
        } else {
          await User.findByIdAndUpdate(user._id, { $set: { refrehToken: [] } })
          logger.warn(`Token reuse detected for user: ${user.name} (${user.email})`)
          res.status(403).json({ message: "Security check failed. Please log in again." })
        }
        return
      }
    }

    // Clean up expired refresh tokens (older than 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    await User.findByIdAndUpdate(
      user._id,
      {
        $pull: {
          refreshToken: {
            createdAt: { $lt: sevenDaysAgo },
          },
        },
      },
      { new: true }
    )

    await User.findByIdAndUpdate(user._id, {
      refreshHistory: [],
      $pull: { refreshToken: { token: refreshToken } },
    })

    const newAccessToken = generateAccessToken({
      userId: user._id.toString(),
      email: user.email,
    })
    const newRefreshToken = generateRefreshToken({
      userId: user._id.toString(),
      email: user.email,
    })

    // Store the new refresh token in the database
    await User.findByIdAndUpdate(user._id, {
      $push: {
        refreshToken: {
          token: newRefreshToken,
          createdAt: new Date(),
          lastUsedAt: new Date(),
        },
        refreshHistory: {
          token: refreshToken,
          lastUsedAt: new Date(),
        },
      },
    })

    // Set the new refresh token cookie
    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    })

    logger.info(`Token refreshed for user: ${user.name} (${user.email})`)

    res.json({
      message: "Token refreshed successfully",
      accessToken: newAccessToken,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
      },
    })
  } catch (e) {
    logger.error(`Error during token refresh:`, e)

    // Clear the cookie on any server error
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    })

    res.status(500).json({ message: "Server error during token refresh" })
  }
}

/**
 * Logs out user by invalidating refresh token and destroying session
 * Removes refresh token from database, clears cookie
 * @route POST /api/auth/logout
 * @param {AuthRequest} req - Express request
 * @param {Response} res - Express response
 */
export const logout = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const refreshToken = req.cookies.refreshToken

    if (refreshToken && req.user) {
      await User.findOneAndUpdate(req.user.id, {
        $pull: {
          refreshToken: { token: refreshToken },
        },
      })
    }

    res.clearCookie("refreshToken")

    logger.info(`User logged out: ${req.user?.name || "Unknown"} (${req.user?.email || "Unknown"})`)

    res.json({ message: "Logged out succesfully" })
  } catch (e) {
    logger.error(`Error during logout:`, e)
    res.status(500).json({ message: "Server error during logout" })
  }
}
