/**
 * Combined middleware for authentication and authorization
 * This file provides a unified interface for all authentication and authorization middleware
 */

const { protect } = require('./authMiddleware');
const { authorizeRoles, isAdmin, isCompanion, isClient } = require('./roleMiddleware');

// Create an alias for authorizeRoles to maintain compatibility with existing code
const authorize = authorizeRoles;

module.exports = {
  protect,
  authorize,
  authorizeRoles,
  isAdmin,
  isCompanion,
  isClient
};
