// /home/ubuntu/lebrume_backend/src/routes/authRoutes.js
const express = require("express");
const router = express.Router();
const { registerUser, loginUser, getMe } = require("../controllers/authController");
const { protect } = require("../middlewares/authMiddleware");

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post("/register", registerUser);

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post("/login", loginUser);

// @route   GET /api/auth/me
// @desc    Get current user profile
// @access  Private (requires token)
router.get("/me", protect, getMe);

module.exports = router;
