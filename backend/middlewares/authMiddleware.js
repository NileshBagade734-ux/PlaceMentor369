import jwt from "jsonwebtoken";
import User from "../models/user.js";

export const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // Validate header format
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Authorization token missing or malformed",
      });
    }

    const token = authHeader.split(" ")[1];

    // Verify JWT secret exists
    if (!process.env.JWT_SECRET) {
      return res.status(500).json({
        message: "JWT secret is not configured",
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch latest user data
    const user = await User.findById(decoded.id).select("-password");

    // Ensure user still exists
    if (!user) {
      return res.status(401).json({
        message: "User no longer exists",
      });
    }

    req.user = user;

    next();
  } catch (err) {
    console.error("Auth middleware error:", err.message);

    return res.status(401).json({
      message: "Invalid or expired token",
    });
  }
};