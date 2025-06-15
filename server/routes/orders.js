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
    const orders = await Order.aggregate([
      { $match: { user: req.user._id } },
      { $sort: { createdAt: -1 } },
      { $unwind: '$items' },
      {
        $lookup: {
          from: 'products',
          localField: 'items.product',
          foreignField: '_id',
          as: 'items.productDetails'
        }
      },
      { $unwind: '$items.productDetails' },
      {
        $group: {
          _id: '$_id',
          user: { $first: '$user' },
          totalAmount: { $first: '$totalAmount' },
          status: { $first: '$status' },
          createdAt: { $first: '$createdAt' },
          updatedAt: { $first: '$updatedAt' },
          items: {
            $push: {
              product: '$items.product',
              quantity: '$items.quantity',
              _id: '$items._id',
              productDetails: {
                _id: '$$item.productDetails._id',
                name: '$$item.productDetails.name',
                price: '$$item.productDetails.price',
                image: '$$item.productDetails.image'
              }
            }
          }
        }
      },
      {
        $project: {
          _id: 1,
          user: 1,
          totalAmount: 1,
          status: 1,
          createdAt: 1,
          updatedAt: 1,
          items: {
            $map: {
              input: '$items',
              as: 'item',
              in: {
                product: {
                  _id: '$$item.productDetails._id',
                  name: '$$item.productDetails.name',
                  price: '$$item.productDetails.price',
                  image: '$$item.productDetails.image'
                },
                quantity: '$$item.quantity',
                _id: '$$item._id'
              }
            }
          }
        }
      }
    ])
    res.json(orders)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

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