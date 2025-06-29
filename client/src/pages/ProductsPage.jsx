import React, { useState, useEffect } from 'react';
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

  // Parse query params from URL and update state
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const newFilters = {};
    params.forEach((value, key) => {
      if (key === 'page' || key === 'searchTerm' || key === 'sortBy' || key === 'sortOrder') {
        // Handled separately
      } else {
        newFilters[key] = value;
      }
    });
    setFilters(newFilters);
    setSearchTerm(params.get('searchTerm') || '');
    setSortBy(params.get('sortBy') || 'createdAt');
    setSortOrder(params.get('sortOrder') || 'desc');
  }, [location.search]);

  // Fetch filter options on mount
  useEffect(() => {
    const fetchFilterOptionsAsync = async () => {
      try {
        const filterOptions = await getProductFilterOptions();
        setAvailableFilters(filterOptions);
      } catch (err) {
        console.error('Error fetching filter options:', err);
      }
    };
    fetchFilterOptionsAsync();
  }, []);

  // Fetch products when filters/search/sort change
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        const params = {
          ...filters,
          page: parseInt(new URLSearchParams(location.search).get('page')) || 1,
          limit: 12,
          searchTerm,
          sortBy,
          sortOrder,
        };
        Object.keys(params).forEach(key => (params[key] === '' || params[key] === null || params[key] === undefined) && delete params[key]);
        const data = await fetchProductsWithFilters(params);
        setProductsData(data);
        // Update URL
        const searchParams = new URLSearchParams(params).toString();
        navigate(`${location.pathname}?${searchParams}`, { replace: true });
      } catch (err) {
        setError('Failed to load products. Please try again later.');
        console.error('Error fetching products:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
    // eslint-disable-next-line
  }, [filters, searchTerm, sortBy, sortOrder]);

  // Handlers
  const handleFilterChange = (filterType, value) => {
    setFilters(prevFilters => {
      const newFilters = { ...prevFilters };
      if (value === '' || value === null || value === undefined || (Array.isArray(value) && value.length === 0)) {
        delete newFilters[filterType];
      } else {
        newFilters[filterType] = value;
      }
      return newFilters;
    });
  };

  const handlePageChange = (pageNumber) => {
    const params = new URLSearchParams(location.search);
    params.set('page', pageNumber);
    navigate(`${location.pathname}?${params.toString()}`);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setFilters({ ...filters }); // trigger useEffect
    const params = new URLSearchParams(location.search);
    params.set('searchTerm', searchTerm);
    params.set('page', 1);
    navigate(`${location.pathname}?${params.toString()}`);
  };

  const handleSortChange = (e) => {
    const { name, value } = e.target;
    if (name === 'sortBy') setSortBy(value);
    if (name === 'sortOrder') setSortOrder(value);
    const params = new URLSearchParams(location.search);
    params.set(name, value);
    params.set('page', 1);
    navigate(`${location.pathname}?${params.toString()}`);
  };

  const handleClearFilters = () => {
    setFilters({});
    setSearchTerm('');
    setSortBy('createdAt');
    setSortOrder('desc');
    navigate('/products');
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
          <div className="card mb-4">
            <div className="card-body">
              <div className="row align-items-center">
                <div className="col-md-8 mb-3 mb-md-0">
                  <form onSubmit={handleSearch}>
                    <div className="input-group">
                      <input
                        type="text"
                        className="form-control form-control-lg"
                        placeholder="Search products..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                      <button type="submit" className="btn btn-primary">
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
                onClick={handleClearFilters}
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
