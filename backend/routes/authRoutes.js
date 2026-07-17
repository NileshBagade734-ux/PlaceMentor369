import express from "express";
import { login, register, forgotPassword, resetPassword } from "../controllers/authController.js";
import { validateRegister, validateLogin } from "../middlewares/validationMiddleware.js";

const router = express.Router();

router.post("/login", validateLogin, login);
router.post("/register", validateRegister, register);

// Password reset flow (no auth required — user is logged out)
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

export default router;
