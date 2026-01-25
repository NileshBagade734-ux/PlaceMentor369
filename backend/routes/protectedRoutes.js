// protectedRoutes.js
import express from "express";
import { verifyToken } from "../middlewares/verifyToken.js"; // ✅ note the .js extension

const router = express.Router();

router.get("/dashboard", verifyToken, (req, res) => {
  res.json({
    message: "Dashboard accessed successfully",
    userId: req.user.id,
    role: req.user.role
  });
});

export default router; // ✅ default export for server.js
