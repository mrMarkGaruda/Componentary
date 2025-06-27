const express = require('express');
const Chat = require('../models/Chat');
const User = require('../models/User');
const Product = require('../models/Product');
const auth = require('../middleware/auth');
const router = express.Router();

// AI service configuration
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://smollm-ai:8000';

// Helper function to call AI service
const callAIService = async (message, productInfo = {}, sellerName = 'Seller') => {
  try {
    const response = await fetch(`${AI_SERVICE_URL}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        product_info: productInfo,
        seller_name: sellerName,
      }),
    });

    if (!response.ok) {
      throw new Error(`AI service responded with status: ${response.status}`);
    }

    const data = await response.json();
    return data.response;
  } catch (error) {
    console.error('AI service error:', error);
    // Fallback response
    return "Thanks for your message! I'm here to help with any questions about our products. How can I assist you today?";
  }
};

// Helper function to get product context
const getProductContext = async (productId) => {
  if (!productId) return {};
  
  try {
    const product = await Product.findById(productId);
    if (!product) return {};
    
    return {
      name: product.name,
      price: product.price,
      category: product.category,
      description: product.description,
      stock: product.stock,
    };
  } catch (error) {
    console.error('Error fetching product context:', error);
    return {};
  }
};

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
    const { recipientId, content, productId } = req.body;
    const senderId = req.user.id;
    
    // Get recipient info to check if it's a seller
    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({ message: 'Recipient not found' });
    }
    
    let chat = await Chat.findOne({
      participants: { $all: [senderId, recipientId] }
    });
    
    if (!chat) {
      chat = new Chat({
        participants: [senderId, recipientId],
        messages: []
      });
    }
    
    // Add user message
    const userMessage = {
      sender: senderId,
      content,
      timestamp: new Date(),
      read: false
    };
    
    chat.messages.push(userMessage);
    chat.lastMessage = new Date();
    
    await chat.save();
    
    // Generate AI response if recipient is a seller
    if (recipient.role === 'seller') {
      try {
        // Get product context if productId is provided
        const productContext = await getProductContext(productId);
        
        // Generate AI response
        const aiResponse = await callAIService(content, productContext, recipient.name);
        
        // Add AI response to chat
        const aiMessage = {
          sender: recipientId,
          content: aiResponse,
          timestamp: new Date(),
          read: false,
          isAI: true
        };
        
        chat.messages.push(aiMessage);
        chat.lastMessage = new Date();
        
        await chat.save();
      } catch (error) {
        console.error('Error generating AI response:', error);
        // Continue without AI response if there's an error
      }
    }
    
    // Populate sender info for response
    await chat.populate('messages.sender', 'name email');
    
    // Return the latest messages (user message and potentially AI response)
    const latestMessages = chat.messages.slice(-2);
    
    res.json({
      messages: latestMessages,
      chatId: chat._id
    });
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
