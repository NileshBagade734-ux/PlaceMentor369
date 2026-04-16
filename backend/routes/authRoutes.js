import express from "express";
import { login, register } from "../controllers/authController.js";
import { body } from "express-validator";

const router = express.Router();

// ✅ Register validation
router.post(
  "/register",
  [
    body("name").notEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("Valid email is required"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
    body("role")
      .isIn(["student", "recruiter"])
      .withMessage("Role must be student or recruiter"),
  ],
  register
);

// ✅ Login validation
router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Valid email is required"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  login
);

export default router;