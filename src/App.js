import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import Products from './pages/Products';
import AddProduct from './pages/AddProduct';
import Categories from './pages/Categories';
import Sales from './pages/Sales';
import ShopkeeperDashboard from './pages/ShopkeeperDashboard';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/admin/dashboard"
              element={
                <PrivateRoute role="admin">
                  <AdminDashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/products"
              element={
                <PrivateRoute role="admin">
                  <Products />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/products/add"
              element={
                <PrivateRoute role="admin">
                  <AddProduct />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/products/edit/:id"
              element={
                <PrivateRoute role="admin">
                  <AddProduct />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/categories"
              element={
                <PrivateRoute role="admin">
                  <Categories />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/sales"
              element={
                <PrivateRoute role="admin">
                  <Sales />
                </PrivateRoute>
              }
            />
            <Route
              path="/shopkeeper/dashboard"
              element={
                <PrivateRoute role="shopkeeper">
                  <ShopkeeperDashboard />
                </PrivateRoute>
              }
            />
            <Route path="/" element={<Navigate to="/login" />} />
          </Routes>
          <ToastContainer position="top-right" autoClose={3000} />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
