// /home/ubuntu/lebrume_backend/src/controllers/ratingController.js
const db = require("../models");
const Rating = db.Rating;
const CompanionProfile = db.CompanionProfile;
const User = db.User;

// @desc    Create a new rating/review for a companion
// @route   POST /api/ratings/companion/:companionProfileId
// @access  Private (Client role)
const createRating = async (req, res, next) => {
  const { companionProfileId } = req.params;
  const { score, reviewText } = req.body;
  const clientId = req.user.id; // From protect middleware

  if (!score) {
    return res.status(400).json({ message: "Score is required." });
  }
  if (score < 1 || score > 5) {
    return res.status(400).json({ message: "Score must be between 1 and 5." });
  }

  try {
    const companionProfile = await CompanionProfile.findByPk(companionProfileId);
    if (!companionProfile) {
      return res.status(404).json({ message: "Companion profile not found." });
    }

    // Check if the client is trying to rate themselves (if they also have a companion profile)
    if (companionProfile.userId === clientId) {
        return res.status(403).json({ message: "Companions cannot rate their own profiles." });
    }

    // Optional: Check if the client has already rated this companion
    const existingRating = await Rating.findOne({
      where: { clientId, companionProfileId },
    });

    if (existingRating) {
      // Allow update or disallow re-rating - for now, let's disallow re-rating simply
      // To allow updates, you'd change this to an update operation.
      return res.status(400).json({ message: "You have already rated this companion." });
    }

    const rating = await Rating.create({
      clientId,
      companionProfileId: parseInt(companionProfileId),
      score,
      reviewText,
    });

    // TODO: Optionally, recalculate average rating for the companion profile and update it.

    res.status(201).json(rating);
  } catch (error) {
    console.error("Error creating rating:", error);
    if (error.name === "SequelizeValidationError") {
        return res.status(400).json({ message: "Validation Error", errors: error.errors.map(e => e.message) });
    }
    next(error);
  }
};

// @desc    Get all ratings/reviews for a specific companion profile
// @route   GET /api/ratings/companion/:companionProfileId
// @access  Public
const getCompanionRatings = async (req, res, next) => {
  const { companionProfileId } = req.params;
  const { page = 1, limit = 10 } = req.query;
  const offset = (page - 1) * limit;

  try {
    const companionProfile = await CompanionProfile.findByPk(companionProfileId);
    if (!companionProfile) {
        return res.status(404).json({ message: "Companion profile not found." });
    }

    const { count, rows } = await Rating.findAndCountAll({
      where: { companionProfileId: parseInt(companionProfileId) },
      include: [
        {
          model: User,
          as: "client",
          attributes: ["id", "name"], // Only include basic client info
        },
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [["createdAt", "DESC"]],
    });

    res.json({
        totalItems: count,
        totalPages: Math.ceil(count / limit),
        currentPage: parseInt(page),
        ratings: rows,
    });

  } catch (error) {
    console.error("Error fetching companion ratings:", error);
    next(error);
  }
};

// @desc    Delete a rating (Admin or owner of the rating)
// @route   DELETE /api/ratings/:ratingId
// @access  Private (Admin role or Client who owns the rating)
const deleteRating = async (req, res, next) => {
    const { ratingId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.userType;

    try {
        const rating = await Rating.findByPk(ratingId);
        if (!rating) {
            return res.status(404).json({ message: "Rating not found." });
        }

        // Check authorization: Admin can delete any, Client can only delete their own
        if (userRole === "Admin" || rating.clientId === userId) {
            await rating.destroy();
            res.json({ message: "Rating deleted successfully." });
        } else {
            return res.status(403).json({ message: "Not authorized to delete this rating." });
        }
    } catch (error) {
        console.error("Error deleting rating:", error);
        next(error);
    }
};


module.exports = {
  createRating,
  getCompanionRatings,
  deleteRating,
};
