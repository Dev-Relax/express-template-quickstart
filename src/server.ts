import dotenv from "dotenv"
import path, { dirname } from "path"
import { fileURLToPath } from "url"
import logger from "./utils/logger"
import { createApp } from "./app"

const __dirname = dirname(fileURLToPath(import.meta.url))
const parentDir = path.normalize(__dirname + "/..")

dotenv.config({ path: `${parentDir}\\.env` })

const startServer = async (): Promise<void> => {
  try {
    
    logger.info("🟢......Server is starting up......🟢")
    const app = await createApp()

    app.listen(process.env.PORT || 3000, () => {
      logger.info(`🚀 App running on port ${process.env.port}`)
      logger.info(`📊 Environment: ${process.env.NODE_ENV}`)
      logger.info(`🌐 Client URL: ${process.env.CLIENT_URL}`)
      logger.info(`🔒 Security: CSRF protection, Rate limiting enabled`)
    })
  } catch (error) {
    logger.error("Error starting server:", error)
    process.exit(1)
  }
}

startServer()
