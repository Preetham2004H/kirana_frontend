import React, { useState, useEffect, useMemo } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import ProductCard from '../components/ProductCard';
import api from '../utils/api';
import { toast } from 'react-toastify';
import '../css/ShopkeeperDashboard.css';

const ShopkeeperDashboard = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showSaleModal, setShowSaleModal] = useState(false);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await api.get('/products');
      setProducts(response.data.data.filter((p) => Number(p.stock) > 0));
    } catch (error) {
      toast.error('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories');
      setCategories(response.data.data);
    } catch (error) {
      toast.error('Failed to fetch categories');
    }
  };

  const handleProductSelect = (product) => {
    setSelectedProduct(product);
    setQuantity('');
    setShowSaleModal(true);
  };

  const isKg = useMemo(() => selectedProduct?.unit === 'kg', [selectedProduct]);
  const isGram = useMemo(() => selectedProduct?.unit === 'gram', [selectedProduct]);
  const isLiter = useMemo(() => selectedProduct?.unit === 'liter', [selectedProduct]);
  const isMl = useMemo(() => selectedProduct?.unit === 'ml', [selectedProduct]);

  const handleSaleSubmit = async (e) => {
    e.preventDefault();

    const qty = parseFloat(quantity);

    if (!selectedProduct || !qty || qty <= 0) {
      toast.error('Please enter valid quantity');
      return;
    }

    if (qty > Number(selectedProduct.stock)) {
      toast.error(`Only ${selectedProduct.stock} ${selectedProduct.unit} available in stock`);
      return;
    }

    try {
      await api.post('/sales', {
        product: selectedProduct._id,
        quantity: qty
      });

      toast.success('Sale recorded successfully!');
      setShowSaleModal(false);
      setSelectedProduct(null);
      setQuantity('');
      fetchProducts();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to record sale');
    }
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.nameKannada && product.nameKannada.includes(searchTerm));
    const matchesCategory = !selectedCategory || product.category._id === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Determine min/step based on unit for fractional entries
  const quantityInputProps = useMemo(() => {
    if (!selectedProduct) return { min: 1, step: 1 };
    if (isKg) return { min: 0.1, step: 0.1 };         // allow 0.5, 0.2, 0.1 kg
    if (isGram) return { min: 1, step: 50 };          // allow 100g, 200g, 500g
    if (isLiter) return { min: 0.1, step: 0.1 };      // allow 0.5 L, 0.2 L
    if (isMl) return { min: 50, step: 50 };           // allow 100 ml, 250 ml, 500 ml
    return { min: 1, step: 1 };
  }, [selectedProduct, isKg, isGram, isLiter, isMl]);

  const setQuickQty = (val) => setQuantity(String(val));

  return (
    <>
      <Navbar />
      <div className="dashboard-layout">
        <Sidebar />
        <main className="main-content">
          <div className="page-header">
            <div>
              <h1 className="page-title">Shopkeeper Dashboard</h1>
              <p className="page-subtitle">Select product to record sale</p>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="card filters-card">
            <div className="filters-grid">
              <div className="form-group">
                <input
                  type="text"
                  placeholder="Search products..."
                  className="form-input"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="form-group">
                <select
                  className="form-select"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <option value="">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          {loading ? (
            <div className="loading">Loading products...</div>
          ) : filteredProducts.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📦</div>
              <h3>No products available</h3>
              <p>Products with stock will appear here</p>
            </div>
          ) : (
            <>
              <div className="products-stats">
                <p>Showing {filteredProducts.length} products</p>
              </div>
              <div className="products-grid">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product._id}
                    product={product}
                    onSelect={handleProductSelect}
                    showProfit={false}
                  />
                ))}
              </div>
            </>
          )}

          {/* Sale Modal */}
          {showSaleModal && selectedProduct && (
            <div className="modal-overlay" onClick={() => setShowSaleModal(false)}>
              <div className="modal-content sale-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                  <h2>Record Sale</h2>
                  <button onClick={() => setShowSaleModal(false)} className="modal-close">
                    ×
                  </button>
                </div>

                <div className="sale-modal-body">
                  <div className="product-summary">
                    <h3>{selectedProduct.name}</h3>
                    {selectedProduct.nameKannada && (
                      <p className="kannada-name">{selectedProduct.nameKannada}</p>
                    )}

                    <div className="product-details">
                      <div className="detail-item">
                        <span>Category:</span>
                        <strong>{selectedProduct.category.name}</strong>
                      </div>
                      <div className="detail-item">
                        <span>Available Stock:</span>
                        <strong>
                          {selectedProduct.stock} {selectedProduct.unit}
                        </strong>
                      </div>
                      <div className="detail-item">
                        <span>Price per unit:</span>
                        <strong>₹{selectedProduct.sellingPrice}</strong>
                      </div>
                    </div>
                  </div>

                  <form onSubmit={handleSaleSubmit} className="sale-form">
                    {/* Quick quantity chips */}
                    {(isKg || isGram || isLiter || isMl) && (
                      <div className="quick-qty" style={{ display: 'flex', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
                        {isKg && (
                          <>
                            <button type="button" className="btn btn-sm btn-secondary" onClick={() => setQuickQty(0.5)}>0.5 kg</button>
                            <button type="button" className="btn btn-sm btn-secondary" onClick={() => setQuickQty(0.2)}>0.2 kg</button>
                            <button type="button" className="btn btn-sm btn-secondary" onClick={() => setQuickQty(0.1)}>0.1 kg</button>
                          </>
                        )}
                        {isGram && (
                          <>
                            <button type="button" className="btn btn-sm btn-secondary" onClick={() => setQuickQty(100)}>100 g</button>
                            <button type="button" className="btn btn-sm btn-secondary" onClick={() => setQuickQty(200)}>200 g</button>
                            <button type="button" className="btn btn-sm btn-secondary" onClick={() => setQuickQty(500)}>500 g</button>
                          </>
                        )}
                        {isLiter && (
                          <>
                            <button type="button" className="btn btn-sm btn-secondary" onClick={() => setQuickQty(0.5)}>0.5 L</button>
                            <button type="button" className="btn btn-sm btn-secondary" onClick={() => setQuickQty(0.25)}>0.25 L</button>
                          </>
                        )}
                        {isMl && (
                          <>
                            <button type="button" className="btn btn-sm btn-secondary" onClick={() => setQuickQty(250)}>250 ml</button>
                            <button type="button" className="btn btn-sm btn-secondary" onClick={() => setQuickQty(500)}>500 ml</button>
                          </>
                        )}
                      </div>
                    )}

                    <div className="form-group">
                      <label className="form-label">
                        Quantity ({selectedProduct.unit}) *
                      </label>
                      <input
                        type="number"
                        className="form-input"
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        min={quantityInputProps.min}
                        step={quantityInputProps.step}
                        max={selectedProduct.stock}
                        required
                        autoFocus
                      />
                      {/* If the browser still blocks unusual decimals, you can swap step to "any" to accept any fractional value */}
                      {/* e.g., step="any" */}
                    </div>

                    {Number(quantity) > 0 && (
                      <div className="sale-summary">
                        <div className="summary-row">
                          <span>Quantity:</span>
                          <strong>
                            {quantity} {selectedProduct.unit}
                          </strong>
                        </div>
                        <div className="summary-row">
                          <span>Price per unit:</span>
                          <strong>₹{selectedProduct.sellingPrice}</strong>
                        </div>
                        <div className="summary-row total">
                          <span>Total Amount:</span>
                          <strong>₹{(Number(quantity) * selectedProduct.sellingPrice).toFixed(2)}</strong>
                        </div>
                      </div>
                    )}

                    <div className="modal-actions">
                      <button
                        type="button"
                        onClick={() => setShowSaleModal(false)}
                        className="btn btn-secondary"
                      >
                        Cancel
                      </button>
                      <button type="submit" className="btn btn-success">
                        Record Sale
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </>
  );
};

export default ShopkeeperDashboard;
