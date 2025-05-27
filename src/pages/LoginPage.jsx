import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loginUser, isAuthenticated } from '../utils/auth';

const LoginPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated()) {
      navigate('/');
    }
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await loginUser(formData.email, formData.password);
      navigate('/'); // Redirect to homepage after successful login
    } catch (err) {
      setError(err.message || 'Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Demo login handler
  const handleDemoLogin = async (e) => {
    e.preventDefault();
    setFormData({ email: 'demo@example.com', password: 'password123' });
    
    setError('');
    setLoading(true);

    try {
      await loginUser('demo@example.com', 'password123');
      navigate('/');
    } catch (err) {
      setError(err.message || 'Demo login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card shadow">
            <div className="card-body p-5">
              <h2 className="text-center mb-4">Login</h2>
              
              {error && (
                <div className="alert alert-danger d-flex align-items-center" role="alert">
                  <i className="bi bi-exclamation-triangle-fill me-2"></i>
                  <div>{error}</div>
                </div>
              )}
              
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="email" className="form-label">
                    <i className="bi bi-envelope me-2"></i>Email address
                  </label>
                  <input
                    type="email"
                    className="form-control"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="name@example.com"
                    required
                  />
                </div>
                
                <div className="mb-3">
                  <label htmlFor="password" className="form-label">
                    <i className="bi bi-lock me-2"></i>Password
                  </label>
                  <input
                    type="password"
                    className="form-control"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <button
                  type="submit"
                  className="btn btn-primary w-100 mt-4 py-2"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Logging in...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-box-arrow-in-right me-2"></i>Login
                    </>
                  )}
                </button>
              </form>

              <div className="text-center mt-4">
                <p className="mb-2">
                  Don't have an account?{' '}
                  <Link to="/signup" className="text-decoration-none">
                    Sign up
                  </Link>
                </p>
                <button 
                  onClick={handleDemoLogin} 
                  className="btn btn-outline-secondary"
                  disabled={loading}
                >
                  <i className="bi bi-people me-2"></i>Try Demo Account
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;