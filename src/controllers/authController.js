// /home/ubuntu/lebrume_backend/src/controllers/authController.js
const jwt = require("jsonwebtoken");
const db = require("../models");
const User = db.User;

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || "YOUR_FALLBACK_JWT_SECRET", {
    expiresIn: "30d", // Token expires in 30 days
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res, next) => {
  const { name, email, password, phone, userType } = req.body;

  if (!name || !email || !password || !userType) {
    return res.status(400).json({ message: "Please provide name, email, password, and userType" });
  }

  // Check if user already exists
  const userExists = await User.findOne({ where: { email } });
  if (userExists) {
    return res.status(400).json({ message: "User already exists with this email" });
  }

  try {
    const user = await User.create({
      name,
      email,
      password, // Password will be hashed by the model hook
      phone,
      userType,
      emailVerified: false, // Default to false, implement email verification flow later
    });

    if (user) {
      res.status(201).json({
        _id: user.id,
        name: user.name,
        email: user.email,
        userType: user.userType,
        token: generateToken(user.id),
      });
    } else {
      res.status(400).json({ message: "Invalid user data" });
    }
  } catch (error) {
    console.error("Registration error:", error);
    // Pass error to the global error handler in app.js
    next(error);
  }
};

// @desc    Authenticate user & get token (Login)
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Please provide email and password" });
  }

  try {
    const user = await User.findOne({ where: { email } });

    if (user && (await user.validPassword(password))) {
      res.json({
        _id: user.id,
        name: user.name,
        email: user.email,
        userType: user.userType,
        token: generateToken(user.id),
      });
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    console.error("Login error:", error);
    next(error);
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me  (or /api/users/me)
// @access  Private (requires token)
const getMe = async (req, res) => {
  // req.user is set by the protect middleware
  if (req.user) {
    res.json({
      _id: req.user.id,
      name: req.user.name,
      email: req.user.email,
      phone: req.user.phone,
      userType: req.user.userType,
      emailVerified: req.user.emailVerified,
      createdAt: req.user.createdAt,
    });
  } else {
    // This case should ideally be caught by the protect middleware itself
    res.status(404).json({ message: "User not found or not authenticated" }); 
  }
};

module.exports = {
  registerUser,
  loginUser,
  getMe,
};
