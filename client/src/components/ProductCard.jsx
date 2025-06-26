import React from 'react';
import { Link } from 'react-router-dom';
import { isAuthenticated, getCurrentUser } from '../utils/auth';
import { useCart } from '../contexts/CartContext';
import noImage from '../assets/no-image.png';

const ProductCard = ({ product }) => {
  const authenticated = isAuthenticated();
  const user = getCurrentUser();
  const userRole = user?.role;
  const { addToCart } = useCart();
  
  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<i key={i} className="bi bi-star-fill text-warning"></i>);
    }

    if (hasHalfStar) {
      stars.push(<i key="half" className="bi bi-star-half text-warning"></i>);
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<i key={`empty-${i}`} className="bi bi-star text-muted"></i>);
    }

    return stars;
  };

  return (
    <div className="col">
      <div className="card h-100 product-card">
        <div className="position-relative overflow-hidden">
          <img 
            src={product.image} 
            className="card-img-top" 
            alt={product.name}
            style={{ height: '220px', objectFit: 'cover', transition: 'transform 0.3s ease' }}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = noImage;
            }}
            onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
            onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
          />
          {product.averageRating > 0 && (
            <div className="position-absolute top-0 end-0 m-2">
              <span className="badge bg-dark bg-opacity-75 text-warning">
                <i className="bi bi-star-fill me-1"></i>
                {product.averageRating.toFixed(1)}
              </span>
            </div>
          )}
          {product.isNew && (
            <div className="position-absolute top-0 start-0 m-2">
              <span className="badge bg-primary">New</span>
            </div>
          )}
        </div>

        <div className="card-body d-flex flex-column">
          <h5 className="card-title text-light mb-2 fw-semibold" style={{ fontSize: '1.1rem', lineHeight: '1.3' }}>
            {product.name}
          </h5>
          
          <div className="mb-2">
            <div className="d-flex align-items-center gap-1 mb-1">
              {product.averageRating > 0 ? (
                <>
                  {renderStars(product.averageRating)}
                  <small className="text-muted ms-1">
                    ({product.reviewCount || 0})
                  </small>
                </>
              ) : (
                <small className="text-muted">No reviews yet</small>
              )}
            </div>
          </div>

          <div className="mb-3">
            <div className="d-flex align-items-center justify-content-between">
              <div className="h4 text-primary mb-0 fw-bold">
                ${product.price.toFixed(2)}
              </div>
              {product.originalPrice && product.originalPrice > product.price && (
                <small className="text-muted text-decoration-line-through">
                  ${product.originalPrice.toFixed(2)}
                </small>
              )}
            </div>
          </div>

          <p className="card-text text-muted flex-grow-1" style={{ 
            fontSize: '0.9rem', 
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical'
          }}>
            {product.description}
          </p>

          {product.specifications && (
            <div className="mb-3">
              <div className="d-flex flex-wrap gap-1">
                {Object.entries(product.specifications).slice(0, 2).map(([key, value]) => (
                  <span key={key} className="badge bg-secondary text-xs">
                    {key}: {value}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="mt-auto">
            <div className="d-flex gap-2 mb-2">
              <Link 
                to={`/product/${product._id}`} 
                className="btn btn-outline-primary flex-grow-1"
              >
                <i className="bi bi-eye me-1"></i>
                View Details
              </Link>
              {authenticated && (
                <button 
                  className="btn btn-primary px-3"
                  onClick={handleAddToCart}
                  title="Add to Cart"
                >
                  <i className="bi bi-cart-plus"></i>
                </button>
              )}
            </div>

            {authenticated && (userRole === 'admin' || 
              (userRole === 'seller' && product.seller === user.id)) && (
              <Link 
                to={`/product/edit/${product._id}`} 
                className="btn btn-outline-secondary btn-sm w-100"
              >
                <i className="bi bi-pencil me-1"></i>
                Edit Product
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;