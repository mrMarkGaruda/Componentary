import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { isAuthenticated, logoutUser } from '../utils/auth';
import { getCurrentUser } from '../utils/auth';
import { useCart } from '../contexts/CartContext';

const Navbar = () => {
  const navigate = useNavigate();
  const authenticated = isAuthenticated();
  const user = getCurrentUser();
  const userRole = user?.role;
  const { cartItemsCount, setCartOpen } = useCart();

  const handleLogout = () => {
    logoutUser();
    navigate('/login');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark sticky-top">
      <div className="container">
        <Link to="/" className="navbar-brand d-flex align-items-center">
          <i className="bi bi-cpu me-2 fs-3"></i>
          <span style={{ fontWeight: '800', fontSize: '1.5rem' }}>Componentary</span>
        </Link>

        <button 
          className="navbar-toggler border-0" 
          type="button" 
          data-bs-toggle="collapse" 
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto">
            <li className="nav-item">
              <Link to="/" className="nav-link d-flex align-items-center">
                <i className="bi bi-house-door me-1"></i> Home
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/products" className="nav-link d-flex align-items-center">
                <i className="bi bi-grid me-1"></i> Products
              </Link>
            </li>
            {authenticated && (userRole === 'admin' || userRole === 'seller') && (
              <li className="nav-item">
                <Link to="/product/new" className="nav-link d-flex align-items-center">
                  <i className="bi bi-plus-circle me-1"></i> Add Product
                </Link>
              </li>
            )}
            {authenticated && userRole === 'admin' && (
              <li className="nav-item">
                <Link to="/admin" className="nav-link d-flex align-items-center">
                  <i className="bi bi-shield-check me-1"></i> Admin
                </Link>
              </li>
            )}
            {authenticated && (userRole === 'seller' || userRole === 'admin') && (
              <li className="nav-item">
                <Link to="/seller" className="nav-link d-flex align-items-center">
                  <i className="bi bi-shop me-1"></i> Seller
                </Link>
              </li>
            )}
            <li className="nav-item">
              <Link to="/recommendations" className="nav-link d-flex align-items-center">
                <i className="bi bi-stars me-1"></i> Recommendations
              </Link>
            </li>
          </ul>

          <ul className="navbar-nav">
            {authenticated && (
              <li className="nav-item">
                <button 
                  className="nav-link btn btn-link position-relative"
                  onClick={() => setCartOpen(true)}
                  style={{ border: 'none', background: 'none' }}
                >
                  <i className="bi bi-cart3 fs-5"></i>
                  {cartItemsCount > 0 && (
                    <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-primary">
                      {cartItemsCount}
                    </span>
                  )}
                </button>
              </li>
            )}
            
            {authenticated ? (
              <li className="nav-item dropdown">
                <button 
                  className="nav-link dropdown-toggle btn btn-link d-flex align-items-center" 
                  type="button" 
                  id="userDropdown" 
                  data-bs-toggle="dropdown" 
                  aria-expanded="false"
                  style={{ border: 'none', background: 'none' }}
                >
                  <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-2" 
                       style={{ width: '32px', height: '32px', fontSize: '0.9rem', fontWeight: '600' }}>
                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <span className="d-none d-lg-inline">{user?.name || 'User'}</span>
                </button>
                <ul className="dropdown-menu dropdown-menu-end shadow">
                  <li className="dropdown-header">
                    <div className="fw-semibold">{user?.name}</div>
                    <small className="text-muted">{user?.email}</small>
                    <div className="mt-1">
                      <span className="badge bg-primary">{userRole?.charAt(0).toUpperCase() + userRole?.slice(1)}</span>
                    </div>
                  </li>
                  <li><hr className="dropdown-divider" /></li>
                  <li>
                    <Link className="dropdown-item d-flex align-items-center" to="/profile">
                      <i className="bi bi-person me-2"></i> Profile
                    </Link>
                  </li>
                  <li>
                    <Link className="dropdown-item d-flex align-items-center" to="/orders">
                      <i className="bi bi-bag me-2"></i> Orders
                    </Link>
                  </li>
                  <li><hr className="dropdown-divider" /></li>
                  <li>
                    <button className="dropdown-item d-flex align-items-center text-danger" onClick={handleLogout}>
                      <i className="bi bi-box-arrow-right me-2"></i> Logout
                    </button>
                  </li>
                </ul>
              </li>
            ) : (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/login">
                    <i className="bi bi-box-arrow-in-right me-1"></i> Login
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="btn btn-primary ms-2" to="/signup">
                    <i className="bi bi-person-plus me-1"></i> Sign Up
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;