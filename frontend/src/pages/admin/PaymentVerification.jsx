import { useState, useEffect } from 'react';
import { adminAPI } from '../../services/admin';
import { formatDateTime, formatCurrency, getOrderStatusBadge, getOrderStatusText, getOrderStatusIcon } from '../../utils/helpers';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';
import Pagination from '../../components/common/Pagination';
import Modal from '../../components/common/Modal';
import { HiCheck, HiX, HiEye, HiDownload, HiCreditCard, HiTicket, HiClock, HiExclamationCircle } from 'react-icons/hi';
import toast from 'react-hot-toast';

const PaymentVerification = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({});
  const [filters, setFilters] = useState({
    status: 'payment_submitted', // Default show orders awaiting verification
    page: 1
  });
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');

  useEffect(() => {
    fetchOrders();
  }, [filters]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getAllOrders(filters);
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

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setAdminNotes('');
    setShowOrderModal(true);
  };

  const handleVerifyPayment = async (orderId, status, notes = '') => {
  const statusText = status === 'paid' ? 'approve' : 'reject';
  
  if (!confirm(`Are you sure you want to ${statusText} this payment?`)) {
    return;
  }

  try {
    setActionLoading(true);
    
    console.log('🔧 Payment verification requested:', {
      orderId,
      status, 
      adminNotes: notes
    });
    
    // FIXED: Send proper payload structure
    const payload = {
      status: status,
      admin_notes: notes || ''
    };
    
    console.log('📤 Sending payload:', payload);
    
    const response = await adminAPI.verifyPayment(orderId, payload);
    
    console.log('✅ Verification response:', response.data);
    
    const message = status === 'paid' 
      ? 'Payment approved successfully! Customer can now download tickets.' 
      : 'Payment rejected successfully.';
    
    toast.success(message);
    fetchOrders();
    setShowOrderModal(false);
    
  } catch (error) {
    console.error('❌ Verification failed:', error);
    
    // Enhanced error handling
    let errorMessage = `Failed to ${statusText} payment`;
    
    if (error.response?.status === 400) {
      errorMessage = error.response.data?.message || 'Invalid request. Please check order status.';
    } else if (error.response?.status === 404) {
      errorMessage = 'Order not found.';
    } else if (error.response?.status === 403) {
      errorMessage = 'Access denied. Admin privileges required.';
    } else if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    }
    
    toast.error(errorMessage);
    
    // Log detailed error for debugging
    console.error('💥 Detailed error info:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      config: error.config
    });
    
  } finally {
    setActionLoading(false);
  }
};

  const getStatusStats = () => {
    const totalOrders = pagination.total || 0;
    const pendingCount = orders.filter(o => o.status === 'pending').length;
    const awaitingCount = orders.filter(o => o.status === 'payment_submitted').length;
    const paidCount = orders.filter(o => o.status === 'paid').length;
    const cancelledCount = orders.filter(o => o.status === 'cancelled').length;

    return { totalOrders, pendingCount, awaitingCount, paidCount, cancelledCount };
  };

  const stats = getStatusStats();

  return (
    <div className="min-h-screen bg-base-200 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">Payment Verification</h1>
          <p className="text-base-content/70">
            Review and verify customer payments for concert tickets
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-6">
          <div className="card bg-base-100 shadow-lg">
            <div className="card-body">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-base-content/70">Total Orders</h3>
                  <p className="text-2xl font-bold">{stats.totalOrders}</p>
                </div>
                <HiTicket className="w-8 h-8 text-primary" />
              </div>
            </div>
          </div>
          
          <div className="card bg-base-100 shadow-lg">
            <div className="card-body">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-base-content/70">Pending Payment</h3>
                  <p className="text-2xl font-bold text-warning">{stats.pendingCount}</p>
                </div>
                <HiClock className="w-8 h-8 text-warning" />
              </div>
            </div>
          </div>

          <div className="card bg-base-100 shadow-lg">
            <div className="card-body">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-base-content/70">Awaiting Verification</h3>
                  <p className="text-2xl font-bold text-info">{stats.awaitingCount}</p>
                </div>
                <HiExclamationCircle className="w-8 h-8 text-info" />
              </div>
            </div>
          </div>
          
          <div className="card bg-base-100 shadow-lg">
            <div className="card-body">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-base-content/70">Approved</h3>
                  <p className="text-2xl font-bold text-success">{stats.paidCount}</p>
                </div>
                <HiCheck className="w-8 h-8 text-success" />
              </div>
            </div>
          </div>
          
          <div className="card bg-base-100 shadow-lg">
            <div className="card-body">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-base-content/70">Rejected</h3>
                  <p className="text-2xl font-bold text-error">{stats.cancelledCount}</p>
                </div>
                <HiX className="w-8 h-8 text-error" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="card bg-base-100 shadow-lg mb-6">
          <div className="card-body">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Filter by Status</span>
                </label>
                <select
                  className="select select-bordered"
                  value={filters.status}
                  onChange={handleStatusChange}
                >
                  <option value="">All Orders</option>
                  <option value="pending">⏳ Pending Payment</option>
                  <option value="payment_submitted">🔍 Awaiting Verification</option>
                  <option value="paid">✅ Approved</option>
                  <option value="cancelled">❌ Rejected</option>
                </select>
              </div>
              
              {filters.status && (
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">&nbsp;</span>
                  </label>
                  <button
                    onClick={() => setFilters({ status: '', page: 1 })}
                    className="btn btn-ghost"
                  >
                    Clear Filter
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Orders Table */}
        {loading ? (
          <LoadingSpinner text="Loading orders..." />
        ) : error ? (
          <ErrorMessage message={error} onRetry={fetchOrders} />
        ) : orders.length === 0 ? (
          <div className="text-center py-12">
            <HiTicket className="w-16 h-16 text-base-content/30 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No orders found</h3>
            <p className="text-base-content/70">
              {filters.status 
                ? `No ${getOrderStatusText(filters.status).toLowerCase()} orders at the moment` 
                : "No orders have been placed yet"}
            </p>
          </div>
        ) : (
          <>
            <div className="card bg-base-100 shadow-lg">
              <div className="card-body p-0">
                <div className="overflow-x-auto">
                  <table className="table table-zebra">
                    <thead>
                      <tr>
                        <th>Order</th>
                        <th>Customer</th>
                        <th>Amount</th>
                        <th>Payment Method</th>
                        <th>Date</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((order) => (
                        <tr key={order.order_id}>
                          <td>
                            <div>
                              <div className="font-semibold">#{order.order_id}</div>
                              <div className="text-sm text-base-content/70">
                                {order.order_items?.length || 0} item(s)
                              </div>
                            </div>
                          </td>
                          <td>
                            <div>
                              <div className="font-medium">{order.user?.name}</div>
                              <div className="text-sm text-base-content/70">{order.user?.email}</div>
                            </div>
                          </td>
                          <td>
                            <div className="font-semibold text-primary">
                              {formatCurrency(order.total_amount)}
                            </div>
                          </td>
                          <td>
                            <div className="capitalize">
                              {order.payment_method?.replace('_', ' ') || 'Not specified'}
                            </div>
                          </td>
                          <td>
                            <div className="text-sm">
                              <div>Created: {formatDateTime(order.created_at)}</div>
                              {order.payment_submitted_at && (
                                <div className="text-info">
                                  Submitted: {formatDateTime(order.payment_submitted_at)}
                                </div>
                              )}
                            </div>
                          </td>
                          <td>
                            <div className={`badge ${getOrderStatusBadge(order.status)}`}>
                              {getOrderStatusIcon(order.status)} {getOrderStatusText(order.status)}
                            </div>
                          </td>
                          <td>
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleViewOrder(order)}
                                className="btn btn-ghost btn-sm"
                                title="View Details"
                              >
                                <HiEye className="w-4 h-4" />
                              </button>
                              
                              {order.status === 'payment_submitted' && (
                                <>
                                  <button
                                    onClick={() => handleVerifyPayment(order.order_id, 'paid')}
                                    className="btn btn-success btn-sm"
                                    title="Approve Payment"
                                    disabled={actionLoading}
                                  >
                                    <HiCheck className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleVerifyPayment(order.order_id, 'cancelled')}
                                    className="btn btn-error btn-sm"
                                    title="Reject Payment"
                                    disabled={actionLoading}
                                  >
                                    <HiX className="w-4 h-4" />
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
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
          onVerifyPayment={handleVerifyPayment}
          loading={actionLoading}
          adminNotes={adminNotes}
          setAdminNotes={setAdminNotes}
        />
      </div>
    </div>
  );
};

// Order Details Modal for Admin
const OrderDetailsModal = ({ isOpen, onClose, order, onVerifyPayment, loading, adminNotes, setAdminNotes }) => {
  if (!order) return null;

  const handleApprove = () => {
    console.log('✅ Approve clicked for order:', order.order_id, 'with notes:', adminNotes);
    onVerifyPayment(order.order_id, 'paid', adminNotes);
  };

  const handleReject = () => {
    console.log('❌ Reject clicked for order:', order.order_id, 'with notes:', adminNotes);
    onVerifyPayment(order.order_id, 'cancelled', adminNotes);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Order Details" size="xl">
      <div className="space-y-6">
        {/* Order Header */}
        <div className="bg-base-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-lg">Order #{order.order_id}</h4>
            <div className={`badge badge-lg ${getOrderStatusBadge(order.status)}`}>
              {getOrderStatusIcon(order.status)} {getOrderStatusText(order.status)}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-base-content/70">Customer:</span>
              <p className="font-medium">{order.user?.name}</p>
              <p className="text-sm text-base-content/70">{order.user?.email}</p>
            </div>
            
            <div>
              <span className="text-base-content/70">Order Date:</span>
              <p className="font-medium">{formatDateTime(order.created_at)}</p>
            </div>
            
            <div>
              <span className="text-base-content/70">Payment Method:</span>
              <p className="font-medium capitalize">
                {order.payment_method?.replace('_', ' ') || 'Not specified'}
              </p>
            </div>
            
            <div>
              <span className="text-base-content/70">Total Amount:</span>
              <p className="font-bold text-primary text-lg">{formatCurrency(order.total_amount)}</p>
            </div>

            {order.payment_submitted_at && (
              <div>
                <span className="text-base-content/70">Payment Submitted:</span>
                <p className="font-medium text-info">{formatDateTime(order.payment_submitted_at)}</p>
              </div>
            )}

            {order.payment_verified_at && (
              <div>
                <span className="text-base-content/70">Payment Verified:</span>
                <p className="font-medium text-success">{formatDateTime(order.payment_verified_at)}</p>
              </div>
            )}
          </div>

          {order.admin_notes && (
            <div className="mt-4 p-3 bg-warning/10 rounded-lg">
              <span className="text-base-content/70">Previous Admin Notes:</span>
              <p className="mt-1">{order.admin_notes}</p>
            </div>
          )}
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
                      Concert: {item.ticket_type?.concert?.title || 'Concert Info'}
                    </p>
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
        </div>

        {/* Admin Actions */}
        {order.status === 'payment_submitted' && (
          <div className="border-t pt-6">
            <h4 className="font-semibold mb-4">Payment Verification</h4>
            
            <div className="space-y-4">
              <div className="bg-warning/10 p-4 rounded-lg">
                <p className="text-sm">
                  ⚠️ <strong>Important:</strong> Only approve payment if you have confirmed the customer 
                  has actually made the payment through the specified payment method.
                </p>
              </div>

              {/* Admin Notes */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Admin Notes (Optional)</span>
                </label>
                <textarea
                  className="textarea textarea-bordered h-24"
                  placeholder="Add any notes about this verification..."
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                ></textarea>
              </div>
              
              <div className="flex gap-4">
                <button
                  onClick={handleApprove}
                  className="btn btn-success flex-1"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="loading loading-spinner loading-sm"></span>
                      Processing...
                    </>
                  ) : (
                    <>
                      <HiCheck className="w-5 h-5 mr-2" />
                      Approve Payment
                    </>
                  )}
                </button>
                <button
                  onClick={handleReject}
                  className="btn btn-error flex-1"
                  disabled={loading}
                >
                  <HiX className="w-5 h-5 mr-2" />
                  Reject Payment
                </button>
              </div>
            </div>
          </div>
        )}

        {order.status === 'paid' && (
          <div className="border-t pt-6">
            <div className="bg-success/10 p-4 rounded-lg">
              <p className="text-success font-medium">
                ✅ Payment has been approved. Customer can now download their tickets.
              </p>
              {order.payment_verified_at && (
                <p className="text-sm text-success mt-1">
                  Verified on: {formatDateTime(order.payment_verified_at)}
                </p>
              )}
            </div>
          </div>
        )}

        {order.status === 'cancelled' && (
          <div className="border-t pt-6">
            <div className="bg-error/10 p-4 rounded-lg">
              <p className="text-error font-medium">
                ❌ Payment has been rejected. Customer has been notified.
              </p>
            </div>
          </div>
        )}

        {order.status === 'pending' && (
          <div className="border-t pt-6">
            <div className="bg-warning/10 p-4 rounded-lg">
              <p className="text-warning font-medium">
                ⏳ Customer has not submitted payment yet.
              </p>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default PaymentVerification;