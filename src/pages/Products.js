import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import ProductCard from '../components/ProductCard';
import api from '../utils/api';
import { toast } from 'react-toastify';
import '../css/Products.css';


const Products = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    lowStock: false
  });

  const navigate = useNavigate();

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.search) params.append('search', filters.search);
      if (filters.category) params.append('category', filters.category);
      if (filters.lowStock) params.append('lowStock', 'true');

      const response = await api.get(`/products?${params.toString()}`);
      setProducts(response.data.data);
    } catch {
      toast.error('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  }, [filters.search, filters.category, filters.lowStock]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    (async () => {
      try {
        const response = await api.get('/categories');
        setCategories(response.data.data);
      } catch {
        toast.error('Failed to fetch categories');
      }
    })();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await api.delete(`/products/${id}`);
      toast.success('Product deleted successfully');
      fetchProducts();
    } catch {
      toast.error('Failed to delete product');
    }
  };

  const handleEdit = (product) => {
    navigate(`/admin/products/edit/${product._id}`);
  };

  return (
    <>
      <Navbar />
      <div className="dashboard-layout">
        <Sidebar />
        <main className="main-content">
          <div className="page-header">
            <div>
              <h1 className="page-title">Products</h1>
              <p className="page-subtitle">Manage your inventory</p>
            </div>
            <Link to="/admin/products/add" className="btn btn-primary">
              + Add Product
            </Link>
          </div>

          <div className="card filters-card">
            <div className="filters-grid">
              <div className="form-group">
                <input
                  type="text"
                  placeholder="Search products..."
                  className="form-input"
                  value={filters.search}
                  onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
                />
              </div>

              <div className="form-group">
                <select
                  className="form-select"
                  value={filters.category}
                  onChange={(e) => setFilters((prev) => ({ ...prev, category: e.target.value }))}
                >
                  <option value="">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={filters.lowStock}
                    onChange={(e) => setFilters((prev) => ({ ...prev, lowStock: e.target.checked }))}
                  />
                  <span>Low Stock Only</span>
                </label>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="loading">Loading products...</div>
          ) : products.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📦</div>
              <h3>No products found</h3>
              <p>Start by adding your first product</p>
              <Link to="/admin/products/add" className="btn btn-primary">
                Add Product
              </Link>
            </div>
          ) : (
            <>
              <div className="products-stats">
                <p>Showing {products.length} products</p>
              </div>
              <div className="products-grid">
                {products.map((product) => (
                  <ProductCard
                    key={product._id}
                    product={product}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            </>
          )}
        </main>
      </div>
    </>
  );
};

export default Products;
