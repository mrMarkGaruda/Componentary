import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { createProduct, updateProduct, fetchProductById } from '../utils/api';
import { getToken, getCurrentUser } from '../utils/auth';

const ProductFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;
  const token = getToken();
  const user = getCurrentUser();
  const userRole = user?.role;
  
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    image: '',
    category: '',
    manufacturer: '',
    stock: '0',
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  useEffect(() => {
    if (!userRole || (userRole !== 'admin' && userRole !== 'seller')) {
      setTimeout(() => {
        window.alert('You do not have permission to access this page.');
        navigate('/');
      }, 100);
      return;
    }
    if (isEditMode) {
      const fetchProduct = async () => {
        try {
          setLoading(true);
          const product = await fetchProductById(id);
          setFormData({
            name: product.name,
            price: product.price.toString(),
            description: product.description,
            image: product.image || '',
            category: product.category || '',
            manufacturer: product.manufacturer || '',
            stock: product.stock ? product.stock.toString() : '0',
          });
          setLoading(false);
        } catch (err) {
          setError('Failed to load product details');
          setLoading(false);
        }
      };
      
      fetchProduct();
    }
  }, [id, isEditMode, userRole, navigate]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      // Convert price and stock to numbers and provide default image if empty
      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock, 10),
        image: formData.image || '/assets/no-image.png', // Provide default image if empty
      };
      
      if (isEditMode) {
        await updateProduct(id, productData, token);
      } else {
        await createProduct(productData, token);
      }
      
      navigate('/');
    } catch (err) {
      setError(err.message || 'Failed to save product');
    } finally {
      setLoading(false);
    }
  };
  
  if (!userRole || (userRole !== 'admin' && userRole !== 'seller')) {
    return null;
  }
  
  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card shadow">
            <div className="card-body p-4">
              <h2 className="text-center mb-4">
                {isEditMode ? 'Edit Product' : 'Create New Product'}
              </h2>
              
              {error && <div className="alert alert-danger">{error}</div>}
              
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="name" className="form-label">
                    Product Name
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div className="mb-3">
                  <label htmlFor="price" className="form-label">
                    Price
                  </label>
                  <div className="input-group">
                    <span className="input-group-text">$</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      className="form-control"
                      id="price"
                      name="price"
                      value={formData.price}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
                
                <div className="mb-3">
                  <label htmlFor="category" className="form-label">
                    Category
                  </label>
                  <select
                    className="form-select"
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select a category</option>
                    <option value="CPU">CPU</option>
                    <option value="GPU">GPU</option>
                    <option value="Motherboard">Motherboard</option>
                    <option value="RAM">RAM</option>
                    <option value="Storage">Storage</option>
                    <option value="PSU">PSU</option>
                    <option value="Case">Case</option>
                    <option value="Cooling">Cooling</option>
                    <option value="Monitor">Monitor</option>
                    <option value="Keyboard">Keyboard</option>
                    <option value="Mouse">Mouse</option>
                    <option value="Networking">Networking</option>
                    <option value="Audio">Audio</option>
                    <option value="Software">Software</option>
                    <option value="Accessories">Accessories</option>
                    <option value="Prebuilt">Prebuilt</option>
                    <option value="Laptop">Laptop</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                
                <div className="mb-3">
                  <label htmlFor="manufacturer" className="form-label">
                    Manufacturer
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="manufacturer"
                    name="manufacturer"
                    value={formData.manufacturer}
                    onChange={handleChange}
                    placeholder="e.g., Intel, AMD, NVIDIA, ASUS"
                    required
                  />
                </div>
                
                <div className="mb-3">
                  <label htmlFor="stock" className="form-label">
                    Stock Quantity
                  </label>
                  <input
                    type="number"
                    min="0"
                    className="form-control"
                    id="stock"
                    name="stock"
                    value={formData.stock}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div className="mb-3">
                  <label htmlFor="description" className="form-label">
                    Description
                  </label>
                  <textarea
                    className="form-control"
                    id="description"
                    name="description"
                    rows="4"
                    value={formData.description}
                    onChange={handleChange}
                    required
                  ></textarea>
                </div>
                
                <div className="mb-3">
                  <label htmlFor="image" className="form-label">
                    Image URL
                  </label>
                  <input
                    type="url"
                    className="form-control"
                    id="image"
                    name="image"
                    value={formData.image}
                    onChange={handleChange}
                    placeholder="https://example.com/image.jpg"
                  />
                  <div className="form-text">Leave empty to use default image</div>
                </div>
                
                <div className="d-grid gap-2">
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Processing...
                      </>
                    ) : isEditMode ? (
                      'Update Product'
                    ) : (
                      'Create Product'
                    )}
                  </button>
                  
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => navigate('/')}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductFormPage;