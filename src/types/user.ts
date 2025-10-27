import mongoose, { Document } from "mongoose"

/**
 * User document interface extending Mongoose Document
 */
export interface IUser extends Document {
  _id: mongoose.Types.ObjectId
  email: string
  password: string
  name: string
  refreshToken?: Array<{
    token: string
    createdAt: Date
    lastUsedAt?: Date
  }>
  refreshHistory?: Array<{
    token: string
    lastUsedAt: Date
  }>
  createdAt: Date
  updatedAt: Date
  comparePassword(candidatePassword: string): Promise<boolean>
}
