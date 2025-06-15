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

module.exports = router;