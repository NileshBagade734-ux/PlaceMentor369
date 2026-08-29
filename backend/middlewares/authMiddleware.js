import jwt from "jsonwebtoken";
import User from "../models/user.js";

// Unified JWT middleware (merges protect + verifyToken)
export const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Authorization token missing or malformed",
      });
    }

    const token = authHeader.split(" ")[1];

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

// Authorization middleware: ensures user can only access their own data
// unless they have admin role. Prevents IDOR (Insecure Direct Object Reference).
export const requireSelf = (req, res, next) => {
  try {
    const requestedId = req.params.id;
    const userId = req.user._id.toString();
    const userIdStr = req.user.id.toString();
    const isAdmin = req.user.role === "admin";

    if (
      !isAdmin &&
      requestedId !== userId &&
      requestedId !== userIdStr
    ) {
      return res.status(403).json({
        error: "Access denied",
        message: "You can only access your own data"
      });
    }

    next();
  } catch (err) {
    console.error("Authorization check error:", err.message);
    return res.status(500).json({
      message: "Authorization check failed"
    });
  }
};
