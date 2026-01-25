// backend/middlewares/authMiddleware.js
import jwt from "jsonwebtoken";
import User from "../models/User.js"; // make sure the filename matches exactly

/**
 * 🔹 Middleware to protect routes
 * Verifies JWT token and attaches user to req.user
 */
export const protect = async (req, res, next) => {
  let token;

  // 1️⃣ Check for token in headers
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1]; // Extract token
  }

  // 2️⃣ If no token found
  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }

  try {
    // 3️⃣ Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 4️⃣ Find user by ID from token payload (exclude password)
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    // 5️⃣ Attach user to request object
    req.user = user;

    // ✅ Proceed to next middleware / route
    next();

  } catch (err) {
    console.error("Auth Middleware Error:", err.message);
    return res.status(401).json({ message: "Token invalid" });
  }
};

/**
 * 🔹 Role-based authorization
 * Usage: authorize("admin"), authorize("student", "recruiter")
 */
export const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ message: `User role '${req.user.role}' not allowed` });
  }
  next();
};
