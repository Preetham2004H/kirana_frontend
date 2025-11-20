import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import '../css/Login.css';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'shopkeeper'
  });
  const [loading, setLoading] = useState(false);

  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        const userData = await login(formData.email, formData.password);
        toast.success('Login successful!');
        navigate(`/${userData.role}/dashboard`);
      } else {
        const userData = await register(
          formData.name,
          formData.email,
          formData.password,
          formData.role
        );
        toast.success('Registration successful!');
        navigate(`/${userData.role}/dashboard`);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-landing">
      {/* Top brand bar */}
      <header className="auth-header">
        <div className="brand">
          <div className="brand-mark">🛒</div>
          <div className="brand-name">Jeevitha Stores</div>
        </div>
      </header>

      {/* Two-column layout */}
      <main className="auth-main">
        {/* Left hero */}
        <section className="hero">
          <h1 className="hero-title">
            Groceries & vegetables delivered fast from Jeevitha Stores
          </h1>
          <p className="hero-subtitle">
            Fresh produce, daily essentials, snacks, and more—neatly stocked for your neighborhood. 
          </p>

          <div className="hero-badges">
            <span className="badge-pill">Fresh veggies</span>
            <span className="badge-pill">Fruits</span>
            <span className="badge-pill">Dairy</span>
            <span className="badge-pill">Snacks</span>
            <span className="badge-pill">Household</span>
          </div>

          <div className="hero-panels">
            <div className="panel">
              <div className="panel-title">Open hours</div>
              <div className="panel-text">7:00 AM – 10:00 PM</div>
            </div>
            <div className="panel">
              <div className="panel-title">Fast checkout</div>
              <div className="panel-text">Secure and quick billing</div>
            </div>
            <div className="panel">
              <div className="panel-title">Local freshness</div>
              <div className="panel-text">Curated from trusted vendors</div>
            </div>
          </div>
        </section>

        {/* Right auth card */}
        <section className="auth-card glass">
          <div className="tab-switch">
            <button
              type="button"
              className={`tab-btn ${isLogin ? 'active' : ''}`}
              onClick={() => setIsLogin(true)}
            >
              Login
            </button>
            <button
              type="button"
              className={`tab-btn ${!isLogin ? 'active' : ''}`}
              onClick={() => setIsLogin(false)}
            >
              Register
            </button>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            {!isLogin && (
              <div className="form-group">
                <label className="form-label">Full name</label>
                <input
                  type="text"
                  name="name"
                  className="form-input"
                  placeholder="Enter your name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                type="email"
                name="email"
                className="form-input"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                required
                autoComplete="email"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                name="password"
                className="form-input"
                placeholder="Minimum 6 characters"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={6}
                autoComplete={isLogin ? 'current-password' : 'new-password'}
              />
            </div>

            {!isLogin && (
              <div className="form-group">
                <label className="form-label">Role</label>
                <select
                  name="role"
                  className="form-select"
                  value={formData.role}
                  onChange={handleChange}
                >
                  <option value="shopkeeper">Shopkeeper</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary btn-full"
              disabled={loading}
            >
              {loading ? 'Please wait...' : isLogin ? 'Login' : 'Create account'}
            </button>
          </form>

          <div className="switch-hint">
            {isLogin ? (
              <span>
                New to Jeevitha Stores?{' '}
                <button
                  type="button"
                  className="link-btn"
                  onClick={() => setIsLogin(false)}
                >
                  Register
                </button>
              </span>
            ) : (
              <span>
                Already have an account?{' '}
                <button
                  type="button"
                  className="link-btn"
                  onClick={() => setIsLogin(true)}
                >
                  Login
                </button>
              </span>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default Login;
