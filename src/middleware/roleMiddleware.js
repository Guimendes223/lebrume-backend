const authorizeRoles = (...allowedRoles) => (req, res, next) => {
  if (req.user && allowedRoles.includes(req.user.userType)) {
    return next();
  }
  res.status(403).json({ message: 'Access denied. Insufficient privileges.' });
};

module.exports = {
  isCompanion: authorizeRoles('Companion'),
  isAdmin: authorizeRoles('Admin'),
  isClient: authorizeRoles('Client'),
  authorizeRoles // exporta para usar diretamente se quiser
};