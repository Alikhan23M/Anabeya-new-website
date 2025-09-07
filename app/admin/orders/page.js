'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingBagIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  CheckCircleIcon,
  XMarkIcon,
  TruckIcon,
  ClockIcon,
  PhotoIcon,
} from '@heroicons/react/24/outline';

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
      icon: XMarkIcon,
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

function ProductImage({ product, className = "w-10 h-10" }) {
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
      <PhotoIcon className="w-5 h-5 text-neutral-400" />
    </div>
  );
}

function OrderRow({ order, onUpdateStatus }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [updating, setUpdating] = useState(false);

  const handleStatusUpdate = async (newStatus) => {
    setUpdating(true);
    try {
      const response = await fetch(`/api/admin/orders/${order._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      
      if (response.ok) {
        onUpdateStatus(order._id, newStatus);
      }
    } catch (error) {
      console.error('Error updating order status:', error);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card card-hover"
    >
      {/* Order Header */}
      <div className="p-6 md:p-6 border-b border-neutral-100">
        <div className="flex items-center justify-between flex-wrap space-y-4 md:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="gradient-primary p-3 rounded-lg">
              <ShoppingBagIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-neutral-900">
                Order #{order.orderNumber}
              </h3>
              <p className="text-sm text-neutral-500">
                {new Date(order.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
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

      {/* Order Details */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div>
            <h4 className="font-semibold text-neutral-900 mb-2">Customer Information</h4>
            <div className="text-sm text-neutral-600">
              <p className="font-medium">{order.customerInfo?.name}</p>
              <p>{order.user?.email}</p>
              <p>{order.customerInfo?.phone}</p>
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-neutral-900 mb-2">Shipping Address</h4>
            <div className="text-sm text-neutral-600">
              <p>{order.customerInfo?.address?.street}</p>
              <p>
                {order.customerInfo?.address?.city}, {order.customerInfo?.address?.state} {order.customerInfo?.address?.zipCode}
              </p>
              <p>{order.customerInfo?.address?.country}</p>
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-neutral-900 mb-2">Order Summary</h4>
            <div className="text-sm text-neutral-600">
              <p>{order.items.length} items</p>
              <p>Total: ${order.totalAmount}</p>
              {order.customerInfo?.sizeDescription && (
                <p className="mt-2 text-xs bg-neutral-50 p-2 rounded">
                  Size Note: {order.customerInfo.sizeDescription}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div className="mb-6">
          <h4 className="font-semibold text-neutral-900 mb-3">Order Items</h4>
          <div className="space-y-3">
            {order.items.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <ProductImage product={item.product} />
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

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-6 border-t border-neutral-100">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center text-primary-600 hover:text-primary-700 font-medium"
          >
            <EyeIcon className="w-4 h-4 mr-1" />
            {isExpanded ? 'Hide Details' : 'View Details'}
          </button>
          
          <div className="flex items-center space-x-2">
            <select
              value={order.status}
              onChange={(e) => handleStatusUpdate(e.target.value)}
              disabled={updating}
              className="px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="Pending">Pending</option>
              <option value="Processing">Processing</option>
              <option value="Shipped">Shipped</option>
              <option value="Delivered">Delivered</option>
              <option value="Cancelled">Cancelled</option>
            </select>
            {updating && (
              <div className="spinner w-4 h-4"></div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/admin/orders');
      if (!response.ok) throw new Error('Failed to fetch orders');
      const data = await response.json();
      setOrders(data);
    } catch (err) {
      setError('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = (orderId, newStatus) => {
    setOrders(prev => prev.map(order => 
      order._id === orderId ? { ...order, status: newStatus } : order
    ));
  };

  const filteredOrders = orders
    .filter(order => {
      const matchesSearch = 
        order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customerInfo?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.user?.email?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'amount':
          return b.totalAmount - a.totalAmount;
        case 'status':
          return a.status.localeCompare(b.status);
        default:
          return 0;
      }
    });

  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'Pending').length,
    processing: orders.filter(o => o.status === 'Processing').length,
    shipped: orders.filter(o => o.status === 'Shipped').length,
    delivered: orders.filter(o => o.status === 'Delivered').length,
    cancelled: orders.filter(o => o.status === 'Cancelled').length,
    revenue: orders.reduce((sum, order) => sum + order.totalAmount, 0),
  };

  if (loading) {
    return (
      <div className="admin-page">
        <div className="flex items-center justify-center min-h-screen">
          <div className="admin-card text-center">
            <div className="spinner mx-auto mb-4"></div>
            <p className="text-neutral-600">Loading orders...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page p-0 md:p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="admin-header">Orders Management</h1>
        <p className="admin-subheader">Manage and track all customer orders</p>
      </div>

      {/* Stats Cards */}
      <div className="admin-stats-grid mb-8">
        <div className="admin-stat-card">
          <h3 className="admin-stat-number">{stats.total}</h3>
          <p className="admin-stat-label">Total Orders</p>
        </div>
        <div className="admin-stat-card">
          <h3 className="admin-stat-number text-warning-600">{stats.pending}</h3>
          <p className="admin-stat-label">Pending</p>
        </div>
        <div className="admin-stat-card">
          <h3 className="admin-stat-number text-primary-600">{stats.processing}</h3>
          <p className="admin-stat-label">Processing</p>
        </div>
        <div className="admin-stat-card">
          <h3 className="admin-stat-number text-secondary-600">{stats.shipped}</h3>
          <p className="admin-stat-label">Shipped</p>
        </div>
        <div className="admin-stat-card">
          <h3 className="admin-stat-number text-success-600">{stats.delivered}</h3>
          <p className="admin-stat-label">Delivered</p>
        </div>
        <div className="admin-stat-card">
          <h3 className="admin-stat-number text-error-600">{stats.cancelled}</h3>
          <p className="admin-stat-label">Cancelled</p>
        </div>
        <div className="admin-stat-card">
          <h3 className="admin-stat-number">${stats.revenue.toFixed(2)}</h3>
          <p className="admin-stat-label">Total Revenue</p>
        </div>
      </div>

      {/* Filters */}
      <div className="admin-card mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
              <input
                type="text"
                placeholder="Search orders by order number, customer name, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex gap-4 flex-wrap">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Processing">Processing</option>
              <option value="Shipped">Shipped</option>
              <option value="Delivered">Delivered</option>
              <option value="Cancelled">Cancelled</option>
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="date">Sort by Date</option>
              <option value="amount">Sort by Amount</option>
              <option value="status">Sort by Status</option>
            </select>
          </div>
        </div>
      </div>

      {/* Orders List */}
      {error ? (
        <div className="admin-card text-center">
          <div className="text-error-500 text-6xl mb-4">⚠️</div>
          <p className="text-error-600">{error}</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="admin-card text-center">
          <div className="text-neutral-400 text-6xl mb-4">📦</div>
          <h3 className="text-xl font-semibold text-neutral-900 mb-2">No Orders Found</h3>
          <p className="text-neutral-600">
            {searchTerm || statusFilter !== 'all' 
              ? 'Try adjusting your search or filter criteria' 
              : 'No orders have been placed yet'
            }
          </p>
        </div>
      ) : (
        <div className="space-y-6 overflow-x-auto">
          {filteredOrders.map((order) => (
            <OrderRow
              key={order._id}
              order={order}
              onUpdateStatus={handleUpdateStatus}
            />
          ))}
        </div>
      )}
    </div>
  );
}