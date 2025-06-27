const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true, lowercase: true },
  password: { type: String, required: true, minlength: 6 },
  role: { type: String, enum: ['admin', 'seller', 'customer'], default: 'customer' },
  avatar: { type: String, default: null },
  isActive: { type: Boolean, default: true },
  emailVerified: { type: Boolean, default: false },
  
  // Profile information
  profile: {
    firstName: String,
    lastName: String,
    phone: String,
    dateOfBirth: Date,
    bio: String
  },
  
  // Preferences for recommendations
  preferences: {
    categories: [String],
    manufacturers: [String],
    priceRange: {
      min: { type: Number, default: 0 },
      max: { type: Number, default: 1000 }
    },
    tags: [String],
    notifications: {
      email: { type: Boolean, default: true },
      sms: { type: Boolean, default: false },
      push: { type: Boolean, default: true }
    },
    privacy: {
      shareViewHistory: { type: Boolean, default: true },
      sharePurchaseHistory: { type: Boolean, default: false },
      allowRecommendations: { type: Boolean, default: true }
    }
  },
  
  // Address information
  addresses: [{
    type: {
      type: String,
      enum: ['home', 'work', 'other'],
      default: 'home'
    },
    isDefault: { type: Boolean, default: false },
    street: String,
    apartment: String,
    city: String,
    state: String,
    zipCode: String,
    country: String,
    instructions: String
  }],
  
  // Purchase and interaction history
  purchaseHistory: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
    quantity: Number,
    price: Number,
    purchaseDate: { type: Date, default: Date.now },
    rating: { type: Number, min: 1, max: 5 },
    reviewed: { type: Boolean, default: false }
  }],
  
  viewHistory: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    viewedAt: { type: Date, default: Date.now },
    duration: Number, // seconds spent viewing
    source: String // how they got to the product
  }],
  
  searchHistory: [{
    query: String,
    filters: mongoose.Schema.Types.Mixed,
    resultsCount: Number,
    clickedResults: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
    searchedAt: { type: Date, default: Date.now }
  }],
  
  wishlist: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    addedAt: { type: Date, default: Date.now },
    priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' }
  }],
  
  cart: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    quantity: { type: Number, default: 1 },
    addedAt: { type: Date, default: Date.now },
    lastModified: { type: Date, default: Date.now }
  }],
  
  // Analytics and behavior
  analytics: {
    totalSpent: { type: Number, default: 0 },
    totalOrders: { type: Number, default: 0 },
    averageOrderValue: { type: Number, default: 0 },
    favoriteCategory: String,
    favoriteManufacturer: String,
    averageSessionDuration: Number, // minutes
    lastActiveDate: Date,
    loginCount: { type: Number, default: 0 },
    deviceInfo: {
      userAgent: String,
      platform: String,
      browser: String
    }
  },
  
  // Seller specific fields
  sellerInfo: {
    businessName: String,
    businessType: String,
    taxId: String,
    bankAccount: {
      accountNumber: String,
      routingNumber: String,
      bankName: String
    },
    rating: { type: Number, default: 0 },
    totalSales: { type: Number, default: 0 },
    commission: { type: Number, default: 0.15 }, // 15% default commission
    verified: { type: Boolean, default: false }
  },
  
  // Security and verification
  security: {
    lastPasswordChange: Date,
    failedLoginAttempts: { type: Number, default: 0 },
    accountLockedUntil: Date,
    twoFactorEnabled: { type: Boolean, default: false },
    twoFactorSecret: String,
    loginHistory: [{
      ip: String,
      userAgent: String,
      loginAt: { type: Date, default: Date.now },
      location: String
    }]
  },
  
  // Communication preferences
  communications: [{
    type: String, // email, sms, push
    content: String,
    sentAt: Date,
    readAt: Date,
    responded: Boolean
  }],
  
  // Subscription and loyalty
  subscription: {
    type: { type: String, enum: ['free', 'premium', 'enterprise'], default: 'free' },
    startDate: Date,
    endDate: Date,
    autoRenew: { type: Boolean, default: false }
  },
  
  loyaltyPoints: { type: Number, default: 0 },
  referralCode: String,
  referredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  
  // Metadata
  source: String, // How they signed up
  lastSyncDate: Date,
  dataQualityScore: { type: Number, min: 0, max: 100, default: 100 }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtuals
userSchema.virtual('fullName').get(function() {
  if (this.profile?.firstName && this.profile?.lastName) {
    return `${this.profile.firstName} ${this.profile.lastName}`;
  }
  return this.name;
});

