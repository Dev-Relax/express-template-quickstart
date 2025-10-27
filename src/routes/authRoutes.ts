import { Router, Request, Response } from "express"
import { login, logout, refresh, register } from "../controllers/authController"
import { authLimiter } from "../middleware/rateLimiter"
import { csrfProtection, csrfTokenGenerator } from "../middleware/csrf"
import { validateLogin, validateRegistration } from "../middleware/validation"
import { authenticate } from "../middleware/auth"

const router = Router()

router.post("/register", authLimiter, csrfProtection, validateRegistration, register)
router.post("/login", authLimiter, csrfProtection, validateLogin, login)
router.post("/refresh", refresh)
router.post("/logout", authenticate, logout)

router.get("/csrf-token", csrfTokenGenerator, (req: Request, res: Response) => {
  res.json({ csrfToken: req.csrfToken })
})

router.post('/debug-csrf', csrfProtection, (req: any, res) => {
  res.json({
    success: true, 
    message: 'CSRF validation passed!',
    cookies: req.cookies,
    csrfHeader: req.headers['x-csrf-token']
  });
});

export { router as authRouter}