const express = require('express');
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

// Add review to product
router.post('/:id/reviews', auth, async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const productId = req.params.id;
    const userId = req.user.id;
    
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // Check if user already reviewed this product
    const existingReview = product.ratings.find(
      r => r.user.toString() === userId
    );
    
    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this product' });
    }
    
    const review = {
      user: userId,
      rating: parseInt(rating),
      comment: comment || '',
      createdAt: new Date()
    };
    
    product.ratings.push(review);
    await product.save();
    
    // Populate the user info for the response
    await product.populate('ratings.user', 'name email');
    const savedReview = product.ratings[product.ratings.length - 1];
    
    res.status(201).json(savedReview);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get reviews for a product
router.get('/:id/reviews', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('ratings.user', 'name')
      .select('ratings averageRating totalRatings');
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    res.json({
      reviews: product.ratings,
      averageRating: product.averageRating,
      totalRatings: product.totalRatings
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;