const { User, CompanionProfile } = require('../models');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res, next) => {
  const { name, email, password, userType, phoneNumber } = req.body;

  try {
    // Check if user already exists
    const userExists = await User.findOne({ where: { email } });
    if (userExists) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password, // Will be hashed in the model hook
      userType, // Client, Companion, or Admin
      phone: phoneNumber
    });

    // If user is a Companion, create an empty profile
    if (userType === 'Companion') {
      await CompanionProfile.create({
        userId: user.id,
        name: user.name,
        displayName: user.name,
        // All other fields will be null/default values
        // isApproved and isVisible default to false
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, userType: user.userType },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    // Return user data and token
    res.status(201).json({
      id: user.id,
      name: user.name,
      email: user.email,
      userType: user.userType,
      token,
      message: userType === 'Companion' 
        ? 'Registration successful. Please complete your profile to appear in search results.' 
        : 'Registration successful.'
    });
  } catch (error) {
    console.error('Error in user registration:', error);
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({ 
        message: 'Validation Error', 
        errors: error.errors.map(e => e.message) 
      });
    }
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    // Find user by email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check password
    const isMatch = await user.validPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, userType: user.userType },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    // If user is a Companion, check profile status
    let profileMessage = '';
    if (user.userType === 'Companion') {
      const profile = await CompanionProfile.findOne({ where: { userId: user.id } });
      if (profile) {
        if (!profile.isApproved) {
          profileMessage = 'Your profile is pending admin approval.';
        } else if (profile.profileCompleteness < 70) {
          profileMessage = 'Please complete your profile to appear in search results.';
        }
      } else {
        profileMessage = 'Please create your companion profile.';
      }
    }

    // Return user data and token
    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      userType: user.userType,
      token,
      profileMessage
    });
  } catch (error) {
    console.error('Error in user login:', error);
    next(error);
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getCurrentUser = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error fetching current user:', error);
    next(error);
  }
};

module.exports = {
  registerUser,
  loginUser,
  getCurrentUser
};
