import mongoose from "mongoose"
import logger from "../utils/logger"

/**
 * Establishes connection to MongoDB database
 * @returns {Promise<void>} Resolves when connection is established
 * @throws {Error} Exits process if connection fails
 */
export const connectDatabase = async (): Promise<void> => {
  try {
    
    await mongoose.connect(process.env.MONGODB_URI as string)

    logger.info("MongoDB connected successfully")
  } catch (error) {
    // Log error and exit process if connection fails
    logger.error("MongoDB connection error:", error)
    process.exit(1)
  }
}

mongoose.connection.on('error', (error) => {
    logger.error("❌ MongoDB connection error:", error)
})

mongoose.connection.on('disconnected', () => {
    logger.warn("⚠️ MongoDB connection lost")
})