userSchema.virtual('defaultAddress').get(function() {
  if (!this.addresses || this.addresses.length === 0) return null;
  return this.addresses.find(addr => addr.isDefault) || this.addresses[0];
});

userSchema.virtual('cartItemsCount').get(function() {
  if (!this.cart || this.cart.length === 0) return 0;
  return this.cart.reduce((total, item) => total + (item.quantity || 0), 0);
});

userSchema.virtual('wishlistItemsCount').get(function() {
  if (!this.wishlist || this.wishlist.length === 0) return 0;
  return this.wishlist.length;
});

// Methods
userSchema.methods.comparePassword = function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.addToCart = function(productId, quantity = 1) {
  const existingItem = this.cart.find(item => item.product.toString() === productId.toString());
  
  if (existingItem) {
    existingItem.quantity += quantity;
    existingItem.lastModified = new Date();
  } else {
    this.cart.push({ product: productId, quantity });
  }
  
  return this.save();
};

userSchema.methods.removeFromCart = function(productId) {
  this.cart = this.cart.filter(item => item.product.toString() !== productId.toString());
  return this.save();
};

userSchema.methods.addToWishlist = function(productId, priority = 'medium') {
  const exists = this.wishlist.find(item => item.product.toString() === productId.toString());
  
  if (!exists) {
    this.wishlist.push({ product: productId, priority });
    return this.save();
  }
  
  return Promise.resolve(this);
};

userSchema.methods.removeFromWishlist = function(productId) {
  this.wishlist = this.wishlist.filter(item => item.product.toString() !== productId.toString());
  return this.save();
};

userSchema.methods.recordView = function(productId, duration = 0, source = 'direct') {
  // Remove old view of same product to avoid duplicates
  this.viewHistory = this.viewHistory.filter(view => 
    view.product.toString() !== productId.toString() || 
    (new Date() - view.viewedAt) > 86400000 // Keep if older than 24 hours
  );
  
  this.viewHistory.push({ product: productId, duration, source });
  
  // Keep only last 100 views
  if (this.viewHistory.length > 100) {
    this.viewHistory = this.viewHistory.slice(-100);
  }
  
  this.analytics.lastActiveDate = new Date();
  return this.save();
};

userSchema.methods.recordSearch = function(query, filters = {}, resultsCount = 0) {
  this.searchHistory.push({ query, filters, resultsCount });
  
  // Keep only last 50 searches
  if (this.searchHistory.length > 50) {
    this.searchHistory = this.searchHistory.slice(-50);
  }
  
  return this.save();
};

userSchema.methods.updateAnalytics = function(orderValue = 0) {
  if (orderValue > 0) {
    this.analytics.totalSpent += orderValue;
    this.analytics.totalOrders += 1;
    this.analytics.averageOrderValue = this.analytics.totalSpent / this.analytics.totalOrders;
  }
  
  this.analytics.lastActiveDate = new Date();
  return this.save();
};

userSchema.methods.addLoyaltyPoints = function(points) {
  this.loyaltyPoints += points;
  return this.save();
};

userSchema.methods.canAccess = function(resource) {
  if (this.role === 'admin') return true;
  if (this.role === 'seller' && ['product', 'order', 'analytics'].includes(resource)) return true;
  if (this.role === 'customer' && ['profile', 'orders', 'wishlist'].includes(resource)) return true;
  return false;
};

// Static methods
userSchema.statics.findByEmail = function(email) {
  return this.findOne({ email: email.toLowerCase() });
};

userSchema.statics.findActive = function() {
  return this.find({ isActive: true });
};

userSchema.statics.findByRole = function(role) {
  return this.find({ role, isActive: true });
};

// Pre-save hooks
userSchema.pre('save', async function(next) {
  // Hash password if modified
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
    this.security.lastPasswordChange = new Date();
  }
  
  // Generate referral code if new user
  if (this.isNew && !this.referralCode) {
    this.referralCode = Math.random().toString(36).substring(2, 8).toUpperCase();
  }
  
  // Update default address logic
  if (this.addresses && this.addresses.length > 0) {
    const defaultExists = this.addresses.some(addr => addr.isDefault);
    if (!defaultExists) {
      this.addresses[0].isDefault = true;
    }
  }
  
  next();
});

// Indexes
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ role: 1, isActive: 1 });
userSchema.index({ 'analytics.lastActiveDate': -1 });
userSchema.index({ 'preferences.categories': 1 });
userSchema.index({ referralCode: 1 }, { unique: true, sparse: true });
userSchema.index({ 'purchaseHistory.product': 1 });
userSchema.index({ 'viewHistory.product': 1 });
userSchema.index({ 'wishlist.product': 1 });

module.exports = mongoose.model('User', userSchema);