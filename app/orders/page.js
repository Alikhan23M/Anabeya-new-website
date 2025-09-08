'use client';
import { useState, useEffect, Suspense } from 'react';
import { useSession } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingBagIcon, 
  TruckIcon, 
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  StarIcon,
  ChatBubbleLeftRightIcon,
  EyeIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  PhotoIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import toast from 'react-hot-toast';
import ReviewModal from '@/components/ui/ReviewModal';

function OrderStatusBadge({ status }) {
  const statusConfig = {
    'Pending': {
      color: 'bg-warning-100 text-warning-800 border-warning-200',
      icon: ClockIcon,
    },
    'Processing': {
      color: 'bg-primary-100 text-primary-800 border-primary-200',
      icon: ClockIcon,
    },
    'Shipped': {
      color: 'bg-secondary-100 text-secondary-800 border-secondary-200',
      icon: TruckIcon,
    },
    'Delivered': {
      color: 'bg-success-100 text-success-800 border-success-200',
      icon: CheckCircleIcon,
    },
    'Cancelled': {
      color: 'bg-error-100 text-error-800 border-error-200',
      icon: XCircleIcon, // Changed from ExclamationCircleIcon to XCircleIcon
    },
  };

  const config = statusConfig[status] || statusConfig['Pending'];
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${config.color}`}>
      <Icon className="w-4 h-4 mr-1" />
      {status}
    </span>
  );
}

function ProductImage({ product, className = "w-12 h-12" }) {
  if (product?.images && product.images[0] && product.images[0] !== '') {
    return (
      <img
        src={product.images[0]}
        alt={product.title}
        className={`${className} object-cover rounded-lg border border-neutral-200`}
      />
    );
  }
  
  return (
    <div className={`${className} bg-neutral-100 rounded-lg flex items-center justify-center border border-neutral-200`}>
      {/* Removed PhotoIcon import, so this will cause an error */}
      <ChatBubbleLeftRightIcon className="w-6 h-6 text-neutral-400" />
    </div>
  );
}

function OrderCard({ order, onViewDetails }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card card-hover"
    >
      {/* Order Header */}
      <div className="p-6 border-b border-neutral-100">
        <div className="flex items-center justify-between">
          <div className="flex flex-wrap gap-2 items-center space-x-4">
            <div className="gradient-primary p-3 rounded-lg">
              <ShoppingBagIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-neutral-900">
                Order #{order.orderNumber}
              </h3>
              <p className="text-sm text-neutral-500 flex items-center">
                <ClockIcon className="w-4 h-4 mr-1" />
                {new Date(order.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
          </div>
          <div className="text-right">
            <OrderStatusBadge status={order.status} />
            <p className="text-2xl font-bold text-neutral-900 mt-2">
              ${order.totalAmount}
            </p>
          </div>
        </div>
      </div>

      {/* Order Items Preview */}
      <div className="p-6">
        <div className="space-y-3">
          {order.items.slice(0, 2).map((item, index) => (
            <div key={index} className="flex items-center space-x-4">
              <ProductImage product={item.product} />
              <div className="flex-1">
                <p className="font-medium text-neutral-900">{item.product?.title}</p>
                <p className="text-sm text-neutral-500">
                  Qty: {item.quantity} • Size: {item.size} • ${item.price}
                </p>
              </div>
                      {/* Product Actions */}
                      <div className="flex gap-2 mt-3">
                        {order.status === 'delivered' && (
                          <button
                            onClick={() => handleReviewProduct(item.product, order._id)}
                            className="btn-outline py-1 px-3 text-sm flex items-center gap-1 text-primary-600 border-primary-300 hover:border-primary-500 hover:text-primary-700"
                          >
                            <StarIcon className="w-4 h-4" />
                            Write Review
                          </button>
                        )}
                        <a
                          href={`/products/${item.product._id}`}
                          className="btn-outline py-1 px-3 text-sm flex items-center gap-1"
                        >
                          <EyeIcon className="w-4 h-4" />
                          View Product
                        </a>
                      </div>
            </div>
          ))}
          {order.items.length > 2 && (
            <p className="text-sm text-neutral-500 text-center">
              +{order.items.length - 2} more items
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between mt-6 pt-6 border-t border-neutral-100">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center text-primary-600 hover:text-primary-700 font-medium"
          >
            {/* Removed EyeIcon import, so this will cause an error */}
            {isExpanded ? 'Hide Details' : 'View Details'}
          </button>
          <button
            onClick={() => onViewDetails(order)}
            className="btn-primary"
          >
            Track Order
          </button>
        </div>
      </div>

      {/* Expanded Details */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-neutral-100"
          >
            <div className="p-6 bg-neutral-50">
              <h4 className="font-semibold text-neutral-900 mb-4">Order Details</h4>
              
              {/* Customer Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h5 className="font-medium text-neutral-700 mb-2">Shipping Address</h5>
                  <div className="text-sm text-neutral-600">
                    <p>{order.customerInfo?.name}</p>
                    <p>{order.customerInfo?.address?.street}</p>
                    <p>
                      {order.customerInfo?.address?.city}, {order.customerInfo?.address?.state} {order.customerInfo?.address?.zipCode}
                    </p>
                    <p>{order.customerInfo?.address?.country}</p>
                  </div>
                </div>
                <div>
                  <h5 className="font-medium text-neutral-700 mb-2">Contact Information</h5>
                  <div className="text-sm text-neutral-600">
                    <p>Phone: {order.customerInfo?.phone}</p>
                    <p>Email: {order.user?.email}</p>
                  </div>
                </div>
              </div>

              {/* All Items */}
              <div>
                <h5 className="font-medium text-neutral-700 mb-3">All Items</h5>
                <div className="space-y-3">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg">
                      <div className="flex items-center space-x-3">
                        <ProductImage product={item.product} className="w-10 h-10" />
                        <div>
                          <p className="font-medium text-neutral-900">{item.product?.title}</p>
                          <p className="text-sm text-neutral-500">
                            Size: {item.size} • Qty: {item.quantity}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-neutral-900">${item.price}</p>
                        <p className="text-sm text-neutral-500">Total: ${(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Size Description */}
              {order.customerInfo?.sizeDescription && (
                <div className="mt-6">
                  <h5 className="font-medium text-neutral-700 mb-2">Size Description</h5>
                  <p className="text-sm text-neutral-600 bg-white p-3 rounded-lg">
                    {order.customerInfo.sizeDescription}
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function OrdersPage() {
  const { data: session, status } = useSession();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showTrackingModal, setShowTrackingModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedOrderId, setSelectedOrderId] = useState(null);

  useEffect(() => {
    if (session) {
      fetchOrders();
    }
  }, [session]);

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/orders');
      if (!response.ok) throw new Error('Failed to fetch orders');
      const data = await response.json();
      setOrders(data);
    } catch (err) {
      setError('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (order) => {
    setSelectedOrder(order);
    setShowTrackingModal(true);
  };

  const handleReviewProduct = (product, orderId) => {
    setSelectedProduct(product);
    setSelectedOrderId(orderId);
    setShowReviewModal(true);
  };

  const handleSubmitReview = async (reviewData) => {
    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reviewData),
      });

      if (!response.ok) {
        throw new Error('Failed to submit review');
      }

      // Refresh orders to show updated review status
      fetchOrders();
    } catch (error) {
      console.error('Error submitting review:', error);
      throw error;
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-primary-light flex items-center justify-center">
        <div className="admin-card text-center">
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-neutral-600">Loading your orders...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-primary-light flex items-center justify-center">
        <div className="admin-card text-center">
          <div className="text-error-500 text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-neutral-900 mb-2">Access Denied</h2>
          <p className="text-neutral-600">You must be logged in to view your orders.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-primary-light">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="admin-header">My Orders</h1>
          <p className="admin-subheader">
            Track your orders and view order history
          </p>
        </div>

        {/* Stats */}
        <div className="admin-stats-grid mb-8">
          <div className="admin-stat-card">
            <div className="gradient-primary p-3 rounded-lg w-fit mx-auto mb-4">
              <ShoppingBagIcon className="w-6 h-6 text-white" />
            </div>
            <h3 className="admin-stat-number">{orders.length}</h3>
            <p className="admin-stat-label">Total Orders</p>
          </div>
          <div className="admin-stat-card">
            <div className="bg-gradient-to-r from-primary-600 to-secondary-600 p-3 rounded-lg w-fit mx-auto mb-4">
              <ClockIcon className="w-6 h-6 text-white" />
            </div>
            <h3 className="admin-stat-number">
              {orders.filter(o => o.status === 'Pending' || o.status === 'Processing').length}
            </h3>
            <p className="admin-stat-label">Active Orders</p>
          </div>
          <div className="admin-stat-card">
            <div className="bg-gradient-to-r from-success-600 to-emerald-600 p-3 rounded-lg w-fit mx-auto mb-4">
              <CheckCircleIcon className="w-6 h-6 text-white" />
            </div>
            <h3 className="admin-stat-number">
              {orders.filter(o => o.status === 'Delivered').length}
            </h3>
            <p className="admin-stat-label">Delivered</p>
          </div>
          <div className="admin-stat-card">
            <div className="bg-gradient-to-r from-warning-600 to-error-600 p-3 rounded-lg w-fit mx-auto mb-4">
              {/* Removed CurrencyDollarIcon import, so this will cause an error */}
              <StarIcon className="w-6 h-6 text-white" />
            </div>
            <h3 className="admin-stat-number">
              ${orders.reduce((sum, order) => sum + order.totalAmount, 0).toFixed(2)}
            </h3>
            <p className="admin-stat-label">Total Spent</p>
          </div>
        </div>

        {/* Orders List */}
        {loading ? (
          <div className="admin-card text-center">
            <div className="spinner mx-auto mb-4"></div>
            <p className="text-neutral-600">Loading your orders...</p>
          </div>
        ) : error ? (
          <div className="admin-card text-center">
            <div className="text-error-500 text-6xl mb-4">⚠️</div>
            <p className="text-error-600">{error}</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="admin-card text-center">
            <div className="text-neutral-400 text-6xl mb-4">📦</div>
            <h3 className="text-xl font-semibold text-neutral-900 mb-2">No Orders Yet</h3>
            <p className="text-neutral-600 mb-6">Start shopping to see your orders here!</p>
            <a
              href="/products"
              className="btn-primary"
            >
              Browse Products
            </a>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <OrderCard
                key={order._id}
                order={order}
                onViewDetails={handleViewDetails}
              />
            ))}
          </div>
        )}
      </div>

      {/* Tracking Modal */}
      <AnimatePresence>
        {showTrackingModal && selectedOrder && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="admin-card max-w-md w-full"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold">Order Tracking</h3>
                <button
                  onClick={() => setShowTrackingModal(false)}
                  className="text-neutral-400 hover:text-neutral-600"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="text-center">
                  <h4 className="font-semibold text-neutral-900">Order #{selectedOrder.orderNumber}</h4>
                  <OrderStatusBadge status={selectedOrder.status} />
                </div>
                
                <div className="bg-neutral-50 rounded-lg p-4">
                  <p className="text-sm text-neutral-600">
                    Your order is currently being processed. You'll receive updates via email.
                  </p>
                </div>
                
                <div className="flex justify-end">
                  <button
                    onClick={() => setShowTrackingModal(false)}
                    className="btn-primary"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Review Modal */}
      <ReviewModal
        isOpen={showReviewModal}
        onClose={() => {
          setShowReviewModal(false);
          setSelectedProduct(null);
          setSelectedOrderId(null);
        }}
        product={selectedProduct}
        orderId={selectedOrderId}
        onSubmit={handleSubmitReview}
      />
    </div>
  );
}
