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
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4>My Products</h4>
        <Link to="/product/new" className="btn btn-primary">
          <i className="bi bi-plus-circle me-1"></i>Add New Product
        </Link>
      </div>
      
      <div className="table-responsive">
        <table className="table table-striped">
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
                <td>{product.name}</td>
                <td>${product.price}</td>
                <td>{product.category}</td>
                <td>
                  <span className={`badge ${product.stock > 0 ? 'bg-success' : 'bg-danger'}`}>
                    {product.stock}
                  </span>
                </td>
                <td>
                  <div className="d-flex align-items-center">
                    <span className="me-1">{product.averageRating.toFixed(1)}</span>
                    <div className="stars">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <i 
                          key={star}
                          className={`bi bi-star${star <= Math.round(product.averageRating) ? '-fill' : ''}`}
                          style={{ color: '#ffc107', fontSize: '12px' }}
                        ></i>
                      ))}
                    </div>
                    <small className="text-muted ms-1">({product.totalRatings})</small>
                  </div>
                </td>
                <td>
                  <div className="btn-group btn-group-sm">
                    <Link 
                      to={`/product/${product._id}`}
                      className="btn btn-outline-info"
                    >
                      View
                    </Link>
                    <Link 
                      to={`/product/edit/${product._id}`}
                      className="btn btn-outline-primary"
                    >
                      Edit
                    </Link>
                    <button 
                      className="btn btn-outline-danger"
                      onClick={() => handleProductToggle(product._id, 'delete')}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {products.length === 0 && (
        <div className="text-center py-5">
          <i className="bi bi-box-seam display-1 text-muted"></i>
          <h4 className="mt-3">No Products Yet</h4>
          <p className="text-muted">Start by adding your first product to your store.</p>
          <Link to="/product/new" className="btn btn-primary">
            Add Your First Product
          </Link>
        </div>
      )}
    </div>
  );

  const renderOrders = () => (
    <div>
      <h4 className="mb-3">Orders for My Products</h4>
      
      <div className="table-responsive">
        <table className="table table-striped">
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
                <td>#{order._id.slice(-6)}</td>
                <td>{order.user?.name}</td>
                <td>
                  {order.items.map((item, index) => (
                    <div key={index}>
                      {item.product?.name}
                    </div>
                  ))}
                </td>
                <td>
                  {order.items.map((item, index) => (
                    <div key={index}>
                      {item.quantity}
                    </div>
                  ))}
                </td>
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
                    Contact Customer
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {orders.length === 0 && (
        <div className="text-center py-5">
          <i className="bi bi-receipt display-1 text-muted"></i>
          <h4 className="mt-3">No Orders Yet</h4>
          <p className="text-muted">Orders for your products will appear here.</p>
        </div>
      )}
    </div>
  );

  const renderAnalytics = () => (
    <div>
      <h4 className="mb-4">Sales Analytics</h4>
      
      <div className="row mb-4">
        <div className="col-md-3">
          <div className="card bg-primary text-white">
            <div className="card-body">
              <h5>Total Products</h5>
              <h2>{analytics.totalProducts || 0}</h2>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-success text-white">
            <div className="card-body">
              <h5>Total Sales</h5>
              <h2>{analytics.totalOrders || 0}</h2>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-info text-white">
            <div className="card-body">
              <h5>Revenue</h5>
              <h2>${analytics.totalRevenue || 0}</h2>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-warning text-white">
            <div className="card-body">
              <h5>Avg Rating</h5>
              <h2>{analytics.averageRating || 0}</h2>
            </div>
          </div>
        </div>
      </div>
      
      <div className="row">
        <div className="col-md-6">
          <div className="card">
            <div className="card-header">
              <h5>Top Selling Products</h5>
            </div>
            <div className="card-body">
              {analytics.topProducts?.map((product, index) => (
                <div key={product._id} className="d-flex justify-content-between py-2">
                  <span>{index + 1}. {product.name}</span>
                  <span className="badge bg-primary">{product.salesCount} sales</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="col-md-6">
          <div className="card">
            <div className="card-header">
              <h5>Recent Reviews</h5>
            </div>
            <div className="card-body">
              {analytics.recentReviews?.map((review, index) => (
                <div key={index} className="border-bottom py-2">
                  <div className="d-flex justify-content-between">
                    <strong>{review.productName}</strong>
                    <div className="stars">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <i 
                          key={star}
                          className={`bi bi-star${star <= review.rating ? '-fill' : ''}`}
                          style={{ color: '#ffc107', fontSize: '12px' }}
                        ></i>
                      ))}
                    </div>
                  </div>
                  <small className="text-muted">{review.comment}</small>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Seller Dashboard</h2>
        <span className="badge bg-secondary">Welcome, {user.name}</span>
      </div>
      
      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'analytics' ? 'active' : ''}`}
            onClick={() => setActiveTab('analytics')}
          >
            <i className="bi bi-graph-up me-1"></i>Analytics
          </button>
        </li>
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'products' ? 'active' : ''}`}
            onClick={() => setActiveTab('products')}
          >
            <i className="bi bi-box-seam me-1"></i>Products
          </button>
        </li>
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            <i className="bi bi-receipt me-1"></i>Orders
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
          {activeTab === 'products' && renderProducts()}
          {activeTab === 'orders' && renderOrders()}
        </div>
      )}
    </div>
  );
};

export default SellerDashboard;
