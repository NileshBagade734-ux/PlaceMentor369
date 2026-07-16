import jwt from "jsonwebtoken";
import User from "../models/user.js";

// Unified JWT middleware (merges protect + verifyToken)
export const protect = async (req, res, next) => {
  try {
    // Read token from httpOnly cookie or Authorization header (for backward compatibility)
    const token = req.cookies.token || (req.headers.authorization?.startsWith("Bearer ") ? req.headers.authorization.split(" ")[1] : null);

    if (!token) {
      return res.status(401).json({
        message: "Authorization token missing",
      });
    }

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({
        message: "JWT secret is not configured",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({
        message: "User not found",
      });
    }

    // Standardized req.user for ALL routes
    req.user = {
      _id: user._id,
      id: user._id,
      role: user.role,
    };

    next();
  } catch (err) {
    console.error("Auth middleware error:", err.message);
    return res.status(401).json({
      message: "Invalid or expired token",
    });
  }
};

// Alias so verifyToken imports still work
export const verifyToken = protect;
