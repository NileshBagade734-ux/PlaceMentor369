import express from "express";
import { login, register, logout } from "../controllers/authController.js";
import { validateRegister, validateLogin } from "../middlewares/validationMiddleware.js";
import { authLimiter } from "../middlewares/rateLimiter.js";

const router = express.Router();

router.post("/login", authLimiter, validateLogin, login);
router.post("/register", authLimiter, validateRegister, register);
router.post("/logout", logout);

export default router;
