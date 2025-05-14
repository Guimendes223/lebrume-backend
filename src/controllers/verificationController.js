// /home/ubuntu/lebrume_backend/src/controllers/verificationController.js
const db = require("../models");
const VerificationRequest = db.VerificationRequest;
const CompanionProfile = db.CompanionProfile;
const User = db.User;
// Assume a file upload middleware like multer will handle file uploads and provide URLs
// For now, we will assume req.body contains the URLs of uploaded files.

// @desc    Submit or update a verification document/step for the authenticated companion
// @route   POST /api/verification/submit/:step (e.g., /submit/id, /submit/selfie, /submit/video)
// @access  Private (Companion role)
const submitVerificationStep = async (req, res, next) => {
  const { step } = req.params;
  const { documentUrl } = req.body; // URL of the uploaded document from file upload middleware
  const userId = req.user.id;

  if (!documentUrl) {
    return res.status(400).json({ message: "Document URL is required." });
  }

  try {
    const companionProfile = await CompanionProfile.findOne({ where: { userId } });
    if (!companionProfile) {
      return res.status(404).json({ message: "Companion profile not found for this user." });
    }

    let verificationRequest = await VerificationRequest.findOne({ where: { companionProfileId: companionProfile.id } });

    if (!verificationRequest) {
      verificationRequest = await VerificationRequest.create({
        companionProfileId: companionProfile.id,
        overallStatus: "InProgress",
      });
    }

    let updated = false;
    switch (step) {
      case "id":
        verificationRequest.idDocumentUrl = documentUrl;
        verificationRequest.idDocumentStatus = "Pending";
        updated = true;
        break;
      case "selfie":
        verificationRequest.selfieUrl = documentUrl;
        verificationRequest.selfieStatus = "Pending";
        updated = true;
        break;
      case "video":
        verificationRequest.videoVerificationUrl = documentUrl;
        verificationRequest.videoVerificationStatus = "Pending";
        updated = true;
        break;
      default:
        return res.status(400).json({ message: "Invalid verification step." });
    }

    if (updated) {
      if (verificationRequest.overallStatus === "NotStarted" || verificationRequest.overallStatus === "Rejected") {
        verificationRequest.overallStatus = "InProgress";
      }
      // If all docs are pending, change to PendingReview
      if (verificationRequest.idDocumentStatus === "Pending" && 
          verificationRequest.selfieStatus === "Pending" && 
          verificationRequest.videoVerificationStatus === "Pending") {
          verificationRequest.overallStatus = "PendingReview";    
      }
      await verificationRequest.save();
      res.json({ message: `Verification step '${step}' submitted successfully.`, verificationRequest });
    } else {
      // Should not happen if step is valid
      res.status(400).json({ message: "Failed to update verification step." });
    }

  } catch (error) {
    console.error(`Error submitting verification step '${step}':`, error);
    if (error.name === "SequelizeValidationError") {
        return res.status(400).json({ message: "Validation Error", errors: error.errors.map(e => e.message) });
    }
    next(error);
  }
};

// @desc    Get verification status for the authenticated companion
// @route   GET /api/verification/status
// @access  Private (Companion role)
const getMyVerificationStatus = async (req, res, next) => {
  const userId = req.user.id;
  try {
    const companionProfile = await CompanionProfile.findOne({ where: { userId } });
    if (!companionProfile) {
      return res.status(404).json({ message: "Companion profile not found for this user." });
    }

    const verificationRequest = await VerificationRequest.findOne({
      where: { companionProfileId: companionProfile.id },
    });

    if (!verificationRequest) {
      return res.status(200).json({ 
        message: "No verification request found. Please start the verification process.",
        status: {
            overallStatus: "NotStarted",
            idDocumentStatus: "NotSubmitted",
            selfieStatus: "NotSubmitted",
            videoVerificationStatus: "NotSubmitted",
        }
    });
    }

    res.json(verificationRequest);
  } catch (error) {
    console.error("Error fetching verification status:", error);
    next(error);
  }
};

