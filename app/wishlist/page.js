"use client";
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HeartIcon, 
  TrashIcon, 
  ShoppingBagIcon,
  EyeIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import ProductGrid from '@/components/ProductGrid';
import { useSession } from "next-auth/react";
import { useWishlist } from '@/contexts/WishlistContext';
import { useCart } from '@/contexts/CartContext';
import toast from 'react-hot-toast';
import ConfirmationDialog from '@/components/ui/ConfirmationDialog';

function WishlistContent() {
  const [wishlistProducts, setWishlistProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const { data: session } = useSession();
  const { clearWishlist, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();

  const getAuthHeaders = () => {
    if (session?.user) {
      return {};
    }
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  useEffect(() => {
    fetchWishlistProducts();
  }, []);

  const fetchWishlistProducts = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/wishlist", {
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch wishlist');
      }
      
      const data = await response.json();
      setWishlistProducts(data.wishlist || []);
      setError('');
    } catch (error) {
      console.error('Error fetching wishlist:', error);
      setError('Failed to load your wishlist');
    } finally {
      setLoading(false);
    }
  };

  const handleClearWishlist = async () => {
    try {
      await clearWishlist();
      setWishlistProducts([]);
      setShowClearConfirm(false);
      toast.success('Wishlist cleared successfully');
    } catch (error) {
      toast.error('Failed to clear wishlist');
    }
  };

  const handleRemoveFromWishlist = async (productId) => {
    try {
      await removeFromWishlist(productId);
      setWishlistProducts(prev => prev.filter(p => p._id !== productId));
      toast.success('Product removed from wishlist');
    } catch (error) {
      toast.error('Failed to remove product');
    }
  };

  const handleAddToCart = async (product) => {
    try {
      await addToCart(product, 1);
      toast.success('Product added to cart');
    } catch (error) {
      toast.error('Failed to add product to cart');
    }
  };

  const handleMoveAllToCart = async () => {
    try {
      for (const product of wishlistProducts) {
        await addToCart(product, 1);
      }
      toast.success('All products moved to cart');
    } catch (error) {
      toast.error('Failed to move some products to cart');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-primary-light flex items-center justify-center">
        <div className="admin-card text-center">
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-neutral-600">Loading your wishlist...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-primary-light flex items-center justify-center">
        <div className="admin-card text-center">
          <div className="text-error-500 text-6xl mb-4">⚠️</div>
          <h3 className="text-xl font-semibold text-neutral-900 mb-2">Error Loading Wishlist</h3>
          <p className="text-neutral-600 mb-6">{error}</p>
          <button 
            onClick={fetchWishlistProducts}
            className="btn-primary"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-primary-light">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center gap-3 mb-4"
          >
            <HeartIconSolid className="w-12 h-12 text-secondary-600" />
            <h1 className="admin-header">My Wishlist</h1>
          </motion.div>
          <p className="admin-subheader">
            Save your favorite products for later
          </p>
        </div>

        {/* Stats and Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="admin-stats-grid mb-8"
        >
          <div className="admin-stat-card">
            <h3 className="admin-stat-number text-secondary-600">{wishlistProducts.length}</h3>
            <p className="admin-stat-label">Total Items</p>
          </div>
          <div className="admin-stat-card">
            <h3 className="admin-stat-number text-primary-600">
              ${wishlistProducts.reduce((sum, p) => sum + (p.onSale ? p.salePrice : p.price), 0).toFixed(2)}
            </h3>
            <p className="admin-stat-label">Total Value</p>
          </div>
          <div className="admin-stat-card">
            <h3 className="admin-stat-number text-warning-600">
              {wishlistProducts.filter(p => p.onSale).length}
            </h3>
            <p className="admin-stat-label">On Sale</p>
          </div>
          <div className="admin-stat-card">
            <h3 className="admin-stat-number text-success-600">
              {wishlistProducts.filter(p => p.stock > 0).length}
            </h3>
            <p className="admin-stat-label">In Stock</p>
          </div>
        </motion.div>

        {/* Action Buttons */}
        {wishlistProducts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-wrap gap-4 justify-center mb-8"
          >
            <button
              onClick={handleMoveAllToCart}
              className="btn-primary flex items-center gap-2"
            >
              <ShoppingBagIcon className="w-5 h-5" />
              Move All to Cart
            </button>
            <button
              onClick={() => setShowClearConfirm(true)}
              className="btn-outline text-error-600 border-error-300 hover:border-error-500 hover:text-error-700 flex items-center gap-2"
            >
              <TrashIcon className="w-5 h-5" />
              Clear Wishlist
            </button>
          </motion.div>
        )}

        {/* Products Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {wishlistProducts.length === 0 ? (
            <div className="admin-card text-center">
              <div className="text-neutral-400 text-8xl mb-6">💝</div>
              <h3 className="text-2xl font-semibold text-neutral-900 mb-4">Your Wishlist is Empty</h3>
              <p className="text-neutral-600 mb-8 max-w-md mx-auto">
                Start building your wishlist by browsing our collection and adding products you love
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a href="/products" className="btn-primary">
                  Browse Products
                </a>
                <a href="/" className="btn-secondary">
                  Go Home
                </a>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              <AnimatePresence>
                {wishlistProducts.map((product, index) => (
                  <motion.div
                    key={product._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.1 }}
                    className="card card-hover relative group"
                  >
                    {/* Product Image */}
                    <div className="relative overflow-hidden">
                      {product.images && product.images[0] && (
                        <img
                          src={product.images[0]}
                          alt={product.title}
                          className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      )}
                      
                      {/* Quick Actions Overlay */}
                      <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <button
                          onClick={() => handleRemoveFromWishlist(product._id)}
                          className="p-2 bg-white rounded-full shadow-lg hover:bg-error-50 transition-colors"
                          title="Remove from wishlist"
                        >
                          <XMarkIcon className="w-4 h-4 text-error-600" />
                        </button>
                        <button
                          onClick={() => handleAddToCart(product)}
                          className="p-2 bg-white rounded-full shadow-lg hover:bg-primary-50 transition-colors"
                          title="Add to cart"
                        >
                          <ShoppingBagIcon className="w-4 h-4 text-primary-600" />
                        </button>
                      </div>

                      {/* Sale Badge */}
                      {product.onSale && (
                        <div className="absolute top-3 left-3 badge-sale">
                          SALE
                        </div>
                      )}

                      {/* Stock Status */}
                      {product.stock === 0 && (
                        <div className="absolute bottom-3 left-3 bg-error-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
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
                              <span className="text-xl font-bold text-secondary-600">
                                ${product.salePrice}
                              </span>
                              <span className="text-sm text-neutral-500 line-through">
                                ${product.price}
                              </span>
                            </>
                          ) : (
                            <span className="text-xl font-bold text-neutral-900">
                              ${product.price}
                            </span>
                          )}
                        </div>
                        
                        <span className="text-sm text-primary-600 bg-primary-50 px-2 py-1 rounded-full">
                          {product.category?.name}
                        </span>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleAddToCart(product)}
                          disabled={product.stock === 0}
                          className="flex-1 btn-primary py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <ShoppingBagIcon className="w-4 h-4 mr-1" />
                          Add to Cart
                        </button>
                        <a
                          href={`/products/${product._id}`}
                          className="btn-outline py-2 text-sm flex items-center justify-center"
                        >
                          <EyeIcon className="w-4 h-4" />
                        </a>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </motion.div>
      </div>

      {/* Clear Wishlist Confirmation Modal */}
      <ConfirmationDialog
        isOpen={showClearConfirm}
        onClose={() => setShowClearConfirm(false)}
        onConfirm={handleClearWishlist}
        title="Clear Wishlist?"
        message="This action cannot be undone. All items in your wishlist will be permanently removed."
        confirmText="Yes, Clear All"
        cancelText="Cancel"
      />
    </div>
  );
}

export default function WishlistPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-primary-light flex items-center justify-center">
        <div className="admin-card text-center">
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-neutral-600">Loading...</p>
        </div>
      </div>
    }>
      <WishlistContent />
    </Suspense>
  );
}