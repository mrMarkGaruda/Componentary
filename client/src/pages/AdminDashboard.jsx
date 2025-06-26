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
    <div className="table-responsive">
      <table className="table table-striped">
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
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>
                <span className={`badge bg-${user.role === 'admin' ? 'danger' : user.role === 'seller' ? 'warning' : 'primary'}`}>
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
                    Promote
                  </button>
                  <button 
                    className="btn btn-outline-danger"
                    onClick={() => handleUserAction(user._id, 'demote')}
                    disabled={user.role === 'customer'}
                  >
                    Demote
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderProducts = () => (
    <div className="table-responsive">
      <table className="table table-striped">
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
              <td>{product.name}</td>
              <td>${product.price}</td>
              <td>{product.category}</td>
              <td>{product.seller?.name}</td>
              <td>{product.stock}</td>
              <td>
                {product.averageRating.toFixed(1)} 
                <span className="text-muted">({product.totalRatings})</span>
              </td>
              <td>
                <button 
                  className="btn btn-outline-danger btn-sm"
                  onClick={() => handleProductAction(product._id, 'delete')}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderOrders = () => (
    <div className="table-responsive">
      <table className="table table-striped">
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
              <td>#{order._id.slice(-6)}</td>
              <td>{order.user?.name}</td>
              <td>${order.totalAmount}</td>
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
              <td>{new Date(order.createdAt).toLocaleDateString()}</td>
              <td>
                <button className="btn btn-outline-info btn-sm">
                  View Details
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderAnalytics = () => (
    <div className="row">
      <div className="col-md-3">
        <div className="card bg-primary text-white">
          <div className="card-body">
            <h5>Total Users</h5>
            <h2>{analytics.totalUsers || 0}</h2>
          </div>
        </div>
      </div>
      <div className="col-md-3">
        <div className="card bg-success text-white">
          <div className="card-body">
            <h5>Total Products</h5>
            <h2>{analytics.totalProducts || 0}</h2>
          </div>
        </div>
      </div>
      <div className="col-md-3">
        <div className="card bg-info text-white">
          <div className="card-body">
            <h5>Total Orders</h5>
            <h2>{analytics.totalOrders || 0}</h2>
          </div>
        </div>
      </div>
      <div className="col-md-3">
        <div className="card bg-warning text-white">
          <div className="card-body">
            <h5>Total Revenue</h5>
            <h2>${analytics.totalRevenue || 0}</h2>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="container py-4">
      <h2 className="mb-4">Admin Dashboard</h2>
      
      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'analytics' ? 'active' : ''}`}
            onClick={() => setActiveTab('analytics')}
          >
            Analytics
          </button>
        </li>
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            Users
          </button>
        </li>
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'products' ? 'active' : ''}`}
            onClick={() => setActiveTab('products')}
          >
            Products
          </button>
        </li>
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            Orders
          </button>
        </li>
      </ul>

      {loading ? (
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
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
