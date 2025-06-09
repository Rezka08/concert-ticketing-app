import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { concertsAPI } from '../services/concerts';
import { ordersAPI } from '../services/orders';
import { useAuth } from '../context/AuthContext';
import { formatDate, formatTime, formatCurrency, getConcertStatusBadge } from '../utils/helpers';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import Modal from '../components/common/Modal';
import { HiCalendar, HiLocationMarker, HiTicket, HiPlus, HiMinus, HiShoppingCart, HiExclamationCircle } from 'react-icons/hi';
import toast from 'react-hot-toast';

const ConcertDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, isAdmin, user } = useAuth();
  
  const [concert, setConcert] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTickets, setSelectedTickets] = useState({});
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => {
    fetchConcertDetail();
  }, [id]);

  const fetchConcertDetail = async () => {
    try {
      setLoading(true);
      const response = await concertsAPI.getConcert(id);
      setConcert(response.data.data);
    } catch (error) {
      setError('Failed to fetch concert details');
    } finally {
      setLoading(false);
    }
  };

  const handleTicketQuantityChange = (ticketTypeId, change) => {
    // Prevent admin from selecting tickets
    if (isAdmin) {
      toast.error('Admins cannot book tickets. This feature is for customers only.');
      return;
    }

    const ticketType = concert.ticket_types.find(t => t.ticket_type_id === ticketTypeId);
    const currentQuantity = selectedTickets[ticketTypeId] || 0;
    const newQuantity = Math.max(0, Math.min(ticketType.quantity_available, currentQuantity + change));
    
    setSelectedTickets({
      ...selectedTickets,
      [ticketTypeId]: newQuantity
    });
  };

  const getTotalPrice = () => {
    return Object.entries(selectedTickets).reduce((total, [ticketTypeId, quantity]) => {
      const ticketType = concert.ticket_types.find(t => t.ticket_type_id == ticketTypeId);
      return total + (ticketType.price * quantity);
    }, 0);
  };

  const getTotalTickets = () => {
    return Object.values(selectedTickets).reduce((total, quantity) => total + quantity, 0);
  };

  const handleBooking = () => {
    if (!isAuthenticated) {
      toast.error('Please login to book tickets');
      navigate('/login');
      return;
    }

    if (isAdmin) {
      toast.error('Admins cannot book tickets. Please use a customer account.');
      return;
    }

    if (getTotalTickets() === 0) {
      toast.error('Please select at least one ticket');
      return;
    }

    setShowBookingModal(true);
  };

  const confirmBooking = async (paymentMethod) => {
    try {
      setBookingLoading(true);
      
      const orderItems = Object.entries(selectedTickets)
        .filter(([_, quantity]) => quantity > 0)
        .map(([ticketTypeId, quantity]) => ({
          ticket_type_id: parseInt(ticketTypeId),
          quantity
        }));

      const orderData = {
        items: orderItems,
        payment_method: paymentMethod
      };

      const response = await ordersAPI.createOrder(orderData);
      
      toast.success('Order created successfully! Please complete payment and wait for admin confirmation.');
      setShowBookingModal(false);
      navigate('/orders');
      
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to create order';
      toast.error(message);
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) return <LoadingSpinner text="Loading concert details..." />;
  if (error) return <ErrorMessage message={error} onRetry={fetchConcertDetail} />;
  if (!concert) return <ErrorMessage message="Concert not found" />;

  return (
    <div className="min-h-screen bg-base-100">
      {/* Hero Section */}
      <div className="relative h-96 bg-gradient-to-r from-primary to-secondary">
        {concert.banner_image && (
          <img 
            src={concert.banner_image} 
            alt={concert.title}
            className="w-full h-full object-cover opacity-30"
          />
        )}
        <div className="absolute inset-0 flex items-center">
          <div className="max-w-7xl mx-auto px-4 text-white">
            <div className="flex items-center gap-4 mb-4">
              <h1 className="text-4xl font-bold">{concert.title}</h1>
              <div className={`badge badge-lg ${getConcertStatusBadge(concert.status)}`}>
                {concert.status}
              </div>
            </div>
            <div className="flex flex-col lg:flex-row gap-4 text-lg">
              <div className="flex items-center gap-2">
                <HiCalendar className="w-5 h-5" />
                <span>{formatDate(concert.date)} at {formatTime(concert.time)}</span>
              </div>
              <div className="flex items-center gap-2">
                <HiLocationMarker className="w-5 h-5" />
                <span>{concert.venue}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Concert Info */}
          <div className="lg:col-span-2">
            <div className="card bg-base-100 shadow-lg">
              <div className="card-body">
                <h2 className="card-title text-2xl mb-4">About This Concert</h2>
                {concert.description ? (
                  <div className="prose max-w-none">
                    <p>{concert.description}</p>
                  </div>
                ) : (
                  <p className="text-base-content/70">No description available.</p>
                )}
              </div>
            </div>
          </div>

          {/* Ticket Selection */}
          <div className="lg:col-span-1">
            <div className="card bg-base-100 shadow-lg sticky top-4">
              <div className="card-body">
                <h2 className="card-title text-xl mb-4">
                  <HiTicket className="w-6 h-6" />
                  {isAdmin ? 'Ticket Information' : 'Select Tickets'}
                </h2>

                {/* Admin Notice */}
                {isAdmin && (
                  <div className="alert alert-info mb-4">
                    <HiExclamationCircle className="w-5 h-5" />
                    <div>
                      <h4 className="font-semibold">Admin View</h4>
                      <p className="text-sm">You're viewing as admin. Ticket booking is disabled for admin accounts.</p>
                    </div>
                  </div>
                )}

                {concert.ticket_types && concert.ticket_types.length > 0 ? (
                  <div className="space-y-4">
                    {concert.ticket_types.map((ticketType) => (
                      <div key={ticketType.ticket_type_id} className="border border-base-300 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-semibold">{ticketType.name}</h3>
                            <p className="text-lg font-bold text-primary">
                              {formatCurrency(ticketType.price)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-base-content/70">
                              {ticketType.quantity_available} available
                            </p>
                          </div>
                        </div>

                        {ticketType.quantity_available > 0 ? (
                          <>
                            {/* Show quantity selector only for non-admin users */}
                            {!isAdmin && (
                              <div className="flex items-center justify-between mt-3">
                                <span className="text-sm">Quantity:</span>
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => handleTicketQuantityChange(ticketType.ticket_type_id, -1)}
                                    className="btn btn-sm btn-circle btn-outline"
                                    disabled={!selectedTickets[ticketType.ticket_type_id]}
                                  >
                                    <HiMinus className="w-4 h-4" />
                                  </button>
                                  <span className="w-8 text-center">
                                    {selectedTickets[ticketType.ticket_type_id] || 0}
                                  </span>
                                  <button
                                    onClick={() => handleTicketQuantityChange(ticketType.ticket_type_id, 1)}
                                    className="btn btn-sm btn-circle btn-outline"
                                    disabled={(selectedTickets[ticketType.ticket_type_id] || 0) >= ticketType.quantity_available}
                                  >
                                    <HiPlus className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            )}
                            
                            {/* Admin view - just show availability */}
                            {isAdmin && (
                              <div className="text-center py-2">
                                <span className="text-sm text-base-content/70">
                                  Total: {ticketType.quantity_total} tickets
                                </span>
                              </div>
                            )}
                          </>
                        ) : (
                          <div className="text-center py-2">
                            <span className="text-error font-semibold">Sold Out</span>
                          </div>
                        )}
                      </div>
                    ))}

                    {/* Booking Section - Only for non-admin users */}
                    {!isAdmin && getTotalTickets() > 0 && (
                      <div className="border-t pt-4">
                        <div className="flex justify-between items-center mb-4">
                          <span className="font-semibold">Total ({getTotalTickets()} tickets):</span>
                          <span className="text-xl font-bold text-primary">
                            {formatCurrency(getTotalPrice())}
                          </span>
                        </div>
                        
                        <button
                          onClick={handleBooking}
                          className="btn btn-primary w-full"
                          disabled={concert.status !== 'upcoming'}
                        >
                          <HiShoppingCart className="w-5 h-5 mr-2" />
                          Book Tickets
                        </button>
                      </div>
                    )}

                    {/* Admin Actions */}
                    {isAdmin && (
                      <div className="border-t pt-4">
                        <div className="text-center space-y-2">
                          <p className="text-sm text-base-content/70">Admin Actions:</p>
                          <div className="flex gap-2">
                            <button 
                              onClick={() => navigate('/admin/concerts')}
                              className="btn btn-secondary btn-sm flex-1"
                            >
                              Manage Concert
                            </button>
                            <button 
                              onClick={() => navigate('/admin/orders')}
                              className="btn btn-accent btn-sm flex-1"
                            >
                              View Orders
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-base-content/70">No tickets available for this concert.</p>
                  </div>
                )}

                {concert.status !== 'upcoming' && !isAdmin && (
                  <div className="alert alert-warning mt-4">
                    <span>This concert is {concert.status}. Tickets are not available for booking.</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Confirmation Modal - Only for non-admin users */}
      {!isAdmin && (
        <BookingModal
          isOpen={showBookingModal}
          onClose={() => setShowBookingModal(false)}
          onConfirm={confirmBooking}
          loading={bookingLoading}
          concert={concert}
          selectedTickets={selectedTickets}
          totalPrice={getTotalPrice()}
          totalTickets={getTotalTickets()}
        />
      )}
    </div>
  );
};

// Booking Modal Component
const BookingModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  loading, 
  concert, 
  selectedTickets, 
  totalPrice, 
  totalTickets 
}) => {
  const [paymentMethod, setPaymentMethod] = useState('bank_transfer');

  const handleConfirm = () => {
    onConfirm(paymentMethod);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Confirm Booking" size="lg">
      <div className="space-y-6">
        {/* Order Summary */}
        <div>
          <h4 className="font-semibold mb-3">Order Summary</h4>
          <div className="bg-base-200 rounded-lg p-4">
            <h5 className="font-semibold">{concert.title}</h5>
            <p className="text-sm text-base-content/70 mb-3">
              {formatDate(concert.date)} at {formatTime(concert.time)}
            </p>
            
            <div className="space-y-2">
              {Object.entries(selectedTickets)
                .filter(([_, quantity]) => quantity > 0)
                .map(([ticketTypeId, quantity]) => {
                  const ticketType = concert.ticket_types.find(t => t.ticket_type_id == ticketTypeId);
                  return (
                    <div key={ticketTypeId} className="flex justify-between">
                      <span>{ticketType.name} x {quantity}</span>
                      <span>{formatCurrency(ticketType.price * quantity)}</span>
                    </div>
                  );
                })}
            </div>
            
            <div className="border-t mt-3 pt-3">
              <div className="flex justify-between font-bold">
                <span>Total ({totalTickets} tickets):</span>
                <span>{formatCurrency(totalPrice)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Method */}
        <div>
          <h4 className="font-semibold mb-3">Payment Method</h4>
          <div className="space-y-2">
            {[
              { value: 'bank_transfer', label: 'Bank Transfer' },
              { value: 'credit_card', label: 'Credit Card' },
              { value: 'e_wallet', label: 'E-Wallet' }
            ].map((method) => (
              <label key={method.value} className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="payment_method"
                  value={method.value}
                  checked={paymentMethod === method.value}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="radio radio-primary"
                />
                <span>{method.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Important Notice */}
        <div className="bg-warning/10 p-4 rounded-lg">
          <h4 className="font-semibold text-warning mb-2">📋 Important Notice</h4>
          <ul className="text-sm space-y-1">
            <li>• Your order will be created as "Pending" status</li>
            <li>• Please make payment using your selected method</li>
            <li>• Admin will verify your payment manually</li>
            <li>• You can download tickets only after payment confirmation</li>
            <li>• Check your orders page for status updates</li>
          </ul>
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <button
            onClick={onClose}
            className="btn btn-ghost flex-1"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="btn btn-primary flex-1"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="loading loading-spinner loading-sm"></span>
                Processing...
              </>
            ) : (
              'Confirm Booking'
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ConcertDetail;