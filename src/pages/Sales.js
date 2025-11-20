import React, { useState, useEffect, useCallback } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import api from '../utils/api';
import { toast } from 'react-toastify';
import '../css/Sales.css';

const Sales = () => {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    product: ''
  });
  const [summary, setSummary] = useState({
    totalRevenue: 0,
    totalProfit: 0,
    totalSales: 0
  });

  const fetchSales = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      if (filters.product) params.append('product', filters.product);

      const response = await api.get(`/sales?${params.toString()}`);
      const data = response.data.data;
      setSales(data);
      setSummary({
        totalRevenue: data.reduce((s, x) => s + x.totalAmount, 0),
        totalProfit: data.reduce((s, x) => s + x.profit, 0),
        totalSales: data.length
      });
    } catch {
      toast.error('Failed to fetch sales');
    } finally {
      setLoading(false);
    }
  }, [filters.startDate, filters.endDate, filters.product]);

  useEffect(() => {
    fetchSales();
  }, [fetchSales]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const exportToCSV = () => {
    const headers = ['Date', 'Product', 'Quantity', 'Price', 'Total', 'Profit', 'Sold By'];
    const rows = sales.map((sale) => [
      formatDate(sale.saleDate),
      sale.product.name,
      `${sale.quantity} ${sale.product.unit}`,
      `₹${sale.sellingPrice}`,
      `₹${sale.totalAmount}`,
      `₹${sale.profit}`,
      sale.soldBy.name
    ]);

    const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sales-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <>
      <Navbar />
      <div className="dashboard-layout">
        <Sidebar />
        <main className="main-content">
          <div className="page-header">
            <div>
              <h1 className="page-title">Sales History</h1>
              <p className="page-subtitle">View all sales transactions</p>
            </div>
            {sales.length > 0 && (
              <button onClick={exportToCSV} className="btn btn-primary">
                📥 Export CSV
              </button>
            )}
          </div>

          <div className="sales-summary">
            <div className="summary-card">
              <div className="summary-icon">💰</div>
              <div className="summary-info">
                <h3>Total Revenue</h3>
                <p>₹{summary.totalRevenue.toLocaleString()}</p>
              </div>
            </div>

            <div className="summary-card">
              <div className="summary-icon">📈</div>
              <div className="summary-info">
                <h3>Total Profit</h3>
                <p>₹{summary.totalProfit.toLocaleString()}</p>
              </div>
            </div>

            <div className="summary-card">
              <div className="summary-icon">🛍️</div>
              <div className="summary-info">
                <h3>Total Sales</h3>
                <p>{summary.totalSales}</p>
              </div>
            </div>
          </div>

          <div className="card filters-card">
            <div className="filters-grid">
              <div className="form-group">
                <label className="form-label">Start Date</label>
                <input
                  type="date"
                  className="form-input"
                  value={filters.startDate}
                  onChange={(e) => setFilters((prev) => ({ ...prev, startDate: e.target.value }))}
                />
              </div>

              <div className="form-group">
                <label className="form-label">End Date</label>
                <input
                  type="date"
                  className="form-input"
                  value={filters.endDate}
                  onChange={(e) => setFilters((prev) => ({ ...prev, endDate: e.target.value }))}
                />
              </div>

              <div className="form-group">
                <button
                  onClick={() => setFilters({ startDate: '', endDate: '', product: '' })}
                  className="btn btn-secondary"
                  style={{ marginTop: '24px' }}
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="loading">Loading sales...</div>
          ) : sales.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">🛍️</div>
              <h3>No sales found</h3>
              <p>Sales transactions will appear here</p>
            </div>
          ) : (
            <div className="card">
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Date & Time</th>
                      <th>Product</th>
                      <th>Quantity</th>
                      <th>Price</th>
                      <th>Total Amount</th>
                      <th>Profit</th>
                      <th>Sold By</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sales.map((sale) => (
                      <tr key={sale._id}>
                        <td>{formatDate(sale.saleDate)}</td>
                        <td>
                          <div>
                            <strong>{sale.product.name}</strong>
                            {sale.product.nameKannada && (
                              <div className="text-secondary">{sale.product.nameKannada}</div>
                            )}
                          </div>
                        </td>
                        <td>{sale.quantity} {sale.product.unit}</td>
                        <td>₹{sale.sellingPrice}</td>
                        <td><strong>₹{sale.totalAmount.toLocaleString()}</strong></td>
                        <td><span className="profit-badge">₹{sale.profit.toLocaleString()}</span></td>
                        <td>{sale.soldBy.name}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>
    </>
  );
};

export default Sales;
