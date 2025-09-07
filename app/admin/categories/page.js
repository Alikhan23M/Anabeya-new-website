// Categories management page with CRUD operations
'use client';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  PhotoIcon,
  XMarkIcon,
  CheckIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import ConfirmationDialog from '@/components/ui/ConfirmationDialog';

function CategoryForm({ onSave, onCancel, initial }) {
  const [name, setName] = useState(initial?.name || '');
  const [description, setDescription] = useState(initial?.description || '');
  const [image, setImage] = useState(null);
  const [existingImage, setExistingImage] = useState(initial?.image || '');
  const [isActive, setIsActive] = useState(initial?.isActive ?? true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initial) {
      setName(initial.name || '');
      setDescription(initial.description || '');
      setIsActive(initial.isActive ?? true);
      setImage(null);
      setExistingImage(initial.image || '');
    } else {
      setName('');
      setDescription('');
      setImage(null);
      setExistingImage('');
      setIsActive(true);
    }
  }, [initial]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('description', description);
      formData.append('isActive', isActive);
      if (image) formData.append('image', image);
      if (existingImage) formData.append('existingImage', existingImage);
      
      await onSave(formData);
      onCancel();
    } catch (error) {
      console.error('Error saving category:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeExistingImage = () => {
    setExistingImage('');
  };

  const removeNewImage = () => {
    setImage(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="admin-card"
    >
      <h3 className="text-xl font-semibold text-neutral-900 mb-6">
        {initial ? 'Edit Category' : 'Add New Category'}
      </h3>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <div>
              <label className="form-label">Category Name *</label>
              <input
                type="text"
                placeholder="Enter category name"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                className="w-full"
              />
            </div>

            <div>
              <label className="form-label">Description</label>
              <textarea
                placeholder="Category description"
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="w-full h-24 resize-none"
              />
            </div>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={isActive}
                onChange={e => setIsActive(e.target.checked)}
                className="w-4 h-4 text-primary-600"
              />
              <span className="font-medium">Active Category</span>
            </label>
          </div>

          {/* Image Upload */}
          <div className="space-y-4">
            <label className="form-label">Category Image</label>
            
            {/* Existing Image */}
            {existingImage && (
              <div className="space-y-3">
                <p className="text-sm font-medium text-neutral-700">Current Image:</p>
                <div className="relative group">
                  <img
                    src={existingImage}
                    alt="Current category image"
                    className="w-full h-32 object-cover rounded-lg border border-neutral-200"
                  />
                  <button
                    type="button"
                    onClick={removeExistingImage}
                    className="absolute top-2 right-2 p-1 bg-error-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <XMarkIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* New Image */}
            <div className="space-y-3">
              <p className="text-sm font-medium text-neutral-700">Upload New Image:</p>
              <input
                type="file"
                accept="image/*"
                onChange={e => setImage(e.target.files[0])}
                className="w-full"
              />
              
              {image && (
                <div className="relative group">
                  <img
                    src={URL.createObjectURL(image)}
                    alt="New category image"
                    className="w-full h-32 object-cover rounded-lg border border-neutral-200"
                  />
                  <button
                    type="button"
                    onClick={removeNewImage}
                    className="absolute top-2 right-2 p-1 bg-error-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <XMarkIcon className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap w-full gap-3 justify-center md:justify-end pt-6 border-t border-neutral-200">
          <button
            type="button"
            onClick={onCancel}
            className="btn-outline w-full md:w-auto"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn-primary w-full md:w-auto flex items-center justify-center gap-2"
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="spinner w-4 h-4"></div>
                Saving...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <CheckIcon className="w-5 h-5" />
                {initial ? 'Update Category' : 'Create Category'}
              </div>
            )}
          </button>
        </div>
      </form>
    </motion.div>
  );
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editCategory, setEditCategory] = useState(null);
  const [deleteCategory, setDeleteCategory] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchCategories = () => {
    setLoading(true);
    fetch('/api/admin/categories')
      .then(res => res.json())
      .then(data => setCategories(Array.isArray(data) ? data : data.categories || []))
      .catch(() => setError('Failed to load categories'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchCategories(); }, []);

  const handleCreate = async (data) => {
    try {
      const response = await fetch('/api/admin/categories', {
        method: 'POST',
        body: data,
      });
      
      if (!response.ok) {
        throw new Error('Failed to create category');
      }
      
      fetchCategories();
      toast.success('Category created successfully');
    } catch (error) {
      toast.error('Failed to create category');
    }
  };

  const handleEdit = async (data) => {
    try {
      const response = await fetch(`/api/admin/categories/${editCategory._id}`, {
        method: 'PUT',
        body: data,
      });
      
      if (!response.ok) {
        throw new Error('Failed to update category');
      }
      
      fetchCategories();
      toast.success('Category updated successfully');
    } catch (error) {
      toast.error('Failed to update category');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category? This action cannot be undone.')) return;
    
    try {
      const response = await fetch(`/api/admin/categories/${id}`, { method: 'DELETE' });
      
      if (!response.ok) {
        throw new Error('Failed to delete category');
      }
      
      fetchCategories();
      toast.success('Category deleted successfully');
    } catch (error) {
      toast.error('Failed to delete category');
    }
  };

  const filteredCategories = categories.filter(category => {
    const matchesSearch = category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         category.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && category.isActive) ||
                         (statusFilter === 'inactive' && !category.isActive);
    
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="admin-page">
        <div className="flex items-center justify-center min-h-screen">
          <div className="admin-card text-center">
            <div className="spinner mx-auto mb-4"></div>
            <p className="text-neutral-600">Loading categories...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-page">
        <div className="flex items-center justify-center min-h-screen">
          <div className="admin-card text-center">
            <div className="text-error-500 text-6xl mb-4">⚠️</div>
            <p className="text-error-600">{error}</p>
            <button onClick={fetchCategories} className="btn-primary mt-4">Try Again</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="max-w-7xl mx-auto p-2 md:p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="admin-header">Categories Management</h1>
          <p className="admin-subheader">Organize your products with categories</p>
        </div>

        {/* Stats */}
        <div className="admin-stats-grid mb-8">
          <div className="admin-stat-card">
            <h3 className="admin-stat-number text-primary-600">{categories.length}</h3>
            <p className="admin-stat-label">Total Categories</p>
          </div>
          <div className="admin-stat-card">
            <h3 className="admin-stat-number text-success-600">
              {categories.filter(c => c.isActive).length}
            </h3>
            <p className="admin-stat-label">Active Categories</p>
          </div>
          <div className="admin-stat-card">
            <h3 className="admin-stat-number text-warning-600">
              {categories.filter(c => !c.isActive).length}
            </h3>
            <p className="admin-stat-label">Inactive Categories</p>
          </div>
          <div className="admin-stat-card">
            <h3 className="admin-stat-number text-secondary-600">
              {categories.filter(c => c.image).length}
            </h3>
            <p className="admin-stat-label">With Images</p>
          </div>
        </div>

        {/* Controls */}
        <div className="admin-card mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <button
              onClick={() => { setShowForm(true); setEditCategory(null); }}
              className="btn-primary flex items-center gap-2"
            >
              <PlusIcon className="w-5 h-5" />
              Add New Category
            </button>

            <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
              <input
                type="text"
                placeholder="Search categories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full sm:w-64"
              />
              
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full sm:w-32"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        {/* Category Form */}
        <AnimatePresence>
          {showForm && (
            <CategoryForm
              onSave={editCategory ? handleEdit : handleCreate}
              onCancel={() => { setShowForm(false); setEditCategory(null); }}
              initial={editCategory}
            />
          )}
        </AnimatePresence>

        {/* Confirmation Dialog for Delete */}
        <ConfirmationDialog
          isOpen={showDeleteConfirm}
          onClose={() => setShowDeleteConfirm(false)}
          onConfirm={() => {
            if (deleteCategory) {
              handleDelete(deleteCategory._id);
            }
            setShowDeleteConfirm(false);
          }}
          title="Confirm Deletion"
          message={`Are you sure you want to delete "${deleteCategory?.name || 'this category'}" (ID: ${deleteCategory?._id})? This action cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
        />

        {/* Categories Grid */}
        {!showForm && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {filteredCategories.map((category, index) => (
                <motion.div
                  key={category._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.1 }}
                  className="card card-hover"
                >
                  {/* Category Image */}
                  <div className="relative h-48 bg-neutral-100 rounded-t-xl overflow-hidden">
                    {category.image ? (
                      <img
                        src={category.image}
                        alt={category.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <PhotoIcon className="w-16 h-16 text-neutral-400" />
                      </div>
                    )}
                    
                    {/* Status Badge */}
                    <div className="absolute top-2 right-2">
                      {category.isActive ? (
                        <span className="badge-new">Active</span>
                      ) : (
                        <span className="bg-neutral-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                          Inactive
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Category Info */}
                  <div className="p-4">
                    <h3 className="font-semibold text-neutral-900 mb-2 text-lg">
                      {category.name}
                    </h3>
                    
                    <p className="text-neutral-600 text-sm mb-4 line-clamp-2">
                      {category.description || 'No description provided'}
                    </p>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => { setEditCategory(category); setShowForm(true); }}
                        className="flex-1 btn-outline py-2 text-sm flex items-center justify-center gap-1"
                      >
                        <PencilIcon className="w-4 h-4" />
                        Edit
                      </button>
                      <button
                        onClick={() => { setDeleteCategory(category); setShowDeleteConfirm(true); }}
                        className="btn-outline py-2 text-sm text-error-600 border-error-300 hover:border-error-500 hover:text-error-700 flex items-center justify-center gap-1"
                      >
                        <TrashIcon className="w-4 h-4" />
                        Delete
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Empty State */}
        {!showForm && filteredCategories.length === 0 && (
          <div className="admin-card text-center">
            <div className="text-neutral-400 text-8xl mb-6">📁</div>
            <h3 className="text-2xl font-semibold text-neutral-900 mb-4">
              {searchTerm || statusFilter !== 'all' 
                ? 'No categories found' 
                : 'No categories yet'
              }
            </h3>
            <p className="text-neutral-600 mb-6">
              {searchTerm || statusFilter !== 'all'
                ? 'Try adjusting your search or filter criteria'
                : 'Start organizing your products by creating your first category'
              }
            </p>
            {!searchTerm && statusFilter === 'all' && (
              <button
                onClick={() => { setShowForm(true); setEditCategory(null); }}
                className="btn-primary"
              >
                Create Your First Category
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}