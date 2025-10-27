import mongoose, { Schema } from "mongoose"
import bcrypt from "bcryptjs"
import { IUser } from "../types/user"

/**
 * Mongoose schema for User model
 * Includes validation, unique constraints, and automatic timestamps
 */
const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false
    },
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    refreshToken: [
      {
        token: String,
        createdAt: {
          type: Date,
          default: Date.now,
          expires: 604800, // 7 days
        },
        lastUsedAt: Date,
      },
    ],
    refreshHistory: [
      {
        token: String,
        lastUsedAt: Date,
      },
    ],
  },
  {
    timestamps: true, // Automatically add createdAt and updatedAt
  }
)

/**
 * Pre-save middleware to hash password before storing
 * Only runs when password is modified
 */
UserSchema.pre("save", async function (next) {
  // Skip if password wasn't modified
  if (!this.isModified("password")) return next()

  // Generate salt with 10 rounds
  const salt = await bcrypt.genSalt(10)

  // Hash the password with the salt
  this.password = await bcrypt.hash(this.password, salt)

  next()
})

/**
 * Instance method to compare password with stored hash
 * @param {string} candidatePassword - Password to verify
 * @returns {Promise<boolean>} True if password matches
 */
UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  try {
    return await bcrypt.compare(candidatePassword, this.password)
  } catch (error: any) {
    throw new Error("Error comparing passwords")
  }
}

export default mongoose.model<IUser>("User", UserSchema)
