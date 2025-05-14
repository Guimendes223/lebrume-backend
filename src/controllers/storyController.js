// /home/ubuntu/lebrume_backend/src/controllers/storyController.js
const db = require("../models");
const Story = db.Story;
const CompanionProfile = db.CompanionProfile;
const { Op } = require("sequelize");

// @desc    Create a new story for the authenticated companion
// @route   POST /api/stories (or /api/companions/me/stories)
// @access  Private (Companion role)
const createStory = async (req, res, next) => {
  const { mediaUrl, mediaType, caption, expiresAt } = req.body;
  const userId = req.user.id; // From protect middleware

  if (!mediaUrl || !mediaType || !expiresAt) {
    return res.status(400).json({ message: "Please provide mediaUrl, mediaType, and expiresAt for the story." });
  }

  try {
    const companionProfile = await CompanionProfile.findOne({ where: { userId } });
    if (!companionProfile) {
      return res.status(404).json({ message: "Companion profile not found for this user. Cannot create story." });
    }

    const newStory = await Story.create({
      companionProfileId: companionProfile.id,
      mediaUrl,
      mediaType,
      caption,
      expiresAt: new Date(expiresAt), // Ensure it's a Date object
    });

    res.status(201).json(newStory);
  } catch (error) {
    console.error("Error creating story:", error);
    if (error.name === "SequelizeValidationError") {
        return res.status(400).json({ message: "Validation Error", errors: error.errors.map(e => e.message) });
    }
    next(error);
  }
};

// @desc    Get active stories for a specific companion profile
// @route   GET /api/stories/companion/:companionProfileId (or /api/companions/:companionProfileId/stories)
// @access  Public
const getCompanionStories = async (req, res, next) => {
  const { companionProfileId } = req.params;

  try {
    const profile = await CompanionProfile.findByPk(companionProfileId);
    if (!profile) {
        return res.status(404).json({ message: "Companion profile not found." });
    }

    const stories = await Story.findAll({
      where: {
        companionProfileId,
        expiresAt: { [Op.gt]: new Date() }, // Only fetch stories that have not expired
      },
      order: [["createdAt", "DESC"]],
    });

    res.json(stories);
  } catch (error) {
    console.error("Error fetching companion stories:", error);
    next(error);
  }
};

// @desc    Delete a story owned by the authenticated companion
// @route   DELETE /api/stories/:storyId (or /api/companions/me/stories/:storyId)
// @access  Private (Companion role, owner)
const deleteStory = async (req, res, next) => {
  const { storyId } = req.params;
  const userId = req.user.id;

  try {
    const companionProfile = await CompanionProfile.findOne({ where: { userId } });
    if (!companionProfile) {
      return res.status(403).json({ message: "User does not have a companion profile." });
    }

    const story = await Story.findByPk(storyId);

    if (!story) {
      return res.status(404).json({ message: "Story not found." });
    }

    // Check if the authenticated companion owns this story
    if (story.companionProfileId !== companionProfile.id) {
      return res.status(403).json({ message: "Not authorized to delete this story." });
    }

    await story.destroy();
    res.json({ message: "Story deleted successfully." });
  } catch (error) {
    console.error("Error deleting story:", error);
    next(error);
  }
};

module.exports = {
  createStory,
  getCompanionStories,
  deleteStory,
};
