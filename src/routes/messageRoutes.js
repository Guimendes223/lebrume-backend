const express = require("express");
const router = express.Router();
const {
  sendMessage,
  getMyConversations,
  getMessagesWithPartner,
  markConversationAsRead,
} = require("../controllers/messageController");
const { protect, authorize } = require('../middleware/combinedMiddleware');

// All message routes are protected
router.use(protect);

// @route   POST /api/messages
// @desc    Send a new message
// @access  Private
router.post("/", sendMessage);

// @route   GET /api/messages/conversations
// @desc    Get all conversations for the authenticated user
// @access  Private
router.get("/conversations", getMyConversations);

// @route   GET /api/messages/conversation/:partnerId
// @desc    Get messages for a specific conversation with another user
// @access  Private
router.get("/conversation/:partnerId", getMessagesWithPartner);

// @route   PUT /api/messages/conversation/:partnerId/read
// @desc    Mark a conversation as read
// @access  Private
router.put("/conversation/:partnerId/read", markConversationAsRead);

module.exports = router;
