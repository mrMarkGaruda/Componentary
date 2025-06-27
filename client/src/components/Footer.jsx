import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="footer py-5 mt-auto">
      <div className="container">
        <div className="row">
          <div className="col-lg-4 mb-4">
            <Link to="/" className="text-decoration-none d-flex align-items-center mb-3">
              <i className="bi bi-cpu fs-3 text-primary me-2"></i>
              <span className="fw-bold text-light fs-4">Componentary</span>
            </Link>
            <p className="text-muted mb-3">
              Your premier destination for PC components, gaming gear, and technology accessories. 
              Build your dream setup with confidence.
            </p>
            <div className="d-flex gap-3">
              <a href="#" className="text-muted hover-primary">
                <i className="bi bi-facebook fs-5"></i>
              </a>
              <a href="#" className="text-muted hover-primary">
                <i className="bi bi-twitter-x fs-5"></i>
              </a>
              <a href="#" className="text-muted hover-primary">
                <i className="bi bi-instagram fs-5"></i>
              </a>
              <a href="#" className="text-muted hover-primary">
                <i className="bi bi-youtube fs-5"></i>
              </a>
              <a href="#" className="text-muted hover-primary">
                <i className="bi bi-discord fs-5"></i>
              </a>
            </div>
          </div>
          
          <div className="col-lg-2 col-md-3 col-sm-6 mb-4">
            <h6 className="text-light fw-semibold mb-3">Shop</h6>
            <ul className="list-unstyled">
              <li className="mb-2">
                <Link to="/products?category=CPU" className="text-muted text-decoration-none hover-primary">
                  CPUs
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/products?category=GPU" className="text-muted text-decoration-none hover-primary">
                  Graphics Cards
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/products?category=RAM" className="text-muted text-decoration-none hover-primary">
                  Memory
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/products?category=Storage" className="text-muted text-decoration-none hover-primary">
                  Storage
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/products?category=Monitor" className="text-muted text-decoration-none hover-primary">
                  Monitors
                </Link>
              </li>
            </ul>
          </div>
          
          <div className="col-lg-2 col-md-3 col-sm-6 mb-4">
            <h6 className="text-light fw-semibold mb-3">Account</h6>
            <ul className="list-unstyled">
              <li className="mb-2">
                <Link to="/login" className="text-muted text-decoration-none hover-primary">
                  Sign In
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/signup" className="text-muted text-decoration-none hover-primary">
                  Create Account
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/orders" className="text-muted text-decoration-none hover-primary">
                  Order History
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/profile" className="text-muted text-decoration-none hover-primary">
                  Profile
                </Link>
              </li>
            </ul>
          </div>
          
          <div className="col-lg-2 col-md-3 col-sm-6 mb-4">
            <h6 className="text-light fw-semibold mb-3">Support</h6>
            <ul className="list-unstyled">
              <li className="mb-2">
                <a href="#" className="text-muted text-decoration-none hover-primary">
                  Help Center
                </a>
              </li>
              <li className="mb-2">
                <a href="#" className="text-muted text-decoration-none hover-primary">
                  Contact Us
                </a>
              </li>
              <li className="mb-2">
                <a href="#" className="text-muted text-decoration-none hover-primary">
                  Shipping Info
                </a>
              </li>
              <li className="mb-2">
                <a href="#" className="text-muted text-decoration-none hover-primary">
                  Returns
                </a>
              </li>
              <li className="mb-2">
                <a href="#" className="text-muted text-decoration-none hover-primary">
                  Warranty
                </a>
              </li>
            </ul>
          </div>
          
          <div className="col-lg-2 col-md-3 col-sm-6 mb-4">
            <h6 className="text-light fw-semibold mb-3">Company</h6>
            <ul className="list-unstyled">
              <li className="mb-2">
                <a href="#" className="text-muted text-decoration-none hover-primary">
                  About Us
                </a>
              </li>
              <li className="mb-2">
                <a href="#" className="text-muted text-decoration-none hover-primary">
                  Careers
                </a>
              </li>
              <li className="mb-2">
                <a href="#" className="text-muted text-decoration-none hover-primary">
                  Privacy Policy
                </a>
              </li>
              <li className="mb-2">
                <a href="#" className="text-muted text-decoration-none hover-primary">
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <hr className="my-4" style={{ borderColor: 'var(--border-color)' }} />
        
        <div className="row align-items-center">
          <div className="col-md-6">
            <p className="text-muted mb-0">
              © 2025 Componentary. All rights reserved.
            </p>
          </div>
          <div className="col-md-6 text-md-end">
            <div className="d-flex justify-content-md-end gap-3 mt-3 mt-md-0">
              <img src="https://img.shields.io/badge/Secure-SSL-green" alt="SSL Secure" height="20" />
              <img src="https://img.shields.io/badge/Payment-Verified-blue" alt="Payment Verified" height="20" />
              <img src="https://img.shields.io/badge/Support-24/7-orange" alt="24/7 Support" height="20" />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;