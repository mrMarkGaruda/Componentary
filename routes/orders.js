const express = require('express');
const Order = require('../models/Order');
const auth = require('../middleware/auth');
const router = express.Router();

// Create order
router.post('/', auth, async (req, res) => {
  try {
    const order = new Order({
      ...req.body,
      user: req.user.id
    });
    
    await order.save();
    
    // Clear user's cart after successful order
    const cartKey = `cart:${req.user.id}`;
    await req.redisClient.del(cartKey);
    
    // Real-time order notification
    req.io.to(`user-${req.user.id}`).emit('order-created', { 
      orderId: order._id, 
      status: order.status 
    });
    
    res.status(201).json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get user's orders
router.get('/', auth, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .populate('items.product', 'name price image')
      .sort({ createdAt: -1 });
    
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update order status (for admin/seller)
router.patch('/:id/status', auth, async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate('user', 'name email');
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Real-time status update notification
    req.io.to(`user-${order.user._id}`).emit('order-status-updated', { 
      orderId: order._id, 
      status: order.status 
    });
    
    res.json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;