import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ordersAPI } from '../services/orders';
import { formatDateTime, formatCurrency, getOrderStatusBadge } from '../utils/helpers';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import Pagination from '../components/common/Pagination';
import Modal from '../components/common/Modal';
import { HiTicket, HiCalendar, HiCreditCard, HiEye, HiX } from 'react-icons/hi';
import toast from 'react-hot-toast';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({});
  const [filters, setFilters] = useState({
    status: '',
    page: 1
  });
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, [filters]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await ordersAPI.getUserOrders(filters);
      setOrders(response.data.data.items);
      setPagination(response.data.data.pagination);
    } catch (error) {
      setError('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (e) => {
    setFilters({
      ...filters,
      status: e.target.value,
      page: 1
    });
  };

  const handlePageChange = (page) => {
    setFilters({
      ...filters,
      page
    });
  };

  const handleViewOrder = async (orderId) => {
    try {
      const response = await ordersAPI.getOrder(orderId);
      setSelectedOrder(response.data.data);
      setShowOrderModal(true);
    } catch (error) {
      toast.error('Failed to fetch order details');
    }
  };

  const handlePayOrder = async (orderId) => {
    try {
      setActionLoading(true);
      await ordersAPI.payOrder(orderId, { payment_method: 'bank_transfer' });
      toast.success('Payment processed successfully');
      fetchOrders();
      setShowOrderModal(false);
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to process payment';
      toast.error(message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (!confirm('Are you sure you want to cancel this order?')) {
      return;
    }

    try {
      setActionLoading(true);
      await ordersAPI.cancelOrder(orderId);
      toast.success('Order cancelled successfully');
      fetchOrders();
      setShowOrderModal(false);
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to cancel order';
      toast.error(message);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-base-200 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">My Orders</h1>
          <p className="text-base-content/70">
            Track and manage your ticket orders
          </p>
        </div>

        {/* Filters */}
        <div className="card bg-base-100 shadow-lg mb-6">
          <div className="card-body">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="form-control">
                <select
                  className="select select-bordered"
                  value={filters.status}
                  onChange={handleStatusChange}
                >
                  <option value="">All Orders</option>
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              
              {filters.status && (
                <button
                  onClick={() => setFilters({ status: '', page: 1 })}
                  className="btn btn-ghost"
                >
                  Clear Filter
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Orders List */}
        {loading ? (
          <LoadingSpinner text="Loading orders..." />
        ) : error ? (
          <ErrorMessage message={error} onRetry={fetchOrders} />
        ) : orders.length === 0 ? (
          <div className="text-center py-12">
            <HiTicket className="w-16 h-16 text-base-content/30 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No orders found</h3>
            <p className="text-base-content/70 mb-4">
              {filters.status 
                ? 'No orders match your filter criteria' 
                : "You haven't made any orders yet"}
            </p>
            {!filters.status && (
              <Link to="/concerts" className="btn btn-primary">
                Browse Concerts
              </Link>
            )}
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order.order_id} className="card bg-base-100 shadow-lg">
                  <div className="card-body">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold">Order #{order.order_id}</h3>
                          <div className={`badge ${getOrderStatusBadge(order.status)}`}>
                            {order.status}
                          </div>
                        </div>
                        
                        <div className="text-sm text-base-content/70 space-y-1">
                          <div className="flex items-center gap-2">
                            <HiCalendar className="w-4 h-4" />
                            <span>{formatDateTime(order.created_at)}</span>
                          </div>
                          
                          {order.payment_method && (
                            <div className="flex items-center gap-2">
                              <HiCreditCard className="w-4 h-4" />
                              <span className="capitalize">{order.payment_method.replace('_', ' ')}</span>
                            </div>
                          )}
                          
                          <p className="mt-2">
                            {order.order_items?.length || 0} item(s) • 
                            Total: <span className="font-semibold text-primary">
                              {formatCurrency(order.total_amount)}
                            </span>
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-2">
                        <button
                          onClick={() => handleViewOrder(order.order_id)}
                          className="btn btn-ghost btn-sm"
                        >
                          <HiEye className="w-4 h-4 mr-2" />
                          View Details
                        </button>
                        
                        {order.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handlePayOrder(order.order_id)}
                              className="btn btn-primary btn-sm"
                              disabled={actionLoading}
                            >
                              Pay Now
                            </button>
                            <button
                              onClick={() => handleCancelOrder(order.order_id)}
                              className="btn btn-error btn-outline btn-sm"
                              disabled={actionLoading}
                            >
                              Cancel
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.pages}
              hasNext={pagination.has_next}
              hasPrev={pagination.has_prev}
              onPageChange={handlePageChange}
            />
          </>
        )}

        {/* Order Details Modal */}
        <OrderDetailsModal
          isOpen={showOrderModal}
          onClose={() => setShowOrderModal(false)}
          order={selectedOrder}
          onPay={handlePayOrder}
          onCancel={handleCancelOrder}
          loading={actionLoading}
        />
      </div>
    </div>
  );
};

// Order Details Modal Component
const OrderDetailsModal = ({ isOpen, onClose, order, onPay, onCancel, loading }) => {
  if (!order) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Order Details" size="lg">
      <div className="space-y-6">
        {/* Order Info */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold">Order #{order.order_id}</h4>
            <div className={`badge badge-lg ${getOrderStatusBadge(order.status)}`}>
              {order.status}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-base-content/70">Order Date:</span>
              <p className="font-medium">{formatDateTime(order.created_at)}</p>
            </div>
            
            {order.payment_method && (
              <div>
                <span className="text-base-content/70">Payment Method:</span>
                <p className="font-medium capitalize">{order.payment_method.replace('_', ' ')}</p>
              </div>
            )}
          </div>
        </div>

        {/* Order Items */}
        <div>
          <h4 className="font-semibold mb-3">Order Items</h4>
          <div className="space-y-3">
            {order.order_items?.map((item) => (
              <div key={item.order_item_id} className="bg-base-200 rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h5 className="font-medium">{item.ticket_type?.name}</h5>
                    <p className="text-sm text-base-content/70">
                      Quantity: {item.quantity} × {formatCurrency(item.price_per_unit)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{formatCurrency(item.subtotal)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="border-t mt-4 pt-4">
            <div className="flex justify-between items-center font-bold text-lg">
              <span>Total:</span>
              <span className="text-primary">{formatCurrency(order.total_amount)}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        {order.status === 'pending' && (
          <div className="flex gap-4">
            <button
              onClick={() => onPay(order.order_id)}
              className="btn btn-primary flex-1"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="loading loading-spinner loading-sm"></span>
                  Processing...
                </>
              ) : (
                'Pay Now'
              )}
            </button>
            <button
              onClick={() => onCancel(order.order_id)}
              className="btn btn-error btn-outline flex-1"
              disabled={loading}
            >
              Cancel Order
            </button>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default Orders;