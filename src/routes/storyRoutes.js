const express = require("express");
const router = express.Router();
const {
  createStory,
  getCompanionStories,
  deleteStory,
} = require("../controllers/storyController");
const { protect, authorize } = require('../middleware/combinedMiddleware');

// @route   POST /api/stories
// @desc    Create a new story for the authenticated companion
// @access  Private (Companion role)
router.post("/", protect, authorize("Companion"), createStory);

// @route   GET /api/stories/companion/:companionProfileId
// @desc    Get active stories for a specific companion profile
// @access  Public
router.get("/companion/:companionProfileId", getCompanionStories);

// @route   DELETE /api/stories/:storyId
// @desc    Delete a story owned by the authenticated companion
// @access  Private (Companion role, owner)
router.delete("/:storyId", protect, authorize("Companion"), deleteStory);

module.exports = router;
