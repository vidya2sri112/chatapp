const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config({ override: true });

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const messageRoutes = require('./routes/messages');
const authenticateToken = require('./middleware/auth');
const User = require('./models/User');
const Message = require('./models/Message');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/messages', messageRoutes);

app.get('/conversations/:userId/messages', authenticateToken, messageRoutes.getConversationHandler);

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

const connectedUsers = new Map();

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Handle user authentication for socket
  socket.on('authenticate', async (token) => {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId);
      
      if (user) {
        socket.userId = user._id.toString();
        socket.username = user.username;
        connectedUsers.set(user._id.toString(), socket.id);
        
        // Update user online status
        await User.findByIdAndUpdate(user._id, { 
          isOnline: true,
          lastSeen: new Date()
        });

        socket.emit('authenticated', { 
          message: 'Authentication successful',
          user: { id: user._id, username: user.username }
        });

        // Notify other users that this user is online
        socket.broadcast.emit('user:online', {
          userId: user._id,
          username: user.username
        });
      }
    } catch (error) {
      socket.emit('auth_error', { message: 'Authentication failed' });
    }
  });

  // Handle sending messages
  socket.on('message:send', async (data) => {
    try {
      const { receiverId, text } = data;
      
      if (!socket.userId) {
        socket.emit('error', { message: 'User not authenticated' });
        return;
      }

      // For general chat, broadcast to all users
      if (receiverId === 'general') {
        const messageData = {
          id: Date.now(),
          sender: {
            _id: socket.userId,
            username: socket.username
          },
          text: text,
          status: 'sent',
          timestamp: new Date()
        };

        // Broadcast to all connected users
        io.emit('message:new', messageData);
        
        return;
      }

      // Save message to database for 1:1 chat
      const message = new Message({
        sender: socket.userId,
        receiver: receiverId,
        text: text,
        status: 'sent'
      });

      await message.save();
      await message.populate('sender', 'username');
      await message.populate('receiver', 'username');

      // Send to receiver if online
      const receiverSocketId = connectedUsers.get(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('message:new', {
          id: message._id,
          sender: message.sender,
          receiver: message.receiver,
          text: message.text,
          status: 'delivered',
          timestamp: message.timestamp
        });

        // Update message status to delivered
        message.status = 'delivered';
        await message.save();
      }

      // Send confirmation to sender
      socket.emit('message:sent', {
        id: message._id,
        sender: message.sender,
        receiver: message.receiver,
        text: message.text,
        status: message.status,
        timestamp: message.timestamp
      });

    } catch (error) {
      console.error('Error sending message:', error);
      socket.emit('error', { message: 'Failed to send message' });
    }
  });

  // Handle typing indicators
  socket.on('typing:start', (data) => {
    const { receiverId } = data;
    const receiverSocketId = connectedUsers.get(receiverId);
    
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('typing:start', {
        userId: socket.userId,
        username: socket.username
      });
    }
  });

  socket.on('typing:stop', (data) => {
    const { receiverId } = data;
    const receiverSocketId = connectedUsers.get(receiverId);
    
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('typing:stop', {
        userId: socket.userId,
        username: socket.username
      });
    }
  });

  // Handle message read status
  socket.on('message:read', async (data) => {
    try {
      const { messageId, senderId } = data;
      
      // Update message status
      await Message.findByIdAndUpdate(messageId, { status: 'read' });
      
      // Notify sender if online
      const senderSocketId = connectedUsers.get(senderId);
      if (senderSocketId) {
        io.to(senderSocketId).emit('message:read', {
          messageId,
          readBy: socket.userId
        });
      }
    } catch (error) {
      console.error('Error updating message read status:', error);
    }
  });

  // Handle disconnection
  socket.on('disconnect', async () => {
    console.log('User disconnected:', socket.id);
    
    if (socket.userId) {
      connectedUsers.delete(socket.userId);
      
      // Update user offline status
      await User.findByIdAndUpdate(socket.userId, {
        isOnline: false,
        lastSeen: new Date()
      });

      // Notify other users that this user is offline
      socket.broadcast.emit('user:offline', {
        userId: socket.userId,
        username: socket.username
      });
    }
  });
});

// Database connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(async () => {
  console.log('Connected to MongoDB');
  if (process.env.RESET_DB_ON_START === 'true') {
    await mongoose.connection.db.dropDatabase();
    console.log('Database cleared for fresh start');
  }
})
.catch((error) => {
  console.error('MongoDB connection error:', error);
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
