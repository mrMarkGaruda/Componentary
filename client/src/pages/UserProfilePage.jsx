import React, { useState, useEffect } from 'react';
import { getCurrentUser } from '../utils/auth';
import { Navigate } from 'react-router-dom';

const UserProfilePage = () => {
  const [user, setUser] = useState(getCurrentUser());
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: ''
    },
    preferences: {
      categories: [],
      priceRange: {
        min: 0,
        max: 1000
      }
    }
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  // Redirect if not authenticated
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/user/profile`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const userData = await response.json();
      setUser(userData);
      setFormData({
        name: userData.name || '',
        email: userData.email || '',
        address: {
          street: userData.address?.street || '',
          city: userData.address?.city || '',
          state: userData.address?.state || '',
          zipCode: userData.address?.zipCode || '',
          country: userData.address?.country || ''
        },
        preferences: {
          categories: userData.preferences?.categories || [],
          priceRange: {
            min: userData.preferences?.priceRange?.min || 0,
            max: userData.preferences?.priceRange?.max || 1000
          }
        }
      });
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleCategoryToggle = (category) => {
    setFormData(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        categories: prev.preferences.categories.includes(category)
          ? prev.preferences.categories.filter(c => c !== category)
          : [...prev.preferences.categories, category]
      }
    }));
  };

  const handlePriceRangeChange = (type, value) => {
    setFormData(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        priceRange: {
          ...prev.preferences.priceRange,
          [type]: parseInt(value)
        }
      }
    }));
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/user/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        const updatedUser = await response.json();
        setUser(updatedUser);
        // Update localStorage
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
        setEditing(false);
        alert('Profile updated successfully!');
      } else {
        throw new Error('Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile. Please try again.');
    }
    
    setLoading(false);
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('New passwords do not match');
      return;
    }
    
    if (passwordData.newPassword.length < 6) {
      alert('New password must be at least 6 characters long');
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/user/change-password`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      });
      
      if (response.ok) {
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setShowPasswordForm(false);
        alert('Password changed successfully!');
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Failed to change password');
      }
    } catch (error) {
      console.error('Error changing password:', error);
      alert(error.message || 'Failed to change password. Please try again.');
    }
    
    setLoading(false);
  };

  const categories = ['CPU', 'GPU', 'Motherboard', 'RAM', 'Storage', 'PSU', 'Case', 'Cooling', 'Monitor', 'Keyboard', 'Mouse'];

  return (
    <div className="container-fluid py-4">
      <div className="d-flex align-items-center mb-4">
        <i className="bi bi-person-circle text-primary fs-2 me-3"></i>
        <div>
          <h1 className="h2 fw-bold text-light mb-1">User Profile</h1>
          <p className="text-muted mb-0">Manage your account settings and preferences</p>
        </div>
      </div>
      
      <div className="row g-4">
        <div className="col-lg-4">
          <div className="card">
            <div className="card-body text-center">
              <div className="mb-4">
                <div className="avatar-container position-relative d-inline-block">
                  <i className="bi bi-person-circle display-1 text-primary"></i>
                  <div className="position-absolute bottom-0 end-0">
                    <span className={`badge rounded-pill ${user.role === 'admin' ? 'bg-danger' : user.role === 'seller' ? 'bg-warning' : 'bg-primary'}`}>
                      <i className={`bi ${user.role === 'admin' ? 'bi-shield-check' : user.role === 'seller' ? 'bi-shop' : 'bi-person'} me-1`}></i>
                      {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    </span>
                  </div>
                </div>
              </div>
              <h4 className="text-light mb-1">{user.name}</h4>
              <p className="text-muted mb-3">{user.email}</p>
              <div className="text-muted small">
                <i className="bi bi-calendar-check me-1"></i>
                Member since {new Date(user.createdAt || Date.now()).toLocaleDateString()}
              </div>
            </div>
          </div>
          
          {/* Quick Stats Card */}
          <div className="card mt-4">
            <div className="card-header">
              <h6 className="mb-0">
                <i className="bi bi-graph-up me-2"></i>Account Overview
              </h6>
            </div>
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="text-muted">Profile Completion</span>
                <span className="text-primary fw-semibold">85%</span>
              </div>
              <div className="progress mb-3" style={{ height: '6px' }}>
                <div className="progress-bar bg-primary" style={{ width: '85%' }}></div>
              </div>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="text-muted">Preferred Categories</span>
                <span className="badge bg-secondary">{formData.preferences.categories.length}</span>
              </div>
              <div className="d-flex justify-content-between align-items-center">
                <span className="text-muted">Price Range</span>
                <span className="text-success fw-semibold">${formData.preferences.priceRange.min} - ${formData.preferences.priceRange.max}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-lg-8">
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5 className="mb-0">
                <i className="bi bi-person-gear me-2"></i>Profile Information
              </h5>
              {!editing ? (
                <button 
                  className="btn btn-outline-primary"
                  onClick={() => setEditing(true)}
                >
                  <i className="bi bi-pencil me-1"></i>Edit Profile
                </button>
              ) : (
                <div className="btn-group">
                  <button 
                    className="btn btn-success"
                    onClick={handleProfileUpdate}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-1" role="status"></span>
                        Saving...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-check-lg me-1"></i>Save Changes
                      </>
                    )}
                  </button>
                  <button 
                    className="btn btn-outline-secondary"
                    onClick={() => setEditing(false)}
                  >
                    <i className="bi bi-x-lg me-1"></i>Cancel
                  </button>
                </div>
              )}
            </div>
            
            <div className="card-body">
              <form onSubmit={handleProfileUpdate}>
                <div className="row g-3 mb-4">
                  <div className="col-md-6">
                    <label className="form-label text-light">
                      <i className="bi bi-person me-1"></i>Full Name
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      disabled={!editing}
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label text-light">
                      <i className="bi bi-envelope me-1"></i>Email Address
                    </label>
                    <input
                      type="email"
                      className="form-control"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      disabled={!editing}
                      placeholder="Enter your email"
                    />
                  </div>
                </div>
                
                <div className="border-top pt-4 mb-4">
                  <h6 className="text-light mb-3">
                    <i className="bi bi-geo-alt me-2"></i>Address Information
                  </h6>
                  <div className="row g-3">
                    <div className="col-12">
                      <input
                        type="text"
                        className="form-control"
                        name="address.street"
                        placeholder="Street Address"
                        value={formData.address.street}
                        onChange={handleInputChange}
                        disabled={!editing}
                      />
                    </div>
                    <div className="col-md-6">
                      <input
                        type="text"
                        className="form-control"
                        name="address.city"
                        placeholder="City"
                        value={formData.address.city}
                        onChange={handleInputChange}
                        disabled={!editing}
                      />
                    </div>
                    <div className="col-md-6">
                      <input
                        type="text"
                        className="form-control"
                        name="address.state"
                        placeholder="State/Province"
                        value={formData.address.state}
                        onChange={handleInputChange}
                        disabled={!editing}
                      />
                    </div>
                    <div className="col-md-6">
                      <input
                        type="text"
                        className="form-control"
                        name="address.zipCode"
                        placeholder="Zip/Postal Code"
                        value={formData.address.zipCode}
                        onChange={handleInputChange}
                        disabled={!editing}
                      />
                    </div>
                    <div className="col-md-6">
                      <input
                        type="text"
                        className="form-control"
                        name="address.country"
                        placeholder="Country"
                        value={formData.address.country}
                        onChange={handleInputChange}
                        disabled={!editing}
                      />
                    </div>
                  </div>
                </div>
                
                <div className="border-top pt-4 mb-4">
                  <h6 className="text-light mb-3">
                    <i className="bi bi-heart me-2"></i>Shopping Preferences
                  </h6>
                  <div className="mb-4">
                    <label className="form-label text-light">Interested Categories</label>
                    <div className="row g-2">
                      {categories.map((category) => (
                        <div key={category} className="col-md-4 col-sm-6">
                          <div className="form-check">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              id={category}
                              checked={formData.preferences.categories.includes(category)}
                              onChange={() => handleCategoryToggle(category)}
                              disabled={!editing}
                            />
                            <label className="form-check-label text-light" htmlFor={category}>
                              {category}
                            </label>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <label className="form-label text-light">
                      <i className="bi bi-currency-dollar me-1"></i>Price Range
                    </label>
                    <div className="row g-3">
                      <div className="col-md-6">
                        <div className="input-group">
                          <span className="input-group-text">$</span>
                          <input
                            type="number"
                            className="form-control"
                            placeholder="Min Price"
                            value={formData.preferences.priceRange.min}
                            onChange={(e) => handlePriceRangeChange('min', e.target.value)}
                            disabled={!editing}
                          />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="input-group">
                          <span className="input-group-text">$</span>
                          <input
                            type="number"
                            className="form-control"
                            placeholder="Max Price"
                            value={formData.preferences.priceRange.max}
                            onChange={(e) => handlePriceRangeChange('max', e.target.value)}
                            disabled={!editing}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>
          
          <div className="card mt-4">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5 className="mb-0">
                <i className="bi bi-shield-lock me-2"></i>Security Settings
              </h5>
              <button 
                className="btn btn-outline-warning"
                onClick={() => setShowPasswordForm(!showPasswordForm)}
              >
                <i className="bi bi-key me-1"></i>Change Password
              </button>
            </div>
            
            {showPasswordForm && (
              <div className="card-body">
                <form onSubmit={handlePasswordChange}>
                  <div className="row g-3">
                    <div className="col-12">
                      <label className="form-label text-light">Current Password</label>
                      <input
                        type="password"
                        className="form-control"
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData(prev => ({...prev, currentPassword: e.target.value}))}
                        placeholder="Enter your current password"
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label text-light">New Password</label>
                      <input
                        type="password"
                        className="form-control"
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData(prev => ({...prev, newPassword: e.target.value}))}
                        placeholder="Enter new password"
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label text-light">Confirm New Password</label>
                      <input
                        type="password"
                        className="form-control"
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData(prev => ({...prev, confirmPassword: e.target.value}))}
                        placeholder="Confirm new password"
                        required
                      />
                    </div>
                  </div>
                  <div className="d-flex gap-2 mt-3">
                    <button type="submit" className="btn btn-warning" disabled={loading}>
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-1" role="status"></span>
                          Changing...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-check-lg me-1"></i>Change Password
                        </>
                      )}
                    </button>
                    <button 
                      type="button" 
                      className="btn btn-outline-secondary"
                      onClick={() => setShowPasswordForm(false)}
                    >
                      <i className="bi bi-x-lg me-1"></i>Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfilePage;
