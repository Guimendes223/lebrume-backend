const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/combinedMiddleware');
const { getPendingApprovalProfiles, approveRejectProfile } = require('../controllers/companionProfileController');

// API routes for admin operations
router.get('/admin/companions/pending', protect, authorize('Admin'), getPendingApprovalProfiles);
router.put('/admin/companions/:id/approval', protect, authorize('Admin'), approveRejectProfile);

// Rota para estatísticas do dashboard
router.get('/admin/stats', protect, authorize('Admin'), (req, res) => {
  // Implementação temporária de estatísticas
  res.json({
    totalProfiles: 0,
    pendingProfiles: 0,
    approvedProfiles: 0,
    rejectedProfiles: 0
  });
});

// Rota para perfis aprovados
router.get('/admin/companions/approved', protect, authorize('Admin'), (req, res) => {
  // Implementação temporária - será substituída por uma consulta real ao banco de dados
  res.json([]);
});