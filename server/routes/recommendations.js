const express = require('express');
const router = express.Router();
const RecommendationService = require('../services/RecommendationService');
const Product = require('../models/Product');
const User = require('../models/User');
const auth = require('../middleware/auth');
const neo4jDriver = require('../config/neo4j');
const redisClient = require('../config/redis');
const { getSimpleRecommendations } = require('../controllers/orderController');

const service = new RecommendationService(neo4jDriver, redisClient);

// Get frequently bought together products
router.get('/bought-together/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    const limit = parseInt(req.query.limit) || 6;
    
    const recommendations = await service.getBoughtTogether(productId, limit);
    res.json(recommendations);
  } catch (error) {
    console.error('Error getting bought together:', error);
    res.status(500).json({ message: 'Failed to get recommendations', error: error.message });
  }
});

// Get personalized recommendations for user
router.get('/user/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    const limit = parseInt(req.query.limit) || 10;
    
    // Verify user access
    if (req.user.id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const recommendations = await service.getPersonalizedRecommendations(userId, limit);
    res.json(recommendations.map(r => r.product));
  } catch (error) {
    console.error('Error getting user recommendations:', error);
    res.status(500).json({ message: 'Failed to get recommendations', error: error.message });
  }
});

// Get comprehensive recommendations for user (multiple types)
router.get('/comprehensive/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Verify user access
    if (req.user.id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const recommendations = await service.getComprehensiveRecommendations(userId);
    res.json(recommendations);
  } catch (error) {
    console.error('Error getting comprehensive recommendations:', error);
    res.status(500).json({ message: 'Failed to get recommendations', error: error.message });
  }
});

// Get recommendations based on similar users
router.get('/similar-users/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    const limit = parseInt(req.query.limit) || 8;
    
    // Verify user access
    if (req.user.id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const recommendations = await service.getSimilarUsersRecommendations(userId, limit);
    res.json(recommendations.map(r => r.product));
  } catch (error) {
    console.error('Error getting similar user recommendations:', error);
    res.status(500).json({ message: 'Failed to get recommendations', error: error.message });
  }
});

// Get trending products
router.get('/trending', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const days = parseInt(req.query.days) || 7;
    
    const trending = await service.getTrendingProducts(limit);
    
    // Fallback to database trending if Neo4j returns empty
    if (trending.length === 0) {
      const dbTrending = await Product.findTrending(days, limit);
      return res.json(dbTrending);
    }
    
    res.json(trending.map(t => t.product));
  } catch (error) {
    console.error('Error getting trending products:', error);
    res.status(500).json({ message: 'Failed to get trending products', error: error.message });
  }
});

// Get featured products
router.get('/featured', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 8;
    const featured = await Product.findFeatured(limit);
    res.json(featured);
  } catch (error) {
    console.error('Error getting featured products:', error);
    res.status(500).json({ message: 'Failed to get featured products', error: error.message });
  }
});

// Get category-based recommendations
router.get('/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const limit = parseInt(req.query.limit) || 8;
    const userId = req.query.userId;
    
    const recommendations = await service.getCategoryRecommendations(category, userId, limit);
    res.json(recommendations.map(r => r.product));
  } catch (error) {
    console.error('Error getting category recommendations:', error);
    res.status(500).json({ message: 'Failed to get category recommendations', error: error.message });
  }
});

// Get similar products
router.get('/similar/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    const limit = parseInt(req.query.limit) || 5;
    
    const similar = await Product.findSimilar(productId, limit);
    res.json(similar);
  } catch (error) {
    console.error('Error getting similar products:', error);
    res.status(500).json({ message: 'Failed to get similar products', error: error.message });
  }
});

// Record purchase for recommendations
router.post('/record-purchase', auth, async (req, res) => {
  try {
    const { userId, productIds } = req.body;
    
    // Verify user access
    if (req.user.id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    await service.createPurchaseRelationship(userId, productIds);
    
    // Update user purchase history
    const user = await User.findById(userId);
    if (user) {
      for (const productId of productIds) {
        const product = await Product.findById(productId);
        if (product) {
          user.purchaseHistory.push({
            product: productId,
            quantity: 1, // This should come from order data
            price: product.price,
            purchaseDate: new Date()
          });
          
          // Update user analytics
          await user.updateAnalytics(product.price);
          
          // Increment product purchase count
          await product.incrementPurchase();
        }
      }
      await user.save();
    }
    
    res.json({ message: 'Purchase recorded successfully' });
  } catch (error) {
    console.error('Error recording purchase:', error);
    res.status(500).json({ message: 'Failed to record purchase', error: error.message });
  }
});

// Record product view for recommendations
router.post('/record-view', auth, async (req, res) => {
  try {
    const { userId, productId, duration, source, category } = req.body;
    
    // Verify user access
    if (req.user.id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    // Record in Neo4j for recommendations
    await service.recordProductView(userId, productId, category);
    
    // Record in MongoDB for user history
    const user = await User.findById(userId);
    if (user) {
      await user.recordView(productId, duration, source);
    }
    
    // Increment product view count
    const product = await Product.findById(productId);
    if (product) {
      await product.incrementView();
    }
    
    res.json({ message: 'View recorded successfully' });
  } catch (error) {
    console.error('Error recording view:', error);
    res.status(500).json({ message: 'Failed to record view', error: error.message });
  }
});

// Get user's recommendation preferences
router.get('/preferences/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Verify user access
    if (req.user.id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const user = await User.findById(userId).select('preferences analytics');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({
      preferences: user.preferences,
      analytics: {
        favoriteCategory: user.analytics.favoriteCategory,
        favoriteManufacturer: user.analytics.favoriteManufacturer,
        totalSpent: user.analytics.totalSpent,
        totalOrders: user.analytics.totalOrders,
        averageOrderValue: user.analytics.averageOrderValue
      }
    });
  } catch (error) {
    console.error('Error getting user preferences:', error);
    res.status(500).json({ message: 'Failed to get preferences', error: error.message });
  }
});

// Update user's recommendation preferences
router.put('/preferences/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    const { preferences } = req.body;
    
    // Verify user access
    if (req.user.id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const user = await User.findByIdAndUpdate(
      userId,
      { $set: { preferences } },
      { new: true, runValidators: true }
    ).select('preferences');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Clear user's recommendation cache
    await service.clearUserRecommendationCache(userId);
    
    res.json({ message: 'Preferences updated successfully', preferences: user.preferences });
  } catch (error) {
    console.error('Error updating preferences:', error);
    res.status(500).json({ message: 'Failed to update preferences', error: error.message });
  }
});

// Get recommendation analytics (admin only)
router.get('/analytics', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    
    const [totalUsers, totalProducts, totalPurchases] = await Promise.all([
      User.countDocuments({ isActive: true }),
      Product.countDocuments({ isActive: true }),
      User.aggregate([
        { $unwind: '$purchaseHistory' },
        { $count: 'total' }
      ])
    ]);
    
    res.json({
      totalUsers,
      totalProducts,
      totalPurchases: totalPurchases[0]?.total || 0,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Error getting recommendation analytics:', error);
    res.status(500).json({ message: 'Failed to get analytics', error: error.message });
  }
});

// Simple recommendations from orderController
router.get('/simple/:userId', getSimpleRecommendations);

module.exports = router;