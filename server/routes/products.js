const express = require('express');
const Product = require('../models/Product'); // This refers to the Product Mongoose Model
const auth = require('../middleware/auth');
const router = express.Router();

// Get all products with Redis caching
router.get('/', async (req, res) => {
  try {
    const cacheKey = 'products:all';
    
    // Try to get from Redis cache first
    const cachedProducts = await req.redisClient.get(cacheKey);
    if (cachedProducts) {
      return res.json(JSON.parse(cachedProducts));
    }
    
    // If not in cache, get from MongoDB
    // Note: The original comment "Store name and email of seller in the product directly"
    // suggests denormalization. If you want to denormalize, you'd modify the Product Mongoose
    // schema to include seller name/email and populate during product creation/update.
    // For now, keeping original populate behavior.
    const products = await Product.find().populate('seller', 'name email'); 
    
    // Cache for 5 minutes
    await req.redisClient.setex(cacheKey, 300, JSON.stringify(products));
    
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single product with Redis caching
router.get('/:id', async (req, res) => {
  try {
    const cacheKey = `product:${req.params.id}`;
    
    // Try cache first
    const cachedProduct = await req.redisClient.get(cacheKey);
    if (cachedProduct) {
      return res.json(JSON.parse(cachedProduct));
    }
    
    const product = await Product.findById(req.params.id).populate('seller', 'name email');
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // Cache for 10 minutes
    await req.redisClient.setex(cacheKey, 600, JSON.stringify(product));
    
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create product
router.post('/', auth, async (req, res) => {
  try {
    const product = new Product({
      ...req.body,
      seller: req.user.id
    });
    
    await product.save();
    
    // Clear products cache
    await req.redisClient.del('products:all');
    
    res.status(201).json(product);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update product
router.put('/:id', auth, async (req, res) => {
  try {
    const product = await Product.findOneAndUpdate(
      { _id: req.params.id, seller: req.user.id },
      req.body,
      { new: true }
    );
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found or unauthorized' });
    }
    
    // Clear cache
    await req.redisClient.del('products:all');
    await req.redisClient.del(`product:${req.params.id}`);
    
    res.json(product);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;