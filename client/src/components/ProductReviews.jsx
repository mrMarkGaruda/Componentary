import React, { useState, useEffect } from 'react';
import { getCurrentUser } from '../utils/auth';

const ProductReviews = ({ productId }) => {
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);
  const [fetching, setFetching] = useState(true);
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [editRating, setEditRating] = useState(5);
  const [editComment, setEditComment] = useState('');
  const user = getCurrentUser();

  // Fetch reviews from backend
  const fetchReviews = async () => {
    setFetching(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/products/${productId}/reviews`);
      if (response.ok) {
        const data = await response.json();
        setReviews(data.reviews || []);
        setAverageRating(data.averageRating || 0);
        setReviewCount(data.reviewCount || 0);
      } else {
        setReviews([]);
        setAverageRating(0);
        setReviewCount(0);
      }
    } catch (error) {
      setReviews([]);
      setAverageRating(0);
      setReviewCount(0);
    }
    setFetching(false);
  };

  useEffect(() => {
    fetchReviews();
    // eslint-disable-next-line
  }, [productId]);

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
        setComment('');
        setRating(5);
        setShowForm(false);
        await fetchReviews();
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

  const handleEditReview = (review) => {
    setEditingReviewId(review._id);
    setEditRating(review.rating);
    setEditComment(review.comment);
  };

  const handleCancelEdit = () => {
    setEditingReviewId(null);
    setEditRating(5);
    setEditComment('');
  };

  const handleSubmitEdit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/reviews/${editingReviewId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ rating: editRating, comment: editComment })
      });
      if (response.ok) {
        await fetchReviews();
        handleCancelEdit();
        alert('Review updated successfully!');
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update review');
      }
    } catch (error) {
      alert(error.message || 'Failed to update review. Please try again.');
    }
    setLoading(false);
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;
    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/reviews/${reviewId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        await fetchReviews();
        alert('Review deleted successfully!');
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete review');
      }
    } catch (error) {
      alert(error.message || 'Failed to delete review. Please try again.');
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
        <h5>Customer Reviews ({reviewCount})</h5>
        {averageRating > 0 && (
          <div className="d-flex align-items-center gap-2">
            {renderStars(Math.round(averageRating))}
            <span className="text-muted">{averageRating.toFixed(2)} / 5</span>
          </div>
        )}
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

      {fetching ? (
        <div className="text-center py-4">
          <span className="spinner-border text-primary" role="status"></span>
        </div>
      ) : reviews.length === 0 ? (
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
                {user && review.user && review.user._id === user.id && (
                  <div className="d-flex gap-2">
                    <button className="btn btn-sm btn-outline-secondary" onClick={() => handleEditReview(review)}>
                      <i className="bi bi-pencil"></i> Edit
                    </button>
                    <button className="btn btn-sm btn-outline-danger" onClick={() => handleDeleteReview(review._id)}>
                      <i className="bi bi-trash"></i> Delete
                    </button>
                  </div>
                )}
              </div>
              {editingReviewId === review._id ? (
                <form onSubmit={handleSubmitEdit} className="ms-5 mt-2">
                  <div className="mb-2">
                    {renderStars(editRating, true, setEditRating)}
                    <span className="ms-2 text-muted">({editRating} stars)</span>
                  </div>
                  <div className="mb-2">
                    <textarea
                      className="form-control"
                      rows="3"
                      value={editComment}
                      onChange={(e) => setEditComment(e.target.value)}
                      required
                    />
                  </div>
                  <div className="d-flex gap-2">
                    <button type="submit" className="btn btn-primary btn-sm" disabled={loading}>
                      {loading ? 'Saving...' : 'Save'}
                    </button>
                    <button type="button" className="btn btn-secondary btn-sm" onClick={handleCancelEdit}>
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                review.comment && (
                  <p className="text-muted mb-0 ms-5">
                    {review.comment}
                  </p>
                )
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductReviews;
