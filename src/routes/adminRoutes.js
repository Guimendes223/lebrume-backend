const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { isAdmin } = require('../middleware/roleMiddleware');
const { getPendingApprovalProfiles, approveRejectProfile } = require('../controllers/companionProfileController');

// API routes for admin operations
router.get('/admin/companions/pending', protect, isAdmin, getPendingApprovalProfiles);
router.put('/admin/companions/:id/approval', protect, isAdmin, approveRejectProfile);

// Rota para estatísticas do dashboard
router.get('/admin/stats', protect, isAdmin, (req, res) => {
  // Implementação temporária de estatísticas
  res.json({
    totalProfiles: 0,
    pendingProfiles: 0,
    approvedProfiles: 0,
    rejectedProfiles: 0
  });
});

// Rota para perfis aprovados
router.get('/admin/companions/approved', protect, isAdmin, (req, res, next) => {
  // Implementação temporária - será substituída por uma consulta real ao banco de dados
  res.json([]);
});

module.exports = router;