import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import api from '../utils/api';
import { toast } from 'react-toastify';
import '../css/Categories.css';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    nameKannada: '',
    description: ''
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await api.get('/categories');
      setCategories(response.data.data);
    } catch (error) {
      toast.error('Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingCategory) {
        await api.put(`/categories/${editingCategory._id}`, formData);
        toast.success('Category updated successfully');
      } else {
        await api.post('/categories', formData);
        toast.success('Category added successfully');
      }

      setShowModal(false);
      setFormData({ name: '', nameKannada: '', description: '' });
      setEditingCategory(null);
      fetchCategories();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      nameKannada: category.nameKannada || '',
      description: category.description || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        await api.delete(`/categories/${id}`);
        toast.success('Category deleted successfully');
        fetchCategories();
      } catch (error) {
        toast.error('Failed to delete category');
      }
    }
  };

  const handleAddNew = () => {
    setEditingCategory(null);
    setFormData({ name: '', nameKannada: '', description: '' });
    setShowModal(true);
  };

  return (
    <>
      <Navbar />
      <div className="dashboard-layout">
        <Sidebar />
        <main className="main-content">
          <div className="page-header">
            <div>
              <h1 className="page-title">Categories</h1>
              <p className="page-subtitle">Manage product categories</p>
            </div>
            <button onClick={handleAddNew} className="btn btn-primary">
              + Add Category
            </button>
          </div>

          {loading ? (
            <div className="loading">Loading categories...</div>
          ) : (
            <div className="card">
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Category Name</th>
                      <th>ಕನ್ನಡ ಹೆಸರು</th>
                      <th>Description</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categories.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="text-center">
                          No categories found. Add your first category.
                        </td>
                      </tr>
                    ) : (
                      categories.map((category) => (
                        <tr key={category._id}>
                          <td><strong>{category.name}</strong></td>
                          <td>{category.nameKannada || '-'}</td>
                          <td>{category.description || '-'}</td>
                          <td>
                            <div className="table-actions">
                              <button
                                onClick={() => handleEdit(category)}
                                className="btn btn-secondary btn-sm"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDelete(category._id)}
                                className="btn btn-danger btn-sm"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Modal */}
          {showModal && (
            <div className="modal-overlay" onClick={() => setShowModal(false)}>
              <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                  <h2>{editingCategory ? 'Edit Category' : 'Add New Category'}</h2>
                  <button onClick={() => setShowModal(false)} className="modal-close">
                    ×
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="modal-form">
                  <div className="form-group">
                    <label className="form-label">Category Name *</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">ಕನ್ನಡ ಹೆಸರು (Kannada Name)</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.nameKannada}
                      onChange={(e) => setFormData({ ...formData, nameKannada: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Description</label>
                    <textarea
                      className="form-textarea"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows="3"
                    />
                  </div>

                  <div className="modal-actions">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="btn btn-secondary"
                    >
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary">
                      {editingCategory ? 'Update' : 'Add'} Category
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>
    </>
  );
};

export default Categories;
