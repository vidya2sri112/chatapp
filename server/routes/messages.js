const express = require('express');
const Message = require('../models/Message');
const authenticateToken = require('../middleware/auth');
const router = express.Router();

async function getConversationHandler(req, res) {
  try {
    const currentUserId = req.user._id;
    const otherUserId = req.params.userId;

    const messages = await Message.find({
      $or: [
        { sender: currentUserId, receiver: otherUserId },
        { sender: otherUserId, receiver: currentUserId }
      ]
    })
      .populate('sender', 'username')
      .populate('receiver', 'username')
      .sort({ timestamp: 1 });

    await Message.updateMany(
      {
        sender: otherUserId,
        receiver: currentUserId,
        status: 'sent'
      },
      { status: 'delivered' }
    );

    res.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Server error while fetching messages' });
  }
}

router.get('/conversations/:userId', authenticateToken, getConversationHandler);

router.get('/conversations/:userId/messages', authenticateToken, getConversationHandler);

router.getConversationHandler = getConversationHandler;

router.put('/conversations/:userId/read', authenticateToken, async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const otherUserId = req.params.userId;

    await Message.updateMany(
      { 
        sender: otherUserId, 
        receiver: currentUserId, 
        status: { $in: ['sent', 'delivered'] }
      },
      { status: 'read' }
    );

    res.json({ message: 'Messages marked as read' });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    res.status(500).json({ error: 'Server error while marking messages as read' });
  }
});

module.exports = router;
