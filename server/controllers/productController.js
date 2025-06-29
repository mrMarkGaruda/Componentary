const Product = require('../models/Product');

// Enhanced product creation with better validation and analytics
exports.createProduct = async (req, res) => {
  try {
    console.log('Product creation request body:', JSON.stringify(req.body, null, 2));
    console.log('User ID from req.user:', req.user?.id);
    
    // Validate required fields
    const requiredFields = ['name', 'price', 'category'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        message: 'Missing required fields',
        missingFields
      });
    }

    // Validate price
    if (req.body.price < 0) {
      return res.status(400).json({
        message: 'Price must be a positive number'
      });
    }

    // Create product with seller info
    const productData = {
      ...req.body,
      seller: req.user.id,
      createdAt: new Date(),
      lastUpdated: new Date()
    };

    const product = new Product(productData);
    console.log('Product before save:', JSON.stringify(product.toObject(), null, 2));
    
    await product.save();
    
    // Invalidate relevant caches
    if (req.redisClient) {
      try {
        await req.redisClient.del('products:all');
        await req.redisClient.del(`products:category:${product.category}`);
        await req.redisClient.del('products:filters');
        console.log('Product caches invalidated');
      } catch (cacheError) {
        console.warn('Cache invalidation failed:', cacheError.message);
      }
    }
    
    // Track product creation analytics
    try {
      await product.trackAnalytics('created');
    } catch (analyticsError) {
      console.warn('Analytics tracking failed:', analyticsError.message);
    }
    
    // Populate seller info for response
    await product.populate('seller', 'name email');
    
    res.status(201).json({
      message: 'Product created successfully',
      product
    });
  } catch (error) {
    console.error('Product creation error:', error);
    
    // Handle different types of errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => ({
        field: err.path,
        message: err.message
      }));
      
      return res.status(400).json({
        message: 'Validation failed',
        errors: validationErrors
      });
    }
    
    if (error.code === 11000) {
      return res.status(409).json({
        message: 'Product with this name already exists'
      });
    }
    
    res.status(500).json({
      message: 'Failed to create product',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
}

exports.getProducts = async (req, res) => {
  try {
    const { 
      category, 
      manufacturer, 
      minPrice, 
      maxPrice, 
      searchTerm, 
      sortBy, 
      sortOrder = 'asc',
      page = 1, 
      limit = 20,
      tags, // Comma-separated string of tags
      minRating, // Minimum average rating
      // For specifications, expect query params like spec_cores=8, spec_socket=LGA1700
      ...otherQueryParams 
    } = req.query;

    let query = {};

    if (category) {
      // Allow multiple categories if sent as a comma-separated string
      const categories = category.split(',').map(cat => cat.trim());
      if (categories.length > 0) {
        query.category = { $in: categories };
      }
    }
    if (manufacturer) {
      // Allow multiple manufacturers
      const manufacturers = manufacturer.split(',').map(man => man.trim());
      if (manufacturers.length > 0) {
        query.manufacturer = { $in: manufacturers };
      }
    }
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) {
        query.price.$gte = parseFloat(minPrice);
      }
      if (maxPrice) {
        query.price.$lte = parseFloat(maxPrice);
      }
    }
    if (searchTerm) {
      query.$text = { $search: searchTerm };
    }
    if (tags) {
      const tagArray = tags.split(',').map(tag => tag.trim());
      if (tagArray.length > 0) {
        query.tags = { $all: tagArray }; // Match all provided tags
      }
    }
    if (minRating) {
      const rating = parseFloat(minRating);
      if (!isNaN(rating) && rating >= 0 && rating <= 5) {
        query.averageRating = { $gte: rating };
      }
    }

    // Dynamic specification filters
    for (const key in otherQueryParams) {
      if (key.startsWith('spec_')) {
        const specKey = key.substring(5); // Remove 'spec_' prefix
        // For numeric values, attempt to parse them
        let specValue = otherQueryParams[key];
        if (!isNaN(parseFloat(specValue)) && isFinite(specValue)) {
            specValue = parseFloat(specValue);
        } else if (typeof specValue === 'string' && specValue.toLowerCase() === 'true') {
            specValue = true;
        } else if (typeof specValue === 'string' && specValue.toLowerCase() === 'false') {
            specValue = false;
        }
        // To handle multiple values for a single spec (e.g. spec_cores=8,10,12)
        if (typeof specValue === 'string' && specValue.includes(',')) {
          const specValues = specValue.split(',').map(val => {
            const trimmedVal = val.trim();
            if (!isNaN(parseFloat(trimmedVal)) && isFinite(trimmedVal)) {
              return parseFloat(trimmedVal);
            }
            return trimmedVal;
          });
          query[`specifications.${specKey}`] = { $in: specValues };
        } else {
          query[`specifications.${specKey}`] = specValue;
        }
      }
    }

    let sortOptions = {};
    if (sortBy) {
      sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;
    } else if (searchTerm) {
      sortOptions = { score: { $meta: "textScore" } }; 
    } else {
      // Default sort if no specific sort or search term
      sortOptions = { createdAt: -1 }; // Sort by newest by default
    }

    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);
    const skip = (pageNumber - 1) * limitNumber;

    const products = await Product.find(query)
      .populate('seller', 'name email')
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNumber);

    const totalProducts = await Product.countDocuments(query);
    
    res.json({
      products,
      currentPage: pageNumber,
      totalPages: Math.ceil(totalProducts / limitNumber),
      totalProducts,
      filtersApplied: req.query // Send back the applied filters for frontend state
    });

  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: error.message });
  }
}

