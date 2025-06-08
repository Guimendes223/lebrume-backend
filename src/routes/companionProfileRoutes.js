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

const { protect } = require('../middleware/authMiddleware');
const { isCompanion, isAdmin } = require('../middleware/roleMiddleware');

// Rotas públicas (não precisa de autenticação)
router.get('/search/companions', (req, res, next) => {
  console.log('GET /search/companions called');
  next();
}, searchCompanionProfiles);

router.get('/companions/:id/profile', (req, res, next) => {
  console.log(`GET /companions/${req.params.id}/profile called`);
  next();
}, getCompanionProfileById);

// Rotas protegidas para Companion
router.get('/companions/me/profile', protect, isCompanion, (req, res, next) => {
  console.log('GET /companions/me/profile called by user:', req.user.id);
  next();
}, getMyCompanionProfile);

router.put('/companions/me/profile', protect, isCompanion, (req, res, next) => {
  console.log('PUT /companions/me/profile called by user:', req.user.id);
  next();
}, upsertMyCompanionProfile);

// Rotas protegidas para Admin
router.get('/admin/companions/pending', protect, isAdmin, (req, res, next) => {
  console.log('GET /admin/companions/pending called by admin:', req.user.id);
  next();
}, getPendingApprovalProfiles);

router.put('/admin/companions/:id/approval', protect, isAdmin, (req, res, next) => {
  console.log(`PUT /admin/companions/${req.params.id}/approval called by admin:`, req.user.id);
  next();
}, approveRejectProfile);

module.exports = router;
