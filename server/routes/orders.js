const express = require('express')
const Order = require('../models/Order')
const Product = require('../models/Product') // Assuming Product model exists for stock updates
const auth = require('../middleware/auth')
const router = express.Router()

router.post('/', auth, async (req, res) => {
  try {
    const order = new Order({
      ...req.body,
      user: req.user.id
    })
    await order.save()

    // Update MongoDB stock with inc for each product in the order
    for (const item of order.items) {
      // Find the product by its ID and decrement its stock by the ordered quantity
      await Product.findByIdAndUpdate(
        item.product,
        { $inc: { stock: -item.quantity } }, // Use $inc to atomically decrement stock
        { new: true } // Return the updated document
      )
    }

    const cartKey = `cart:${req.user.id}`
    // Clear the user's cart in Redis after a successful order
    await req.redisClient.del(cartKey)
    res.status(201).json(order)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
})

router.get('/', auth, async (req, res) => {
  try {
    // Use aggregation with $lookup instead of populate for better performance and flexibility
    const orders = await Order.aggregate([
      // Match orders for the authenticated user
      { $match: { user: req.user._id } }, // Ensure req.user._id is used for ObjectId comparison

      // Sort orders by creation date in descending order
      { $sort: { createdAt: -1 } },

      // Unwind the 'items' array to process each item individually
      { $unwind: '$items' },

      // Perform a lookup to join with the 'products' collection
      {
        $lookup: {
          from: 'products', // The collection name for products (usually pluralized lowercase)
          localField: 'items.product', // Field from the input documents (Order's item.product)
          foreignField: '_id', // Field from the "products" documents (_id of the product)
          as: 'items.productDetails' // The array field to add to the input documents
        }
      },

      // Unwind the productDetails array created by $lookup (since it's an array)
      { $unwind: '$items.productDetails' },

      // Group back the items into their original order structure
      {
        $group: {
          _id: '$_id', // Group by the original order _id
          user: { $first: '$user' }, // Take the first user field
          totalAmount: { $first: '$totalAmount' }, // Take the first totalAmount
          status: { $first: '$status' }, // Take the first status
          createdAt: { $first: '$createdAt' }, // Take the first createdAt
          updatedAt: { $first: '$updatedAt' }, // Take the first updatedAt
          // Reconstruct the items array with the populated product details
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
      // Project to reshape the output to match the desired structure, if necessary
      // For example, if you want to rename 'items.productDetails' to 'items.product'
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
    ).populate('user', 'name email') // This populate remains as it's not related to the product lookup comment
    if (!order) {
      return res.status(404).json({ message: 'Order not found' })
    }
    res.json(order)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
})

module.exports = router