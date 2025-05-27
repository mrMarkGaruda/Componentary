const API_STORAGE_KEY = 'mock_api_products';

// Initialize products in localStorage if they don't exist
const initializeProducts = () => {
  if (!localStorage.getItem(API_STORAGE_KEY)) {
    const initialProducts = [
      {
        id: '1',
        name: 'Smartphone X',
        price: 599.99,
        description: 'Latest smartphone with advanced camera and long battery life.',
        image: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?q=80&w=2118&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
      },
      {
        id: '2',
        name: 'Wireless Headphones',
        price: 129.99,
        description: 'Premium noise-cancelling wireless headphones with 30-hour battery life.',
        image: 'https://images.unsplash.com/photo-1612465289702-7c84b5258fde?q=80&w=1946&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
      },
      {
        id: '3',
        name: 'Fitness Tracker',
        price: 89.99,
        description: 'Track your steps, heart rate, and sleep with this water-resistant fitness band.',
        image: 'https://images.unsplash.com/photo-1532435109783-fdb8a2be0baa?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
      }
    ];
    localStorage.setItem(API_STORAGE_KEY, JSON.stringify(initialProducts));
  }
};

// Get all products
export const fetchProducts = async () => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  try {
    initializeProducts();
    const products = JSON.parse(localStorage.getItem(API_STORAGE_KEY) || '[]');
    return products;
  } catch (error) {
    console.error('Error fetching products:', error);
    throw new Error('Failed to fetch products');
  }
};

// Get single product
export const fetchProductById = async (id) => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  try {
    initializeProducts();
    const products = JSON.parse(localStorage.getItem(API_STORAGE_KEY) || '[]');
    const product = products.find(p => p.id === id);
    
    if (!product) {
      throw new Error('Product not found');
    }
    
    return product;
  } catch (error) {
    console.error(`Error fetching product ${id}:`, error);
    throw error;
  }
};

// Create product (requires auth)
export const createProduct = async (productData, token) => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  try {
    if (!token) {
      throw new Error('Authentication required');
    }
    
    initializeProducts();
    const products = JSON.parse(localStorage.getItem(API_STORAGE_KEY) || '[]');
    
    // Generate a new unique ID (timestamp + random)
    const newProduct = {
      ...productData,
      id: Date.now().toString() + Math.random().toString(36).substring(2, 9)
    };
    
    products.push(newProduct);
    localStorage.setItem(API_STORAGE_KEY, JSON.stringify(products));
    
    return newProduct;
  } catch (error) {
    console.error('Error creating product:', error);
    throw error;
  }
};

// Update product (requires auth)
export const updateProduct = async (id, productData, token) => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  try {
    if (!token) {
      throw new Error('Authentication required');
    }
    
    initializeProducts();
    const products = JSON.parse(localStorage.getItem(API_STORAGE_KEY) || '[]');
    const productIndex = products.findIndex(p => p.id === id);
    
    if (productIndex === -1) {
      throw new Error('Product not found');
    }
    
    // Update the product
    const updatedProduct = { ...products[productIndex], ...productData, id };
    products[productIndex] = updatedProduct;
    
    localStorage.setItem(API_STORAGE_KEY, JSON.stringify(products));
    
    return updatedProduct;
  } catch (error) {
    console.error(`Error updating product ${id}:`, error);
    throw error;
  }
};

// Delete product (requires auth)
export const deleteProduct = async (id, token) => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 600));
  
  try {
    if (!token) {
      throw new Error('Authentication required');
    }
    
    initializeProducts();
    const products = JSON.parse(localStorage.getItem(API_STORAGE_KEY) || '[]');
    const updatedProducts = products.filter(p => p.id !== id);
    
    if (products.length === updatedProducts.length) {
      throw new Error('Product not found');
    }
    
    localStorage.setItem(API_STORAGE_KEY, JSON.stringify(updatedProducts));
    
    return true;
  } catch (error) {
    console.error(`Error deleting product ${id}:`, error);
    throw error;
  }
};