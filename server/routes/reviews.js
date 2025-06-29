const express = require('express');
const Review = require('../models/Review');
const Product = require('../models/Product');
const auth = require('../middleware/auth');
const roles = require('../middleware/roles');
const router = express.Router();

// Edit a review (only by author)
router.put('/:reviewId', auth, async (req, res) => {
  try {
    const review = await Review.findById(req.params.reviewId);
    if (!review) return res.status(404).json({ message: 'Review not found' });
    if (review.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    review.rating = req.body.rating;
    review.comment = req.body.comment;
    review.updatedAt = new Date();
    await review.save();
    // Update product stats
    await updateProductStats(review.product);
    res.json(review);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete a review (by author or admin)
router.delete('/:reviewId', auth, async (req, res) => {
  try {
    const review = await Review.findById(req.params.reviewId);
    if (!review) return res.status(404).json({ message: 'Review not found' });
    if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    const productId = review.product;
    await review.deleteOne();
    // Update product stats
    await updateProductStats(productId);
    res.json({ message: 'Review deleted' });
  } catch (error) {
    res.status(400).json({ message: error.message });
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
