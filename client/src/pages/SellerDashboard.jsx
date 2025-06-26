import React, { useState, useEffect } from 'react';
import { getCurrentUser } from '../utils/auth';
import { Navigate, Link } from 'react-router-dom';

const SellerDashboard = () => {
  const [activeTab, setActiveTab] = useState('products');
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [analytics, setAnalytics] = useState({});
  const [loading, setLoading] = useState(true);
  const user = getCurrentUser();

  // Redirect if not seller or admin
  if (!user || (user.role !== 'seller' && user.role !== 'admin')) {
    return <Navigate to="/" replace />;
  }

  useEffect(() => {
    fetchDashboardData();
  }, [activeTab]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/seller/${activeTab}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      
      if (activeTab === 'products') setProducts(data);
      else if (activeTab === 'orders') setOrders(data);
      else if (activeTab === 'analytics') setAnalytics(data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
    setLoading(false);
  };

  const handleProductToggle = async (productId, action) => {
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

  const renderProducts = () => (
    <div className="card">
      <div className="card-header d-flex justify-content-between align-items-center">
        <h5 className="mb-0">
          <i className="bi bi-box-seam me-2"></i>My Products
        </h5>
        <Link to="/product/new" className="btn btn-primary">
          <i className="bi bi-plus-circle me-1"></i>Add New Product
        </Link>
      </div>
      <div className="card-body">
        {products.length === 0 ? (
          <div className="text-center py-5">
            <i className="bi bi-box-seam display-1 text-muted opacity-50"></i>
            <h4 className="mt-3 text-light">No Products Yet</h4>
            <p className="text-muted">Start by adding your first product to your store.</p>
            <Link to="/product/new" className="btn btn-primary btn-lg">
              <i className="bi bi-plus-circle me-2"></i>Add Your First Product
            </Link>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-dark table-hover">
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Name</th>
                  <th>Price</th>
                  <th>Category</th>
                  <th>Stock</th>
                  <th>Rating</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product._id}>
                    <td>
                      <img 
                        src={product.image} 
                        alt={product.name}
                        style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                        className="rounded"
                      />
                    </td>
                    <td className="fw-semibold">{product.name}</td>
                    <td className="text-primary fw-bold">${product.price}</td>
                    <td>
                      <span className="badge bg-secondary">{product.category}</span>
                    </td>
                    <td>
                      <span className={`badge ${product.stock > 10 ? 'bg-success' : product.stock > 0 ? 'bg-warning' : 'bg-danger'}`}>
                        {product.stock}
                      </span>
                    </td>
                    <td>
                      <div className="d-flex align-items-center">
                        <i className="bi bi-star-fill text-warning me-1"></i>
                        <span className="me-1">{product.averageRating.toFixed(1)}</span>
                        <small className="text-muted">({product.totalRatings})</small>
                      </div>
                    </td>
                    <td>
                      <div className="btn-group btn-group-sm">
                        <Link 
                          to={`/product/${product._id}`}
                          className="btn btn-outline-info"
                        >
                          <i className="bi bi-eye me-1"></i>View
                        </Link>
                        <Link 
                          to={`/product/edit/${product._id}`}
                          className="btn btn-outline-primary"
                        >
                          <i className="bi bi-pencil me-1"></i>Edit
                        </Link>
                        <button 
                          className="btn btn-outline-danger"
                          onClick={() => handleProductToggle(product._id, 'delete')}
                        >
                          <i className="bi bi-trash me-1"></i>Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );

  const renderOrders = () => (
    <div className="card">
      <div className="card-header">
        <h5 className="mb-0">
          <i className="bi bi-receipt me-2"></i>Orders for My Products
        </h5>
      </div>
      <div className="card-body">
        {orders.length === 0 ? (
          <div className="text-center py-5">
            <i className="bi bi-receipt display-1 text-muted opacity-50"></i>
            <h4 className="mt-3 text-light">No Orders Yet</h4>
            <p className="text-muted">Orders for your products will appear here.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-dark table-hover">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Product</th>
                  <th>Quantity</th>
                  <th>Amount</th>
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
                    <td>
                      {order.items.map((item, index) => (
                        <div key={index} className="small">
                          {item.product?.name}
                        </div>
                      ))}
                    </td>
                    <td>
                      {order.items.map((item, index) => (
                        <div key={index}>
                          <span className="badge bg-info">{item.quantity}</span>
                        </div>
                      ))}
                    </td>
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
                        <i className="bi bi-chat-dots me-1"></i>Contact
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );

  const renderAnalytics = () => (
    <div>
      <div className="row g-4 mb-4">
        <div className="col-md-3">
          <div className="card bg-gradient-primary">
            <div className="card-body text-center">
              <i className="bi bi-box-seam fs-1 mb-3 opacity-75"></i>
              <h5 className="text-light">Total Products</h5>
              <h2 className="text-light fw-bold">{analytics.totalProducts || 0}</h2>
              <p className="text-light opacity-75 mb-0">Listed items</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-gradient-success">
            <div className="card-body text-center">
              <i className="bi bi-graph-up fs-1 mb-3 opacity-75"></i>
              <h5 className="text-light">Total Sales</h5>
              <h2 className="text-light fw-bold">{analytics.totalOrders || 0}</h2>
              <p className="text-light opacity-75 mb-0">Orders sold</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-gradient-info">
            <div className="card-body text-center">
              <i className="bi bi-currency-dollar fs-1 mb-3 opacity-75"></i>
              <h5 className="text-light">Revenue</h5>
              <h2 className="text-light fw-bold">${analytics.totalRevenue || 0}</h2>
              <p className="text-light opacity-75 mb-0">Total earnings</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-gradient-warning">
            <div className="card-body text-center">
              <i className="bi bi-star-fill fs-1 mb-3 opacity-75"></i>
              <h5 className="text-light">Avg Rating</h5>
              <h2 className="text-light fw-bold">{analytics.averageRating || 0}</h2>
              <p className="text-light opacity-75 mb-0">Customer rating</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="row g-4">
        <div className="col-md-6">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">
                <i className="bi bi-trophy me-2"></i>Top Selling Products
              </h5>
            </div>
            <div className="card-body">
              {analytics.topProducts?.length > 0 ? (
                analytics.topProducts.map((product, index) => (
                  <div key={product._id} className="d-flex justify-content-between align-items-center py-2 border-bottom">
                    <div>
                      <span className="fw-semibold">{index + 1}. {product.name}</span>
                    </div>
                    <span className="badge bg-primary">{product.salesCount} sales</span>
                  </div>
                ))
              ) : (
                <div className="text-center py-3">
                  <i className="bi bi-graph-down text-muted fs-1"></i>
                  <p className="text-muted mt-2 mb-0">No sales data yet</p>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="col-md-6">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">
                <i className="bi bi-chat-quote me-2"></i>Recent Reviews
              </h5>
            </div>
            <div className="card-body">
              {analytics.recentReviews?.length > 0 ? (
                analytics.recentReviews.map((review, index) => (
                  <div key={index} className="border-bottom py-2">
                    <div className="d-flex justify-content-between align-items-start mb-1">
                      <strong className="text-light">{review.productName}</strong>
                      <div className="d-flex align-items-center">
                        <i className="bi bi-star-fill text-warning me-1"></i>
                        <span className="small">{review.rating}</span>
                      </div>
                    </div>
                    <p className="text-muted small mb-0">{review.comment}</p>
                  </div>
                ))
              ) : (
                <div className="text-center py-3">
                  <i className="bi bi-chat-dots text-muted fs-1"></i>
                  <p className="text-muted mt-2 mb-0">No reviews yet</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="container-fluid py-4">
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div className="d-flex align-items-center">
          <i className="bi bi-shop text-primary fs-2 me-3"></i>
          <div>
            <h1 className="h2 fw-bold text-light mb-1">Seller Dashboard</h1>
            <p className="text-muted mb-0">Manage your products and track sales</p>
          </div>
        </div>
        <div className="d-flex align-items-center">
          <span className="badge bg-secondary fs-6 px-3 py-2">Welcome, {user.name}</span>
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
                className={`nav-link ${activeTab === 'products' ? 'active' : ''}`}
                onClick={() => setActiveTab('products')}
              >
                <i className="bi bi-box-seam me-2"></i>Products <span className="badge bg-primary ms-1">{products.length}</span>
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'orders' ? 'active' : ''}`}
                onClick={() => setActiveTab('orders')}
              >
                <i className="bi bi-receipt me-2"></i>Orders <span className="badge bg-success ms-1">{orders.length}</span>
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
          {activeTab === 'products' && renderProducts()}
          {activeTab === 'orders' && renderOrders()}
        </div>
      )}
    </div>
  );
};

export default SellerDashboard;
