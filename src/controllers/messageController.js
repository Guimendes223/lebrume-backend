// /home/ubuntu/lebrume_backend/src/controllers/messageController.js
const db = require("../models");
const Message = db.Message;
const User = db.User;
const { Op } = require("sequelize");

// @desc    Send a new message
// @route   POST /api/messages
// @access  Private
const sendMessage = async (req, res, next) => {
  const { receiverId, content } = req.body;
  const senderId = req.user.id; // From protect middleware

  if (!receiverId || !content) {
    return res.status(400).json({ message: "Receiver ID and content are required." });
  }

  if (senderId === parseInt(receiverId)) {
    return res.status(400).json({ message: "Cannot send a message to yourself." });
  }

  try {
    // Check if receiver exists
    const receiverExists = await User.findByPk(receiverId);
    if (!receiverExists) {
      return res.status(404).json({ message: "Receiver not found." });
    }

    const message = await Message.create({
      senderId,
      receiverId,
      content,
    });

    // TODO: Implement real-time notification (e.g., WebSockets) to the receiver

    res.status(201).json(message);
  } catch (error) {
    console.error("Error sending message:", error);
    next(error);
  }
};

// @desc    Get all conversations for the authenticated user (grouped by other user)
// @route   GET /api/messages/conversations
// @access  Private
const getMyConversations = async (req, res, next) => {
  const userId = req.user.id;
  try {
    // Find all messages where the user is either a sender or a receiver
    const messages = await Message.findAll({
      where: {
        [Op.or]: [{ senderId: userId }, { receiverId: userId }],
      },
      include: [
        { model: User, as: "sender", attributes: ["id", "name", "userType"] }, // Include basic sender info
        { model: User, as: "receiver", attributes: ["id", "name", "userType"] }, // Include basic receiver info
      ],
      order: [["createdAt", "DESC"]],
    });

    // Group messages by conversation partner
    const conversations = {};
    messages.forEach(msg => {
      const partner = msg.senderId === userId ? msg.receiver : msg.sender;
      if (!partner) return; // Should not happen with proper includes
      const partnerId = partner.id;

      if (!conversations[partnerId]) {
        conversations[partnerId] = {
          partner: {
            id: partner.id,
            name: partner.name,
            userType: partner.userType,
            // profilePictureUrl: partner.CompanionProfile ? partner.CompanionProfile.profilePictureUrl : null // TODO: Add this if User model is associated with CompanionProfile directly or fetch separately
          },
          lastMessage: msg,
          unreadCount: 0, // Calculate unread count separately if needed
          messages: []
        };
      }
      conversations[partnerId].messages.unshift(msg); // Add to beginning for chronological order (newest first in array)
      if (msg.receiverId === userId && !msg.readStatus) {
        conversations[partnerId].unreadCount++;
      }
    });
    
    // Convert to array for response
    const conversationList = Object.values(conversations).sort((a,b) => b.lastMessage.createdAt - a.lastMessage.createdAt);

    res.json(conversationList);
  } catch (error) {
    console.error("Error fetching conversations:", error);
    next(error);
  }
};

// @desc    Get messages for a specific conversation with another user
// @route   GET /api/messages/conversation/:partnerId
// @access  Private
const getMessagesWithPartner = async (req, res, next) => {
  const userId = req.user.id;
  const partnerId = parseInt(req.params.partnerId);

  if (isNaN(partnerId)) {
    return res.status(400).json({ message: "Invalid partner ID." });
  }

  try {
    const messages = await Message.findAll({
      where: {
        [Op.or]: [
          { senderId: userId, receiverId: partnerId },
          { senderId: partnerId, receiverId: userId },
        ],
      },
      include: [
        { model: User, as: "sender", attributes: ["id", "name"] },
        { model: User, as: "receiver", attributes: ["id", "name"] },
      ],
      order: [["createdAt", "ASC"]], // Oldest first for chat history display
    });

    // Mark messages as read (ones sent by partner to current user)
    await Message.update(
      { readStatus: true },
      {
        where: {
          senderId: partnerId,
          receiverId: userId,
          readStatus: false,
        },
      }
    );

    res.json(messages);
  } catch (error) {
    console.error("Error fetching messages with partner:", error);
    next(error);
  }
};

// @desc    Mark a conversation as read
// @route   PUT /api/messages/conversation/:partnerId/read
// @access  Private
const markConversationAsRead = async (req, res, next) => {
    const userId = req.user.id;
    const partnerId = parseInt(req.params.partnerId);

    if (isNaN(partnerId)) {
        return res.status(400).json({ message: "Invalid partner ID." });
    }

    try {
        await Message.update(
            { readStatus: true },
            {
                where: {
                    senderId: partnerId,
                    receiverId: userId,
                    readStatus: false,
                },
            }
        );
        res.json({ message: "Conversation marked as read." });
    } catch (error) {
        console.error("Error marking conversation as read:", error);
        next(error);
    }
};


module.exports = {
  sendMessage,
  getMyConversations,
  getMessagesWithPartner,
  markConversationAsRead,
};
