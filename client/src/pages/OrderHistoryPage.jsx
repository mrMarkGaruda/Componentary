import React, { useState, useEffect } from 'react';
import { getCurrentUser } from '../utils/auth';
import { Navigate } from 'react-router-dom';

const OrderHistoryPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const user = getCurrentUser();

  // Redirect if not authenticated
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setError(null);
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/orders`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setOrders(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError('Failed to load orders. Please try again later.');
      setOrders([]); // Ensure orders is always an array
    }
    setLoading(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered': return 'success';
      case 'shipped': return 'info';
      case 'processing': return 'warning';
      case 'cancelled': return 'danger';
      default: return 'secondary';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'delivered': return 'bi-check-circle-fill';
      case 'shipped': return 'bi-truck';
      case 'processing': return 'bi-clock-fill';
      case 'cancelled': return 'bi-x-circle-fill';
      default: return 'bi-hourglass-split';
    }
  };

  const OrderDetailModal = ({ order, onClose }) => {
    if (!order) return null;

    return (
      <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Order Details - #{order._id.slice(-6)}</h5>
              <button type="button" className="btn-close" onClick={onClose}></button>
            </div>
            <div className="modal-body">
              <div className="row mb-3">
                <div className="col-md-6">
                  <strong>Order Date:</strong> {new Date(order.createdAt).toLocaleDateString()}
                </div>
                <div className="col-md-6">
                  <strong>Status:</strong> 
                  <span className={`badge bg-${getStatusColor(order.status)} ms-2`}>
                    <i className={`bi ${getStatusIcon(order.status)} me-1`}></i>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                </div>
              </div>
              
              <div className="mb-3">
                <strong>Shipping Address:</strong>
                <p className="mb-0">
                  {order.shippingAddress?.street}<br />
                  {order.shippingAddress?.city}, {order.shippingAddress?.country} {order.shippingAddress?.zipCode}
                </p>
              </div>
              
              <div className="mb-3">
                <strong>Payment Method:</strong> {order.paymentMethod}
              </div>
              
              <div className="mb-3">
                <strong>Items:</strong>
                <div className="table-responsive">
                  <table className="table table-sm">
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>Quantity</th>
                        <th>Price</th>
                        <th>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {order.items.map((item, index) => (
                        <tr key={index}>
                          <td>
                            <div className="d-flex align-items-center">
                              <img 
                                src={item.product?.image} 
                                alt={item.product?.name}
                                style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                                className="rounded me-2"
                              />
                              {item.product?.name}
                            </div>
                          </td>
                          <td>{item.quantity}</td>
                          <td>${item.price}</td>
                          <td>${(item.quantity * item.price).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              
              <div className="text-end">
                <h5>Total: ${order.totalAmount}</h5>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Close
              </button>
              {order.status === 'delivered' && (
                <button type="button" className="btn btn-primary">
                  Leave Review
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="container py-5">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-4">
        <div className="alert alert-danger" role="alert">
          <i className="bi bi-exclamation-triangle me-2"></i>
          {error}
          <button 
            className="btn btn-outline-danger btn-sm ms-3"
            onClick={fetchOrders}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Order History</h2>
        <span className="text-muted">Total Orders: {orders.length}</span>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-5">
          <i className="bi bi-receipt display-1 text-muted"></i>
          <h4 className="mt-3">No Orders Yet</h4>
          <p className="text-muted">Your order history will appear here after you make your first purchase.</p>
          <a href="/" className="btn btn-primary">
            Start Shopping
          </a>
        </div>
      ) : (
        <div className="row">
          {orders.map((order) => (
            <div key={order._id} className="col-md-6 col-lg-4 mb-4">
              <div className="card h-100">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <h6 className="card-title">Order #{order._id.slice(-6)}</h6>
                    <span className={`badge bg-${getStatusColor(order.status)}`}>
                      <i className={`bi ${getStatusIcon(order.status)} me-1`}></i>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </div>
                  
                  <div className="mb-3">
                    <small className="text-muted">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </small>
                  </div>
                  
                  <div className="mb-3">
                    <div className="d-flex justify-content-between">
                      <span>Items:</span>
                      <span>{order.items.length}</span>
                    </div>
                    <div className="d-flex justify-content-between">
                      <span>Total:</span>
                      <strong>${order.totalAmount}</strong>
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <small className="text-muted">Products:</small>
                    <div className="mt-1">
                      {order.items.slice(0, 2).map((item, index) => (
                        <div key={index} className="d-flex align-items-center mb-1">
                          <img 
                            src={item.product?.image} 
                            alt={item.product?.name}
                            style={{ width: '30px', height: '30px', objectFit: 'cover' }}
                            className="rounded me-2"
                          />
                          <small>{item.product?.name}</small>
                        </div>
                      ))}
                      {order.items.length > 2 && (
                        <small className="text-muted">
                          +{order.items.length - 2} more items
                        </small>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="card-footer">
                  <button 
                    className="btn btn-outline-primary btn-sm w-100"
                    onClick={() => setSelectedOrder(order)}
                  >
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedOrder && (
        <OrderDetailModal 
          order={selectedOrder} 
          onClose={() => setSelectedOrder(null)}
        />
      )}
    </div>
  );
};

export default OrderHistoryPage;
