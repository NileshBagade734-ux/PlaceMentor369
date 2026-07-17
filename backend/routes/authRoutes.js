import express from "express";
import { login, register } from "../controllers/authController.js";
import { validateRegister, validateLogin } from "../middlewares/validationMiddleware.js";
import { authLimiter } from "../middlewares/rateLimiter.js";

const router = express.Router();

router.post("/login", authLimiter, validateLogin, login);
router.post("/register", authLimiter, validateRegister, register);

export default router;
