// /home/ubuntu/lebrume_backend/src/controllers/companionProfileController.js
const db = require("../models");
const User = db.User;
const CompanionProfile = db.CompanionProfile;
const { Op } = require("sequelize");

// @desc    Get public companion profile by ID
// @route   GET /api/companions/:id
// @access  Public
const getCompanionProfileById = async (req, res, next) => {
  try {
    const profile = await CompanionProfile.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: "user",
          attributes: ["name", "emailVerified"], // Only include non-sensitive user data
        },
        // Add other includes later like Stories, Services, Ratings
      ],
    });

    if (profile) {
      // Check privacy settings before returning
      // For now, assume all profiles fetched this way are public or the logic is handled elsewhere
      res.json(profile);
    } else {
      res.status(404).json({ message: "Companion profile not found" });
    }
  } catch (error) {
    console.error("Error fetching companion profile:", error);
    next(error);
  }
};

// @desc    Get current authenticated companion's own profile
// @route   GET /api/companions/me/profile
// @access  Private (Companion role)
const getMyCompanionProfile = async (req, res, next) => {
  try {
    const profile = await CompanionProfile.findOne({
      where: { userId: req.user.id }, // req.user is set by protect middleware
      include: [
        {
          model: User,
          as: "user",
          attributes: { exclude: ["password"] },
        },
      ],
    });

    if (profile) {
      res.json(profile);
    } else {
      // If the user is a Companion but has no profile yet, they might need to create it.
      res.status(404).json({ message: "Companion profile not found for this user. Please create one." });
    }
  } catch (error) {
    console.error("Error fetching own companion profile:", error);
    next(error);
  }
};

// @desc    Create or Update current authenticated companion's profile
// @route   PUT /api/companions/me/profile
// @access  Private (Companion role)
const upsertMyCompanionProfile = async (req, res, next) => {
  const { 
    displayName, locationCity, locationState, locationCountry, 
    aboutMe, servicesSummary, ratesSummary, contactPhone, contactEmail,
    profilePictureUrl, privacySettings, availabilityStatus 
  } = req.body;

  try {
    let profile = await CompanionProfile.findOne({ where: { userId: req.user.id } });

    if (profile) {
      // Update existing profile
      profile.displayName = displayName || profile.displayName;
      profile.locationCity = locationCity || profile.locationCity;
      profile.locationState = locationState || profile.locationState;
      profile.locationCountry = locationCountry || profile.locationCountry;
      profile.aboutMe = aboutMe || profile.aboutMe;
      profile.servicesSummary = servicesSummary || profile.servicesSummary;
      profile.ratesSummary = ratesSummary || profile.ratesSummary;
      profile.contactPhone = contactPhone || profile.contactPhone;
      profile.contactEmail = contactEmail || profile.contactEmail;
      profile.profilePictureUrl = profilePictureUrl || profile.profilePictureUrl;
      profile.privacySettings = privacySettings || profile.privacySettings;
      profile.availabilityStatus = availabilityStatus || profile.availabilityStatus;
      // Potentially update profileCompleteness based on fields filled

      await profile.save();
      res.json(profile);
    } else {
      // Create new profile for the Companion user
      if (req.user.userType !== "Companion") {
        return res.status(403).json({ message: "Only users with Companion role can create a companion profile." });
      }
      profile = await CompanionProfile.create({
        userId: req.user.id,
        displayName,
        locationCity,
        locationState,
        locationCountry,
        aboutMe,
        servicesSummary,
        ratesSummary,
        contactPhone,
        contactEmail,
        profilePictureUrl,
        privacySettings,
        availabilityStatus,
        profileCompleteness: 0, // Initial completeness
      });
      res.status(201).json(profile);
    }
  } catch (error) {
    console.error("Error upserting companion profile:", error);
    if (error.name === 'SequelizeValidationError') {
        return res.status(400).json({ message: "Validation Error", errors: error.errors.map(e => e.message) });
    }
    next(error);
  }
};

// @desc    Search/Filter companion profiles
// @route   GET /api/search/companions  (or /api/companions/search)
// @access  Public
const searchCompanionProfiles = async (req, res, next) => {
    const { location, service_type, keywords, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = {};
    let userWhereClause = {}; // For filtering by user properties if needed

    if (location) {
        // Simple location search (can be made more complex with city, state, country)
        whereClause[Op.or] = [
            { locationCity: { [Op.iLike]: `%${location}%` } },
            { locationState: { [Op.iLike]: `%${location}%` } },
            { locationCountry: { [Op.iLike]: `%${location}%` } },
        ];
    }
    if (keywords) {
        whereClause[Op.or] = (
            whereClause[Op.or] ? 
            [...whereClause[Op.or], { displayName: { [Op.iLike]: `%${keywords}%` } }, { aboutMe: { [Op.iLike]: `%${keywords}%` } } ] :
            [{ displayName: { [Op.iLike]: `%${keywords}%` } }, { aboutMe: { [Op.iLike]: `%${keywords}%` } } ]
        );
    }
    // Add filtering by service_type later when Service model is fully integrated

    try {
        const { count, rows } = await CompanionProfile.findAndCountAll({
            where: whereClause,
            include: [
                {
                    model: User,
                    as: "user",
                    attributes: ["name", "emailVerified"],
                    where: userWhereClause
                },
                // Include services later for filtering by service_type
            ],
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [["updatedAt", "DESC"]], // Example ordering
            distinct: true, // Important for counts with includes
        });

        res.json({
            totalItems: count,
            totalPages: Math.ceil(count / limit),
            currentPage: parseInt(page),
            companions: rows,
        });

    } catch (error) {
        console.error("Error searching companion profiles:", error);
        next(error);
    }
};


module.exports = {
  getCompanionProfileById,
  getMyCompanionProfile,
  upsertMyCompanionProfile,
  searchCompanionProfiles,
};
