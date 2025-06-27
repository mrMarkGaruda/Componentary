const express = require('express');
const Chat = require('../models/Chat');
const auth = require('../middleware/auth');
const router = express.Router();

// Simple rate limiting map to prevent API abuse
const apiCallTracker = new Map();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const MAX_CALLS_PER_WINDOW = 30; // Max 30 API calls per minute per user

// Rate limiting middleware
const rateLimiter = (req, res, next) => {
  const userId = req.user.id;
  const now = Date.now();
  
  if (!apiCallTracker.has(userId)) {
    apiCallTracker.set(userId, { count: 1, windowStart: now });
    return next();
  }
  
  const userTracker = apiCallTracker.get(userId);
  
  // Reset window if expired
  if (now - userTracker.windowStart > RATE_LIMIT_WINDOW) {
    userTracker.count = 1;
    userTracker.windowStart = now;
    return next();
  }
  
  // Check if limit exceeded
  if (userTracker.count >= MAX_CALLS_PER_WINDOW) {
    return res.status(429).json({ 
      message: 'Too many requests. Please wait before trying again.' 
    });
  }
  
  userTracker.count++;
  next();
};

// Get chat history between user and seller
router.get('/:sellerId', auth, rateLimiter, async (req, res) => {
  try {
    const { sellerId } = req.params;
    const userId = req.user.id;
    
    const chat = await Chat.findOne({
      participants: { $all: [userId, sellerId] }
    }).populate('messages.sender', 'name email');
    
    if (!chat) {
      return res.json({ messages: [] });
    }
    
    // Mark messages as read
    chat.messages.forEach(message => {
      if (message.sender._id.toString() !== userId && !message.read) {
        message.read = true;
      }
    });
    
    await chat.save();
    
    res.json(chat);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Send a message
router.post('/send', auth, rateLimiter, async (req, res) => {
  try {
    const { recipientId, content } = req.body;
    const senderId = req.user.id;
    
    let chat = await Chat.findOne({
      participants: { $all: [senderId, recipientId] }
    });
    
    if (!chat) {
      chat = new Chat({
        participants: [senderId, recipientId],
        messages: []
      });
    }
    
    const newMessage = {
      sender: senderId,
      content,
      timestamp: new Date(),
      read: false
    };
    
    chat.messages.push(newMessage);
    chat.lastMessage = new Date();
    
    await chat.save();
    
    // Populate sender info for response
    await chat.populate('messages.sender', 'name email');
    
    const savedMessage = chat.messages[chat.messages.length - 1];
    
    res.json(savedMessage);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all chats for a user
router.get('/', auth, rateLimiter, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const chats = await Chat.find({
      participants: userId
    })
    .populate('participants', 'name email role')
    .populate('messages.sender', 'name email')
    .sort({ lastMessage: -1 });
    
    // Add unread count for each chat
    const chatsWithUnread = chats.map(chat => {
      const unreadCount = chat.messages.filter(
        message => message.sender._id.toString() !== userId && !message.read
      ).length;
      
      return {
        ...chat.toObject(),
        unreadCount
      };
    });
    
    res.json(chatsWithUnread);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
