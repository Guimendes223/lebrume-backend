const { CompanionProfile, User, Service, Media } = require('../models');
const { Op } = require('sequelize');

// @desc    Get companion profile by ID
// @route   GET /api/companions/:id/profile
// @access  Public
const getCompanionProfileById = async (req, res, next) => {
  try {
    const profile = await CompanionProfile.findOne({
      where: { 
        id: req.params.id,
        isVisible: true // Only return visible profiles
      },
      include: [
        {
          model: User,
          as: "user",
          attributes: ["name", "emailVerified"]
        },
        // Include other associations as needed
      ]
    });

    if (!profile) {
      return res.status(404).json({ message: "Companion profile not found" });
    }

    res.json(profile);
  } catch (error) {
    console.error("Error fetching companion profile:", error);
    next(error);
  }
};

// @desc    Get current authenticated companion's profile
// @route   GET /api/companions/me/profile
// @access  Private (Companion role)
const getMyCompanionProfile = async (req, res, next) => {
  try {
    const profile = await CompanionProfile.findOne({
      where: { userId: req.user.id },
      include: [
        {
          model: User,
          as: "user",
          attributes: ["name", "emailVerified"]
        },
        // Include other associations as needed
      ]
    });

    if (profile) {
      res.json(profile);
    } else {
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
      
      // Profile completeness is calculated in the model hooks
      await profile.save();
      
      // Return updated profile with completeness information
      res.json({
        ...profile.toJSON(),
        message: profile.isApproved 
          ? "Profile updated successfully." 
          : "Profile updated successfully. It will be visible in search after admin approval."
      });
    } else {
      // Create new profile for the Companion user
      if (req.user.userType !== "Companion") {
        return res.status(403).json({ message: "Only users with Companion role can create a companion profile." });
      }
      
      profile = await CompanionProfile.create({
        userId: req.user.id,
        name: req.user.name, // Use the user's name initially
        displayName: displayName || req.user.name,
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
        // isApproved and isVisible default to false
      });
      
      res.status(201).json({
        ...profile.toJSON(),
        message: "Profile created successfully. It will be visible in search after admin approval and completion."
      });
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
// @route   GET /api/search/companions
// @access  Public
const searchCompanionProfiles = async (req, res, next) => {
    const { location, service_type, keywords, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    
    // Base where clause - only show approved and visible profiles
    let whereClause = {
        isApproved: true,
        isVisible: true
    };
    
    let userWhereClause = {}; // For filtering by user properties if needed
    
    if (location) {
        // Location search
        whereClause[Op.or] = [
            { locationCity: { [Op.iLike]: `%${location}%` } },
            { locationState: { [Op.iLike]: `%${location}%` } },
            { locationCountry: { [Op.iLike]: `%${location}%` } },
        ];
    }
    
    if (keywords) {
        // Keyword search in name and description
        const keywordConditions = [
            { displayName: { [Op.iLike]: `%${keywords}%` } },
            { aboutMe: { [Op.iLike]: `%${keywords}%` } }
        ];
        
        whereClause[Op.or] = whereClause[Op.or] 
            ? [...whereClause[Op.or], ...keywordConditions]
            : keywordConditions;
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

// @desc    Admin: Get all companion profiles pending approval
// @route   GET /api/admin/companions/pending
// @access  Private (Admin role)
const getPendingApprovalProfiles = async (req, res, next) => {
    try {
        // Ensure user is admin
        if (req.user.userType !== "Admin") {
            return res.status(403).json({ message: "Access denied. Admin privileges required." });
        }
        
        const profiles = await CompanionProfile.findAll({
            where: { 
                isApproved: false,
                profileCompleteness: { [Op.gte]: 70 } // Only show profiles that are complete enough for review
            },
            include: [
                {
                    model: User,
                    as: "user",
                    attributes: ["name", "email", "emailVerified"]
                }
            ],
            order: [["createdAt", "ASC"]] // Oldest first
        });
        
        res.json(profiles);
    } catch (error) {
        console.error("Error fetching pending approval profiles:", error);
        next(error);
    }
};

// @desc    Admin: Approve or reject a companion profile
// @route   PUT /api/admin/companions/:id/approval
// @access  Private (Admin role)
const approveRejectProfile = async (req, res, next) => {
    const { approved, rejectionReason } = req.body;
    
    try {
        // Ensure user is admin
        if (req.user.userType !== "Admin") {
            return res.status(403).json({ message: "Access denied. Admin privileges required." });
        }
        
        const profile = await CompanionProfile.findByPk(req.params.id);
        
        if (!profile) {
            return res.status(404).json({ message: "Companion profile not found" });
        }
        
        if (approved) {
            profile.isApproved = true;
            profile.approvedAt = new Date();
            profile.approvedBy = req.user.id;
            profile.rejectionReason = null;
            
            // isVisible will be set in the beforeSave hook based on approval and completeness
        } else {
            profile.isApproved = false;
            profile.approvedAt = null;
            profile.approvedBy = null;
            profile.rejectionReason = rejectionReason || "Profile rejected by admin.";
            profile.isVisible = false;
        }
        
        await profile.save();
        
        res.json({
            message: approved ? "Profile approved successfully." : "Profile rejected.",
            profile
        });
    } catch (error) {
        console.error("Error approving/rejecting profile:", error);
        next(error);
    }
};

module.exports = {
  getCompanionProfileById,
  getMyCompanionProfile,
  upsertMyCompanionProfile,
  searchCompanionProfiles,
  getPendingApprovalProfiles,
  approveRejectProfile
};
