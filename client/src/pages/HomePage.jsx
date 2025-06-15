import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { fetchProductsWithFilters, getProductFilterOptions } from '../utils/api';
import ProductList from '../components/ProductList';
import ProductFilters from '../components/ProductFilters';
import { Pagination, Form, Row, Col, Spinner, Alert, Button } from 'react-bootstrap';

const HomePage = () => {
  const [productsData, setProductsData] = useState({ products: [], totalPages: 1, currentPage: 1, totalProducts: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({});
  const [availableFilters, setAvailableFilters] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('createdAt'); // Default sort
  const [sortOrder, setSortOrder] = useState('desc'); // Default order

  const location = useLocation();
  const navigate = useNavigate();

  // Function to parse query params from URL
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
  }, [location.search, parseQueryParams]); // Re-run if URL query params change

  const fetchFilterOptions = async () => {
    try {
      const filterOptions = await getProductFilterOptions();
      setAvailableFilters(filterOptions);
    } catch (err) {
      console.error("Failed to load filter options:", err);
      // setError('Failed to load filter options.'); // Optional: show error for filters
    }
  };

  const loadProducts = useCallback(async (currentPage = 1, currentFilters = filters, currentSearchTerm = searchTerm, currentSortBy = sortBy, currentSortOrder = sortOrder) => {
    setLoading(true);
    setError(null);
    try {
      const queryParams = {
        ...currentFilters,
        page: currentPage,
        limit: 12, // Or your preferred limit
        searchTerm: currentSearchTerm,
        sortBy: currentSortBy,
        sortOrder: currentSortOrder,
      };
      // Remove empty/null filters before sending
      Object.keys(queryParams).forEach(key => 
        (queryParams[key] === '' || queryParams[key] === null || queryParams[key] === undefined) && delete queryParams[key]
      );

      const data = await fetchProductsWithFilters(queryParams);
      setProductsData(data);
      // Update URL with current filters, search, sort, and page
      const searchParams = new URLSearchParams(queryParams).toString();
      navigate(`${location.pathname}?${searchParams}`, { replace: true });

    } catch (err) {
      setError('Failed to load products. Please try again later.');
      console.error("Product loading error:", err);
    } finally {
      setLoading(false);
    }
  }, [filters, searchTerm, sortBy, sortOrder, navigate, location.pathname]); // Include all dependencies that might change

  useEffect(() => {
    // Load products when filters, search, sort, or initial URL params change
    const currentPageFromUrl = parseInt(new URLSearchParams(location.search).get('page')) || 1;
    loadProducts(currentPageFromUrl, filters, searchTerm, sortBy, sortOrder);
  }, [filters, searchTerm, sortBy, sortOrder, loadProducts, location.search]); // Add location.search to re-trigger on direct URL changes


  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    // loadProducts will be called by the useEffect watching `filters`
  };

  const handlePageChange = (pageNumber) => {
    loadProducts(pageNumber);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    // loadProducts will be called by the useEffect watching `searchTerm`
  };
  
  const handleSortChange = (e) => {
    const { name, value } = e.target;
    if (name === 'sortBy') setSortBy(value);
    if (name === 'sortOrder') setSortOrder(value);
    // loadProducts will be called by the useEffect watching `sortBy` or `sortOrder`
  };

  return (
    <div className="container-fluid mt-4">
      <Row>
        <Col md={3} className="mb-4">
          {availableFilters ? (
            <ProductFilters 
              availableFilters={availableFilters} 
              onFilterChange={handleFilterChange} 
              currentFilters={filters} 
            />
          ) : (
            <div className="text-center"><Spinner animation="border" /> <p>Loading filters...</p></div>
          )}
        </Col>

        <Col md={9}>
          <Form onSubmit={handleSearch} className="mb-3">
            <Row>
              <Col xs={12} md={6} lg={8}>
                <Form.Control 
                  type="text" 
                  placeholder="Search products..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </Col>
              <Col xs={12} md={6} lg={4} className="mt-2 mt-md-0">
                 <Button type="submit" variant="primary" className="w-100">Search</Button>
              </Col>
            </Row>
          </Form>
          
          <Row className="mb-3 align-items-center">
            <Col md={6}>
              <p className="mb-0">Showing {productsData.products.length} of {productsData.totalProducts} products</p>
            </Col>
            <Col md={6} className="d-flex justify-content-md-end">
              <Form.Group as={Row} className="mb-0 align-items-center">
                <Form.Label column sm="auto" className="pe-2">Sort by:</Form.Label>
                <Col sm="auto" className="pe-1">
                  <Form.Select name="sortBy" value={sortBy} onChange={handleSortChange} size="sm">
                    <option value="createdAt">Date Added</option>
                    <option value="price">Price</option>
                    <option value="name">Name</option>
                    <option value="averageRating">Rating</option>
                    {searchTerm && <option value="score">Relevance</option>}
                  </Form.Select>
                </Col>
                <Col sm="auto">
                  <Form.Select name="sortOrder" value={sortOrder} onChange={handleSortChange} size="sm">
                    <option value="asc">Asc</option>
                    <option value="desc">Desc</option>
                  </Form.Select>
                </Col>
              </Form.Group>
            </Col>
          </Row>

          {loading ? (
            <div className="text-center"><Spinner animation="border" style={{ width: '3rem', height: '3rem' }} /> <p>Loading products...</p></div>
          ) : error ? (
            <Alert variant="danger">{error}</Alert>
          ) : (
            <ProductList products={productsData.products} />
          )}

          {!loading && productsData.totalPages > 1 && (
            <div className="d-flex justify-content-center mt-4">
              <Pagination>
                {[...Array(productsData.totalPages).keys()].map(num => (
                  <Pagination.Item 
                    key={num + 1} 
                    active={num + 1 === productsData.currentPage} 
                    onClick={() => handlePageChange(num + 1)}
                  >
                    {num + 1}
                  </Pagination.Item>
                ))}
              </Pagination>
            </div>
          )}
        </Col>
      </Row>
    </div>
  );
};

export default HomePage;