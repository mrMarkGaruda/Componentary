import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import CartDrawer from './components/CartDrawer';

// Contexts
import { CartProvider } from './contexts/CartContext';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import NotFoundPage from './pages/NotFoundPage';
import ProductFormPage from './pages/ProductFormPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderSuccessPage from './pages/OrderSuccessPage';

const App = () => {
  return (
    <Router>
      <CartProvider>
        <div className="d-flex flex-column min-vh-100">
          <Navbar />
          <CartDrawer />
          
          <main style={{ minHeight: "calc(100vh - 180px)" }} className="flex-grow-1">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route 
                path="/product/new" 
                element={
                  <ProtectedRoute>
                    <ProductFormPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/product/edit/:id" 
                element={
                  <ProtectedRoute>
                    <ProductFormPage />
                  </ProtectedRoute>
                } 
              />
              <Route path="/product/:id" element={<ProductDetailPage />} />
              <Route 
                path="/checkout" 
                element={
                  <ProtectedRoute>
                    <CheckoutPage />
                  </ProtectedRoute>
                } 
              />
              <Route path="/order-success" element={<OrderSuccessPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </main>
          
          <Footer />
        </div>
      </CartProvider>
    </Router>
  );
};

export default App;