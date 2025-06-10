const express = require('express');
const router = express.Router();
const { 
  getCompanionProfileById, 
  getMyCompanionProfile, 
  upsertMyCompanionProfile,
  searchCompanionProfiles,
  getPendingApprovalProfiles,
  approveRejectProfile
} = require('../controllers/companionProfileController');

const { protect, authorize } = require('../middleware/combinedMiddleware');

// Rotas públicas (não precisa de autenticação)
router.get('/search/companions', searchCompanionProfiles);
router.get('/companions/:id/profile', getCompanionProfileById);

// Rotas protegidas para Companion
router.get('/companions/me/profile', protect, authorize("Companion"), getMyCompanionProfile);
router.put('/companions/me/profile', protect, authorize("Companion"), upsertMyCompanionProfile);

// Rotas protegidas para Admin
router.get('/admin/companions/pending', protect, authorize("Admin"), getPendingApprovalProfiles);
router.put('/admin/companions/:id/approval', protect, authorize("Admin"), approveRejectProfile);

module.exports = router;
