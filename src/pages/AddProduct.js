import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import api from '../utils/api';
import { toast } from 'react-toastify';
import '../css/AddProduct.css';


const AddProduct = () => {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    nameKannada: '',
    category: '',
    buyingPrice: '',
    sellingPrice: '',
    stock: '',
    minStockLevel: '10',
    unit: 'piece',
    description: ''
  });
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchCategories = useCallback(async () => {
    try {
      const response = await api.get('/categories');
      setCategories(response.data.data);
    } catch {
      toast.error('Failed to fetch categories');
    }
  }, []);

  const fetchProduct = useCallback(async () => {
    if (!id) return;
    try {
      const response = await api.get(`/products/${id}`);
      const product = response.data.data;
      setFormData({
        name: product.name,
        nameKannada: product.nameKannada || '',
        category: product.category._id,
        buyingPrice: product.buyingPrice,
        sellingPrice: product.sellingPrice,
        stock: product.stock,
        minStockLevel: product.minStockLevel,
        unit: product.unit,
        description: product.description || ''
      });
      if (product.image) {
        setImagePreview(`http://localhost:5000${product.image}`);
      }
    } catch {
      toast.error('Failed to fetch product');
    }
  }, [id]);

  useEffect(() => {
    fetchCategories();
    if (isEdit) fetchProduct();
  }, [fetchCategories, fetchProduct, isEdit]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = new FormData();
      Object.keys(formData).forEach((key) => data.append(key, formData[key]));
      if (image) data.append('image', image);

      if (isEdit) {
        await api.put(`/products/${id}`, data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('Product updated successfully');
      } else {
        await api.post('/products', data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('Product added successfully');
      }
      navigate('/admin/products');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  const profit =
    Number(formData.sellingPrice || 0) - Number(formData.buyingPrice || 0);
  const profitMargin = formData.buyingPrice
    ? ((profit / Number(formData.buyingPrice)) * 100).toFixed(2)
    : 0;

  return (
    <>
      <Navbar />
      <div className="dashboard-layout">
        <Sidebar />
        <main className="main-content">
          <div className="page-header">
            <div>
              <h1 className="page-title">{isEdit ? 'Edit Product' : 'Add New Product'}</h1>
              <p className="page-subtitle">
                {isEdit ? 'Update product information' : 'Fill in the details below'}
              </p>
            </div>
          </div>

          <div className="add-product-container">
            <form onSubmit={handleSubmit} className="product-form">
              <div className="form-section">
                <h3 className="section-title">Basic Information</h3>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Product Name *</label>
                    <input
                      type="text"
                      name="name"
                      className="form-input"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">ಕನ್ನಡ ಹೆಸರು (Kannada Name)</label>
                    <input
                      type="text"
                      name="nameKannada"
                      className="form-input"
                      value={formData.nameKannada}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Category *</label>
                    <select
                      name="category"
                      className="form-select"
                      value={formData.category}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select Category</option>
                      {categories.map((cat) => (
                        <option key={cat._id} value={cat._id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Unit *</label>
                    <select
                      name="unit"
                      className="form-select"
                      value={formData.unit}
                      onChange={handleChange}
                      required
                    >
                      <option value="piece">Piece</option>
                      <option value="kg">Kilogram (kg)</option>
                      <option value="gram">Gram</option>
                      <option value="liter">Liter</option>
                      <option value="ml">Milliliter (ml)</option>
                      <option value="packet">Packet</option>
                      <option value="bundle">Bundle</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea
                    name="description"
                    className="form-textarea"
                    value={formData.description}
                    onChange={handleChange}
                    rows="3"
                  />
                </div>
              </div>

              <div className="form-section">
                <h3 className="section-title">Pricing</h3>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Buying Price (₹) *</label>
                    <input
                      type="number"
                      name="buyingPrice"
                      className="form-input"
                      value={formData.buyingPrice}
                      onChange={handleChange}
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Selling Price (₹) *</label>
                    <input
                      type="number"
                      name="sellingPrice"
                      className="form-input"
                      value={formData.sellingPrice}
                      onChange={handleChange}
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                </div>

                {formData.buyingPrice && formData.sellingPrice && (
                  <div className="profit-info">
                    <div className="profit-item">
                      <span>Profit per unit:</span>
                      <strong className={profit >= 0 ? 'profit-positive' : 'profit-negative'}>
                        ₹{profit.toFixed(2)}
                      </strong>
                    </div>
                    <div className="profit-item">
                      <span>Profit Margin:</span>
                      <strong className={profitMargin >= 0 ? 'profit-positive' : 'profit-negative'}>
                        {profitMargin}%
                      </strong>
                    </div>
                  </div>
                )}
              </div>

              <div className="form-section">
                <h3 className="section-title">Inventory</h3>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Current Stock *</label>
                    <input
                      type="number"
                      name="stock"
                      className="form-input"
                      value={formData.stock}
                      onChange={handleChange}
                      min="0"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Minimum Stock Level *</label>
                    <input
                      type="number"
                      name="minStockLevel"
                      className="form-input"
                      value={formData.minStockLevel}
                      onChange={handleChange}
                      min="0"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h3 className="section-title">Product Image</h3>

                <div className="image-upload-container">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="file-input"
                    id="image-upload"
                  />
                  <label htmlFor="image-upload" className="file-label">
                    {imagePreview ? 'Change Image' : 'Upload Image'}
                  </label>

                  {imagePreview && (
                    <div className="image-preview">
                      <img src={imagePreview} alt="Preview" />
                    </div>
                  )}
                </div>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  onClick={() => navigate('/admin/products')}
                  className="btn btn-secondary"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Saving...' : isEdit ? 'Update Product' : 'Add Product'}
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </>
  );
};

export default AddProduct;
