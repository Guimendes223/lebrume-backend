const express = require("express");
const router = express.Router();
const {
  createRating,
  getCompanionRatings,
  deleteRating,
} = require("../controllers/ratingController");
const { protect, authorize } = require('../middleware/combinedMiddleware');

// @route   POST /api/ratings/companion/:companionProfileId
// @desc    Create a new rating/review for a companion
// @access  Private (Client role)
router.post("/companion/:companionProfileId", protect, authorize("Client"), createRating);

// @route   GET /api/ratings/companion/:companionProfileId
// @desc    Get all ratings/reviews for a specific companion profile
// @access  Public
router.get("/companion/:companionProfileId", getCompanionRatings);

// @route   DELETE /api/ratings/:ratingId
// @desc    Delete a rating (Admin or owner of the rating)
// @access  Private (Admin role or Client who owns the rating)
router.delete("/:ratingId", protect, authorize("Admin", "Client"), deleteRating);

module.exports = router;
