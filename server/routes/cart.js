const express = require('express');
const auth = require('../middleware/auth');
const router = express.Router();

// Get user's cart from Redis
router.get('/', auth, async (req, res) => {
  try {
    const cartKey = `cart:${req.user.id}`;
    const cart = await req.redisClient.get(cartKey);
    
    res.json(cart ? JSON.parse(cart) : []);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add item to cart
router.post('/add', auth, async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;
    const cartKey = `cart:${req.user.id}`;
    
    let cart = await req.redisClient.get(cartKey);
    cart = cart ? JSON.parse(cart) : [];
    
    const existingItem = cart.find(item => item.productId === productId);
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.push({ productId, quantity, addedAt: new Date() });
    }
    
    // Cache cart for 24 hours
    await req.redisClient.setex(cartKey, 86400, JSON.stringify(cart));
    
    // Real-time notification
    req.io.to(`user-${req.user.id}`).emit('cart-updated', { 
      action: 'item-added', 
      cart 
    });
    
    res.json({ message: 'Item added to cart', cart });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Remove item from cart
router.delete('/remove/:productId', auth, async (req, res) => {
  try {
    const cartKey = `cart:${req.user.id}`;
    let cart = await req.redisClient.get(cartKey);
    cart = cart ? JSON.parse(cart) : [];
    
    cart = cart.filter(item => item.productId !== req.params.productId);
    
    await req.redisClient.setex(cartKey, 86400, JSON.stringify(cart));
    
    // Real-time notification
    req.io.to(`user-${req.user.id}`).emit('cart-updated', { 
      action: 'item-removed', 
      cart 
    });
    
    res.json({ message: 'Item removed from cart', cart });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Clear cart
router.delete('/clear', auth, async (req, res) => {
  try {
    const cartKey = `cart:${req.user.id}`;
    await req.redisClient.del(cartKey);
    
    res.json({ message: 'Cart cleared' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;