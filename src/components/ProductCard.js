import React from 'react';
import '../css/ProductCard.css';

const FILES_BASE = process.env.REACT_APP_FILES_URL || ''; // e.g., https://your-backend.onrender.com

const ProductCard = ({ product, onEdit, onDelete, onSelect, showProfit = true }) => {
  const imgSrc = product?.image ? `${FILES_BASE}${product.image}` : '';

  const stockStatus = () => {
    if (!product) return '';
    if (product.stock === 0) return 'out-of-stock';
    if (product.stock <= product.minStockLevel) return 'low-stock';
    return 'in-stock';
  };

  const profit =
    product?.sellingPrice != null && product?.buyingPrice != null
      ? Number(product.sellingPrice) - Number(product.buyingPrice)
      : null;

  const profitMargin =
    product?.buyingPrice
      ? (((Number(product.sellingPrice) - Number(product.buyingPrice)) /
          Number(product.buyingPrice)) *
          100
        ).toFixed(1)
      : null;

  return (
    <div className="product-card">
      <div className="product-image">
        {imgSrc ? (
          <img src={imgSrc} alt={product?.name || 'Product'} />
        ) : (
          <div className="product-no-image">📦</div>
        )}
      </div>

      <div className="product-info">
        <h3 className="product-name">{product?.name}</h3>
        {product?.nameKannada && (
          <p className="product-name-kannada">{product.nameKannada}</p>
        )}

        <div className="product-category">{product?.category?.name || 'Uncategorized'}</div>

        <div className="product-prices">
          <div>
            <span className="price-label">Buy:</span>
            <span className="price-value">
              {product?.buyingPrice != null ? `₹${product.buyingPrice}` : '—'}
            </span>
          </div>
          <div>
            <span className="price-label">Sell:</span>
            <span className="price-value selling">
              {product?.sellingPrice != null ? `₹${product.sellingPrice}` : '—'}
            </span>
          </div>
        </div>

        {showProfit && profit != null && (
          <div className="product-profit">
            Profit: ₹{profit} {profitMargin != null ? `(${profitMargin}%)` : ''}
          </div>
        )}

        <div className="product-stock">
          <span className={`stock-badge ${stockStatus()}`}>
            Stock: {product?.stock ?? 0} {product?.unit || ''}
          </span>
        </div>

        <div className="product-actions">
          {onSelect && (
            <button onClick={() => onSelect(product)} className="btn btn-primary btn-sm">
              Select
            </button>
          )}
          {onEdit && (
            <button onClick={() => onEdit(product)} className="btn btn-secondary btn-sm">
              Edit
            </button>
          )}
          {onDelete && (
            <button onClick={() => onDelete(product._id)} className="btn btn-danger btn-sm">
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
