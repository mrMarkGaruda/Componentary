const express = require('express');
const router = express.Router();

// AI service configuration
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://smollm-ai:8000';

// Helper function to call AI service for website help
const callWebsiteHelperAI = async (message, pageContext, sessionId) => {
  try {
    const response = await fetch(`${AI_SERVICE_URL}/website-helper`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        page_context: pageContext,
        session_id: sessionId,
      }),
    });

    if (!response.ok) {
      throw new Error(`AI service responded with status: ${response.status}`);
    }

    const data = await response.json();
    return data.response;
  } catch (error) {
    console.error('Website Helper AI service error:', error);
    // Fallback response based on context
    return generateFallbackResponse(message, pageContext);
  }
};

// Generate fallback responses based on page context and message
const generateFallbackResponse = (message, pageContext) => {
  const messageWords = message.toLowerCase().split(' ');
  const pagePath = pageContext.currentPage || '';
  const pageTitle = pageContext.pageTitle || '';
  
  // Check what page user is on and provide relevant help
  if (pagePath === '/' || pagePath === '/home') {
    if (messageWords.some(word => ['product', 'shop', 'buy', 'browse'].includes(word))) {
      return "Welcome to Componentary! You can browse our products by clicking 'Products' in the navigation menu. We specialize in PC components like graphics cards, processors, motherboards, and more. Use the search and filter options to find exactly what you need.";
    }
    if (messageWords.some(word => ['help', 'navigate', 'how'].includes(word))) {
      return "I can help you navigate Componentary! Use the top navigation to browse Products, or if you're a seller, you can access your dashboard. Need to find something specific? Try our search feature or product filters.";
    }
  }
  
  if (pagePath.includes('/products')) {
    if (messageWords.some(word => ['filter', 'search', 'find'].includes(word))) {
      return "On the products page, you can filter by category, manufacturer, price range, and ratings. Use the search box to find specific items, and sort results by price, name, or date. Each product shows key specs and customer reviews.";
    }
    if (messageWords.some(word => ['compare', 'difference', 'which'].includes(word))) {
      return "To compare products, you can view individual product pages to see detailed specifications, reviews, and ratings. Look at the technical specifications section and customer feedback to make informed decisions.";
    }
  }
  
  if (pagePath.includes('/product/')) {
    if (pageContext.productInfo?.name) {
      if (messageWords.some(word => ['price', 'cost', 'buy'].includes(word))) {
        return `For the ${pageContext.productInfo.name}, you can see the current price and availability on this page. Add it to your cart and proceed to checkout when you're ready to purchase.`;
      }
      if (messageWords.some(word => ['spec', 'detail', 'feature'].includes(word))) {
        return `You're viewing the product details for ${pageContext.productInfo.name}. Scroll down to see full specifications, customer reviews, and related product recommendations.`;
      }
      if (messageWords.some(word => ['review', 'rating', 'quality'].includes(word))) {
        return "Customer reviews and ratings are shown below the product description. These provide real feedback from verified buyers about product quality, performance, and value.";
      }
    }
  }
  
  if (pagePath.includes('/checkout')) {
    return "On the checkout page, review your items, enter shipping information, and select your payment method. Make sure all details are correct before completing your order. You'll receive an email confirmation once your order is placed.";
  }
  
  if (pagePath.includes('/profile')) {
    return "In your profile, you can update personal information, manage addresses, view order history, and adjust notification preferences. Keep your profile updated for the best shopping experience.";
  }
  
  if (pagePath.includes('/admin') || pagePath.includes('/seller')) {
    return "This is your dashboard where you can manage products, view orders, and access analytics. Use the navigation tabs to switch between different management functions.";
  }
  
  // General help responses
  if (messageWords.some(word => ['account', 'login', 'register', 'signup'].includes(word))) {
    return "To create an account or log in, use the buttons in the top right corner. Having an account lets you track orders, save favorites, and get personalized recommendations.";
  }
  
  if (messageWords.some(word => ['shipping', 'delivery', 'order'].includes(word))) {
    return "We offer fast shipping with most orders shipping within 1-2 business days. You can track your orders in your profile under 'Order History'. Free shipping is available on orders over $50.";
  }
  
  if (messageWords.some(word => ['return', 'refund', 'warranty'].includes(word))) {
    return "We have a 30-day return policy for most items. Products come with manufacturer warranties. You can start a return process from your order history or contact our support team.";
  }
  
  if (messageWords.some(word => ['payment', 'secure', 'safe'].includes(word))) {
    return "Componentary uses secure payment processing. We accept major credit cards and ensure all transactions are encrypted and protected. Your payment information is never stored on our servers.";
  }
  
  // Default helpful response
  return "I'm here to help you navigate Componentary! I can assist with finding products, understanding features, account management, orders, and more. What specific information are you looking for?";
};

// Simple rate limiting
const helperCallTracker = new Map();
const HELPER_RATE_LIMIT_WINDOW = 30000; // 30 seconds
const MAX_HELPER_CALLS_PER_WINDOW = 10; // Max 10 calls per 30 seconds

const helperRateLimiter = (req, res, next) => {
  const clientIP = req.ip || req.connection.remoteAddress || 'unknown';
  const now = Date.now();
  
  if (!helperCallTracker.has(clientIP)) {
    helperCallTracker.set(clientIP, { count: 1, windowStart: now });
    return next();
  }
  
  const ipTracker = helperCallTracker.get(clientIP);
  
  // Reset window if expired
  if (now - ipTracker.windowStart > HELPER_RATE_LIMIT_WINDOW) {
    ipTracker.count = 1;
    ipTracker.windowStart = now;
    return next();
  }
  
  // Check if limit exceeded
  if (ipTracker.count >= MAX_HELPER_CALLS_PER_WINDOW) {
    return res.status(429).json({ 
      response: 'Please wait a moment before asking another question. I want to make sure I can help everyone effectively!' 
    });
  }
  
  ipTracker.count++;
  next();
};

// Website helper chat endpoint
router.post('/chat', helperRateLimiter, async (req, res) => {
  try {
    const { message, pageContext, sessionId } = req.body;
    
    if (!message || !message.trim()) {
      return res.status(400).json({ 
        response: 'Please ask me a question and I\'ll be happy to help!' 
      });
    }
    
    // Generate AI response
    const aiResponse = await callWebsiteHelperAI(message.trim(), pageContext || {}, sessionId);
    
    res.json({
      response: aiResponse,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Website helper endpoint error:', error);
    res.status(500).json({ 
      response: 'I\'m having trouble right now, but you can browse our site or contact our support team for assistance.' 
    });
  }
});

// Health check for website helper
router.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'website-helper',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
