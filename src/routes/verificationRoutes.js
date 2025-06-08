// /home/ubuntu/lebrume_backend/src/routes/verificationRoutes.js
const express = require("express");
const router = express.Router();
const {
  submitVerificationStep,
  getMyVerificationStatus,
  getPendingVerifications,
  processVerificationRequest,
} = require("../controllers/verificationController");
const { protect, authorize } = require("../middleware/authMiddleware");

// Companion Routes
// @route   POST /api/verification/submit/:step
// @desc    Submit or update a verification document/step for the authenticated companion
// @access  Private (Companion role)
router.post("/submit/:step", protect, authorize("Companion"), submitVerificationStep);

// @route   GET /api/verification/status
// @desc    Get verification status for the authenticated companion
// @access  Private (Companion role)
router.get("/status", protect, authorize("Companion"), getMyVerificationStatus);

// Admin Routes
// @route   GET /api/verification/admin/pending
// @desc    Get all pending verification requests (Admin)
// @access  Private (Admin role)
router.get("/admin/pending", protect, authorize("Admin"), getPendingVerifications);

// @route   POST /api/verification/admin/:requestId/action
// @desc    Approve or reject a verification request or step (Admin)
// @access  Private (Admin role)
router.post("/admin/:requestId/action", protect, authorize("Admin"), processVerificationRequest);

module.exports = router;
