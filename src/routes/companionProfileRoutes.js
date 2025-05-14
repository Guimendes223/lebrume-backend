// /home/ubuntu/lebrume_backend/src/routes/companionProfileRoutes.js
const express = require("express");
const router = express.Router();
const {
  getCompanionProfileById,
  getMyCompanionProfile,
  upsertMyCompanionProfile,
  searchCompanionProfiles // This might be better on a general /api/search route
} = require("../controllers/companionProfileController");
const { protect, authorize } = require("../middlewares/authMiddleware");

// @route   GET /api/companions/search
// @desc    Search/Filter companion profiles
// @access  Public
// Note: The project plan also mentions GET /api/search/companions. We'll use this for now.
router.get("/search", searchCompanionProfiles);

// @route   GET /api/companions/me/profile
// @desc    Get current authenticated companion's own profile
// @access  Private (Companion role)
router.get("/me/profile", protect, authorize("Companion"), getMyCompanionProfile);

// @route   PUT /api/companions/me/profile
// @desc    Create or Update current authenticated companion's profile
// @access  Private (Companion role)
router.put("/me/profile", protect, authorize("Companion"), upsertMyCompanionProfile);

// @route   GET /api/companions/:id
// @desc    Get public companion profile by ID
// @access  Public
router.get("/:id", getCompanionProfileById);

module.exports = router;
