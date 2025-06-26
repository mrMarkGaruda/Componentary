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
    <div className="container py-4">
      <div className="row">
        <div className="col-md-4">
          <div className="card">
            <div className="card-body text-center">
              <div className="mb-3">
                <i className="bi bi-person-circle display-1 text-muted"></i>
              </div>
              <h5>{user.name}</h5>
              <p className="text-muted">{user.email}</p>
              <span className={`badge bg-${user.role === 'admin' ? 'danger' : user.role === 'seller' ? 'warning' : 'primary'}`}>
                {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
              </span>
              <div className="mt-3">
                <small className="text-muted">
                  Member since {new Date(user.createdAt || Date.now()).toLocaleDateString()}
                </small>
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-md-8">
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Profile Information</h5>
              {!editing ? (
                <button 
                  className="btn btn-outline-primary btn-sm"
                  onClick={() => setEditing(true)}
                >
                  <i className="bi bi-pencil me-1"></i>Edit Profile
                </button>
              ) : (
                <div>
                  <button 
                    className="btn btn-success btn-sm me-2"
                    onClick={handleProfileUpdate}
                    disabled={loading}
                  >
                    {loading ? 'Saving...' : 'Save'}
                  </button>
                  <button 
                    className="btn btn-secondary btn-sm"
                    onClick={() => setEditing(false)}
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
            
            <div className="card-body">
              <form onSubmit={handleProfileUpdate}>
                <div className="row mb-3">
                  <div className="col-md-6">
                    <label className="form-label">Name</label>
                    <input
                      type="text"
                      className="form-control"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      disabled={!editing}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      className="form-control"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      disabled={!editing}
                    />
                  </div>
                </div>
                
                <h6 className="mb-3">Address</h6>
                <div className="row mb-3">
                  <div className="col-12 mb-2">
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
                  <div className="col-md-6 mb-2">
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
                  <div className="col-md-6 mb-2">
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
                  <div className="col-md-6 mb-2">
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
                  <div className="col-md-6 mb-2">
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
                
                <h6 className="mb-3">Preferences</h6>
                <div className="mb-3">
                  <label className="form-label">Interested Categories</label>
                  <div className="row">
                    {categories.map((category) => (
                      <div key={category} className="col-md-4 col-sm-6 mb-2">
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id={category}
                            checked={formData.preferences.categories.includes(category)}
                            onChange={() => handleCategoryToggle(category)}
                            disabled={!editing}
                          />
                          <label className="form-check-label" htmlFor={category}>
                            {category}
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="mb-3">
                  <label className="form-label">Price Range</label>
                  <div className="row">
                    <div className="col-md-6">
                      <input
                        type="number"
                        className="form-control"
                        placeholder="Min Price"
                        value={formData.preferences.priceRange.min}
                        onChange={(e) => handlePriceRangeChange('min', e.target.value)}
                        disabled={!editing}
                      />
                    </div>
                    <div className="col-md-6">
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
              </form>
            </div>
          </div>
          
          <div className="card mt-4">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Security</h5>
              <button 
                className="btn btn-outline-warning btn-sm"
                onClick={() => setShowPasswordForm(!showPasswordForm)}
              >
                <i className="bi bi-key me-1"></i>Change Password
              </button>
            </div>
            
            {showPasswordForm && (
              <div className="card-body">
                <form onSubmit={handlePasswordChange}>
                  <div className="mb-3">
                    <label className="form-label">Current Password</label>
                    <input
                      type="password"
                      className="form-control"
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData(prev => ({...prev, currentPassword: e.target.value}))}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">New Password</label>
                    <input
                      type="password"
                      className="form-control"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData(prev => ({...prev, newPassword: e.target.value}))}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Confirm New Password</label>
                    <input
                      type="password"
                      className="form-control"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData(prev => ({...prev, confirmPassword: e.target.value}))}
                      required
                    />
                  </div>
                  <div className="d-flex gap-2">
                    <button type="submit" className="btn btn-warning" disabled={loading}>
                      {loading ? 'Changing...' : 'Change Password'}
                    </button>
                    <button 
                      type="button" 
                      className="btn btn-secondary"
                      onClick={() => setShowPasswordForm(false)}
                    >
                      Cancel
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
