import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { fetchProductsWithFilters, getProductFilterOptions } from '../utils/api';
import ProductList from '../components/ProductList';
import ProductFilters from '../components/ProductFilters';
import { Pagination, Form, Row, Col, Spinner, Alert, Button } from 'react-bootstrap';
import { isAuthenticated, getCurrentUser } from '../utils/auth';

const HomePage = () => {
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
  }, [location.search, parseQueryParams]);

  const fetchFilterOptions = async () => {
    try {
      const filterOptions = await getProductFilterOptions();
      setAvailableFilters(filterOptions);
    } catch (err) {
      console.error("Failed to load filter options:", err);
    }
  };

  const loadProducts = useCallback(async (currentPage = 1, currentFilters = filters, currentSearchTerm = searchTerm, currentSortBy = sortBy, currentSortOrder = sortOrder) => {
    setLoading(true);
    setError(null);
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
    } finally {
      setLoading(false);
    }
  }, [filters, searchTerm, sortBy, sortOrder, navigate, location.pathname]);

  useEffect(() => {
    const currentPageFromUrl = parseInt(new URLSearchParams(location.search).get('page')) || 1;
    loadProducts(currentPageFromUrl, filters, searchTerm, sortBy, sortOrder);
  }, [filters, searchTerm, sortBy, sortOrder, loadProducts, location.search]);


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

  return (
    <>
      {/* Hero Section */}
      <div className="bg-light text-dark py-5 mb-5">
        <div className="container">
          <Row className="align-items-center">
            <Col lg={6}>
              <h1 className="display-4 fw-bold">Componentary</h1>
              <p className="lead">Your one-stop marketplace for PC components and peripherals. Find everything you need to build or upgrade your dream setup.</p>
              {authenticated && (userRole === 'admin' || userRole === 'seller') ? (
                <Link to="/product/new" className="btn btn-primary btn-lg">
                  <i className="bi bi-plus-circle me-2"></i>Add Your Product
                </Link>
              ) : authenticated ? (
                 <Link to="/products" className="btn btn-primary btn-lg"> {/* Changed this to /products or similar if you have a dedicated products page */} 
                  <i className="bi bi-search me-2"></i>Browse Products
                </Link>
              ) : (
                <Link to="/signup" className="btn btn-primary btn-lg">
                  <i className="bi bi-person-plus me-2"></i>Sign Up & Shop
                </Link>
              )}
            </Col>
            <Col lg={6} className="d-none d-lg-block text-center">
              <img 
                src="https://images.unsplash.com/photo-1593640408182-31c70c8268f5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
                alt="PC Components"
                className="img-fluid rounded shadow-lg" style={{maxHeight: "350px"}}
              />
            </Col>
          </Row>
        </div>
      </div>

      {/* Products Section */}
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
            <Row className="mb-3 align-items-center">
                <Col xs={12} md={7} lg={8} className="mb-2 mb-md-0">
                    <Form onSubmit={handleSearch}>
                        <Form.Control 
                        type="text" 
                        placeholder="Search products... (e.g., RTX 3080, AMD Ryzen, gaming keyboard)"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </Form>
                </Col>
                <Col xs={12} md={5} lg={4} className="d-flex justify-content-md-end">
                    <Form.Group as={Row} className="mb-0 align-items-center gx-2">
                        <Form.Label column sm="auto" className="pe-1 visually-hidden-xs">Sort by:</Form.Label>
                        <Col sm="auto" className="flex-grow-1 flex-md-grow-0">
                        <Form.Select name="sortBy" value={sortBy} onChange={handleSortChange} size="sm">
                            <option value="createdAt">Newest</option>
                            <option value="price">Price</option>
                            <option value="name">Name</option>
                            <option value="averageRating">Rating</option>
                            {searchTerm && <option value="score">Relevance</option>}
                        </Form.Select>
                        </Col>
                        <Col sm="auto" className="flex-grow-1 flex-md-grow-0">
                        <Form.Select name="sortOrder" value={sortOrder} onChange={handleSortChange} size="sm">
                            <option value="asc">Asc</option>
                            <option value="desc">Desc</option>
                        </Form.Select>
                        </Col>
                    </Form.Group>
                </Col>
            </Row>
            
            <p className="text-muted mb-3">Showing {productsData.products.length} of {productsData.totalProducts} products</p>

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
    </>
  );
};

export default HomePage;