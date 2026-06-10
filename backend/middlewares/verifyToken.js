import jwt from "jsonwebtoken";
import User from "../models/user.js";

export const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided or invalid authorization format" });
  }

  const parts = authHeader.split(" ");
  if (parts.length !== 2) {
    return res.status(401).json({ message: "Invalid authorization scheme (must be Bearer token)" });
  }

  const token = parts[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("_id role");

    if (!user) {
      return res.status(401).json({ message: "User not found or account has been deleted" });
    }

    // 🔥 FIX
    req.user = {
      id: user._id,
      role: user.role
    };

    next();
  } catch (err) {
    console.error("TOKEN ERROR:", err.message);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};
