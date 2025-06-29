const express = require('express');
const Product = require('../models/Product');
const Order = require('../models/Order');
const auth = require('../middleware/auth');
const roles = require('../middleware/roles');
const router = express.Router();

// Seller Dashboard Analytics
router.get('/analytics', auth, roles(['seller', 'admin']), async (req, res) => {
  try {
    const sellerId = req.user.id;
    
    const totalProducts = await Product.countDocuments({ seller: sellerId });
    
    const sellerOrders = await Order.aggregate([
      { $unwind: '$items' },
      {
        $lookup: {
          from: 'products',
          localField: 'items.product',
          foreignField: '_id',
          as: 'productInfo'
        }
      },
      { $match: { 'productInfo.seller': req.user._id } },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: { $multiply: ['$items.quantity', '$items.price'] } }
        }
      }
    ]);
    
    const totalOrders = sellerOrders.length > 0 ? sellerOrders[0].totalOrders : 0;
    const totalRevenue = sellerOrders.length > 0 ? sellerOrders[0].totalRevenue : 0;
    
    // Get average rating across all products
    const avgRatingResult = await Product.aggregate([
      { $match: { seller: req.user._id } },
      { $group: { _id: null, avgRating: { $avg: '$averageRating' } } }
    ]);
    
    const averageRating = avgRatingResult.length > 0 ? avgRatingResult[0].avgRating.toFixed(1) : 0;
    
    // Get top selling products
    const topProducts = await Order.aggregate([
      { $unwind: '$items' },
      {
        $lookup: {
          from: 'products',
          localField: 'items.product',
          foreignField: '_id',
          as: 'productInfo'
        }
      },
      { $match: { 'productInfo.seller': req.user._id } },
      {
        $group: {
          _id: '$items.product',
          name: { $first: { $arrayElemAt: ['$productInfo.name', 0] } },
          salesCount: { $sum: '$items.quantity' }
        }
      },
      { $sort: { salesCount: -1 } },
      { $limit: 5 }
    ]);
    
    // Get recent reviews
    const recentReviews = await Product.aggregate([
      { $match: { seller: req.user._id } },
      { $unwind: '$reviews' },
      { $sort: { 'reviews.createdAt': -1 } },
      {
        $project: {
          productName: '$name',
          rating: '$reviews.rating',
          comment: '$reviews.comment',
          createdAt: '$reviews.createdAt'
        }
      },
      { $limit: 5 }
    ]);

    res.json({
      totalProducts,
      totalOrders,
      totalRevenue: totalRevenue.toFixed(2),
      averageRating,
      topProducts,
      recentReviews
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get seller's products
router.get('/products', auth, roles(['seller', 'admin']), async (req, res) => {
  try {
    const products = await Product.find({ seller: req.user.id })
      .sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get orders for seller's products
router.get('/orders', auth, roles(['seller', 'admin']), async (req, res) => {
  try {
    const orders = await Order.aggregate([
      { $unwind: '$items' },
      {
        $lookup: {
          from: 'products',
          localField: 'items.product',
          foreignField: '_id',
          as: 'productInfo'
        }
      },
      { $match: { 'productInfo.seller': req.user._id } },
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'userInfo'
        }
      },
      {
        $project: {
          _id: 1,
          user: { $arrayElemAt: ['$userInfo', 0] },
          items: [{
            product: { $arrayElemAt: ['$productInfo', 0] },
            quantity: '$items.quantity',
            price: '$items.price'
          }],
          totalAmount: 1,
          status: 1,
          createdAt: 1
        }
      },
      { $sort: { createdAt: -1 } }
    ]);
    
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
