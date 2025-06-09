import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ordersAPI } from '../services/orders';
import { ticketsAPI } from '../services/tickets';
import { formatDateTime, formatCurrency, getOrderStatusBadge } from '../utils/helpers';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import Pagination from '../components/common/Pagination';
import Modal from '../components/common/Modal';
import { useAuth } from '../context/AuthContext';
import { HiTicket, HiCalendar, HiCreditCard, HiEye, HiX, HiDownload, HiClock } from 'react-icons/hi';
import toast from 'react-hot-toast';

const Orders = () => {
  const { isAdmin } = useAuth();
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
  const [downloadLoading, setDownloadLoading] = useState({});

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
      toast.success('Payment submitted successfully! Please wait for admin confirmation.');
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

  // NEW: Download PDF Ticket
  const handleDownloadTicket = async (orderId) => {
    try {
      setDownloadLoading(prev => ({ ...prev, [orderId]: true }));
      
      await ticketsAPI.downloadTicketPDF(orderId);
      toast.success('Ticket downloaded successfully!');
      
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to download ticket';
      toast.error(message);
    } finally {
      setDownloadLoading(prev => ({ ...prev, [orderId]: false }));
    }
  };

  // NEW: Preview PDF Ticket
  const handlePreviewTicket = async (orderId) => {
    try {
      await ticketsAPI.previewTicketPDF(orderId);
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to preview ticket';
      toast.error(message);
    }
  };

  return (
    <div className="min-h-screen bg-base-200 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">
            {isAdmin ? 'All Orders' : 'My Orders'}
          </h1>
          <p className="text-base-content/70">
            {isAdmin 
              ? 'View and manage all customer orders' 
              : 'Track and manage your ticket orders'}
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
                  <option value="pending">⏳ Pending Payment</option>
                  <option value="paid">✅ Confirmed</option>
                  <option value="cancelled">❌ Cancelled</option>
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
            {!filters.status && !isAdmin && (
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
                            {order.status === 'pending' && '⏳ '}
                            {order.status === 'paid' && '✅ '}
                            {order.status === 'cancelled' && '❌ '}
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

                          {/* Show status message */}
                          {order.status === 'pending' && (
                            <div className="flex items-center gap-2 text-warning">
                              <HiClock className="w-4 h-4" />
                              <span className="text-sm">Waiting for payment confirmation...</span>
                            </div>
                          )}
                          
                          {order.status === 'paid' && (
                            <div className="flex items-center gap-2 text-success">
                              <HiTicket className="w-4 h-4" />
                              <span className="text-sm">Payment confirmed! You can download your tickets.</span>
                            </div>
                          )}
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
                        
                        {/* Order Status Specific Actions */}
                        {order.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handlePayOrder(order.order_id)}
                              className="btn btn-primary btn-sm"
                              disabled={actionLoading}
                            >
                              {actionLoading ? 'Processing...' : 'Submit Payment'}
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
                        
                        {/* NEW: Download Tickets for Paid Orders */}
                        {order.status === 'paid' && (
                          <>
                            <button
                              onClick={() => handleDownloadTicket(order.order_id)}
                              className="btn btn-success btn-sm"
                              disabled={downloadLoading[order.order_id]}
                            >
                              {downloadLoading[order.order_id] ? (
                                <>
                                  <span className="loading loading-spinner loading-sm"></span>
                                  Downloading...
                                </>
                              ) : (
                                <>
                                  <HiDownload className="w-4 h-4 mr-2" />
                                  Download Tickets
                                </>
                              )}
                            </button>
                            
                            <button
                              onClick={() => handlePreviewTicket(order.order_id)}
                              className="btn btn-info btn-outline btn-sm"
                            >
                              <HiEye className="w-4 h-4 mr-2" />
                              Preview
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
          onDownloadTicket={handleDownloadTicket}
          onPreviewTicket={handlePreviewTicket}
          loading={actionLoading}
          downloadLoading={downloadLoading}
        />
      </div>
    </div>
  );
};

// Enhanced Order Details Modal Component
const OrderDetailsModal = ({ 
  isOpen, 
  onClose, 
  order, 
  onPay, 
  onCancel, 
  onDownloadTicket, 
  onPreviewTicket,
  loading,
  downloadLoading
}) => {
  if (!order) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Order Details" size="lg">
      <div className="space-y-6">
        {/* Order Info */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold">Order #{order.order_id}</h4>
            <div className={`badge badge-lg ${getOrderStatusBadge(order.status)}`}>
              {order.status === 'pending' && '⏳ '}
              {order.status === 'paid' && '✅ '}
              {order.status === 'cancelled' && '❌ '}
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

        {/* Status Specific Content */}
        {order.status === 'pending' && (
          <div className="bg-warning/10 p-4 rounded-lg">
            <h4 className="font-semibold text-warning mb-2">⏳ Payment Required</h4>
            <p className="text-sm mb-3">
              Please submit your payment using the selected payment method. 
              Your order will be confirmed after admin verification.
            </p>
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
                  'Submit Payment'
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
          </div>
        )}

        {order.status === 'paid' && (
          <div className="bg-success/10 p-4 rounded-lg">
            <h4 className="font-semibold text-success mb-2">✅ Payment Confirmed</h4>
            <p className="text-sm mb-3">
              Your payment has been confirmed! You can now download your tickets.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => onDownloadTicket(order.order_id)}
                className="btn btn-success flex-1"
                disabled={downloadLoading[order.order_id]}
              >
                {downloadLoading[order.order_id] ? (
                  <>
                    <span className="loading loading-spinner loading-sm"></span>
                    Downloading...
                  </>
                ) : (
                  <>
                    <HiDownload className="w-4 h-4 mr-2" />
                    Download PDF Tickets
                  </>
                )}
              </button>
              <button
                onClick={() => onPreviewTicket(order.order_id)}
                className="btn btn-info btn-outline"
              >
                <HiEye className="w-4 h-4 mr-2" />
                Preview
              </button>
            </div>
          </div>
        )}

        {order.status === 'cancelled' && (
          <div className="bg-error/10 p-4 rounded-lg">
            <h4 className="font-semibold text-error mb-2">❌ Order Cancelled</h4>
            <p className="text-sm">
              This order has been cancelled. If you have any questions, please contact support.
            </p>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default Orders;