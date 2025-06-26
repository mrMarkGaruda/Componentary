import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { isAuthenticated, logoutUser } from '../utils/auth';
import { getCurrentUser } from '../utils/auth';

const Navbar = () => {
  const navigate = useNavigate();
  const authenticated = isAuthenticated();
  const user = getCurrentUser();
  const userRole = user?.role;

  const handleLogout = () => {
    logoutUser();
    navigate('/login');
  };

  return (
    <header className="py-3 mb-4 border-bottom">
      <div className="container d-flex flex-wrap align-items-center justify-content-center justify-content-md-between">
        <Link to="/" className="d-flex align-items-center mb-2 mb-md-0 text-dark text-decoration-none">
          <i className="bi bi-shop-window fs-4 me-2"></i>
          <h3 className="m-0">Componentary</h3>
        </Link>

        <ul className="nav col-12 col-md-auto mb-2 justify-content-center mb-md-0">
          <li>
            <Link to="/" className="nav-link px-2 link-dark">
              <i className="bi bi-house-door me-1"></i> Home
            </Link>
          </li>
          <li>
            <Link to="/products" className="nav-link px-2 link-dark">
              <i className="bi bi-grid me-1"></i> Products
            </Link>
          </li>
          {(authenticated && (userRole === 'admin' || userRole === 'seller')) ? (
            <li>
              <Link to="/product/new" className="nav-link px-2 link-dark">
                <i className="bi bi-plus-circle me-1"></i> Add Product
              </Link>
            </li>
          ) : authenticated ? (
            <li>
              <span className="nav-link px-2 text-muted" title="Only sellers and admins can add products" style={{ cursor: 'not-allowed', opacity: 0.6 }}>
                <i className="bi bi-plus-circle me-1"></i> Add Product
              </span>
            </li>
          ) : null}
        </ul>

        <div className="col-md-3 text-end">
          {authenticated ? (
            <div className="dropdown">
              <button 
                className="btn btn-outline-dark dropdown-toggle" 
                type="button" 
                id="userDropdown" 
                data-bs-toggle="dropdown" 
                aria-expanded="false"
              >
                <i className="bi bi-person-circle me-1"></i> {user?.name || 'User'}
              </button>
              <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="userDropdown">
                <li>
                  <div className="dropdown-item-text">
                    <small className="text-muted">{user?.email}</small>
                  </div>
                </li>
                <li>
                  <div className="dropdown-item-text">
                    <span className="badge bg-secondary">{userRole?.charAt(0).toUpperCase() + userRole?.slice(1)}</span>
                  </div>
                </li>
                <li><hr className="dropdown-divider" /></li>
                <li>
                  <Link className="dropdown-item" to="/profile">
                    <i className="bi bi-person me-1"></i> Profile
                  </Link>
                </li>
                <li>
                  <Link className="dropdown-item" to="/orders">
                    <i className="bi bi-bag me-1"></i> Order History
                  </Link>
                </li>
                {userRole === 'admin' && (
                  <li>
                    <Link className="dropdown-item" to="/admin">
                      <i className="bi bi-shield-check me-1"></i> Admin Dashboard
                    </Link>
                  </li>
                )}
                {(userRole === 'seller' || userRole === 'admin') && (
                  <li>
                    <Link className="dropdown-item" to="/seller">
                      <i className="bi bi-shop me-1"></i> Seller Dashboard
                    </Link>
                  </li>
                )}
                <li><hr className="dropdown-divider" /></li>
                <li>
                  <button className="dropdown-item text-danger" onClick={handleLogout}>
                    <i className="bi bi-box-arrow-right me-1"></i> Logout
                  </button>
                </li>
              </ul>
            </div>
          ) : (
            <>
              <Link className="btn btn-outline-dark me-2" to="/login">
                <i className="bi bi-box-arrow-in-right me-1"></i> Login
              </Link>
              <Link className="btn btn-success" to="/signup">
                <i className="bi bi-person-plus me-1"></i> Sign-up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;