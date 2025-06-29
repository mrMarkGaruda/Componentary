import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { fetchProductsWithFilters, getProductFilterOptions } from '../utils/api';
import ProductList from '../components/ProductList';
import ProductFilters from '../components/ProductFilters';
import { useAuth } from '../contexts/AuthContext';

const ProductsPage = () => {
  const [productsData, setProductsData] = useState({ products: [], totalPages: 1, currentPage: 1, totalProducts: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({});
  const [availableFilters, setAvailableFilters] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  const location = useLocation();
  const navigate = useNavigate();
  const { user, isLoggedIn, userRole } = useAuth();

  const parseQueryParams = useCallback(() => {
    const params = new URLSearchParams(location.search);
    const newFilters = {};
    
    // Check if we have malformed URL parameters (like ?0=m&1=a...)
    let hasInvalidParams = false;
    params.forEach((value, key) => {
      if (!isNaN(key)) {
        hasInvalidParams = true;
      }
    });
    
    // If we have invalid params, clear them and return empty filters
    if (hasInvalidParams) {
      navigate('/products', { replace: true });
      return {};
    }
    
    params.forEach((value, key) => {
      if (key === 'page' || key === 'searchTerm' || key === 'sortBy' || key === 'sortOrder') {
        // Handled separately
      } else {
        newFilters[key] = value;
      }
    });
    const searchTermFromURL = params.get('searchTerm') || '';
    const sortByFromURL = params.get('sortBy') || 'createdAt';
    const sortOrderFromURL = params.get('sortOrder') || 'desc';
    
    setSearchTerm(searchTermFromURL);
    setSortBy(sortByFromURL);
    setSortOrder(sortOrderFromURL);
    return newFilters;
  }, [location.search, navigate]);

  useEffect(() => {
    const initialFilters = parseQueryParams();
    // Ensure filters is always an object
    setFilters(initialFilters && typeof initialFilters === 'object' ? initialFilters : {});
    fetchFilterOptions();
  }, [location.search, parseQueryParams]);

  const fetchFilterOptions = async () => {
    try {
      const filterOptions = await getProductFilterOptions();
      setAvailableFilters(filterOptions);
    } catch (err) {
      console.error('Error fetching filter options:', err);
    }
  };

  const fetchProducts = useCallback(async (pageNum = 1) => {
    try {
      setLoading(true);
      setError(null);
      
      const queryParams = {
        ...filters,
        searchTerm: searchTerm || undefined,
        sortBy,
        sortOrder,
        page: pageNum,
        limit: 12
      };

      
      const data = await fetchProductsWithFilters(queryParams);
      setProductsData(data);
    } catch (err) {
      setError('Failed to load products. Please try again later.');
      console.error('Error fetching products:', err);
    }
    setLoading(false);
  }, [filters, searchTerm, sortBy, sortOrder]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const page = parseInt(params.get('page')) || 1;
    fetchProducts(page);
  }, [fetchProducts, location.search]);

  const updateURL = useCallback((newParams) => {
    const params = new URLSearchParams();
    
    // Ensure filters is an object
    const safeFilters = (newParams.filters && typeof newParams.filters === 'object' && !Array.isArray(newParams.filters)) 
      ? newParams.filters 
      : {};
    
    // Add filters
    Object.entries(safeFilters).forEach(([key, value]) => {
      if (value && value !== '') {
        params.set(key, value);
      }
    });
    
    // Add other params
    if (newParams.searchTerm) params.set('searchTerm', newParams.searchTerm);
    if (newParams.sortBy && newParams.sortBy !== 'createdAt') params.set('sortBy', newParams.sortBy);
    if (newParams.sortOrder && newParams.sortOrder !== 'desc') params.set('sortOrder', newParams.sortOrder);
    if (newParams.page && newParams.page !== 1) params.set('page', newParams.page);

    const newURL = params.toString() ? `?${params.toString()}` : '';
    navigate(newURL, { replace: true });
  }, [navigate]);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    updateURL({ 
      filters: newFilters, 
      searchTerm, 
      sortBy, 
      sortOrder,
      page: 1 
    });
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    updateURL({ 
      filters, 
      searchTerm, 
      sortBy, 
      sortOrder,
      page: 1 
    });
  };

  const handleSortChange = async (newSortBy, newSortOrder) => {
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
    
    // Update URL with new sorting parameters
    updateURL({ 
      filters, 
      searchTerm, 
      sortBy: newSortBy, 
      sortOrder: newSortOrder,
      page: 1 
    });
  };

  const handlePageChange = (pageNum) => {
    updateURL({ 
      filters, 
      searchTerm, 
      sortBy, 
      sortOrder,
      page: pageNum 
    });
  };

  const handleClearFilters = () => {
    setFilters({});
    setSearchTerm('');
    updateURL({ 
      filters: {}, 
      searchTerm: '', 
      sortBy, 
      sortOrder,
      page: 1 
    });
  };

  return (
    <div className="container py-4">
      {/* Header */}
      <div className="row">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h1>All Products</h1>
            {isLoggedIn && (userRole === 'admin' || userRole === 'seller') && (
              <Link to="/product/new" className="btn btn-primary">
                <i className="bi bi-plus-circle me-2"></i>Add New Product
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Products Layout with Grid */}
      <div className="products-layout">
        {/* Filters Sidebar */}
        <div className="filter-sidebar">
          {availableFilters ? (
            <ProductFilters
              availableFilters={availableFilters}
              filters={filters}
              onFilterChange={handleFilterChange}
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

        {/* Main Content */}
        <div className="products-grid">
          {/* Search and Sort Controls */}
          <div className="mb-4">
            <div className="row align-items-center">
              <div className="col-md-8">
                <form onSubmit={handleSearchSubmit}>
                  <div className="input-group">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Search products..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <button type="submit" className="btn btn-outline-primary">
                      <i className="bi bi-search"></i>
                    </button>
                  </div>
                </form>
              </div>
              <div className="col-md-4">
                <select
                  className="form-select"
                  value={`${sortBy}-${sortOrder}`}
                  onChange={(e) => {
                    const [newSortBy, newSortOrder] = e.target.value.split('-');
                    handleSortChange(newSortBy, newSortOrder);
                  }}
                >
                  <option value="createdAt-desc">Newest First</option>
                  <option value="createdAt-asc">Oldest First</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="name-asc">Name: A to Z</option>
                  <option value="name-desc">Name: Z to A</option>
                  <option value="averageRating-desc">Highest Rated</option>
                </select>
              </div>
            </div>
          </div>

          {/* Products Count */}
          {!loading && (
            <div className="mb-3">
              <small className="text-muted">
                Showing {productsData.products.length} of {productsData.totalProducts} products
              </small>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '300px' }}>
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="alert alert-danger mb-4" role="alert">
              <i className="bi bi-exclamation-triangle me-2"></i>
              {error}
            </div>
          )}

          {/* Products List */}
          {!loading && !error && (
            <>
              <ProductList products={productsData.products} />

              {/* Pagination */}
              {productsData.totalPages > 1 && (
                <div className="d-flex justify-content-center mt-4">
                  <nav aria-label="Products pagination">
                    <ul className="pagination">
                      <li className={`page-item ${productsData.currentPage === 1 ? 'disabled' : ''}`}>
                        <button 
                          className="page-link" 
                          onClick={() => handlePageChange(1)}
                          disabled={productsData.currentPage === 1}
                          aria-label="First page"
                        >
                          <i className="bi bi-chevron-double-left"></i>
                        </button>
                      </li>
                      <li className={`page-item ${productsData.currentPage === 1 ? 'disabled' : ''}`}>
                        <button 
                          className="page-link" 
                          onClick={() => handlePageChange(productsData.currentPage - 1)}
                          disabled={productsData.currentPage === 1}
                          aria-label="Previous page"
                        >
                          <i className="bi bi-chevron-left"></i>
                        </button>
                      </li>
                      
                      {/* Page Numbers */}
                      {Array.from({ length: Math.min(5, productsData.totalPages) }, (_, i) => {
                        const pageNum = Math.max(1, productsData.currentPage - 2) + i;
                        if (pageNum <= productsData.totalPages) {
                          return (
                            <li 
                              key={pageNum}
                              className={`page-item ${pageNum === productsData.currentPage ? 'active' : ''}`}
                            >
                              <button 
                                className="page-link"
                                onClick={() => handlePageChange(pageNum)}
                                aria-label={`Page ${pageNum}`}
                                aria-current={pageNum === productsData.currentPage ? 'page' : undefined}
                              >
                                {pageNum}
                              </button>
                            </li>
                          );
                        }
                        return null;
                      })}
                      
                      <li className={`page-item ${productsData.currentPage === productsData.totalPages ? 'disabled' : ''}`}>
                        <button 
                          className="page-link" 
                          onClick={() => handlePageChange(productsData.currentPage + 1)}
                          disabled={productsData.currentPage === productsData.totalPages}
                          aria-label="Next page"
                        >
                          <i className="bi bi-chevron-right"></i>
                        </button>
                      </li>
                      <li className={`page-item ${productsData.currentPage === productsData.totalPages ? 'disabled' : ''}`}>
                        <button 
                          className="page-link" 
                          onClick={() => handlePageChange(productsData.totalPages)}
                          disabled={productsData.currentPage === productsData.totalPages}
                          aria-label="Last page"
                        >
                          <i className="bi bi-chevron-double-right"></i>
                        </button>
                      </li>
                    </ul>
                  </nav>
                </div>
              )}
            </>
          )}

          {/* Empty State */}
          {!loading && !error && productsData.products.length === 0 && (
            <div className="text-center py-5">
              <i className="bi bi-inbox fs-1 text-muted mb-3"></i>
              <h4>No products found</h4>
              <p className="text-muted">
                Try adjusting your filters or search terms.
              </p>
              <button 
                className="btn btn-outline-primary"
                onClick={() => {
                  setFilters({});
                  setSearchTerm('');
                  updateURL({ filters: {}, searchTerm: '', sortBy, sortOrder, page: 1 });
                }}
              >
                Clear All Filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;
