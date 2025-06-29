const express = require('express');
const Product = require('../models/Product');
const Review = require('../models/Review');
const productController = require('../controllers/productController');
const auth = require('../middleware/auth');
const roles = require('../middleware/roles');
const router = express.Router();

// GET all products (with filtering, sorting, pagination)
// No Redis caching here for now, as dynamic queries are complex to cache effectively at this level.
// Caching can be re-introduced with more sophisticated strategies if needed.
router.get('/', productController.getProducts);

// GET distinct filter values (categories, manufacturers, etc.)
router.get('/filters', productController.getProductFilters);

// GET single product (with Redis caching)
router.get('/:id', async (req, res) => {
  try {
    const cacheKey = `product:${req.params.id}`;
    
    if (req.redisClient) {
      const cachedProduct = await req.redisClient.get(cacheKey);
      if (cachedProduct) {
        return res.json(JSON.parse(cachedProduct));
      }
    }
    
    // Delegate to controller if not in cache or Redis is not available
    return productController.getProduct(req, res);

  } catch (error) {
    console.error(`Error in GET /products/:id route: ${error.message}`);
    res.status(500).json({ message: error.message });
  }
});

// POST create new product
router.post('/', auth, roles(['admin', 'seller']), productController.createProduct);

// PUT update existing product
router.put('/:id', auth, roles(['admin', 'seller']), productController.updateProduct);

// DELETE product
router.delete('/:id', auth, roles(['admin', 'seller']), productController.deleteProduct);

// POST create a review for a product
router.post('/:id/reviews', auth, async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const productId = req.params.id;
    const userId = req.user.id;
    
    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    
    // Check if user already reviewed
    const existing = await Review.findOne({ product: productId, user: userId });
    if (existing) return res.status(400).json({ message: 'You have already reviewed this product' });
    
    // Create review
    const review = new Review({ product: productId, user: userId, rating, comment });
    await review.save();
    
    // Update product stats
    await updateProductStats(productId);
    
    // Populate user info for response
    await review.populate('user', 'name email');
    res.status(201).json(review);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// GET reviews for a product
router.get('/:id/reviews', async (req, res) => {
  try {
    const productId = req.params.id;
    const reviews = await Review.find({ product: productId }).populate('user', 'name').sort({ createdAt: -1 });
    const product = await Product.findById(productId).select('averageRating reviewCount');
    res.json({
      reviews,
      averageRating: product?.averageRating || 0,
      reviewCount: product?.reviewCount || 0
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Helper to update product stats
async function updateProductStats(productId) {
  const reviews = await Review.find({ product: productId });
  const averageRating = reviews.length ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length) : 0;
  await Product.findByIdAndUpdate(productId, {
    averageRating,
    reviewCount: reviews.length
  });
}

module.exports = router;