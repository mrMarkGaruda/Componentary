import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { CartProvider } from '../client/src/contexts/CartContext';
import ProductCard from '../client/src/components/ProductCard';
import Navbar from '../client/src/components/Navbar';

// Mock the auth utility
jest.mock('../client/src/utils/auth', () => ({
  isAuthenticated: jest.fn(() => false),
  getCurrentUser: jest.fn(() => null),
  logoutUser: jest.fn()
}));

// Test wrapper component
const TestWrapper = ({ children }) => (
  <BrowserRouter>
    <CartProvider>
      {children}
    </CartProvider>
  </BrowserRouter>
);

describe('ProductCard Component', () => {
  const mockProduct = {
    _id: '1',
    name: 'Test Product',
    price: 99.99,
    description: 'Test description',
    image: 'test-image.jpg',
    category: 'Electronics',
    manufacturer: 'Test Manufacturer'
  };

  test('renders product information correctly', () => {
    render(
      <TestWrapper>
        <ProductCard product={mockProduct} />
      </TestWrapper>
    );

    expect(screen.getByText('Test Product')).toBeInTheDocument();
    expect(screen.getByText('$99.99')).toBeInTheDocument();
    expect(screen.getByText('Test description')).toBeInTheDocument();
  });

  test('has functional add to cart button', () => {
    render(
      <TestWrapper>
        <ProductCard product={mockProduct} />
      </TestWrapper>
    );

    const addButton = screen.getByRole('button', { name: /add/i });
    expect(addButton).toBeInTheDocument();
    
    fireEvent.click(addButton);
    // Cart functionality would be tested via context
  });

  test('has view details link', () => {
    render(
      <TestWrapper>
        <ProductCard product={mockProduct} />
      </TestWrapper>
    );

    const detailsLink = screen.getByRole('link', { name: /view details/i });
    expect(detailsLink).toHaveAttribute('href', '/product/1');
  });
});

describe('Navbar Component', () => {
  test('renders main navigation links', () => {
    render(
      <TestWrapper>
        <Navbar />
      </TestWrapper>
    );

    expect(screen.getByText('Componentary')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /home/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /products/i })).toBeInTheDocument();
  });

  test('shows login button when not authenticated', () => {
    render(
      <TestWrapper>
        <Navbar />
      </TestWrapper>
    );

    expect(screen.getByRole('link', { name: /login/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /sign up/i })).toBeInTheDocument();
  });
});
