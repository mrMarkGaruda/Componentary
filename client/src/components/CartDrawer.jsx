import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';

const CartDrawer = () => {
  const { cart, cartOpen, setCartOpen, removeFromCart, updateQuantity, cartTotal } = useCart();

  if (!cartOpen) return null;

  return (
    <div 
      className="position-fixed top-0 end-0 h-100 shadow" 
      style={{ 
        width: '350px', 
        zIndex: 1050, 
        transform: cartOpen ? 'translateX(0)' : 'translateX(100%)', 
        transition: 'transform 0.3s ease-in-out', 
        overflow: 'auto',
        backgroundColor: 'var(--card-bg)',
        borderLeft: '1px solid var(--border-color)'
      }}
    >
      <div 
        className="p-3 d-flex justify-content-between align-items-center"
        style={{ 
          borderBottom: '1px solid var(--border-color)',
          backgroundColor: 'var(--surface-bg)'
        }}
      >
        <h5 className="m-0" style={{ color: 'var(--text-light)' }}>
          Your Cart ({cart.length})
        </h5>
        <button 
          className="btn-close" 
          onClick={() => setCartOpen(false)} 
          aria-label="Close"
          style={{ 
            filter: 'invert(1)',
            opacity: 0.8
          }}
        ></button>
      </div>
      
      <div className="p-3">
        {cart.length === 0 ? (
          <div className="text-center py-5">
            <i className="bi bi-cart fs-1" style={{ color: 'var(--text-muted)' }}></i>
            <p className="mt-3" style={{ color: 'var(--text-light)' }}>Your cart is empty</p>
            <button 
              className="btn btn-sm" 
              onClick={() => setCartOpen(false)}
              style={{
                backgroundColor: 'transparent',
                border: '1px solid var(--primary-color)',
                color: 'var(--primary-color)'
              }}
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <>
            {cart.map(item => (
              <div key={item._id} className="mb-3" style={{ 
                backgroundColor: 'var(--surface-bg)',
                border: '1px solid var(--border-light)',
                borderRadius: '8px',
                overflow: 'hidden'
              }}>
                <div className="row g-0">
                  <div className="col-4">
                    <img 
                      src={item.image} 
                      className="img-fluid" 
                      alt={item.name} 
                      style={{ height: '100%', objectFit: 'cover' }}
                    />
                  </div>
                  <div className="col-8">
                    <div className="p-2">
                      <h6 style={{ color: 'var(--text-light)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                        {item.name}
                      </h6>
                      <p style={{ color: 'var(--primary-color)', marginBottom: '0.5rem', fontWeight: '600' }}>
                        ${(item.price).toFixed(2)}
                      </p>
                      
                      <div className="d-flex align-items-center mt-2">
                        <div className="input-group input-group-sm" style={{ width: '90px' }}>
                          <button 
                            className="btn btn-sm" 
                            type="button"
                            onClick={() => updateQuantity(item._id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            style={{
                              backgroundColor: 'var(--darker-color)',
                              border: '1px solid var(--border-light)',
                              color: 'var(--text-light)'
                            }}
                          >-</button>
                          <input 
                            type="text" 
                            className="form-control text-center" 
                            value={item.quantity} 
                            readOnly
                            style={{
                              backgroundColor: 'var(--darker-color)',
                              border: '1px solid var(--border-light)',
                              color: 'var(--text-light)',
                              fontSize: '0.8rem'
                            }}
                          />
                          <button 
                            className="btn btn-sm"
                            type="button"
                            onClick={() => updateQuantity(item._id, item.quantity + 1)}
                            style={{
                              backgroundColor: 'var(--darker-color)',
                              border: '1px solid var(--border-light)',
                              color: 'var(--text-light)'
                            }}
                          >+</button>
                        </div>
                        
                        <button 
                          className="btn btn-sm ms-2"
                          onClick={() => removeFromCart(item._id)}
                          style={{
                            backgroundColor: 'transparent',
                            border: '1px solid #dc3545',
                            color: '#dc3545',
                            fontSize: '0.75rem',
                            padding: '0.25rem 0.5rem'
                          }}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            <div className="pt-3 mt-3" style={{ borderTop: '1px solid var(--border-color)' }}>
              <div className="d-flex justify-content-between mb-3">
                <span style={{ fontWeight: 'bold', color: 'var(--text-light)' }}>Total:</span>
                <span style={{ fontWeight: 'bold', color: 'var(--text-light)' }}>${cartTotal.toFixed(2)}</span>
              </div>
              
              <Link 
                to="/checkout" 
                className="btn w-100 mb-2"
                onClick={() => setCartOpen(false)}
                style={{
                  backgroundColor: 'var(--primary-color)',
                  border: 'none',
                  color: 'var(--text-light)',
                  fontWeight: '600'
                }}
              >
                Proceed to Checkout
              </Link>
              
              <button 
                className="btn w-100"
                onClick={() => setCartOpen(false)}
                style={{
                  backgroundColor: 'transparent',
                  border: '1px solid var(--border-light)',
                  color: 'var(--text-light)'
                }}
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