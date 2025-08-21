const express = require('express');
const User = require('../models/User');
const Message = require('../models/Message');
const authenticateToken = require('../middleware/auth');
const router = express.Router();

router.get('/', authenticateToken, async (req, res) => {
  try {
    const currentUserId = req.user._id;
    
    const users = await User.find({ _id: { $ne: currentUserId } })
      .select('username isOnline lastSeen')
      .sort({ username: 1 });

    const usersWithLastMessage = await Promise.all(
      users.map(async (user) => {
        const lastMessage = await Message.findOne({
          $or: [
            { sender: currentUserId, receiver: user._id },
            { sender: user._id, receiver: currentUserId }
          ]
        })
        .sort({ timestamp: -1 })
        .populate('sender', 'username');

        return {
          id: user._id,
          username: user.username,
          isOnline: user.isOnline,
          lastSeen: user.lastSeen,
          lastMessage: lastMessage ? {
            text: lastMessage.text,
            timestamp: lastMessage.timestamp,
            senderName: lastMessage.sender.username
          } : null
        };
      })
    );

    res.json(usersWithLastMessage);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Server error while fetching users' });
  }
});

module.exports = router;

