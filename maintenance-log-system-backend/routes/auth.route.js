// routes/auth.route.js
const express = require("express");
const router = express.Router();

const authController = require("../controllers/auth.controller");
const authMiddleware = require("../middleware/auth.middleware");

// Public routes
router.post("/register", authController.register);
router.post("/login", authController.login);

// 🔹 Logout route (frontend calls this)
router.post("/logout", authController.logout);

// 🔹 Auth status (frontend calls this in AuthButton)
router.get("/status", authMiddleware, (req, res) => {
  res.json({ authenticated: true, user: req.user });
});

// Protected route - returns logged-in user info
router.get("/me", authMiddleware, authController.me);

module.exports = router;
