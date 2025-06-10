const express = require("express");
const router = express.Router();
const {
  submitVerificationStep,
  getVerificationStatus
} = require("../controllers/verificationController");
const { protect, authorize } = require('../middleware/combinedMiddleware');

// @route   POST /api/verification/submit/:step
// @desc    Submit verification documents for a specific step
// @access  Private (Companion role)
router.post("/submit/:step", protect, authorize("Companion"), submitVerificationStep);

// @route   GET /api/verification/status
// @desc    Get verification status for the authenticated companion
// @access  Private (Companion role)
router.get("/status", protect, authorize("Companion"), getVerificationStatus);

// @route   GET /api/verification/requests
// @desc    Get all verification requests (for admin)
// @access  Private (Admin role)
router.get("/requests", protect, authorize("Admin"), (req, res) => {
  // Implementação temporária
  res.json({ message: "Esta funcionalidade será implementada em breve", data: [] });
});

// @route   PUT /api/verification/:requestId/status
// @desc    Update verification request status (for admin)
// @access  Private (Admin role)
router.put("/:requestId/status", protect, authorize("Admin"), (req, res) => {
  // Implementação temporária
  res.json({ message: "Esta funcionalidade será implementada em breve", success: true });
});

module.exports = router;
