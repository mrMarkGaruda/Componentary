import React, { useState } from 'react';
import { getCurrentUser } from '../utils/auth';

const ProductReviews = ({ productId, reviews = [], onReviewAdded }) => {
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const user = getCurrentUser();

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!user) {
      alert('Please login to leave a review');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/products/${productId}/reviews`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ rating, comment })
      });

      if (response.ok) {
        const newReview = await response.json();
        setComment('');
        setRating(5);
        setShowForm(false);
        if (onReviewAdded) onReviewAdded(newReview);
        alert('Review submitted successfully!');
      } else {
        const error = await response.json();
        console.error('Review submission error:', error);
        throw new Error(error.message || 'Failed to submit review');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      alert(error.message || 'Failed to submit review. Please try again.');
    }
    setLoading(false);
  };

  const renderStars = (rating, isInteractive = false, onRatingChange = null) => {
    return (
      <div className="stars d-flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <i
            key={star}
            className={`bi bi-star${star <= rating ? '-fill' : ''} ${isInteractive ? 'interactive-star' : ''}`}
            style={{ 
              color: star <= rating ? '#ffc107' : '#dee2e6', 
              cursor: isInteractive ? 'pointer' : 'default',
              fontSize: '18px'
            }}
            onClick={isInteractive ? () => onRatingChange(star) : undefined}
          ></i>
        ))}
      </div>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5>Customer Reviews ({reviews.length})</h5>
        {user && (
          <button 
            className="btn btn-outline-primary btn-sm"
            onClick={() => setShowForm(!showForm)}
          >
            <i className="bi bi-plus-circle me-1"></i>
            Write a Review
          </button>
        )}
      </div>

      {showForm && (
        <div className="card mb-4">
          <div className="card-body">
            <h6>Write Your Review</h6>
            <form onSubmit={handleSubmitReview}>
              <div className="mb-3">
                <label className="form-label">Rating</label>
                <div className="d-flex align-items-center">
                  {renderStars(rating, true, setRating)}
                  <span className="ms-2 text-muted">({rating} stars)</span>
                </div>
              </div>
              
              <div className="mb-3">
                <label className="form-label">Comment</label>
                <textarea
                  className="form-control"
                  rows="4"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share your experience with this product..."
                  required
                />
              </div>
              
              <div className="d-flex gap-2">
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Submitting...
                    </>
                  ) : (
                    'Submit Review'
                  )}
                </button>
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {reviews.length === 0 ? (
        <div className="text-center py-4">
          <i className="bi bi-chat-square-text display-4 text-muted"></i>
          <h6 className="mt-2">No reviews yet</h6>
          <p className="text-muted">Be the first to review this product!</p>
        </div>
      ) : (
        <div className="reviews-list">
          {reviews.map((review, index) => (
            <div key={index} className="review-item border-bottom pb-3 mb-3">
              <div className="d-flex justify-content-between align-items-start">
                <div className="d-flex align-items-center mb-2">
                  <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-2" 
                       style={{ width: '40px', height: '40px', fontSize: '14px' }}>
                    {review.user?.name?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <h6 className="mb-0">{review.user?.name || 'Anonymous'}</h6>
                    <div className="d-flex align-items-center">
                      {renderStars(review.rating)}
                      <small className="text-muted ms-2">
                        {formatDate(review.createdAt)}
                      </small>
                    </div>
                  </div>
                </div>
              </div>
              
              {review.comment && (
                <p className="text-muted mb-0 ms-5">
                  {review.comment}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductReviews;
