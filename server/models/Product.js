const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  originalPrice: { type: Number, min: 0 }, // For sales/discounts
  image: { type: String, required: true },
  images: [String], // Additional images
  category: {
    type: String,
    required: true,
    enum: [
      'CPU', 'GPU', 'Motherboard', 'RAM', 'Storage', 'PSU', 'Case', 'Cooling',
      'Monitor', 'Keyboard', 'Mouse', 'Networking', 'Audio', 'Software',
      'Accessories', 'Prebuilt', 'Laptop', 'Other'
    ],
  },
  subcategory: { type: String, trim: true }, // e.g., "Gaming Keyboard", "Mechanical"
  manufacturer: { type: String, required: true, trim: true },
  modelNumber: { type: String, trim: true },
  sku: { type: String, unique: true, sparse: true }, // Stock Keeping Unit
  specifications: { type: mongoose.Schema.Types.Mixed },
  features: [String], // Key features array
  tags: [String],
  compatibility: [String], // Compatible products/standards
  dimensions: {
    length: Number,
    width: Number,
    height: Number,
    weight: Number,
    unit: { type: String, default: 'cm' }
  },
  stock: { type: Number, required: true, min: 0, default: 0 },
  isActive: { type: Boolean, default: true },
  isFeatured: { type: Boolean, default: false },
  isOnSale: { type: Boolean, default: false },
  saleEndDate: Date,
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
  // Reviews and Ratings
  reviews: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    rating: { type: Number, min: 1, max: 5, required: true },
    title: String,
    comment: String,
    verified: { type: Boolean, default: false }, // Verified purchase
    helpful: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    createdAt: { type: Date, default: Date.now }
  }],
  averageRating: { type: Number, default: 0, min: 0, max: 5 },
  reviewCount: { type: Number, default: 0, min: 0 },
  ratingDistribution: {
    1: { type: Number, default: 0 },
    2: { type: Number, default: 0 },
    3: { type: Number, default: 0 },
    4: { type: Number, default: 0 },
    5: { type: Number, default: 0 }
  },

  // Analytics and Recommendations
  viewCount: { type: Number, default: 0 },
  purchaseCount: { type: Number, default: 0 },
  wishlistCount: { type: Number, default: 0 },
  clickCount: { type: Number, default: 0 },
  lastViewed: Date,
  
  // SEO and Marketing
  seoTitle: String,
  seoDescription: String,
  keywords: [String],
  
  // Shipping and Logistics
  shippingWeight: Number,
  shippingDimensions: {
    length: Number,
    width: Number,
    height: Number
  },
  freeShipping: { type: Boolean, default: false },
  shippingCost: { type: Number, default: 0 },
  
  // Warranty and Support
  warrantyPeriod: String, // e.g., "2 years", "Limited lifetime"
  warrantyType: String, // e.g., "Manufacturer", "Seller", "Extended"
  returnPolicy: String,
  
  // Metadata
  importedFrom: String, // Data source if imported
  lastSyncDate: Date,
  dataQualityScore: { type: Number, min: 0, max: 100, default: 100 }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for discount percentage
productSchema.virtual('discountPercentage').get(function() {
  if (this.originalPrice && this.originalPrice > this.price) {
    return Math.round(((this.originalPrice - this.price) / this.originalPrice) * 100);
  }
  return 0;
});

// Virtual for in stock status
productSchema.virtual('inStock').get(function() {
  return this.stock > 0;
});

// Virtual for new product (less than 30 days old)
productSchema.virtual('isNew').get(function() {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  return this.createdAt > thirtyDaysAgo;
});

// Method to calculate average rating and distribution
productSchema.methods.calculateRatingStats = function() {
  if (this.reviews.length === 0) {
    this.averageRating = 0;
    this.reviewCount = 0;
    this.ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  } else {
    const sum = this.reviews.reduce((acc, review) => acc + review.rating, 0);
    this.averageRating = parseFloat((sum / this.reviews.length).toFixed(2));
    this.reviewCount = this.reviews.length;
    
    // Calculate rating distribution
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    this.reviews.forEach(review => {
      distribution[review.rating]++;
    });
    this.ratingDistribution = distribution;
  }
};

