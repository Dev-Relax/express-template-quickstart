import {
  validatePasswordChange,
  validateProfileUpdate,
  validateUserDeletion,
} from "./../middleware/validation"
import { csrfProtection } from "./../middleware/csrf"
import { Router } from "express"
import { authenticate } from "../middleware/auth"
import { deleteUser, getProfile, updatePassword, updateUser } from "../controllers/userController"

const router = Router()

router.put("/profile", authenticate, csrfProtection, validateProfileUpdate, updateUser)
router.put("/password", authenticate, csrfProtection, validatePasswordChange, updatePassword)

router.delete("/account", authenticate, csrfProtection, validateUserDeletion, deleteUser)

router.get("/profile", authenticate, getProfile)

export { router as userRouter }