exports.getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('seller', 'name email')
    if (!product) return res.status(404).json({ message: 'Product not found' })
    res.json(product)
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findOneAndUpdate(
      { _id: req.params.id, seller: req.user.id }, // Ensure only the seller or admin can update
      req.body,
      { new: true }
    )
    if (!product) return res.status(404).json({ message: 'Product not found or unauthorized' })
    
    // Invalidate relevant caches
    if (req.redisClient) {
      await req.redisClient.del('products:all');
      await req.redisClient.del(`product:${req.params.id}`);
    }
    res.json(product)
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findOneAndDelete({ _id: req.params.id, seller: req.user.id })
    if (!product) return res.status(404).json({ message: 'Product not found or unauthorized' })
    
    // Invalidate relevant caches
    if (req.redisClient) {
      await req.redisClient.del('products:all');
      await req.redisClient.del(`product:${req.params.id}`);
    }
    res.json({ message: 'Product deleted' })
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// New controller function to get distinct filter values
exports.getProductFilters = async (req, res) => {
  try {
    const cacheKey = 'product:filters:v2'; // Changed cache key due to new structure
    if (req.redisClient) {
      const cachedFilters = await req.redisClient.get(cacheKey);
      if (cachedFilters) {
        return res.json(JSON.parse(cachedFilters));
      }
    }

    const categories = await Product.distinct('category');
    const manufacturers = await Product.distinct('manufacturer');
    const allTags = await Product.distinct('tags');

    // Fetch distinct values for common specification keys
    // This can be expanded based on common query patterns or specific needs
    const commonSpecKeys = [
      'specifications.socket', 
      'specifications.chipset', 
      'specifications.memoryType', // For RAM & GPU
      'specifications.capacity', // For RAM & Storage
      'specifications.cores', // For CPU
      'specifications.speed', // For RAM
      'specifications.type', // For Case, Cooling, Storage, RAM etc.
      'specifications.formFactor', // For Motherboard, Case
      'specifications.efficiency', // For PSU
      'specifications.modularity' // For PSU
    ];
    
    const specFilters = {};
    for (const key of commonSpecKeys) {
        const distinctValues = await Product.distinct(key);
        if (distinctValues && distinctValues.length > 0) {
            // Clean up key name for frontend (e.g., 'specifications.socket' -> 'socket')
            const cleanKey = key.replace('specifications.', '');
            specFilters[cleanKey] = distinctValues.sort();
        }
    }
    
    // Get min and max price for price range slider
    const priceStats = await Product.aggregate([
        { $group: { _id: null, minPrice: { $min: "$price" }, maxPrice: { $max: "$price" } } }
    ]);

    const filters = {
      categories: categories.sort(),
      manufacturers: manufacturers.sort(),
      tags: allTags.sort(),
      priceRange: priceStats.length > 0 ? { min: priceStats[0].minPrice, max: priceStats[0].maxPrice } : { min: 0, max: 5000 },
      specificationFilters: specFilters,
    };

    if (req.redisClient) {
      await req.redisClient.setex(cacheKey, 3600, JSON.stringify(filters)); // Cache for 1 hour
    }

    res.json(filters);
  } catch (error) {
    console.error('Error fetching product filters:', error);
    res.status(500).json({ message: error.message });
  }
};