// Method to increment view count
productSchema.methods.incrementView = function() {
  this.viewCount++;
  this.lastViewed = new Date();
  return this.save();
};

// Method to increment purchase count
productSchema.methods.incrementPurchase = function(quantity = 1) {
  this.purchaseCount += quantity;
  this.stock = Math.max(0, this.stock - quantity);
  return this.save();
};

// Method to check if product is compatible with another
productSchema.methods.isCompatibleWith = function(otherProduct) {
  if (!this.compatibility || !otherProduct.compatibility) return false;
  
  return this.compatibility.some(comp => 
    otherProduct.compatibility.includes(comp) ||
    otherProduct.category === comp ||
    this.category === otherProduct.compatibility.find(c => c === this.category)
  );
};

// Pre-save hooks
productSchema.pre('save', function(next) {
  this.calculateRatingStats();
  
  // Auto-generate SKU if not provided
  if (!this.sku) {
    const categoryCode = this.category.substring(0, 3).toUpperCase();
    const manufacturerCode = this.manufacturer.substring(0, 3).toUpperCase();
    const randomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    this.sku = `${categoryCode}-${manufacturerCode}-${randomCode}`;
  }
  
  // Update sale status
  if (this.saleEndDate && this.saleEndDate < new Date()) {
    this.isOnSale = false;
  }
  
  next();
});

// Static methods for recommendations
productSchema.statics.findSimilar = function(productId, limit = 5) {
  return this.findById(productId).then(product => {
    if (!product) return [];
    
    return this.find({
      _id: { $ne: productId },
      $or: [
        { category: product.category },
        { manufacturer: product.manufacturer },
        { tags: { $in: product.tags } }
      ],
      isActive: true
    })
    .sort({ averageRating: -1, purchaseCount: -1 })
    .limit(limit);
  });
};

productSchema.statics.findTrending = function(days = 7, limit = 10) {
  const dateThreshold = new Date();
  dateThreshold.setDate(dateThreshold.getDate() - days);
  
  return this.find({
    isActive: true,
    createdAt: { $gte: dateThreshold }
  })
  .sort({ purchaseCount: -1, viewCount: -1, averageRating: -1 })
  .limit(limit);
};

productSchema.statics.findFeatured = function(limit = 8) {
  return this.find({
    isActive: true,
    $or: [
      { isFeatured: true },
      { averageRating: { $gte: 4.5 } },
      { purchaseCount: { $gte: 10 } }
    ]
  })
  .sort({ isFeatured: -1, averageRating: -1, purchaseCount: -1 })
  .limit(limit);
};

// Indexes for performance
productSchema.index({ name: 'text', description: 'text', tags: 'text' });
productSchema.index({ category: 1, isActive: 1 });
productSchema.index({ manufacturer: 1, isActive: 1 });
productSchema.index({ price: 1, isActive: 1 });
productSchema.index({ averageRating: -1, isActive: 1 });
productSchema.index({ purchaseCount: -1, isActive: 1 });
productSchema.index({ viewCount: -1, isActive: 1 });
productSchema.index({ createdAt: -1, isActive: 1 });
productSchema.index({ seller: 1, isActive: 1 });
productSchema.index({ tags: 1, isActive: 1 });
productSchema.index({ isFeatured: -1, isActive: 1 });
productSchema.index({ isOnSale: -1, isActive: 1 });
productSchema.index({ sku: 1 }, { unique: true, sparse: true });

// Compound indexes for common queries
productSchema.index({ category: 1, averageRating: -1, isActive: 1 });
productSchema.index({ manufacturer: 1, category: 1, isActive: 1 });
productSchema.index({ price: 1, category: 1, isActive: 1 });

module.exports = mongoose.model('Product', productSchema);