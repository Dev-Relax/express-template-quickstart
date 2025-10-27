import validator from "validator"
import { Request, Response, NextFunction } from "express"
import logger from "../utils/logger"

/**
 * Validation error interface
 */

interface ValidationError {
  field: string
  message: string
}

/**
 * Validates email format using validator
 * @param {string} email - Email address to validate
 * @returns {boolean} True if email is valid
 */
const isValidEmail = (email: string): boolean => {
  return validator.isEmail(email)
}

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {boolean} True if password meets criteria
 */
const isValidPassword = (password: string): boolean => {
  if (!validator.isLength(password, { min: 6 })) {
    return false
  }

  // Add more password strength checks as needed

  return true
}

/**
 * Validates name field
 * Removes extra whitespace and checks length
 * @param {string} name - Name to validate
 * @returns {boolean} True if name is valid
 */
const isValidName = (name: string): boolean => {
  const trimmedName = validator.trim(name)
  return validator.isLength(trimmedName, { min: 2, max: 50 })
}

/**
 * Sanitizes string input by removing dangerous characters
 * @param {string} input - String to sanitize
 * @returns {string} Sanitized string
 */
export const sanitizeString = (input: string): string => {
  let sanitized = validator.trim(input)
  // Escape HTML to prevent XSS
  sanitized = validator.escape(sanitized)
  return sanitized
}

/**
 * Middleware to validate user registration input
 * checks email, password, and name fields
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next function
 * @returns
 */
export const validateRegistration = (req: Request, res: Response, next: NextFunction): void => {
  const errors: ValidationError[] = []
  const { email, password, name } = req.body

  // validate email
  if (!email) {
    errors.push({ field: "email", message: "Email is required" })
  } else if (!isValidEmail(email)) {
    errors.push({ field: "email", message: "Invalid email format" })
  } else if (typeof email !== "string") {
    errors.push({ field: "email", message: "Email must be a string" })
  }

  if (!password) {
    errors.push({ field: "password", message: "Password is required" })
  } else if (typeof password !== "string") {
    errors.push({ field: "password", message: "Password must be a string" })
  } else if (!isValidPassword(password)) {
    errors.push({ field: "password", message: "Password must be at least 6 characters long" })
  }

  // validate name
  if (!name) {
    errors.push({ field: "name", message: "Name is required" })
  } else if (typeof name !== "string") {
    errors.push({ field: "name", message: "Name must be a string" })
  } else if (!isValidName(name)) {
    errors.push({ field: "name", message: "Name must be between 2 and 50 characters" })
  } else {
    // Sanitize name
    req.body.name = sanitizeString(name)
  }

  // If there are validation errors, respond with 400 Bad Request
  if (errors.length > 0) {
    logger.warn("Registration validation failed:", errors)
    res.status(400).json({ errors })
    return
  }

  next()
}

/**
 * Middleware to validate user login input
 * checks email and password fields
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next function
 */
export const validateLogin = (req: Request, res: Response, next: NextFunction): void => {
  const errors: ValidationError[] = []
  const { email, password } = req.body
  // validate email
  if (!email) {
    errors.push({ field: "email", message: "Email is required" })
  } else if (!isValidEmail(email)) {
    errors.push({ field: "email", message: "Invalid email format" })
  } else if (typeof email !== "string") {
    errors.push({ field: "email", message: "Email must be a string" })
  } else {
    // Normalize email
    req.body.email = validator.normalizeEmail(email) || email.toLowerCase()
  }

  // validate password
  if (!password) {
    errors.push({ field: "password", message: "Password is required" })
  } else if (typeof password !== "string") {
    errors.push({ field: "password", message: "Password must be a string" })
  }

  // If there are validation errors, respond with 400 Bad Request
  if (errors.length > 0) {
    logger.warn("Login validation failed:", errors)
    res.status(400).json({ errors })
    return
  }

  next()
}

/**
 * Middleware to validate profile update input
 * validates optional name and email fields
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next function
 * @returns
 */
export const validateProfileUpdate = (req: Request, res: Response, next: NextFunction): void => {
  const errors: ValidationError[] = []
  const { name, email } = req.body

  // At least one field must be provided
  if (!name && !email) {
    errors.push({
      field: "general",
      message: "At least one field (name or email) must be provided",
    })
  }

  // validate name if provided
  if (name !== undefined) {
    if (typeof name !== "string") {
      errors.push({
        field: "name",
        message: "Name must be a string",
      })
    } else if (!isValidName(name)) {
      errors.push({
        field: "name",
        message: "Name must be between 2 and 50 characters",
      })
    } else {
      // Sanitize name
      req.body.name = sanitizeString(name)
    }
  }

  if (email !== undefined) {
    if (typeof email !== "string") {
      errors.push({
        field: "email",
        message: "Email must be a string",
      })
    } else if (!isValidEmail(email)) {
      errors.push({
        field: "email",
        message: "Invalid email format",
      })
    } else {
      // sanitize email
      req.body.email = validator.normalizeEmail(email) || email.toLowerCase()
    }
  }

  // if there are errors, return them
  if (errors.length > 0) {
    logger.warn("Profile update validation failed:", errors)
    res.status(400).json({ errors })
    return
  }

  // validation passed, continue to next middleware
  next()
}

/**
 * Middleware to validate user registration input
 * checks email, password, and name fields
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next function
 * @returns
 */
export const validatePasswordChange = (req: Request, res: Response, next: NextFunction): void => {
  const errors: ValidationError[] = []
  const { currentPassword, newPassword } = req.body

  // validate current password
  if (!currentPassword) {
    errors.push({
      field: "currentPassword",
      message: "Current password is required",
    })
  } else if (typeof currentPassword !== "string") {
    errors.push({
      field: "currentPasword",
      message: "Current password must be a string",
    })
  }

  // validate new password
  if (!newPassword) {
    errors.push({
      field: "newPassword",
      message: "New password is required",
    })
  } else if (typeof newPassword !== "string") {
    errors.push({
      field: "newPassword",
      message: "New password must be a string",
    })
  } else if (!isValidPassword(newPassword)) {
    errors.push({
      field: "newPassword",
      message: "New password must be at least 6 characters long",
    })
  }

  // check if new password is different from current
  if (currentPassword && newPassword && currentPassword === newPassword) {
    errors.push({
      field: "newPassword",
      message: "New password must be different from current password",
    })
  }

  // if there are errors, return them
  if (errors.length > 0) {
    logger.warn("Password change validation failed:", errors)
    return
  }

  // validation passed, continue to next middleware
  next()
}

/**
 * Middleware to validate user deletion input
 * validates password confirmation
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next function
 * @returns
 */
export const validateUserDeletion = (req: Request, res: Response, next: NextFunction): void => {
  const errors: ValidationError[] = []
  const { password } = req.body

  // validate password
  if (!password) {
    errors.push({
      field: "password",
      message: "Password is required",
    })
  } else if (typeof password !== "string") {
    errors.push({
      field: "password",
      message: "password must be a string",
    })
  }

  // if there are errors, return them
  if (errors.length > 0) {
    logger.warn("User deletion validation failed:", errors)
    res.status(400).json({ errors })
    return
  }

  // validation passed, continue to next middleware
  next()
}
