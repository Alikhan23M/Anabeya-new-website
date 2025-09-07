'use client';
import { useEffect, useState, useRef } from 'react';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  RadialLinearScale,
} from 'chart.js';
import {
  ShoppingBagIcon,
  UsersIcon,
  CurrencyDollarIcon,
  CubeIcon,
  BellIcon,
  EyeIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  RadialLinearScale
);

const Chart = dynamic(() => import('react-chartjs-2').then(mod => mod.Bar), { ssr: false });
const LineChart = dynamic(() => import('react-chartjs-2').then(mod => mod.Line), { ssr: false });
const DoughnutChart = dynamic(() => import('react-chartjs-2').then(mod => mod.Doughnut), { ssr: false });

function StatCard({ title, value, icon: Icon, trend, color = "purple" }) {
  const colors = {
    purple: "from-purple-600 to-rose-600",
    blue: "from-blue-600 to-cyan-600", 
    green: "from-green-600 to-emerald-600",
    orange: "from-orange-600 to-red-600"
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-gradient-to-r ${colors[color]} rounded-xl shadow-lg p-6 text-white`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-white/80 text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold mt-2">{value}</p>
          {trend && (
            <div className="flex items-center mt-2">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M12.577 4.878a.75.75 0 01.919-.53l4.78 1.281a.75.75 0 01.531.919l-1.281 4.78a.75.75 0 01-1.449-.387l.81-3.022a19.407 19.407 0 00-5.594 5.203.75.75 0 01-1.139.093L7 10.06l-4.72 4.72a.75.75 0 01-1.06-1.061l5.25-5.25a.75.75 0 011.06 0l3.606 3.605a19.413 19.413 0 015.594-5.203l-3.022-.815a.75.75 0 01-.387-1.449z" clipRule="evenodd" />
              </svg>
              <span className="text-sm">{trend}</span>
            </div>
          )}
        </div>
        <div className="bg-white/20 p-3 rounded-lg">
          <Icon className="w-8 h-8" />
        </div>
      </div>
    </motion.div>
  );
}

function NotificationBell({ notifications, onToggle }) {
  return (
    <div className="relative">
      <button
        onClick={onToggle}
        className="bg-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-200"
      >
        <BellIcon className="w-6 h-6 text-gray-700" />
        {notifications.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {notifications.length}
          </span>
        )}
      </button>
    </div>
  );
}

export default function AdminDashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    fetchAnalytics();
    // setupNotifications();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const res = await fetch('/api/admin/analytics');
      const analyticsData = await res.json();
      setData(analyticsData);
    } catch (err) {
      setError('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  const setupNotifications = () => {
    // Simulate real-time notifications
    const eventSource = new EventSource('/api/admin/notifications');
    
    eventSource.onmessage = (event) => {
      const notification = JSON.parse(event.data);
      setNotifications(prev => [notification, ...prev.slice(0, 9)]);
      
      // Play notification sound
      if (audioRef.current) {
        audioRef.current.play();
      }
    };

    return () => eventSource.close();
  };

  if (loading) {
  return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-rose-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="text-center mt-4 text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-rose-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="text-red-500 text-2xl mb-4">⚠️</div>
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const chartColors = {
    primary: 'rgba(147, 51, 234, 0.8)',
    secondary: 'rgba(244, 63, 94, 0.8)',
    accent: 'rgba(59, 130, 246, 0.8)',
    success: 'rgba(34, 197, 94, 0.8)',
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-rose-50 p-2 md:p-6">
      {/* <audio ref={audioRef} src="/notification.mp3" /> */}
      
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-rose-600 bg-clip-text text-transparent">
            Admin Dashboard
          </h1>
          <p className="text-gray-600 mt-2">Welcome back! Here's what's happening with your store.</p>
        </div>
        {/* <NotificationBell 
          notifications={notifications} 
          onToggle={() => setShowNotifications(!showNotifications)} 
        /> */}
      </div>

      {/* Notifications Panel */}
      {showNotifications && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute right-6 top-20 bg-white rounded-xl shadow-2xl p-4 w-80 z-50"
        >
          <h3 className="font-semibold mb-3">Recent Notifications</h3>
          {notifications.length === 0 ? (
            <p className="text-gray-500 text-sm">No new notifications</p>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {notifications.map((notification, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium">{notification.title}</p>
                  <p className="text-xs text-gray-600">{notification.message}</p>
                  <p className="text-xs text-gray-400 mt-1">{notification.time}</p>
            </div>
          ))}
        </div>
          )}
        </motion.div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Orders"
          value={data.totals.orders}
          icon={ShoppingBagIcon}
          trend="+12% from last month"
          color="purple"
        />
        <StatCard
          title="Total Revenue"
          value={`$${data.totals.revenue.toLocaleString()}`}
          icon={CurrencyDollarIcon}
          trend="+8% from last month"
          color="green"
        />
        <StatCard
          title="Total Users"
          value={data.totals.users}
          icon={UsersIcon}
          trend="+5% from last month"
          color="blue"
        />
        <StatCard
          title="Total Products"
          value={data.totals.products}
          icon={CubeIcon}
          trend="+3% from last month"
          color="orange"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Revenue & Orders Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M12.577 4.878a.75.75 0 01.919-.53l4.78 1.281a.75.75 0 01.531.919l-1.281 4.78a.75.75 0 01-1.449-.387l.81-3.022a19.407 19.407 0 00-5.594 5.203.75.75 0 01-1.139.093L7 10.06l-4.72 4.72a.75.75 0 01-1.06-1.061l5.25-5.25a.75.75 0 011.06 0l3.606 3.605a19.413 19.413 0 015.594-5.203l-3.022-.815a.75.75 0 01-.387-1.449z" clipRule="evenodd" />
            </svg>
            Revenue & Orders Trend
          </h2>
          {typeof window !== 'undefined' && data.monthlyRevenue && (
            <LineChart
              data={{
                labels: data.monthlyRevenue.map(row => `${row._id.month}/${row._id.year}`),
                datasets: [
                  {
                    label: 'Revenue',
                    data: data.monthlyRevenue.map(row => row.revenue),
                    borderColor: chartColors.primary,
                    backgroundColor: chartColors.primary.replace('0.8', '0.1'),
                    tension: 0.4,
                    yAxisID: 'y',
                  },
                  {
                    label: 'Orders',
                    data: data.monthlyRevenue.map(row => row.orders),
                    borderColor: chartColors.secondary,
                    backgroundColor: chartColors.secondary.replace('0.8', '0.1'),
                    tension: 0.4,
                    yAxisID: 'y1',
                  },
                ],
              }}
              options={{
                responsive: true,
                interaction: { mode: 'index', intersect: false },
                plugins: { 
                  legend: { position: 'top' },
                  title: { display: false }
                },
                scales: {
                  y: { 
                    type: 'linear', 
                    display: true, 
                    position: 'left',
                    title: { display: true, text: 'Revenue ($)' }
                  },
                  y1: { 
                    type: 'linear', 
                    display: true, 
                    position: 'right', 
                    grid: { drawOnChartArea: false },
                    title: { display: true, text: 'Orders' }
                  },
                },
              }}
            />
          )}
        </motion.div>

        {/* Order Status Distribution */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <EyeIcon className="w-5 h-5 mr-2 text-purple-600" />
            Order Status Distribution
          </h2>
          {typeof window !== 'undefined' && data.orderStatusStats && (
            <DoughnutChart
              data={{
                labels: data.orderStatusStats.map(stat => stat._id),
                datasets: [{
                  data: data.orderStatusStats.map(stat => stat.count),
                  backgroundColor: [
                    chartColors.primary,
                    chartColors.secondary,
                    chartColors.accent,
                    chartColors.success,
                  ],
                  borderWidth: 2,
                  borderColor: '#fff',
                }],
              }}
              options={{
                responsive: true,
                plugins: { 
                  legend: { position: 'bottom' },
                  title: { display: false }
                },
              }}
            />
          )}
        </motion.div>
        </div>

      {/* Top Products Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-lg p-6 mb-8"
      >
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <CubeIcon className="w-5 h-5 mr-2 text-purple-600" />
          Top Selling Products
        </h2>
          {typeof window !== 'undefined' && data.topProducts && (
            <Chart
              data={{
                labels: data.topProducts.map(row => row.product.title),
                datasets: [
                  {
                  label: 'Units Sold',
                    data: data.topProducts.map(row => row.totalSold),
                  backgroundColor: chartColors.primary,
                  borderRadius: 8,
                  },
                  {
                  label: 'Revenue ($)',
                    data: data.topProducts.map(row => row.revenue),
                  backgroundColor: chartColors.secondary,
                  borderRadius: 8,
                  },
                ],
              }}
              options={{
                responsive: true,
              plugins: { 
                legend: { position: 'top' },
                title: { display: false }
              },
              scales: {
                y: {
                  beginAtZero: true,
                  title: { display: true, text: 'Count/Amount' }
                }
              }
              }}
            />
          )}
      </motion.div>

      {/* Recent Orders & Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Orders */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2 bg-white rounded-xl shadow-lg p-6"
        >
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <ClockIcon className="w-5 h-5 mr-2 text-purple-600" />
            Recent Orders
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Order ID</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Customer</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Total</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Date</th>
                </tr>
              </thead>
              <tbody>
                {data.recentOrders.map((order, i) => (
                  <tr key={i} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4 font-mono text-sm">#{order._id.slice(-8)}</td>
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium">{order.user?.name}</p>
                        <p className="text-sm text-gray-500">{order.user?.email}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        order.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                        order.status === 'Processing' ? 'bg-blue-100 text-blue-800' :
                        order.status === 'Shipped' ? 'bg-purple-100 text-purple-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-semibold">${order.totalAmount}</td>
                    <td className="py-3 px-4 text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <h2 className="text-xl font-semibold mb-4">Quick Stats</h2>
          <div className="space-y-4">
            {data.orderStatusStats.map((stat, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="font-medium">{stat._id}</span>
                <span className="text-2xl font-bold text-purple-600">{stat.count}</span>
              </div>
            ))}
        </div>
        </motion.div>
      </div>
    </div>
  );
}