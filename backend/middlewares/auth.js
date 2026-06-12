import jwt from "jsonwebtoken";

export const protect = (req, res, next) => {
  const authHeader = req.headers.authorization;

  // Validate authorization header format
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      message: "Authorization token missing or malformed",
    });
  }

  const token = authHeader.split(" ")[1];

  // Ensure JWT secret exists
  if (!process.env.JWT_SECRET) {
    return res.status(500).json({
      message: "JWT secret is not configured",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Store only required user fields
    req.student = {
      id: decoded.id,
      email: decoded.email,
    };

    next();
  } catch (err) {
    return res.status(401).json({
      message: "Invalid or expired token",
    });
  }
};