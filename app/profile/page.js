'use client';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  UserIcon,
  ShoppingBagIcon,
  HeartIcon,
  CogIcon,
  BellIcon,
  ShieldCheckIcon,
  CreditCardIcon,
  MapPinIcon,
  CalendarIcon,
} from '@heroicons/react/24/outline';

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const [userStats, setUserStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session) {
      fetchUserStats();
    }
  }, [session]);

  const fetchUserStats = async () => {
    try {
      const [ordersRes, wishlistRes] = await Promise.all([
        fetch('/api/orders'),
        fetch('/api/wishlist')
      ]);
      
      const orders = await ordersRes.json();
      const wishlist = await wishlistRes.json();
      
      setUserStats({
        totalOrders: orders.length,
        totalSpent: orders.reduce((sum, order) => sum + order.totalAmount, 0),
        wishlistItems: wishlist.wishlist?.length || 0,
        lastOrder: orders[0] ? new Date(orders[0].createdAt) : null
      });
    } catch (error) {
      console.error('Error fetching user stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-rose-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="text-center mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-rose-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="text-red-500 text-2xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-6">You must be logged in to view your profile.</p>
          <Link
            href="/auth/login"
            className="bg-gradient-to-r from-purple-600 to-rose-600 text-white px-6 py-3 rounded-lg hover:from-purple-700 hover:to-rose-700 transition-all duration-200"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  const { user } = session;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-rose-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-24 h-24 bg-gradient-to-r from-purple-600 to-rose-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <UserIcon className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-rose-600 bg-clip-text text-transparent mb-4">
            Welcome back, {user.name}!
          </h1>
          <p className="text-gray-600 text-lg">
            Manage your account, view orders, and track your shopping activity
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-lg p-6 text-center"
          >
            <div className="bg-gradient-to-r from-purple-600 to-rose-600 p-3 rounded-lg w-fit mx-auto mb-4">
              <ShoppingBagIcon className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">
              {loading ? '...' : userStats?.totalOrders || 0}
            </h3>
            <p className="text-gray-600">Total Orders</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-lg p-6 text-center"
          >
            <div className="bg-gradient-to-r from-blue-600 to-cyan-600 p-3 rounded-lg w-fit mx-auto mb-4">
              <CreditCardIcon className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">
              ${loading ? '...' : (userStats?.totalSpent || 0).toFixed(2)}
            </h3>
            <p className="text-gray-600">Total Spent</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-lg p-6 text-center"
          >
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-3 rounded-lg w-fit mx-auto mb-4">
              <HeartIcon className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">
              {loading ? '...' : userStats?.wishlistItems || 0}
            </h3>
            <p className="text-gray-600">Wishlist Items</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-lg p-6 text-center"
          >
            <div className="bg-gradient-to-r from-orange-600 to-red-600 p-3 rounded-lg w-fit mx-auto mb-4">
              <CalendarIcon className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">
              {loading ? '...' : userStats?.lastOrder ? 'Active' : 'New'}
            </h3>
            <p className="text-gray-600">Account Status</p>
          </motion.div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Information */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2 space-y-6"
          >
            {/* Account Information */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <UserIcon className="w-5 h-5 mr-2 text-purple-600" />
                Account Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={user.name || ''}
                    disabled
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-700"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={user.email || ''}
                    disabled
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-700"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Account Type
                  </label>
                  <input
                    type="text"
                    value={user.isAdmin ? 'Administrator' : 'Customer'}
                    disabled
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-700"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Member Since
                  </label>
                  <input
                    type="text"
                    value={new Date().toLocaleDateString()}
                    disabled
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-700"
                  />
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link
                  href="/orders"
                  className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-all duration-200"
                >
                  <ShoppingBagIcon className="w-6 h-6 text-purple-600 mr-3" />
                  <div>
                    <h3 className="font-medium text-gray-900">View Orders</h3>
                    <p className="text-sm text-gray-600">Track your order history</p>
                  </div>
                </Link>

                <Link
                  href="/wishlist"
                  className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-all duration-200"
                >
                  <HeartIcon className="w-6 h-6 text-purple-600 mr-3" />
                  <div>
                    <h3 className="font-medium text-gray-900">Wishlist</h3>
                    <p className="text-sm text-gray-600">View saved items</p>
                  </div>
                </Link>

                <Link
                  href="/cart"
                  className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-all duration-200"
                >
                  <ShoppingBagIcon className="w-6 h-6 text-purple-600 mr-3" />
                  <div>
                    <h3 className="font-medium text-gray-900">Shopping Cart</h3>
                    <p className="text-sm text-gray-600">Continue shopping</p>
                  </div>
                </Link>

                <Link
                  href="/products"
                  className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-all duration-200"
                >
                  <MapPinIcon className="w-6 h-6 text-purple-600 mr-3" />
                  <div>
                    <h3 className="font-medium text-gray-900">Browse Products</h3>
                    <p className="text-sm text-gray-600">Discover new items</p>
                  </div>
                </Link>
              </div>
            </div>
          </motion.div>

          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            {/* Account Settings */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <CogIcon className="w-5 h-5 mr-2 text-purple-600" />
                Account Settings
              </h2>
              <div className="space-y-4">
                <button className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center">
                    <ShieldCheckIcon className="w-5 h-5 text-gray-600 mr-3" />
                    <div>
                      <p className="font-medium text-gray-900">Security Settings</p>
                      <p className="text-sm text-gray-600">Password & privacy</p>
                    </div>
                  </div>
                </button>

                <button className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center">
                    <BellIcon className="w-5 h-5 text-gray-600 mr-3" />
                    <div>
                      <p className="font-medium text-gray-900">Notifications</p>
                      <p className="text-sm text-gray-600">Email preferences</p>
                    </div>
                  </div>
                </button>

                <button className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center">
                    <MapPinIcon className="w-5 h-5 text-gray-600 mr-3" />
                    <div>
                      <p className="font-medium text-gray-900">Addresses</p>
                      <p className="text-sm text-gray-600">Shipping addresses</p>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Recent Activity</h2>
              <div className="space-y-4">
                {userStats?.lastOrder ? (
                  <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Last order placed</p>
                      <p className="text-xs text-gray-600">
                        {userStats.lastOrder.toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Welcome to Anabeya!</p>
                      <p className="text-xs text-gray-600">Start shopping to see activity</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
