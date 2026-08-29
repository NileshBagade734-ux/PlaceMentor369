import crypto from "crypto";
import bcrypt from "bcryptjs";
import User from "../models/user.js";
import generateToken from "../utils/generateToken.js";
import { sendPasswordResetEmail } from "../utils/emailService.js";

// ── Helpers ────────────────────────────────────────────────────────────────

/**
 * Hash a raw token with SHA-256 before storing or comparing.
 * This ensures that even if the DB is compromised, raw tokens are never exposed.
 */
function hashToken(raw) {
  return crypto.createHash("sha256").update(raw).digest("hex");
}

// REGISTER
export const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({ message: "Password must be at least 8 characters long, contain an uppercase letter, a lowercase letter, and a number." });
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role
    });

    res.status(201).json({
      token: generateToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// LOGIN
export const login = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    const user = await User.findOne({ email, role });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    res.json({
      token: generateToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// FORGOT PASSWORD
// POST /api/auth/forgot-password  { email }
//
// Security notes:
//   - Always returns 200 regardless of whether the email exists (prevents user enumeration).
//   - Any previously issued token for this email is overwritten (single outstanding token).
//   - The raw token is only ever sent by email; only its SHA-256 hash is persisted.
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required." });
    }

    const user = await User.findOne({ email });

    // Return 200 even when the email is not found — prevents user enumeration.
    if (!user) {
      return res.status(200).json({
        message: "If that email is registered, a reset link has been sent."
      });
    }

    // Generate a cryptographically secure 32-byte random token.
    const rawToken = crypto.randomBytes(32).toString("hex");
    const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

    // Overwrite any existing token — only one valid token at a time per user.
    await User.updateOne(
      { _id: user._id },
      {
        resetToken: hashToken(rawToken),
        resetTokenExpiry: expiry
      }
    );

    // Build the reset URL — FRONTEND_URL must be set in .env
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password.html?token=${rawToken}`;

    await sendPasswordResetEmail(user.email, user.name, resetUrl);

    return res.status(200).json({
      message: "If that email is registered, a reset link has been sent."
    });
  } catch (err) {
    console.error("FORGOT PASSWORD ERROR:", err);
    res.status(500).json({ message: "Server error. Please try again." });
  }
};

// RESET PASSWORD
// POST /api/auth/reset-password  { token, newPassword }
//
// Security notes:
//   - Token is validated by hash comparison AND expiry check in one query.
//   - Token is nullified immediately after a successful reset (single-use).
//   - New password goes through the same strength requirements as registration.
export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ message: "Token and new password are required." });
    }

    // Enforce the same password strength policy as registration.
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({
        message:
          "Password must be at least 8 characters and include an uppercase letter, a lowercase letter, and a number."
      });
    }

    // Find user whose stored hash matches AND whose expiry is still in the future.
    const user = await User.findOne({
      resetToken: hashToken(token),
      resetTokenExpiry: { $gt: new Date() }
    });

    if (!user) {
      return res.status(400).json({
        message: "Reset link is invalid or has expired. Please request a new one."
      });
    }

    // Hash the new password.
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password and immediately invalidate the token (single-use enforcement).
    await User.updateOne(
      { _id: user._id },
      {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null
      }
    );

    return res.status(200).json({ message: "Password reset successfully. You can now log in." });
  } catch (err) {
    console.error("RESET PASSWORD ERROR:", err);
    res.status(500).json({ message: "Server error. Please try again." });
  }
};
