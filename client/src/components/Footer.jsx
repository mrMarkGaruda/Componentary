import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="py-4 bg-light mt-auto">
      <div className="container">
        <div className="row align-items-center justify-content-between">
          <div className="col-md-4 text-center text-md-start">
            <Link to="/" className="text-decoration-none text-dark">
              <i className="bi bi-shop-window fs-4 me-2"></i>
              <span className="fw-bold">Markslist</span>
            </Link>
          </div>
          
          <div className="col-md-4 text-center my-3 my-md-0">
            <ul className="nav justify-content-center">
              <li className="nav-item">
                <Link to="/" className="nav-link px-2 text-dark">
                  Home
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/login" className="nav-link px-2 text-dark">
                  Login
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/signup" className="nav-link px-2 text-dark">
                  Sign-up
                </Link>
              </li>
            </ul>
          </div>
          
          <div className="col-md-4 text-center text-md-end">
            <div className="fs-4">
              <a href="#" className="text-dark me-3"><i className="bi bi-facebook"></i></a>
              <a href="#" className="text-dark me-3"><i className="bi bi-twitter-x"></i></a>
              <a href="#" className="text-dark me-3"><i className="bi bi-instagram"></i></a>
              <a href="#" className="text-dark"><i className="bi bi-linkedin"></i></a>
            </div>
          </div>
        </div>
        <hr />
        <p className="text-center text-muted mb-0">© 2025 Markslist. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;