import express from "express";
import { login, register, logout } from "../controllers/authController.js";
import { validateRegister, validateLogin } from "../middlewares/validationMiddleware.js";

const router = express.Router();

router.post("/login", validateLogin, login);
router.post("/register", validateRegister, register);
router.post("/logout", logout);

export default router;
