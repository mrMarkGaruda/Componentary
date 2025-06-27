const express = require('express')
const Order = require('../models/Order')
const Product = require('../models/Product')
const auth = require('../middleware/auth')
const router = express.Router()

router.post('/', auth, async (req, res) => {
  try {
    const order = new Order({
      ...req.body,
      user: req.user.id
    })
    await order.save()
    for (const item of order.items) {
      await Product.findByIdAndUpdate(
        item.product,
        { $inc: { stock: -item.quantity } },
        { new: true }
      )
    }
    const cartKey = `cart:${req.user.id}`
    await req.redisClient.del(cartKey)
    res.status(201).json(order)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
})

router.get('/', auth, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate('items.product', 'name price imageUrl images')
      .sort({ createdAt: -1 });
    
    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: error.message });
  }
});

router.patch('/:id/status', auth, async (req, res) => {
  try {
    const { status } = req.body
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate('user', 'name email')
    if (!order) {
      return res.status(404).json({ message: 'Order not found' })
    }
    res.json(order)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
})

module.exports = router