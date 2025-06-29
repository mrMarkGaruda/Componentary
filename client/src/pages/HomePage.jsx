import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { fetchProductsWithFilters, getProductFilterOptions } from '../utils/api';
import ProductList from '../components/ProductList';
import ProductFilters from '../components/ProductFilters';
import RecommendationSection from '../components/RecommendationSection';
import { useAuth } from '../contexts/AuthContext';
import { isTokenValid } from '../utils/auth';

const HomePage = () => {
  const [productsData, setProductsData] = useState({ products: [], totalPages: 1, currentPage: 1, totalProducts: 0 });
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [recommendedProducts, setRecommendedProducts] = useState([]);
  const [trendingProducts, setTrendingProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({});
  const [availableFilters, setAvailableFilters] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [heroImageLoaded, setHeroImageLoaded] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const { user, isLoggedIn } = useAuth();

  const parseQueryParams = useCallback(() => {
    const params = new URLSearchParams(location.search);
    const newFilters = {};
    params.forEach((value, key) => {
      if (key === 'page' || key === 'searchTerm' || key === 'sortBy' || key === 'sortOrder') {
        // Handled separately
      } else {
        newFilters[key] = value;
      }
    });
    setSearchTerm(params.get('searchTerm') || '');
    setSortBy(params.get('sortBy') || 'createdAt');
    setSortOrder(params.get('sortOrder') || 'desc');
    return newFilters;
  }, [location.search]);

  useEffect(() => {
    const initialFilters = parseQueryParams();
    setFilters(initialFilters);
    fetchFilterOptions();
    loadHomePageData();
    
    // Preload hero image
    const heroImageUrl = 'https://images.unsplash.com/photo-1593640408182-31c70c8268f5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
    const img = new Image();
    img.onload = () => setHeroImageLoaded(true);
    img.onerror = () => {
      console.warn('Hero image failed to load, using fallback');
      setHeroImageLoaded(false);
    };
    img.src = heroImageUrl;
  }, [location.search, parseQueryParams]);

  const loadProducts = useCallback(async (currentPage = 1, currentFilters = null, currentSearchTerm = null, currentSortBy = null, currentSortOrder = null) => {
    try {
      // Use current state if no parameters provided
      const effectiveFilters = currentFilters !== null ? currentFilters : filters;
      const effectiveSearchTerm = currentSearchTerm !== null ? currentSearchTerm : searchTerm;
      const effectiveSortBy = currentSortBy !== null ? currentSortBy : sortBy;
      const effectiveSortOrder = currentSortOrder !== null ? currentSortOrder : sortOrder;
      
      const queryParams = {
        ...effectiveFilters,
        page: currentPage,
        limit: 12, 
        searchTerm: effectiveSearchTerm,
        sortBy: effectiveSortBy,
        sortOrder: effectiveSortOrder,
      };
      Object.keys(queryParams).forEach(key => 
        (queryParams[key] === '' || queryParams[key] === null || queryParams[key] === undefined) && delete queryParams[key]
      );

      console.log('Loading products with query params:', queryParams);
      const data = await fetchProductsWithFilters(queryParams);
      console.log('Received products data:', data);
      setProductsData(data);
      const searchParams = new URLSearchParams(queryParams).toString();
      navigate(`${location.pathname}?${searchParams}`, { replace: true });

    } catch (err) {
      setError('Failed to load products. Please try again later.');
      console.error("Product loading error:", err);
    }
  }, [filters, searchTerm, sortBy, sortOrder, navigate, location.pathname]);

  const loadHomePageData = async () => {
    setLoading(true);
    try {
      // Load featured products (highest rated)
      const featuredResponse = await fetchProductsWithFilters({
        limit: 8,
        sortBy: 'averageRating',
        sortOrder: 'desc'
      });
      setFeaturedProducts(featuredResponse.products);

      // Load trending products (most recently added)
      const trendingResponse = await fetchProductsWithFilters({
        limit: 6,
        sortBy: 'createdAt',
        sortOrder: 'desc'
      });
      setTrendingProducts(trendingResponse.products);

      // Load personalized recommendations if user is authenticated
      if (isLoggedIn && user && isTokenValid()) {
        try {
          const token = localStorage.getItem('token');
          if (!token) {
            console.log('No authentication token found');
            return;
          }

          const recommendationsResponse = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/recommendations/user/${user.id}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (recommendationsResponse.ok) {
            const recommendations = await recommendationsResponse.json();
            setRecommendedProducts(recommendations.slice(0, 8));
          } else if (recommendationsResponse.status === 401) {
            console.log('Authentication failed, clearing invalid token');
            localStorage.removeItem('token');
            localStorage.removeItem('currentUser');
          } else {
            console.log('Failed to load recommendations:', recommendationsResponse.status);
          }
        } catch (err) {
          console.log('Recommendations not available:', err.message);
        }
      }

      // Load initial products with filters
      const currentPageFromUrl = parseInt(new URLSearchParams(location.search).get('page')) || 1;
      await loadProducts(currentPageFromUrl, filters, searchTerm, sortBy, sortOrder);

    } catch (err) {
      setError('Failed to load homepage data. Please try again later.');
      console.error("Homepage loading error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Separate useEffect to handle filter, search, and sort changes
  useEffect(() => {
    // Don't run on initial mount - handled by loadHomePageData
    if (loading) return;
    
    console.log('Filters or sort changed, reloading products...');
    loadProducts(1);
  }, [filters, searchTerm, sortBy, sortOrder, loading]);

  const fetchFilterOptions = async () => {
    try {
      const filterOptions = await getProductFilterOptions();
      setAvailableFilters(filterOptions);
    } catch (err) {
      console.error("Failed to load filter options:", err);
    }
  };

  const handleFilterChange = (filterType, value) => {
    console.log('Filter change:', filterType, value);
    setFilters(prevFilters => {
      const newFilters = { ...prevFilters };
      
      if (value === '' || value === null || value === undefined || (Array.isArray(value) && value.length === 0)) {
        // Remove the filter if the value is empty
        delete newFilters[filterType];
      } else {
        newFilters[filterType] = value;
      }
      
      console.log('New filters state:', newFilters);
      return newFilters;
    });
    
    // Use a separate effect to handle the actual filtering
    // This will be handled by the useEffect below
  };

  const handlePageChange = (pageNumber) => {
    loadProducts(pageNumber, filters, searchTerm, sortBy, sortOrder);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    loadProducts(1, filters, searchTerm, sortBy, sortOrder);
  };
  
  const handleSortChange = (e) => {
    const { name, value } = e.target;
    if (name === 'sortBy') {
      setSortBy(value);
    }
    if (name === 'sortOrder') {
      setSortOrder(value);
    }
    // The useEffect will handle the actual loading
  };

  const handleClearFilters = () => {
    setFilters({});
    setSearchTerm('');
    setSortBy('createdAt');
    setSortOrder('desc');
    navigate('/');
  };

  // Enhanced hero section for better visual appeal
  const renderHeroSection = () => {
    const heroImageUrl = 'https://images.unsplash.com/photo-1593640408182-31c70c8268f5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
    
    const heroStyle = heroImageLoaded 
      ? {
          backgroundImage: `linear-gradient(rgba(44, 62, 80, 0.8), rgba(215, 86, 64, 0.8)), url('${heroImageUrl}')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          borderRadius: '12px',
          minHeight: '500px',
          display: 'flex',
          alignItems: 'center'
        }
      : {
          background: 'linear-gradient(135deg, var(--primary-color), var(--secondary-color))',
          borderRadius: '12px',
          minHeight: '500px',
          display: 'flex',
          alignItems: 'center'
        };

    return (
      <div className="hero-section text-white py-5 mb-4" style={heroStyle}>
        <div className="container text-center">
          <h1 className="display-4 fw-bold mb-3" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>
            <i className="bi bi-cpu me-3"></i>
            Welcome to Componentary
          </h1>
          <p className="lead mb-4" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>
            Your one-stop marketplace for PC components and hardware
          </p>
          <div className="row justify-content-center">
            <div className="col-md-8">
              <div className="search-container" style={{
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
                padding: '1rem',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.2)'
              }}>
                <div className="d-flex align-items-center">
                  <input
                    type="text"
                    className="form-control form-control-lg me-2"
                    placeholder="Search for components, brands, or models..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && loadProducts(1)}
                    style={{
                      background: 'rgba(255, 255, 255, 0.9)',
                      border: 'none',
                      color: '#333'
                    }}
                  />
                  <button 
                    className="btn btn-primary btn-lg"
                    onClick={() => loadProducts(1)}
                    style={{
                      background: 'var(--primary-color)',
                      border: 'none',
                      boxShadow: '0 4px 12px rgba(215, 86, 64, 0.3)'
                    }}
                  >
                    <i className="bi bi-search me-2"></i>Search
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="row mt-5">
            <div className="col-md-3">
              <div className="feature-card text-center" style={{
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
                padding: '1.5rem',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                marginBottom: '1rem'
              }}>
                <i className="bi bi-truck display-6 mb-2" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}></i>
                <h6 style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>Fast Shipping</h6>
              </div>
            </div>
            <div className="col-md-3">
              <div className="feature-card text-center" style={{
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
                padding: '1.5rem',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                marginBottom: '1rem'
              }}>
                <i className="bi bi-shield-check display-6 mb-2" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}></i>
                <h6 style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>Quality Assured</h6>
              </div>
            </div>
            <div className="col-md-3">
              <div className="feature-card text-center" style={{
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
                padding: '1.5rem',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                marginBottom: '1rem'
              }}>
                <i className="bi bi-headset display-6 mb-2" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}></i>
                <h6 style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>24/7 Support</h6>
              </div>
            </div>
            <div className="col-md-3">
              <div className="feature-card text-center" style={{
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
                padding: '1.5rem',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                marginBottom: '1rem'
              }}>
                <i className="bi bi-award display-6 mb-2" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}></i>
                <h6 style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>Best Prices</h6>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Enhanced quick categories section
  const renderQuickCategories = () => (
    <div className="quick-categories mb-4">
      <h3 className="text-center mb-4">
        <i className="bi bi-grid me-2"></i>Shop by Category
      </h3>
      <div className="row g-3">
        {/*
          { name: 'Graphics Cards', icon: 'bi-gpu-card', color: '#e74c3c' },
          { name: 'Processors', icon: 'bi-cpu', color: '#3498db' },
          { name: 'Motherboards', icon: 'bi-motherboard', color: '#2ecc71' },
          { name: 'Memory', icon: 'bi-memory', color: '#f39c12' },
          { name: 'Storage', icon: 'bi-device-hdd', color: '#9b59b6' },
          { name: 'Power Supplies', icon: 'bi-lightning', color: '#e67e22' }
        ].map((category, index) => (
          <div key={index} className="col-md-2 col-6">
            <div 
              className="category-card text-center p-3 h-100 cursor-pointer"
              onClick={() => handleFilterChange('category', category.name)}
              style={{ '--hover-color': category.color }}
            >
              <i className={`${category.icon} display-6 mb-2`} style={{ color: category.color }}></i>
              <h6 className="mb-0">{category.name}</h6>
            </div>
          </div>
        ))}
        */}
      </div>
    </div>
  );

  // Enhanced stats section
  const renderStatsSection = () => (
    <div className="stats-section bg-dark py-4 mb-4" style={{ borderRadius: '12px' }}>
      <div className="container">
        <div className="row text-center">
          <div className="col-md-3">
            <div className="stat-item">
              <h3 className="text-primary">{productsData.totalProducts || 0}+</h3>
              <p className="mb-0">Products Available</p>
            </div>
          </div>
          <div className="col-md-3">
            <div className="stat-item">
              <h3 className="text-success">99.9%</h3>
              <p className="mb-0">Customer Satisfaction</p>
            </div>
          </div>
          <div className="col-md-3">
            <div className="stat-item">
              <h3 className="text-warning">24/7</h3>
              <p className="mb-0">Support Available</p>
            </div>
          </div>
          <div className="col-md-3">
            <div className="stat-item">
              <h3 className="text-info">Fast</h3>
              <p className="mb-0">Free Shipping</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-vh-100">
      {/* Enhanced Hero Section */}
      {renderHeroSection()}

      {/* Quick Categories */}
      {renderQuickCategories()}

      {/* Stats Section */}
      {renderStatsSection()}

      <div className="container-fluid">
        {/* Personalized Recommendations Section */}
        <RecommendationSection />
        {/* Trending Products Section */}
        {trendingProducts.length > 0 && (
          <div className="mb-5">
            <div className="d-flex align-items-center justify-content-between mb-4">
              <div>
                <h2 className="h3 fw-bold text-light mb-1">
                  <i className="bi bi-fire text-primary me-2"></i>Trending Now
                </h2>
                <p className="text-muted mb-0">Latest arrivals and hot picks</p>
              </div>
              <Link to="/products?sortBy=createdAt&sortOrder=desc" className="btn btn-outline-primary">
                View All <i className="bi bi-arrow-right ms-1"></i>
              </Link>
            </div>
            <ProductList products={trendingProducts} />
          </div>
        )}

        {/* Featured Products Section */}
        {featuredProducts.length > 0 && (
          <div className="mb-5">
            <div className="d-flex align-items-center justify-content-between mb-4">
              <div>
                <h2 className="h3 fw-bold text-light mb-1">
                  <i className="bi bi-star-fill text-warning me-2"></i>Top Rated
                </h2>
                <p className="text-muted mb-0">Highest rated products by our community</p>
              </div>
              <Link to="/products?sortBy=averageRating&sortOrder=desc" className="btn btn-outline-primary">
                View All <i className="bi bi-arrow-right ms-1"></i>
              </Link>
            </div>
            <ProductList products={featuredProducts} />
          </div>
        )}

        {/* Main Products Section with Filters */}
        <div className="products-layout">
          <div className="filter-sidebar">
            {availableFilters ? (
              <ProductFilters 
                filters={filters}
                onFilterChange={handleFilterChange}
                availableFilters={availableFilters}
                onClearFilters={handleClearFilters}
              />
            ) : (
              <div className="filter-sidebar">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5 className="mb-0">
                    <i className="bi bi-funnel me-2"></i>Filters
                  </h5>
                  <div className="loading-spinner"></div>
                </div>
                <p className="text-muted">Loading filters...</p>
              </div>
            )}
          </div>

          <div className="products-grid">
            {/* Search and Sort Controls */}
            <div className="card mb-4">
              <div className="card-body">
                <div className="row align-items-center">
                  <div className="col-md-8 mb-3 mb-md-0">
                    <form onSubmit={handleSearch}>
                      <div className="input-group">
                        <input 
                          type="text" 
                          className="form-control form-control-lg"
                          placeholder="Search for components, brands, or specifications..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <button className="btn btn-primary" type="submit">
                          <i className="bi bi-search"></i>
                        </button>
                      </div>
                    </form>
                  </div>
                  <div className="col-md-4">
                    <div className="row g-2">
                      <div className="col-6">
                        <select 
                          name="sortBy" 
                          value={sortBy} 
                          onChange={handleSortChange}
                          className="form-select"
                        >
                          <option value="createdAt">Newest</option>
                          <option value="price">Price</option>
                          <option value="name">Name</option>
                          <option value="averageRating">Rating</option>
                          {searchTerm && <option value="score">Relevance</option>}
                        </select>
                      </div>
                      <div className="col-6">
                        <select 
                          name="sortOrder" 
                          value={sortOrder} 
                          onChange={handleSortChange}
                          className="form-select"
                        >
                          <option value="asc">↑ Asc</option>
                          <option value="desc">↓ Desc</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Results Summary */}
            <div className="d-flex align-items-center justify-content-between mb-4">
              <p className="text-muted mb-0">
                Showing <span className="text-primary fw-semibold">{productsData.products.length}</span> of{' '}
                <span className="text-primary fw-semibold">{productsData.totalProducts}</span> products
              </p>
              {Object.keys(filters).length > 0 && (
                <button className="btn btn-outline-secondary btn-sm" onClick={handleClearFilters}>
                  <i className="bi bi-x-circle me-1"></i>Clear Filters
                </button>
              )}
            </div>

            {/* Products Grid */}
            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" style={{ width: '3rem', height: '3rem' }} role="status">
                  <span className="visually-hidden">Loading products...</span>
                </div>
                <p className="mt-3 text-muted">Loading products...</p>
              </div>
            ) : error ? (
              <div className="alert alert-danger" role="alert">
                <i className="bi bi-exclamation-triangle me-2"></i>
                {error}
              </div>
            ) : (
              <ProductList products={productsData.products} />
            )}

            {/* Pagination */}
            {!loading && productsData.totalPages > 1 && (
              <nav className="mt-5">
                <ul className="pagination justify-content-center">
                  <li className={`page-item ${productsData.currentPage === 1 ? 'disabled' : ''}`}>
                    <button 
                      className="page-link" 
                      onClick={() => handlePageChange(productsData.currentPage - 1)}
                      disabled={productsData.currentPage === 1}
                    >
                      <i className="bi bi-chevron-left"></i>
                    </button>
                  </li>
                  {[...Array(productsData.totalPages).keys()].map(num => (
                    <li 
                      key={num + 1} 
                      className={`page-item ${num + 1 === productsData.currentPage ? 'active' : ''}`}
                    >
                      <button 
                        className="page-link" 
                        onClick={() => handlePageChange(num + 1)}
                      >
                        {num + 1}
                      </button>
                    </li>
                  ))}
                  <li className={`page-item ${productsData.currentPage === productsData.totalPages ? 'disabled' : ''}`}>
                    <button 
                      className="page-link" 
                      onClick={() => handlePageChange(productsData.currentPage + 1)}
                      disabled={productsData.currentPage === productsData.totalPages}
                    >
                      <i className="bi bi-chevron-right"></i>
                    </button>
                  </li>
                </ul>
              </nav>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;