// --- Admin Routes ---

// @desc    Get all pending verification requests (Admin)
// @route   GET /api/verification/admin/pending
// @access  Private (Admin role)
const getPendingVerifications = async (req, res, next) => {
  try {
    const pendingRequests = await VerificationRequest.findAll({
      where: { overallStatus: "PendingReview" }, // Or include InProgress if admins review step-by-step
      include: [
        {
          model: CompanionProfile,
          as: "companionProfile",
          include: [{ model: User, as: "user", attributes: ["id", "name", "email"] }],
        },
      ],
      order: [["updatedAt", "ASC"]], // Oldest pending first
    });
    res.json(pendingRequests);
  } catch (error) {
    console.error("Error fetching pending verifications:", error);
    next(error);
  }
};

// @desc    Approve or reject a verification request or step (Admin)
// @route   POST /api/verification/admin/:requestId/action
// @access  Private (Admin role)
const processVerificationRequest = async (req, res, next) => {
  const { requestId } = req.params;
  const { action, comments, stepToUpdate, stepStatus } = req.body; // action: "approve_all", "reject_all", "update_step"
                                                                // comments for rejection
                                                                // stepToUpdate: "id", "selfie", "video" (if action is "update_step")
                                                                // stepStatus: "Approved", "Rejected" (if action is "update_step")

  try {
    const verificationRequest = await VerificationRequest.findByPk(requestId);
    if (!verificationRequest) {
      return res.status(404).json({ message: "Verification request not found." });
    }

    if (action === "approve_all") {
      verificationRequest.idDocumentStatus = "Approved";
      verificationRequest.selfieStatus = "Approved";
      verificationRequest.videoVerificationStatus = "Approved";
      verificationRequest.overallStatus = "Verified";
      verificationRequest.adminComments = comments || "All steps approved.";
      // Potentially update CompanionProfile trust level here
    } else if (action === "reject_all") {
      verificationRequest.overallStatus = "Rejected";
      verificationRequest.adminComments = comments || "Verification rejected.";
      // Optionally reset individual step statuses to Pending or Rejected
    } else if (action === "update_step" && stepToUpdate && stepStatus) {
        if (!["id", "selfie", "video"].includes(stepToUpdate)) {
            return res.status(400).json({ message: "Invalid step to update." });
        }
        if (!["Approved", "Rejected", "Pending"].includes(stepStatus)) {
            return res.status(400).json({ message: "Invalid step status." });
        }
        verificationRequest[`${stepToUpdate}Status`] = stepStatus;
        verificationRequest.adminComments = comments || verificationRequest.adminComments;
        // Recalculate overallStatus
        if (verificationRequest.idDocumentStatus === "Approved" && 
            verificationRequest.selfieStatus === "Approved" && 
            verificationRequest.videoVerificationStatus === "Approved") {
            verificationRequest.overallStatus = "Verified";
        } else if (verificationRequest.idDocumentStatus === "Rejected" || 
                   verificationRequest.selfieStatus === "Rejected" || 
                   verificationRequest.videoVerificationStatus === "Rejected") {
            verificationRequest.overallStatus = "Rejected"; // Or InProgress if some are still pending
        } else {
            verificationRequest.overallStatus = "PendingReview"; // Or InProgress
        }
    } else {
      return res.status(400).json({ message: "Invalid action or missing parameters for step update." });
    }

    await verificationRequest.save();
    // TODO: Notify user about the status change (e.g., via email or in-app notification)
    res.json({ message: `Verification request ${requestId} processed.`, verificationRequest });
  } catch (error) {
    console.error("Error processing verification request:", error);
    next(error);
  }
};

module.exports = {
  submitVerificationStep,
  getMyVerificationStatus,
  getPendingVerifications,
  processVerificationRequest,
};
