import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { fetchProductsWithFilters, getProductFilterOptions } from '../utils/api';
import ProductList from '../components/ProductList';
import ProductFilters from '../components/ProductFilters';
import { isAuthenticated, getCurrentUser, isTokenValid } from '../utils/auth';

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

  const location = useLocation();
  const navigate = useNavigate();
  const authenticated = isAuthenticated();
  const user = getCurrentUser();
  const userRole = user?.role;

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
  }, [location.search, parseQueryParams]);

  const fetchFilterOptions = async () => {
    try {
      const filterOptions = await getProductFilterOptions();
      setAvailableFilters(filterOptions);
    } catch (err) {
      console.error("Failed to load filter options:", err);
    }
  };

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
      if (authenticated && user && isTokenValid()) {
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

  const loadProducts = useCallback(async (currentPage = 1, currentFilters = filters, currentSearchTerm = searchTerm, currentSortBy = sortBy, currentSortOrder = sortOrder) => {
    try {
      const queryParams = {
        ...currentFilters,
        page: currentPage,
        limit: 12, 
        searchTerm: currentSearchTerm,
        sortBy: currentSortBy,
        sortOrder: currentSortOrder,
      };
      Object.keys(queryParams).forEach(key => 
        (queryParams[key] === '' || queryParams[key] === null || queryParams[key] === undefined) && delete queryParams[key]
      );

      const data = await fetchProductsWithFilters(queryParams);
      setProductsData(data);
      const searchParams = new URLSearchParams(queryParams).toString();
      navigate(`${location.pathname}?${searchParams}`, { replace: true });

    } catch (err) {
      setError('Failed to load products. Please try again later.');
      console.error("Product loading error:", err);
    }
  }, [filters, searchTerm, sortBy, sortOrder, navigate, location.pathname]);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
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
    if (name === 'sortBy') setSortBy(value);
    if (name === 'sortOrder') setSortOrder(value);
  };

  const handleClearFilters = () => {
    setFilters({});
    setSearchTerm('');
    setSortBy('createdAt');
    setSortOrder('desc');
    navigate('/');
  };

  return (
    <div className="min-vh-100">
      {/* Hero Section */}
      <div className="hero-section py-5 mb-5">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-6 fade-in-up">
              <h1 className="display-3 fw-bold text-light mb-4">
                Build Your Dream
                <span className="text-primary d-block">PC Setup</span>
              </h1>
              <p className="lead text-light mb-4" style={{ fontSize: '1.25rem', lineHeight: '1.6' }}>
                Discover premium PC components, gaming peripherals, and cutting-edge technology. 
                Join thousands of builders creating their perfect systems.
              </p>
              <div className="d-flex flex-wrap gap-3">
                {authenticated && (userRole === 'admin' || userRole === 'seller') ? (
                  <Link to="/product/new" className="btn btn-primary btn-lg px-4 py-3">
                    <i className="bi bi-plus-circle me-2"></i>List Your Product
                  </Link>
                ) : (
                  <Link to="/products" className="btn btn-primary btn-lg px-4 py-3">
                    <i className="bi bi-search me-2"></i>Browse Catalog
                  </Link>
                )}
                {!authenticated && (
                  <Link to="/signup" className="btn btn-outline-light btn-lg px-4 py-3">
                    <i className="bi bi-person-plus me-2"></i>Join Community
                  </Link>
                )}
              </div>
            </div>
            <div className="col-lg-6 text-center mt-5 mt-lg-0">
              <div className="position-relative">
                <img 
                  src="https://images.unsplash.com/photo-1593640408182-31c70c8268f5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                  alt="Gaming PC Setup"
                  className="img-fluid rounded-4 shadow-lg"
                  style={{ maxHeight: "400px", objectFit: "cover" }}
                />
                <div className="position-absolute top-0 start-0 w-100 h-100 bg-primary opacity-10 rounded-4"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container-fluid">
        {/* Personalized Recommendations Section */}
        {authenticated && recommendedProducts.length > 0 && (
          <div className="mb-5">
            <div className="d-flex align-items-center justify-content-between mb-4">
              <div>
                <h2 className="h3 fw-bold text-light mb-1">Recommended for You</h2>
                <p className="text-muted mb-0">Based on your browsing and purchase history</p>
              </div>
              <Link to="/products" className="btn btn-outline-primary">
                View All <i className="bi bi-arrow-right ms-1"></i>
              </Link>
            </div>
            <ProductList products={recommendedProducts} />
          </div>
        )}

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
        <div className="row">
          <div className="col-lg-3">
            <div className="sticky-top" style={{ top: '100px' }}>
              {availableFilters ? (
                <ProductFilters 
                  filters={filters}
                  onFilterChange={handleFilterChange}
                  availableFilters={availableFilters}
                  onClearFilters={handleClearFilters}
                />
              ) : (
                <div className="card">
                  <div className="card-body text-center">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading filters...</span>
                    </div>
                    <p className="mt-2 mb-0">Loading filters...</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="col-lg-9">
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