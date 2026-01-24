const express = require("express");
const router = express.Router();
const verifyToken = require("../middlewares/verifyToken");

router.get("/dashboard", verifyToken, (req, res) => {
  res.json({
    message: "Dashboard accessed successfully",
    userId: req.user.id,
    role: req.user.role
  });
});

module.exports = router;
