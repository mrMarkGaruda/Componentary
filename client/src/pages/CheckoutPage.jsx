import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { isAuthenticated } from '../utils/auth';
import { placeOrder } from '../utils/api';
import { getToken, getCurrentUser } from '../utils/auth';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { cart, cartTotal, clearCart } = useCart();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    address: '',
    city: '',
    postalCode: '',
    country: '',
    cardName: '',
    cardNumber: '',
    expDate: '',
    cvv: '',
    paymentMethod: 'credit_card', // default to credit card
  });
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const user = getCurrentUser();

  // Redirect if not authenticated
  if (!isAuthenticated()) {
    return (
      <div className="container py-5 text-center">
        <div className="alert alert-warning">
          <h4>Please log in to checkout</h4>
          <p>You need to be logged in to complete your purchase.</p>
          <Link to="/login" className="btn btn-primary">Login</Link>
        </div>
      </div>
    );
  }

  // Redirect if cart is empty
  if (cart.length === 0) {
    return (
      <div className="container py-5 text-center">
        <div className="alert alert-info">
          <h4>Your cart is empty</h4>
          <p>Add some products to your cart before checking out.</p>
          <Link to="/" className="btn btn-primary">Browse Products</Link>
        </div>
      </div>
    );
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (step === 1) {
      setStep(2);
      window.scrollTo(0, 0);
      return;
    }
    setLoading(true);
    try {
      // Prepare order data
      const paymentMethodMap = {
        credit_card: 'credit_card',
        paypal: 'paypal',
        bank_transfer: 'bank_transfer',
      };
      const orderData = {
        items: cart.map(item => ({
          product: item._id,
          quantity: item.quantity,
          price: item.price
        })),
        totalAmount: cartTotal,
        shippingAddress: {
          street: formData.address,
          city: formData.city,
          country: formData.country,
          zipCode: formData.postalCode
        },
        paymentMethod: paymentMethodMap[formData.paymentMethod] || 'credit_card',
        paymentStatus: 'completed',
      };
      await placeOrder(orderData, getToken());
      // Record purchase for recommendations
      await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/recommendations/record-purchase`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify({ userId: user.id, productIds: cart.map(item => item._id) })
      });
      setLoading(false);
      clearCart();
      const orderNumber = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
      navigate('/order-success', { state: { orderNumber } });
    } catch (err) {
      setLoading(false);
      alert(err.message || 'Failed to place order.');
    }
  };

  return (
    <div className="container py-4">
      {/* Progress Indicator */}
      <div className="mb-4">
        <div className="progress" style={{ height: '4px' }}>
          <div 
            className="progress-bar" 
            role="progressbar" 
            style={{ width: step === 1 ? '50%' : '100%' }}
            aria-valuenow={step === 1 ? 50 : 100} 
            aria-valuemin="0" 
            aria-valuemax="100"
          ></div>
        </div>
        <div className="d-flex justify-content-between mt-2">
          <span className="badge bg-primary rounded-pill">1. Shipping</span>
          <span className={`badge ${step === 2 ? 'bg-primary' : 'bg-secondary'} rounded-pill`}>
            2. Payment
          </span>
        </div>
      </div>

      <div className="row">
        {/* Checkout Form */}
        <div className="col-md-8">
          <div className="card mb-4">
            <div className="card-body">
              <h4 className="mb-3">
                {step === 1 ? 'Shipping Information' : 'Payment Details'}
              </h4>
              
              <form onSubmit={handleSubmit}>
                {step === 1 ? (
                  /* Shipping Form */
                  <>
                    <div className="row g-3">
                      <div className="col-12">
                        <label htmlFor="fullName" className="form-label">Full Name</label>
                        <input 
                          type="text" 
                          className="form-control" 
                          id="fullName" 
                          name="fullName"
                          value={formData.fullName}
                          onChange={handleChange}
                          required
                        />
                      </div>
                      
                      <div className="col-12">
                        <label htmlFor="email" className="form-label">Email</label>
                        <input 
                          type="email" 
                          className="form-control" 
                          id="email" 
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                        />
                      </div>
                      
                      <div className="col-12">
                        <label htmlFor="address" className="form-label">Address</label>
                        <input 
                          type="text" 
                          className="form-control" 
                          id="address" 
                          name="address"
                          value={formData.address}
                          onChange={handleChange}
                          required
                        />
                      </div>
                      
                      <div className="col-md-5">
                        <label htmlFor="country" className="form-label">Country</label>
                        <select 
                          className="form-select" 
                          id="country" 
                          name="country"
                          value={formData.country}
                          onChange={handleChange}
                          required
                        >
                          <option value="">Choose...</option>
                          <option value="US">United States</option>
                          <option value="CA">Canada</option>
                          <option value="UK">United Kingdom</option>
                        </select>
                      </div>
                      
                      <div className="col-md-4">
                        <label htmlFor="city" className="form-label">City</label>
                        <input 
                          type="text" 
                          className="form-control" 
                          id="city" 
                          name="city"
                          value={formData.city}
                          onChange={handleChange}
                          required
                        />
                      </div>
                      
                      <div className="col-md-3">
                        <label htmlFor="postalCode" className="form-label">Postal Code</label>
                        <input 
                          type="text" 
                          className="form-control" 
                          id="postalCode" 
                          name="postalCode"
                          value={formData.postalCode}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>
                    
                    <hr className="my-4" />
                    
                    <button type="submit" className="btn btn-primary w-100">
                      Continue to Payment
                    </button>
                  </>
                ) : (
                  /* Payment Form */
                  <>
                    <div className="row g-3">
                      {/* Payment Method Selection */}
                      <div className="col-12 mb-2">
                        <label className="form-label">Payment Method</label>
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="radio"
                            name="paymentMethod"
                            id="creditCard"
                            value="credit_card"
                            checked={formData.paymentMethod === 'credit_card'}
                            onChange={handleChange}
                          />
                          <label className="form-check-label" htmlFor="creditCard">
                            Credit Card
                          </label>
                        </div>
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="radio"
                            name="paymentMethod"
                            id="paypal"
                            value="paypal"
                            checked={formData.paymentMethod === 'paypal'}
                            onChange={handleChange}
                          />
                          <label className="form-check-label" htmlFor="paypal">
                            PayPal
                          </label>
                        </div>
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="radio"
                            name="paymentMethod"
                            id="bankTransfer"
                            value="bank_transfer"
                            checked={formData.paymentMethod === 'bank_transfer'}
                            onChange={handleChange}
                          />
                          <label className="form-check-label" htmlFor="bankTransfer">
                            Bank Transfer
                          </label>
                        </div>
                      </div>
                      
                      {/* Only show card fields if credit card is selected */}
                      {formData.paymentMethod === 'credit_card' && (
                        <>
                          <div className="col-12">
                            <label htmlFor="cardName" className="form-label">Name on Card</label>
                            <input 
                              type="text" 
                              className="form-control" 
                              id="cardName" 
                              name="cardName"
                              value={formData.cardName}
                              onChange={handleChange}
                              required={formData.paymentMethod === 'credit_card'}
                            />
                          </div>
                          
                          <div className="col-12">
                            <label htmlFor="cardNumber" className="form-label">Card Number</label>
                            <input 
                              type="text" 
                              className="form-control" 
                              id="cardNumber" 
                              name="cardNumber"
                              value={formData.cardNumber}
                              onChange={handleChange}
                              required={formData.paymentMethod === 'credit_card'}
                              placeholder="XXXX XXXX XXXX XXXX"
                            />
                          </div>
                          
                          <div className="col-md-6">
                            <label htmlFor="expDate" className="form-label">Expiration Date</label>
                            <input 
                              type="text" 
                              className="form-control" 
                              id="expDate" 
                              name="expDate"
                              value={formData.expDate}
                              onChange={handleChange}
                              required={formData.paymentMethod === 'credit_card'}
                              placeholder="MM/YY"
                            />
                          </div>
                          
                          <div className="col-md-6">
                            <label htmlFor="cvv" className="form-label">CVV</label>
                            <input 
                              type="text" 
                              className="form-control" 
                              id="cvv" 
                              name="cvv"
                              value={formData.cvv}
                              onChange={handleChange}
                              required={formData.paymentMethod === 'credit_card'}
                              placeholder="123"
                            />
                          </div>
                        </>
                      )}
                    </div>
                    
                    <hr className="my-4" />
                    
                    <div className="d-flex gap-2">
                      <button 
                        type="button" 
                        className="btn btn-outline-secondary flex-grow-1"
                        onClick={() => setStep(1)}
                      >
                        Back
                      </button>
                      <button 
                        type="submit" 
                        className="btn btn-primary flex-grow-1"
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            Processing...
                          </>
                        ) : (
                          'Complete Order'
                        )}
                      </button>
                    </div>
                  </>
                )}
              </form>
            </div>
          </div>
        </div>
        
        {/* Order Summary */}
        <div className="col-md-4">
          <div className="card">
            <div className="card-body">
              <h4 className="mb-3">Order Summary</h4>
              
              {cart.map(item => (
                <div key={item._id} className="d-flex justify-content-between mb-2">
                  <div>
                    <span className="fw-bold">{item.quantity}x</span> {item.name}
                  </div>
                  <div>${(item.price * item.quantity).toFixed(2)}</div>
                </div>
              ))}
              
              <hr />
              
              <div className="d-flex justify-content-between mb-2">
                <div>Subtotal</div>
                <div>${cartTotal.toFixed(2)}</div>
              </div>
              
              <div className="d-flex justify-content-between mb-2">
                <div>Shipping</div>
                <div>Free</div>
              </div>
              
              <div className="d-flex justify-content-between mb-2">
                <div>Tax</div>
                <div>${(cartTotal * 0.1).toFixed(2)}</div>
              </div>
              
              <hr />
              
              <div className="d-flex justify-content-between mb-2 fw-bold">
                <div>Total</div>
                <div>${(cartTotal * 1.1).toFixed(2)}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;