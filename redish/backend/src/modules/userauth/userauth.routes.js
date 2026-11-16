import { Router } from "express";
import {
  userregistercontroller,
  userLoginController,
  userRefreshTokenController,
  userLogoutController,
  getMeController,
} from "./userauth.controller.js";
import {
  registerSchema,
  loginSchema,
  validate,
} from "./userauth.validator.js";
import { authMiddleware } from "../../middleware/auth.middleware.js";

const router = Router();

// Public routes
router.post("/register", validate(registerSchema), userregistercontroller);
router.post("/login", validate(loginSchema), userLoginController);
router.post("/refresh", userRefreshTokenController);
router.post("/logout", userLogoutController);

// Protected routes (require valid access token)
router.get("/me", authMiddleware, getMeController);

export default router;
