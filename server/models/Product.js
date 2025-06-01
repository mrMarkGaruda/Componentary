const mongoose = require('mongoose')
const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  image: { type: String, required: true },
  category: { type: String, required: true, enum: ['Electronics', 'Clothing', 'Books', 'Home', 'Sports', 'Other'] },
  tags: [String],
  stock: { type: Number, required: true, min: 0, default: 0 },
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  ratings: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    rating: { type: Number, min: 1, max: 5 },
    comment: String,
    createdAt: { type: Date, default: Date.now }
  }],
  averageRating: { type: Number, default: 0 },
  totalRatings: { type: Number, default: 0 }
}, { timestamps: true })
productSchema.methods.calculateAverageRating = function() {
  if (this.ratings.length === 0) {
    this.averageRating = 0
    this.totalRatings = 0
  } else {
    const sum = this.ratings.reduce((acc, rating) => acc + rating.rating, 0)
    this.averageRating = sum / this.ratings.length
    this.totalRatings = this.ratings.length
  }
}
module.exports = mongoose.model('Product', productSchema)