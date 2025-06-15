const mongoose = require('mongoose')
const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  image: { type: String, required: true }, // Ensure this stores a URL or path to the image
  category: {
    type: String,
    required: true,
    enum: [
      'CPU', // Central Processing Unit
      'GPU', // Graphics Processing Unit
      'Motherboard',
      'RAM', // Random Access Memory
      'Storage', // SSD, HDD, NVMe
      'PSU', // Power Supply Unit
      'Case', // PC Case
      'Cooling', // CPU Coolers, Case Fans, Liquid Coolers
      'Monitor',
      'Keyboard',
      'Mouse',
      'Networking', // Network Cards, Routers, Switches
      'Audio', // Sound Cards, Headsets, Speakers
      'Software', // Operating Systems, Productivity Software
      'Accessories', // Cables, Adapters, Peripherals
      'Prebuilt', // Prebuilt PCs
      'Laptop',
      'Other', // Other components or related items
    ],
  },
  manufacturer: { type: String, required: true, trim: true }, // e.g., "Intel", "NVIDIA", "ASUS"
  modelNumber: { type: String, trim: true }, // e.g., "BX8070110900K", "RTX 3080"
  specifications: { type: mongoose.Schema.Types.Mixed }, // Flexible field for component-specific details
  // Example for specifications:
  // For CPU: { cores: 8, threads: 16, clockSpeed: "3.8GHz", socket: "LGA1200" }
  // For GPU: { memory: "10GB GDDR6X", boostClock: "1.71GHz", chipset: "GeForce RTX 3080" }
  // For RAM: { capacity: "16GB", type: "DDR4", speed: "3200MHz", modules: "2x8GB" }
  tags: [String], // e.g., ["gaming", "ddr5", "rgb"]
  stock: { type: Number, required: true, min: 0, default: 0 },
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  ratings: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    rating: { type: Number, min: 1, max: 5, required: true },
    comment: String,
    createdAt: { type: Date, default: Date.now }
  }],
  averageRating: { type: Number, default: 0, min: 0, max: 5 },
  totalRatings: { type: Number, default: 0, min: 0 }
}, { timestamps: true })

// Method to calculate average rating
productSchema.methods.calculateAverageRating = function() {
  if (this.ratings.length === 0) {
    this.averageRating = 0
    this.totalRatings = 0
  } else {
    const sum = this.ratings.reduce((acc, item) => acc + item.rating, 0)
    this.averageRating = parseFloat((sum / this.ratings.length).toFixed(2)) // Round to 2 decimal places
    this.totalRatings = this.ratings.length
  }
}

// Pre-save hook to update average rating
productSchema.pre('save', function(next) {
  this.calculateAverageRating()
  next()
})

// Indexing for frequently queried fields
productSchema.index({ name: 'text', description: 'text', category: 1, manufacturer: 1, tags: 1 });
productSchema.index({ price: 1 });
productSchema.index({ averageRating: -1 });
productSchema.index({ seller: 1 });

module.exports = mongoose.model('Product', productSchema)