import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI } from '../../services/admin';
import { formatCurrency } from '../../utils/helpers';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';
import { HiUsers, HiTicket, HiCurrencyDollar, HiShoppingCart, HiTrendingUp, HiCalendar } from 'react-icons/hi';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getDashboardStats();
      setStats(response.data.data);
    } catch (error) {
      setError('Failed to fetch dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner text="Loading dashboard..." />;
  if (error) return <ErrorMessage message={error} onRetry={fetchDashboardStats} />;

  const statCards = [
    {
      title: 'Total Users',
      value: stats.total_users,
      icon: HiUsers,
      color: 'text-blue-600',
      bg: 'bg-blue-100',
      link: '/admin/users'
    },
    {
      title: 'Total Concerts',
      value: stats.total_concerts,
      icon: HiTicket,
      color: 'text-green-600',
      bg: 'bg-green-100',
      link: '/admin/concerts'
    },
    {
      title: 'Total Orders',
      value: stats.total_orders,
      icon: HiShoppingCart,
      color: 'text-purple-600',
      bg: 'bg-purple-100'
    },
    {
      title: 'Total Revenue',
      value: formatCurrency(stats.total_revenue),
      icon: HiCurrencyDollar,
      color: 'text-green-600',
      bg: 'bg-green-100'
    },
    {
      title: 'Recent Orders (7 days)',
      value: stats.recent_orders,
      icon: HiTrendingUp,
      color: 'text-orange-600',
      bg: 'bg-orange-100'
    },
    {
      title: 'Monthly Revenue',
      value: formatCurrency(stats.monthly_revenue),
      icon: HiCalendar,
      color: 'text-indigo-600',
      bg: 'bg-indigo-100'
    }
  ];

  return (
    <div className="min-h-screen bg-base-200 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">Admin Dashboard</h1>
          <p className="text-base-content/70">
            Overview of your concert ticketing platform
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {statCards.map((stat, index) => (
            <div key={index} className="card bg-base-100 shadow-lg card-hover">
              <div className="card-body">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-base-content/70 mb-2">
                      {stat.title}
                    </h3>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-full ${stat.bg}`}>
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
                {stat.link && (
                  <div className="card-actions justify-end mt-4">
                    <Link to={stat.link} className="btn btn-ghost btn-sm">
                      View Details
                    </Link>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="card bg-base-100 shadow-lg">
            <div className="card-body">
              <h2 className="card-title">Quick Actions</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                <Link to="/admin/concerts" className="btn btn-primary">
                  <HiTicket className="w-5 h-5 mr-2" />
                  Manage Concerts
                </Link>
                <Link to="/admin/users" className="btn btn-secondary">
                  <HiUsers className="w-5 h-5 mr-2" />
                  Manage Users
                </Link>
                <Link to="/admin/reports" className="btn btn-accent">
                  <HiTrendingUp className="w-5 h-5 mr-2" />
                  View Reports
                </Link>
                <Link to="/concerts" className="btn btn-ghost">
                  View Public Site
                </Link>
              </div>
            </div>
          </div>

          {/* Top Selling Concerts */}
          <div className="card bg-base-100 shadow-lg">
            <div className="card-body">
              <h2 className="card-title">Top Selling Concerts</h2>
              {stats.top_concerts && stats.top_concerts.length > 0 ? (
                <div className="space-y-3 mt-4">
                  {stats.top_concerts.map((concert, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-base-200 rounded-lg">
                      <div>
                        <h4 className="font-medium">{concert.title}</h4>
                        <p className="text-sm text-base-content/70">{concert.venue}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{concert.tickets_sold} tickets</p>
                        <p className="text-sm text-success">{formatCurrency(concert.revenue)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-base-content/70">No sales data available</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;