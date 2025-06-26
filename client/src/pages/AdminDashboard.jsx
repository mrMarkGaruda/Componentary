import React, { useState, useEffect } from 'react';
import { getCurrentUser } from '../utils/auth';
import { Navigate } from 'react-router-dom';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [analytics, setAnalytics] = useState({});
  const [loading, setLoading] = useState(true);
  const user = getCurrentUser();

  // Redirect if not admin
  if (!user || user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  useEffect(() => {
    fetchDashboardData();
  }, [activeTab]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/admin/${activeTab}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      
      if (activeTab === 'users') setUsers(data);
      else if (activeTab === 'products') setProducts(data);
      else if (activeTab === 'orders') setOrders(data);
      else if (activeTab === 'analytics') setAnalytics(data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
    setLoading(false);
  };

  const handleUserAction = async (userId, action) => {
    try {
      await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/admin/users/${userId}/${action}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      fetchDashboardData();
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  const handleProductAction = async (productId, action) => {
    try {
      if (action === 'delete') {
        await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/products/${productId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
      }
      fetchDashboardData();
    } catch (error) {
      console.error('Error updating product:', error);
    }
  };

  const handleOrderStatusUpdate = async (orderId, status) => {
    try {
      await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      });
      fetchDashboardData();
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  const renderUsers = () => (
    <div className="card">
      <div className="card-header">
        <h5 className="mb-0">
          <i className="bi bi-people me-2"></i>User Management
        </h5>
      </div>
      <div className="card-body">
        <div className="table-responsive">
          <table className="table table-dark table-hover">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id}>
                  <td className="fw-semibold">{user.name}</td>
                  <td className="text-muted">{user.email}</td>
                  <td>
                    <span className={`badge ${user.role === 'admin' ? 'bg-danger' : user.role === 'seller' ? 'bg-warning' : 'bg-primary'}`}>
                      {user.role}
                    </span>
                  </td>
                  <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td>
                    <div className="btn-group btn-group-sm">
                      <button 
                        className="btn btn-outline-warning"
                        onClick={() => handleUserAction(user._id, 'promote')}
                        disabled={user.role === 'admin'}
                      >
                        <i className="bi bi-arrow-up me-1"></i>Promote
                      </button>
                      <button 
                        className="btn btn-outline-danger"
                        onClick={() => handleUserAction(user._id, 'demote')}
                        disabled={user.role === 'customer'}
                      >
                        <i className="bi bi-arrow-down me-1"></i>Demote
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderProducts = () => (
    <div className="card">
      <div className="card-header">
        <h5 className="mb-0">
          <i className="bi bi-box me-2"></i>Product Management
        </h5>
      </div>
      <div className="card-body">
        <div className="table-responsive">
          <table className="table table-dark table-hover">
            <thead>
              <tr>
                <th>Name</th>
                <th>Price</th>
                <th>Category</th>
                <th>Seller</th>
                <th>Stock</th>
                <th>Rating</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product._id}>
                  <td className="fw-semibold">{product.name}</td>
                  <td className="text-primary fw-bold">${product.price}</td>
                  <td>
                    <span className="badge bg-secondary">{product.category}</span>
                  </td>
                  <td className="text-muted">{product.seller?.name}</td>
                  <td>
                    <span className={`badge ${product.stock > 10 ? 'bg-success' : product.stock > 0 ? 'bg-warning' : 'bg-danger'}`}>
                      {product.stock}
                    </span>
                  </td>
                  <td>
                    <div className="d-flex align-items-center">
                      <i className="bi bi-star-fill text-warning me-1"></i>
                      {product.averageRating.toFixed(1)} 
                      <span className="text-muted ms-1">({product.totalRatings})</span>
                    </div>
                  </td>
                  <td>
                    <button 
                      className="btn btn-outline-danger btn-sm"
                      onClick={() => handleProductAction(product._id, 'delete')}
                    >
                      <i className="bi bi-trash me-1"></i>Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderOrders = () => (
    <div className="card">
      <div className="card-header">
        <h5 className="mb-0">
          <i className="bi bi-cart-check me-2"></i>Order Management
        </h5>
      </div>
      <div className="card-body">
        <div className="table-responsive">
          <table className="table table-dark table-hover">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Total</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order._id}>
                  <td className="fw-bold text-primary">#{order._id.slice(-6)}</td>
                  <td className="fw-semibold">{order.user?.name}</td>
                  <td className="text-success fw-bold">${order.totalAmount}</td>
                  <td>
                    <select 
                      className="form-select form-select-sm"
                      value={order.status}
                      onChange={(e) => handleOrderStatusUpdate(order._id, e.target.value)}
                    >
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td className="text-muted">{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td>
                    <button className="btn btn-outline-info btn-sm">
                      <i className="bi bi-eye me-1"></i>View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderAnalytics = () => (
    <div className="row g-4">
      <div className="col-md-3">
        <div className="card bg-gradient-primary">
          <div className="card-body text-center">
            <i className="bi bi-people fs-1 mb-3 opacity-75"></i>
            <h5 className="text-light">Total Users</h5>
            <h2 className="text-light fw-bold">{analytics.totalUsers || 0}</h2>
            <p className="text-light opacity-75 mb-0">Registered members</p>
          </div>
        </div>
      </div>
      <div className="col-md-3">
        <div className="card bg-gradient-success">
          <div className="card-body text-center">
            <i className="bi bi-box fs-1 mb-3 opacity-75"></i>
            <h5 className="text-light">Total Products</h5>
            <h2 className="text-light fw-bold">{analytics.totalProducts || 0}</h2>
            <p className="text-light opacity-75 mb-0">Available items</p>
          </div>
        </div>
      </div>
      <div className="col-md-3">
        <div className="card bg-gradient-info">
          <div className="card-body text-center">
            <i className="bi bi-cart-check fs-1 mb-3 opacity-75"></i>
            <h5 className="text-light">Total Orders</h5>
            <h2 className="text-light fw-bold">{analytics.totalOrders || 0}</h2>
            <p className="text-light opacity-75 mb-0">Completed orders</p>
          </div>
        </div>
      </div>
      <div className="col-md-3">
        <div className="card bg-gradient-warning">
          <div className="card-body text-center">
            <i className="bi bi-currency-dollar fs-1 mb-3 opacity-75"></i>
            <h5 className="text-light">Total Revenue</h5>
            <h2 className="text-light fw-bold">${analytics.totalRevenue || 0}</h2>
            <p className="text-light opacity-75 mb-0">All-time earnings</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="container-fluid py-4">
      <div className="d-flex align-items-center mb-4">
        <i className="bi bi-shield-lock text-primary fs-2 me-3"></i>
        <div>
          <h1 className="h2 fw-bold text-light mb-1">Admin Dashboard</h1>
          <p className="text-muted mb-0">Manage users, products, and orders</p>
        </div>
      </div>
      
      <div className="card mb-4">
        <div className="card-body p-0">
          <ul className="nav nav-tabs nav-fill">
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'analytics' ? 'active' : ''}`}
                onClick={() => setActiveTab('analytics')}
              >
                <i className="bi bi-graph-up me-2"></i>Analytics
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'users' ? 'active' : ''}`}
                onClick={() => setActiveTab('users')}
              >
                <i className="bi bi-people me-2"></i>Users <span className="badge bg-primary ms-1">{users.length}</span>
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'products' ? 'active' : ''}`}
                onClick={() => setActiveTab('products')}
              >
                <i className="bi bi-box me-2"></i>Products <span className="badge bg-success ms-1">{products.length}</span>
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'orders' ? 'active' : ''}`}
                onClick={() => setActiveTab('orders')}
              >
                <i className="bi bi-cart-check me-2"></i>Orders <span className="badge bg-info ms-1">{orders.length}</span>
              </button>
            </li>
          </ul>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" style={{ width: '3rem', height: '3rem' }} role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3 text-muted">Loading dashboard data...</p>
        </div>
      ) : (
        <div>
          {activeTab === 'analytics' && renderAnalytics()}
          {activeTab === 'users' && renderUsers()}
          {activeTab === 'products' && renderProducts()}
          {activeTab === 'orders' && renderOrders()}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
