import React from 'react';
import { Link, useLocation, Navigate } from 'react-router-dom';

const OrderSuccessPage = () => {
  const location = useLocation();
  const orderNumber = location.state?.orderNumber;
  
  // If no order number is provided (e.g., direct access), redirect to home
  if (!orderNumber) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="container py-5 text-center">
      <div className="card shadow-sm border-0 p-4">
        <div className="card-body">
          <div className="mb-4">
            <i className="bi bi-check-circle text-success" style={{ fontSize: '5rem' }}></i>
          </div>
          
          <h2 className="mb-3">Order Successful!</h2>
          
          <p className="lead mb-4">
            Thank you for your purchase. Your order number is:
          </p>
          
          <div className="bg-light py-3 mb-4">
            <h3 className="text-primary"># {orderNumber}</h3>
          </div>
          
          <p className="mb-4">
            We've sent a confirmation email with your order details.
          </p>
          
          <Link to="/" className="btn btn-primary">
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccessPage;