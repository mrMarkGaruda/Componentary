import React, { useState, useEffect } from 'react';
import { fetchProducts } from '../utils/api';
import ProductCard from '../components/ProductCard';
import { Link } from 'react-router-dom';
import { isAuthenticated } from '../utils/auth';

const HomePage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const authenticated = isAuthenticated();

  useEffect(() => {
    const getProducts = async () => {
      try {
        setLoading(true);
        const data = await fetchProducts();
        setProducts(data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load products. Please try again later.');
        setLoading(false);
      }
    };

    getProducts();
  }, []);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger text-center" role="alert">
        {error}
      </div>
    );
  }

  return (
    <>
      {/* Hero Section */}
      <div className="bg-primary text-white py-5 mb-5">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-6">
              <h1 className="display-4 fw-bold">Discover Amazing Products</h1>
              <p className="lead">Find the best products for your needs with our curated selection.</p>
              {authenticated ? (
                <Link to="/product/new" className="btn btn-light btn-lg">
                  <i className="bi bi-plus-circle me-2"></i>Add Your Product
                </Link>
              ) : (
                <Link to="/signup" className="btn btn-light btn-lg">
                  <i className="bi bi-person-plus me-2"></i>Sign Up Now
                </Link>
              )}
            </div>
            <div className="col-lg-6 d-none d-lg-block">
              <img 
                src="https://images.unsplash.com/photo-1556740772-1a741367b93e?fm=jpg&q=60&w=3000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDF8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" 
                alt="Shop now" 
                className="img-fluid rounded shadow"
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* Products Section */}
      <div className="container py-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2>Featured Products</h2>
          {authenticated && (
            <Link to="/product/new" className="btn btn-outline-primary">
              <i className="bi bi-plus-circle me-2"></i>Add New Product
            </Link>
          )}
        </div>
        
        {products.length === 0 ? (
          <div className="alert alert-info py-4 text-center">
            <i className="bi bi-info-circle fs-4 d-block mb-3"></i>
            <h4>No products available yet</h4>
            {authenticated ? (
              <div className="mt-3">
                <Link to="/product/new" className="btn btn-primary">
                  Add Your First Product
                </Link>
              </div>
            ) : (
              <div className="mt-3">
                <p>Please sign in to add products</p>
                <Link to="/login" className="btn btn-primary me-2">
                  Login
                </Link>
                <Link to="/signup" className="btn btn-outline-primary">
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        ) : (
          <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default HomePage;