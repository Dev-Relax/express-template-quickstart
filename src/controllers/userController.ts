import { Response } from "express"
import logger from "../utils/logger"
import { AuthRequest } from "../types/auth"
import User from "../models/User"

/**
 * Retrieves authenticated user's information
 * @param {AuthRequest} req - Express request with user data
 * @param {Response} res - Express response
 */
export const getProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // find user by ID from authenticated token
    const user = await User.findById(req.user?.id)

    // verify if user exists
    if (!user) {
      res.status(404).json({ error: "User not found" })
      return
    }

    // return user data (excluding sensitive fields)
    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      },
    })
  } catch (error: any) {
    logger.error(`Error while fetching profile:`, error)
    res.status(500).json({ message: "Server error while fetching profile" })
  }
}

/**
 * Deletes authenticated user's account
 * Requires password confirmation for security
 * Removes user document, invalidates tokens
 * @param {AuthRequest} req - Express request with user data
 * @param {Response} res - Express response
 */
export const deleteUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // extract password from request body
    const { password } = req.body

    // validate password is provided
    if (!password) {
      res.status(400).json({ error: "Password is required to delete account." })
      return
    }

    // find user and include password field
    const user = await User.findById(req.user?.id).select("+password")

    // verify user exists
    if (!user) {
      res.status(400).json({ error: "User not found" })
      return
    }

    // verify password is correct
    const isPasswordValid = await user.comparePassword(password)
    if (!isPasswordValid) {
      res.status(401).json({ error: "Password is incorect" })
      return
    }

    // store email for logging
    const userEmail = user.email

    // delete user document from database
    await User.findByIdAndDelete(user._id)

    // clear refreshToken cookie
    res.clearCookie("refreshToken")

    logger.info(`User account deleted: ${userEmail}`)

    // return success response
    res.json({ message: "Account deleted successfully" })
  } catch (error) {
    logger.error("Delete account error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

/**
 * Updates authenticated user's information
 * Allows updating name and/or email
 * @param {AuthRequest} req - Express request with user data
 * @param {Response} res - Express response
 */
export const updateUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // extract update data from request body (already validated and sanitized)
    const { name, email } = req.body

    // find user by ID from authentificated token
    const user = await User.findById(req.user?.id)

    // verify user exists
    if (!user) {
      res.status(404).json({ error: "User not found" })
      return
    }

    // check if new email is already taken by another user
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email })
      if (existingUser) {
        res.status(400).json({ error: "Email already in use" })
        return
      }

      // update email
      user.email = email
    }

    // update name if provided
    if (name) {
      user.name = name
    }

    // save updated user
    await user.save()

    logger.info(`User profile updated: ${user.email}`)

    // return updated user data
    res.json({
      message: "Profile updated successfully",
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        updatedAt: user.updatedAt,
      },
    })
  } catch (error) {
    logger.error("Update profile error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

/**
 * Changes authenticated user's password
 * Requires current password for verification
 * @param {AuthRequest} req - Express request with user data
 * @param {Response} res - Express response
 */
export const updatePassword = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // extract password data from request body (already sanitized)
    const { currentPassword, newPassword } = req.body

    // find user and include password field
    const user = await User.findById(req.user?.id).select("+password")

    // verify user exists
    if (!user) {
      res.status(404).json({ error: "User not found" })
      return
    }

    // verify current password is correct
    const isPasswordValid = await user.comparePassword(currentPassword)
    if (!isPasswordValid) {
      res.status(401).json({ error: "Current password is incorrect" })
      return
    }

    // update password (will be hashed by pre-save method)
    user.password = newPassword
    await user.save()

    // invalidate all refresh tokens for security
    user.refreshToken = []
    await user.save()

    logger.info(`Password changed for user: ${user.email}`)

    res.json({ message: "Password updated succesfully. Please log in again." })
  } catch (error) {
    logger.error("update password error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}
