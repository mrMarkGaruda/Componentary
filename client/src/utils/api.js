import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Get all products
export const fetchProducts = async () => {
  try {
    const res = await axios.get(`${API_BASE_URL}/api/products`);
    return res.data;
  } catch (error) {
    throw new Error('Failed to fetch products');
  }
};

// Get single product
export const fetchProductById = async (id) => {
  try {
    const res = await axios.get(`${API_BASE_URL}/api/products/${id}`);
    return res.data;
  } catch (error) {
    throw new Error('Failed to fetch product');
  }
};

// Create product (requires auth)
export const createProduct = async (productData, token) => {
  try {
    const res = await axios.post(`${API_BASE_URL}/api/products`, productData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
  } catch (error) {
    throw new Error('Failed to create product');
  }
};

// Update product (requires auth)
export const updateProduct = async (id, productData, token) => {
  try {
    const res = await axios.put(`${API_BASE_URL}/api/products/${id}`, productData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
  } catch (error) {
    throw new Error('Failed to update product');
  }
};

// Delete product (requires auth)
export const deleteProduct = async (id, token) => {
  try {
    await axios.delete(`${API_BASE_URL}/api/products/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return true;
  } catch (error) {
    throw new Error('Failed to delete product');
  }
};

// Place order
export const placeOrder = async (orderData, token) => {
  try {
    const res = await axios.post(`${API_BASE_URL}/api/orders`, orderData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to place order');
  }
};

// Get frequently bought together for a product
export const fetchBoughtTogether = async (productId) => {
  try {
    const res = await axios.get(`${API_BASE_URL}/api/recommendations/bought-together/${productId}`);
    return res.data;
  } catch (error) {
    return [];
  }
};