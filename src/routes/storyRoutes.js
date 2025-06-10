// /home/ubuntu/lebrume_backend/src/routes/storyRoutes.js
const express = require("express");
const router = express.Router();
const {
  createStory,
  getCompanionStories,
  deleteStory,
} = require("../controllers/storyController");
const { protect } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

// @route   POST /api/stories
// @desc    Create a new story for the authenticated companion
// @access  Private (Companion role)
router.post("/", protect, authorizeRoles("Companion"), createStory);

// @route   GET /api/stories/companion/:companionProfileId
// @desc    Get active stories for a specific companion profile
// @access  Public
router.get("/companion/:companionProfileId", getCompanionStories);

// @route   DELETE /api/stories/:storyId
// @desc    Delete a story owned by the authenticated companion
// @access  Private (Companion role, owner)
router.delete("/:storyId", protect, authorizeRoles("Companion"), deleteStory);

module.exports = router;
