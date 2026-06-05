import express from "express";
import { login, register, googleLogin, googleCompleteRegistration } from "../controllers/authController.js";
import { authLimiter } from "../middlewares/rateLimiter.js";

const router = express.Router();

router.post("/login", authLimiter, login);
router.post("/register", authLimiter, register);   // 👈 THIS WAS MISSING
router.post("/google", googleLogin);
router.post("/google/complete", googleCompleteRegistration);

export default router;
