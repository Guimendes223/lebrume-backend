// /home/ubuntu/lebrume_backend/src/middlewares/authMiddleware.js
const jwt = require("jsonwebtoken");
const db = require("../models");
const User = db.User;

const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || "YOUR_FALLBACK_JWT_SECRET"); // Use environment variable for secret
      req.user = await User.findByPk(decoded.id, {
        attributes: { exclude: ["password"] }, // Don't send back the password
      });
      if (!req.user) {
        return res.status(401).json({ message: "Not authorized, user not found" });
      }
      next();
    } catch (error) {
      console.error("Token verification error:", error);
      return res.status(401).json({ message: "Not authorized, token failed" });
    }
  }

  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.userType)) {
      return res.status(403).json({ message: `User role ${req.user ? req.user.userType : 'unknown'} is not authorized to access this route` });
    }
    next();
  };
};

module.exports = { protect, authorize };
