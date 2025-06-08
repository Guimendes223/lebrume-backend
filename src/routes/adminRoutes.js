const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { isAdmin } = require('../middleware/roleMiddleware');

// Admin dashboard route for profile approval
router.get('/dashboard', protect, isAdmin, (req, res) => {
  res.render('admin/dashboard', { user: req.user });
});

// Admin profile approval routes
router.get('/profiles/pending', protect, isAdmin, (req, res) => {
  res.render('admin/pending-profiles', { user: req.user });
});

module.exports = router;
