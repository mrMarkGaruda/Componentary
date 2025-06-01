import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';

const CartDrawer = () => {
  const { cart, cartOpen, setCartOpen, removeFromCart, updateQuantity, cartTotal } = useCart();

  if (!cartOpen) return null;

  return (
    <div className="position-fixed top-0 end-0 h-100 bg-white shadow" 
         style={{ width: '350px', zIndex: 1050, transform: cartOpen ? 'translateX(0)' : 'translateX(100%)', 
                  transition: 'transform 0.3s ease-in-out', overflow: 'auto' }}>
      <div className="p-3 border-bottom d-flex justify-content-between align-items-center">
        <h5 className="m-0">Your Cart ({cart.length})</h5>
        <button className="btn-close" onClick={() => setCartOpen(false)} aria-label="Close"></button>
      </div>
      
      <div className="p-3">
        {cart.length === 0 ? (
          <div className="text-center py-5">
            <i className="bi bi-cart fs-1 text-muted"></i>
            <p className="mt-3">Your cart is empty</p>
            <button className="btn btn-outline-primary btn-sm" onClick={() => setCartOpen(false)}>
              Continue Shopping
            </button>
          </div>
        ) : (
          <>
            {cart.map(item => (
              <div key={item.id} className="card mb-3">
                <div className="row g-0">
                  <div className="col-4">
                    <img 
                      src={item.image} 
                      className="img-fluid rounded-start" 
                      alt={item.name} 
                      style={{ height: '100%', objectFit: 'cover' }}
                    />
                  </div>
                  <div className="col-8">
                    <div className="card-body p-2">
                      <h6 className="card-title">{item.name}</h6>
                      <p className="card-text text-primary mb-1">${(item.price).toFixed(2)}</p>
                      
                      <div className="d-flex align-items-center mt-2">
                        <div className="input-group input-group-sm" style={{ width: '100px' }}>
                          <button 
                            className="btn btn-outline-secondary" 
                            type="button"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                          >-</button>
                          <input 
                            type="text" 
                            className="form-control text-center" 
                            value={item.quantity} 
                            readOnly
                          />
                          <button 
                            className="btn btn-outline-secondary" 
                            type="button"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          >+</button>
                        </div>
                        
                        <button 
                          className="btn btn-sm text-danger ms-2" 
                          onClick={() => removeFromCart(item.id)}
                        >
                          <i className="bi bi-trash"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            <div className="border-top pt-3 mt-3">
              <div className="d-flex justify-content-between mb-3">
                <span className="fw-bold">Total:</span>
                <span className="fw-bold">${cartTotal.toFixed(2)}</span>
              </div>
              
              <Link 
                to="/checkout" 
                className="btn btn-primary w-100"
                onClick={() => setCartOpen(false)}
              >
                Proceed to Checkout
              </Link>
              
              <button 
                className="btn btn-outline-secondary w-100 mt-2"
                onClick={() => setCartOpen(false)}
              >
                Continue Shopping
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CartDrawer;