import { Types } from "mongoose"
import { Request } from "express"

/**
 * Extended Express Request interface with user data
 */
export interface AuthRequest extends Request {
  user?: {
    id: Types.ObjectId
    name: string
    email: string
    createdAt: Date
  }
}
