import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("_id role");

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    // 🔥 FIX
    req.user = {
      id: user._id,
      role: user.role
    };

    next();
  } catch (err) {
    console.error("TOKEN ERROR:", err);
    return res.status(401).json({ message: "Invalid token" });
  }
};
