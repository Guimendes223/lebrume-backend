const express = require("express");
const router = express.Router();
const {
  submitVerificationStep,
  getVerificationStatus,
  getVerificationRequests,
  updateVerificationStatus
} = require("../controllers/verificationController");
const { protect } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

// @route   POST /api/verification/submit/:step
// @desc    Submit verification documents for a specific step
// @access  Private (Companion role)
router.post("/submit/:step", protect, authorizeRoles("Companion"), submitVerificationStep);

// @route   GET /api/verification/status
// @desc    Get verification status for the authenticated companion
// @access  Private (Companion role)
router.get("/status", protect, authorizeRoles("Companion"), getVerificationStatus);

// @route   GET /api/verification/requests
// @desc    Get all verification requests (for admin)
// @access  Private (Admin role)
router.get("/requests", protect, authorizeRoles("Admin"), getVerificationRequests);

// @route   PUT /api/verification/:requestId/status
// @desc    Update verification request status (for admin)
// @access  Private (Admin role)
router.put("/:requestId/status", protect, authorizeRoles("Admin"), updateVerificationStatus);

module.exports = router;
