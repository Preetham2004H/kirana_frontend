import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import api from '../utils/api';
import { toast } from 'react-toastify';
import '../css/AdminDashboard.css';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [fastMoving, setFastMoving] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [salesTrend, setSalesTrend] = useState([]);
  const [categorySales, setCategorySales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('7');

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const [statsRes, fastMovingRes, lowStockRes, trendRes, categoryRes] = await Promise.all([
        api.get('/dashboard/stats'),
        api.get('/dashboard/fast-moving?limit=10'),
        api.get('/dashboard/low-stock'),
        api.get(`/dashboard/sales-trend?days=${dateRange}`),
        api.get('/dashboard/category-sales')
      ]);
      setStats(statsRes.data.data);
      setFastMoving(fastMovingRes.data.data);
      setLowStock(lowStockRes.data.data);
      setSalesTrend(trendRes.data.data);
      setCategorySales(categoryRes.data.data);
    } catch {
      toast.error('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  }, [dateRange]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="dashboard-layout">
          <Sidebar />
          <main className="main-content">
            <div className="loading">Loading dashboard...</div>
          </main>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="dashboard-layout">
        <Sidebar />
        <main className="main-content">
          <div className="page-header">
            <h1 className="page-title">Admin Dashboard</h1>
            <p className="page-subtitle">Overview of your grocery store performance</p>
          </div>

          <div className="stats-grid">
            <div className="stat-card revenue">
              <div className="stat-icon">💰</div>
              <div className="stat-info">
                <h3>Total Revenue</h3>
                <p className="stat-value">₹{(stats?.revenue || 0).toLocaleString()}</p>
              </div>
            </div>

            <div className="stat-card profit">
              <div className="stat-icon">📈</div>
              <div className="stat-info">
                <h3>Total Profit</h3>
                <p className="stat-value">₹{(stats?.profit || 0).toLocaleString()}</p>
              </div>
            </div>

            <div className="stat-card sales">
              <div className="stat-icon">🛍️</div>
              <div className="stat-info">
                <h3>Total Sales</h3>
                <p className="stat-value">{stats?.totalSales || 0}</p>
              </div>
            </div>

            <div className="stat-card products">
              <div className="stat-icon">📦</div>
              <div className="stat-info">
                <h3>Total Products</h3>
                <p className="stat-value">{stats?.totalProducts || 0}</p>
              </div>
            </div>

            <div className="stat-card low-stock">
              <div className="stat-icon">⚠️</div>
              <div className="stat-info">
                <h3>Low Stock Items</h3>
                <p className="stat-value">{stats?.lowStockProducts || 0}</p>
              </div>
            </div>

            <div className="stat-card out-stock">
              <div className="stat-icon">🚫</div>
              <div className="stat-info">
                <h3>Out of Stock</h3>
                <p className="stat-value">{stats?.outOfStockProducts || 0}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header-with-filter">
              <h2 className="card-title">Sales Trend</h2>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="form-select filter-select"
              >
                <option value="7">Last 7 Days</option>
                <option value="14">Last 14 Days</option>
                <option value="30">Last 30 Days</option>
              </select>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={salesTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="_id" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="#2563eb" name="Revenue (₹)" />
                <Line type="monotone" dataKey="profit" stroke="#10b981" name="Profit (₹)" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="dashboard-grid">
            <div className="card">
              <h2 className="card-title">Fast Moving Products</h2>
              <div className="fast-moving-list">
                {fastMoving.slice(0, 5).map((item, index) => (
                  <div key={item._id} className="fast-moving-item">
                    <div className="item-rank">{index + 1}</div>
                    <div className="item-details">
                      <h4>{item.product.name}</h4>
                      <p>{item.product.nameKannada}</p>
                    </div>
                    <div className="item-stats">
                      <span className="quantity">{item.totalQuantity} sold</span>
                      <span className="revenue">₹{item.totalRevenue.toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
              <Link to="/admin/products" className="card-link">
                View All Products →
              </Link>
            </div>

            <div className="card">
              <h2 className="card-title">Sales by Category</h2>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categorySales}
                    dataKey="totalRevenue"
                    nameKey="categoryName"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label
                  >
                    {categorySales.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {lowStock.length > 0 && (
            <div className="card alert-card">
              <h2 className="card-title">⚠️ Low Stock Alert</h2>
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Category</th>
                      <th>Current Stock</th>
                      <th>Min Level</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lowStock.slice(0, 10).map((product) => (
                      <tr key={product._id}>
                        <td>
                          <div>
                            <strong>{product.name}</strong>
                            {product.nameKannada && (
                              <div className="text-secondary">{product.nameKannada}</div>
                            )}
                          </div>
                        </td>
                        <td>{product.category?.name}</td>
                        <td>
                          <span className={`badge ${product.stock === 0 ? 'badge-danger' : 'badge-warning'}`}>
                            {product.stock} {product.unit}
                          </span>
                        </td>
                        <td>{product.minStockLevel} {product.unit}</td>
                        <td>
                          <Link
                            to={`/admin/products/edit/${product._id}`}
                            className="btn btn-primary btn-sm"
                          >
                            Restock
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="card">
            <h2 className="card-title">Category Performance</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={categorySales}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="categoryName" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="totalRevenue" fill="#2563eb" name="Revenue (₹)" />
                <Bar dataKey="totalProfit" fill="#10b981" name="Profit (₹)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </main>
      </div>
    </>
  );
};

export default AdminDashboard;
