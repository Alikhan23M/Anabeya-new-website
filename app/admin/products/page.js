// Products management page with CRUD operations
'use client';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  EyeIcon,
  PhotoIcon,
  XMarkIcon,
  CheckIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import ConfirmationDialog from '@/components/ui/ConfirmationDialog';

function ProductModal({ open, onClose, onSave, initial, categories }) {
  const [title, setTitle] = useState(initial?.title || '');
  const [description, setDescription] = useState(initial?.description || '');
  const [shortDescription, setShortDescription] = useState(initial?.shortDescription || '');
  const [price, setPrice] = useState(initial?.price || '');
  const [salePrice, setSalePrice] = useState(initial?.salePrice || '');
  const [onSale, setOnSale] = useState(initial?.onSale || false);
  const [images, setImages] = useState([]);
  const [existingImages, setExistingImages] = useState(initial?.images || []);
  const [category, setCategory] = useState(initial?.category || '');
  const [sizes, setSizes] = useState(initial?.sizes?.join(',') || '');
  const [colors, setColors] = useState(initial?.colors?.join(',') || '');
  const [stock, setStock] = useState(initial?.stock || 0);
  const [isFeatured, setIsFeatured] = useState(initial?.isFeatured || false);
  const [isTrending, setIsTrending] = useState(initial?.isTrending || false);
  const [isActive, setIsActive] = useState(initial?.isActive ?? true);
  const [tags, setTags] = useState(initial?.tags?.join(',') || '');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && initial) {
      setTitle(initial.title || '');
      setDescription(initial.description || '');
      setShortDescription(initial.shortDescription || '');
      setPrice(initial.price || '');
      setSalePrice(initial.salePrice || '');
      setOnSale(initial.onSale || false);
      setCategory(initial.category || '');
      setSizes(initial.sizes?.join(',') || '');
      setColors(initial.colors?.join(',') || '');
      setStock(initial.stock || 0);
      setIsFeatured(initial.isFeatured || false);
      setIsTrending(initial.isTrending || false);
      setIsActive(initial.isActive ?? true);
      setTags(initial.tags?.join(',') || '');
      setImages([]);
      setExistingImages(initial.images || []);
    } else if (!open) {
      // Reset form when closing
      setTitle('');
      setDescription('');
      setShortDescription('');
      setPrice('');
      setSalePrice('');
      setOnSale(false);
      setCategory('');
      setSizes('');
      setColors('');
      setStock(0);
      setIsFeatured(false);
      setIsTrending(false);
      setIsActive(true);
      setTags('');
      setImages([]);
      setExistingImages([]);
    }
  }, [open, initial]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('shortDescription', shortDescription);
      formData.append('price', price);
      formData.append('salePrice', salePrice);
      formData.append('onSale', onSale);
      formData.append('category', category);
      formData.append('sizes', JSON.stringify(sizes.split(',').map(s => s.trim()).filter(Boolean)));
      formData.append('colors', JSON.stringify(colors.split(',').map(c => c.trim()).filter(Boolean)));
      formData.append('stock', stock);
      formData.append('isFeatured', isFeatured);
      formData.append('isTrending', isTrending);
      formData.append('isActive', isActive);
      formData.append('tags', JSON.stringify(tags.split(',').map(t => t.trim()).filter(Boolean)));
      
      // Add new images
      for (let i = 0; i < images.length; i++) {
        formData.append('images', images[i]);
      }
      
      // Add existing images
      formData.append('existingImages', JSON.stringify(existingImages));
      
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Error saving product:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeExistingImage = (index) => {
    setExistingImages(prev => prev.filter((_, i) => i !== index));
  };

  const removeNewImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-neutral-200 px-6 py-4 rounded-t-2xl">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-neutral-900">
                {initial ? 'Edit Product' : 'Add New Product'}
              </h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-neutral-100 rounded-full transition-colors"
              >
                <XMarkIcon className="w-6 h-6 text-neutral-500" />
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <div>
                  <label className="form-label">Product Title *</label>
                  <input
                    type="text"
                    placeholder="Enter product title"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    required
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="form-label">Short Description *</label>
                  <textarea
                    placeholder="Brief product description (max 150 characters)"
                    value={shortDescription}
                    maxLength={150}
                    onChange={e => setShortDescription(e.target.value)}
                    required
                    className="w-full h-20 resize-none"
                  />
                  <p className="text-sm text-neutral-500 mt-1">
                    {shortDescription.length}/150 characters
                  </p>
                </div>

                <div>
                  <label className="form-label">Full Description *</label>
                  <textarea
                    placeholder="Detailed product description"
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    required
                    className="w-full h-24 resize-none"
                  />
                </div>
              </div>

              {/* Pricing & Category */}
              <div className="space-y-4">
                <div>
                  <label className="form-label">Regular Price *</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-500">$</span>
                    <input
                      type="number"
                      placeholder="0.00"
                      value={price}
                      onChange={e => setPrice(e.target.value)}
                      required
                      min="0"
                      step="0.01"
                      className="w-full pl-8"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="onSale"
                    checked={onSale}
                    onChange={e => setOnSale(e.target.checked)}
                    className="w-4 h-4 text-primary-600"
                  />
                  <label htmlFor="onSale" className="form-label mb-0">On Sale</label>
                </div>

                {onSale && (
                  <div>
                    <label className="form-label">Sale Price *</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-500">$</span>
                      <input
                        type="number"
                        placeholder="0.00"
                        value={salePrice}
                        onChange={e => setSalePrice(e.target.value)}
                        required
                        min="0"
                        step="0.01"
                        className="w-full pl-8"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="form-label">Category *</label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    required
                    className="w-full"
                  >
                    <option value="">Select Category</option>
                    {categories.map(cat => (
                      <option key={cat._id} value={cat._id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="form-label">Stock Quantity</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={stock}
                    onChange={e => setStock(e.target.value)}
                    min="0"
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            {/* Additional Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="form-label">Sizes (comma separated)</label>
                <input
                  type="text"
                  placeholder="S, M, L, XL"
                  value={sizes}
                  onChange={e => setSizes(e.target.value)}
                  className="w-full"
                />
              </div>

              <div>
                <label className="form-label">Colors (comma separated)</label>
                <input
                  type="text"
                  placeholder="Red, Blue, Green"
                  value={colors}
                  onChange={e => setColors(e.target.value)}
                  className="w-full"
                />
              </div>

              <div>
                <label className="form-label">Tags (comma separated)</label>
                <input
                  type="text"
                  placeholder="casual, summer, handmade"
                  value={tags}
                  onChange={e => setTags(e.target.value)}
                  className="w-full"
                />
              </div>
            </div>

            {/* Flags */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={e => setIsFeatured(e.target.checked)}
                  className="w-4 h-4 text-primary-600"
                />
                <span className="font-medium">Featured Product</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isTrending}
                  onChange={e => setIsTrending(e.target.checked)}
                  className="w-4 h-4 text-primary-600"
                />
                <span className="font-medium">Trending</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={e => setIsActive(e.target.checked)}
                  className="w-4 h-4 text-primary-600"
                />
                <span className="font-medium">Active</span>
              </label>
            </div>

            {/* Images */}
            <div className="space-y-4">
              <label className="form-label">Product Images</label>
              
              {/* Existing Images */}
              {existingImages.length > 0 && (
                <div className="space-y-3">
                  <p className="text-sm font-medium text-neutral-700">Current Images:</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {existingImages.map((image, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={image}
                          alt={`Product ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg border border-neutral-200"
                        />
                        <button
                          type="button"
                          onClick={() => removeExistingImage(index)}
                          className="absolute top-1 right-1 p-1 bg-error-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <XMarkIcon className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* New Images */}
              <div className="space-y-3">
                <p className="text-sm font-medium text-neutral-700">Add New Images:</p>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={e => setImages([...e.target.files])}
                  className="w-full"
                />
                
                {images.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {Array.from(images).map((file, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`New ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg border border-neutral-200"
                        />
                        <button
                          type="button"
                          onClick={() => removeNewImage(index)}
                          className="absolute top-1 right-1 p-1 bg-error-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <XMarkIcon className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 justify-center md:justify-end pt-6 border-t border-neutral-200">
              <button
                type="button"
                onClick={onClose}
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
                    {initial ? 'Update Product' : 'Create Product'}
                  </div>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [deleteProduct, setDeleteProduct] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchProducts = () => {
    setLoading(true);
    fetch('/api/admin/products')
      .then((res) => res.json())
      .then((data) => setProducts(Array.isArray(data) ? data : data.products || []))
      .catch(() => setError('Failed to load products'))
      .finally(() => setLoading(false));
  };

  const fetchCategories = () => {
    fetch('/api/admin/categories')
      .then(res => res.json())
      .then(data => setCategories(Array.isArray(data) ? data : data.categories || []));
  };

  useEffect(() => { 
    fetchProducts(); 
    fetchCategories(); 
  }, []);

  const handleCreate = async (formData) => {
    try {
      const response = await fetch('/api/admin/products', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Failed to create product');
      }
      
      fetchProducts();
      toast.success('Product created successfully');
    } catch (error) {
      toast.error('Failed to create product');
    }
  };

  const handleEdit = async (formData) => {
    try {
      const response = await fetch(`/api/admin/products/${editProduct._id}`, {
        method: 'PUT',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Failed to update product');
      }
      
      fetchProducts();
      toast.success('Product updated successfully');
    } catch (error) {
      toast.error('Failed to update product');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product? This action cannot be undone.')) return;
    
    try {
      const response = await fetch(`/api/admin/products/${id}`, { method: 'DELETE' });
      
      if (!response.ok) {
        throw new Error('Failed to delete product');
      }
      
      fetchProducts();
      toast.success('Product deleted successfully');
    } catch (error) {
      toast.error('Failed to delete product');
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.shortDescription.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || product.category?._id === categoryFilter;
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && product.isActive) ||
                         (statusFilter === 'inactive' && !product.isActive);
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  if (loading) {
    return (
      <div className="admin-page">
        <div className="flex items-center justify-center min-h-screen">
          <div className="admin-card text-center">
            <div className="spinner mx-auto mb-4"></div>
            <p className="text-neutral-600">Loading products...</p>
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
            <button onClick={fetchProducts} className="btn-primary mt-4">Try Again</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="max-w-7xl mx-auto p-0 md:p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="admin-header">Products Management</h1>
          <p className="admin-subheader">Create, edit, and manage your product catalog</p>
        </div>

        {/* Stats */}
        <div className="admin-stats-grid mb-8">
          <div className="admin-stat-card">
            <h3 className="admin-stat-number text-primary-600">{products.length}</h3>
            <p className="admin-stat-label">Total Products</p>
          </div>
          <div className="admin-stat-card">
            <h3 className="admin-stat-number text-success-600">
              {products.filter(p => p.isActive).length}
            </h3>
            <p className="admin-stat-label">Active Products</p>
          </div>
          <div className="admin-stat-card">
            <h3 className="admin-stat-number text-warning-600">
              {products.filter(p => p.onSale).length}
            </h3>
            <p className="admin-stat-label">On Sale</p>
          </div>
          <div className="admin-stat-card">
            <h3 className="admin-stat-number text-secondary-600">
              {products.filter(p => p.stock === 0).length}
            </h3>
            <p className="admin-stat-label">Out of Stock</p>
          </div>
          <div className="admin-stat-card">
            <h3 className="admin-stat-number text-amber-600">
              {products.filter(p => p.isFeatured).length}
            </h3>
            <p className="admin-stat-label">Featured</p>
          </div>
          <div className="admin-stat-card">
            <h3 className="admin-stat-number text-purple-600">
              {products.filter(p => p.isTrending).length}
            </h3>
            <p className="admin-stat-label">Trending</p>
          </div>
          <div className="admin-stat-card">
            <h3 className="admin-stat-number text-neutral-600">
              ${products.reduce((sum, p) => sum + (p.onSale ? p.salePrice : p.price), 0).toFixed(2)}
            </h3>
            <p className="admin-stat-label">Total Value</p>
          </div>
        </div>

        {/* Controls */}
        <div className="admin-card mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <button
              onClick={() => { setShowModal(true); setEditProduct(null); }}
              className="btn-primary flex items-center gap-2"
            >
              <PlusIcon className="w-5 h-5" />
              Add New Product
            </button>

            <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full sm:w-64"
              />
              
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full sm:w-40"
              >
                <option value="all">All Categories</option>
                {categories.map(cat => (
                  <option key={cat._id} value={cat._id}>{cat.name}</option>
                ))}
              </select>
              
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

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredProducts.map((product, index) => (
              <motion.div
                key={product._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.1 }}
                className="card card-hover"
              >
                {/* Product Image */}
                <div className="relative h-48 bg-neutral-100 rounded-t-xl overflow-hidden">
                  {product.images && product.images[0] ? (
                    <img
                      src={product.images[0]}
                      alt={product.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <PhotoIcon className="w-16 h-16 text-neutral-400" />
                    </div>
                  )}
                  
                  {/* Status Badges */}
                  <div className="absolute top-2 left-2 flex flex-col gap-1">
                    {product.onSale && (
                      <span className="badge-sale text-xs">SALE</span>
                    )}
                    {product.isFeatured && (
                      <span className="badge-featured text-xs">FEATURED</span>
                    )}
                    {product.isTrending && (
                      <span className="badge-trending text-xs">TRENDING</span>
                    )}
                    {!product.isActive && (
                      <span className="bg-neutral-500 text-white px-2 py-1 rounded-full text-xs font-semibold">INACTIVE</span>
                    )}
                  </div>

                  {/* Stock Status */}
                  {product.stock === 0 && (
                    <div className="absolute bottom-2 left-2 bg-error-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                      Out of Stock
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="p-4">
                  <h3 className="font-semibold text-neutral-900 mb-2 line-clamp-2">
                    {product.title}
                  </h3>
                  
                  <p className="text-neutral-600 text-sm mb-3 line-clamp-2">
                    {product.shortDescription}
                  </p>

                  {/* Price */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      {product.onSale ? (
                        <>
                          <span className="text-lg font-bold text-secondary-600">
                            ${product.salePrice}
                          </span>
                          <span className="text-sm text-neutral-500 line-through">
                            ${product.price}
                          </span>
                        </>
                      ) : (
                        <span className="text-lg font-bold text-neutral-900">
                          ${product.price}
                        </span>
                      )}
                    </div>
                    
                    <span className="text-sm text-primary-600 bg-primary-50 px-2 py-1 rounded-full">
                      {product.category?.name || 'Uncategorized'}
                    </span>
                  </div>

                  {/* Details */}
                  <div className="space-y-2 mb-4 text-sm text-neutral-600">
                    <div className="flex justify-between">
                      <span>Stock:</span>
                      <span className={product.stock === 0 ? 'text-error-600 font-semibold' : ''}>
                        {product.stock}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Category:</span>
                      <span>{product.category?.name || 'N/A'}</span>
                    </div>
                    {product.sizes?.length > 0 && (
                      <div className="flex justify-between">
                        <span>Sizes:</span>
                        <span>{product.sizes.join(', ')}</span>
                      </div>
                    )}
                    {product.colors?.length > 0 && (
                      <div className="flex justify-between">
                        <span>Colors:</span>
                        <span>{product.colors.join(', ')}</span>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => { setEditProduct(product); setShowModal(true); }}
                      className="flex-1 btn-outline py-2 text-sm flex items-center justify-center gap-1"
                    >
                      <PencilIcon className="w-4 h-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => { setDeleteProduct(product); setShowDeleteConfirm(true); }}
                      className="btn-outline py-2 text-sm text-error-600 border-error-300 hover:border-error-500 hover:text-error-700 flex items-center justify-center gap-1"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Empty State */}
        {filteredProducts.length === 0 && (
          <div className="admin-card text-center">
            <div className="text-neutral-400 text-8xl mb-6">📦</div>
            <h3 className="text-2xl font-semibold text-neutral-900 mb-4">
              {searchTerm || categoryFilter !== 'all' || statusFilter !== 'all' 
                ? 'No products found' 
                : 'No products yet'
              }
            </h3>
            <p className="text-neutral-600 mb-6">
              {searchTerm || categoryFilter !== 'all' || statusFilter !== 'all'
                ? 'Try adjusting your search or filter criteria'
                : 'Start building your product catalog by adding your first product'
              }
            </p>
            {!searchTerm && categoryFilter === 'all' && statusFilter === 'all' && (
              <button
                onClick={() => { setShowModal(true); setEditProduct(null); }}
                className="btn-primary"
              >
                Add Your First Product
              </button>
            )}
          </div>
        )}
      </div>

      {/* Product Modal */}
      <ProductModal
        open={showModal}
        onClose={() => { setShowModal(false); setEditProduct(null); }}
        onSave={editProduct ? handleEdit : handleCreate}
        initial={editProduct}
        categories={categories}
      />

      {/* Confirmation Dialog for Delete */}
      <ConfirmationDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={() => {
          if (deleteProduct) {
            handleDelete(deleteProduct._id);
          }
          setShowDeleteConfirm(false);
        }}
        title="Confirm Deletion"
        message={`Are you sure you want to delete "${deleteProduct?.title || 'this product'}" (ID: ${deleteProduct?._id})? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
      />
    </div>
  );
}