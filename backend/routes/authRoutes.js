import express from "express";
import { login, register, googleLogin, googleCompleteRegistration } from "../controllers/authController.js";

const router = express.Router();

router.post("/login", login);
router.post("/register", register);   // 👈 THIS WAS MISSING
router.post("/google", googleLogin);
router.post("/google/complete", googleCompleteRegistration);

export default router;
