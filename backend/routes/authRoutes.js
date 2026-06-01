import express from "express";
import { login, register } from "../controllers/authController.js";
import { authLimiter } from "../middlewares/rateLimiter.js";

const router = express.Router();

router.post("/login", authLimiter, login);
router.post("/register", authLimiter, register);   // 👈 THIS WAS MISSING

export default router;
