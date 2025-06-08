import { useState, useEffect } from 'react';
import { concertsAPI } from '../../services/concerts';
import { ticketsAPI } from '../../services/tickets';
import { formatDate, formatTime, formatCurrency, getConcertStatusBadge } from '../../utils/helpers';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';
import Pagination from '../../components/common/Pagination';
import Modal from '../../components/common/Modal';
import { HiPlus, HiPencil, HiTrash, HiEye, HiTicket } from 'react-icons/hi';
import toast from 'react-hot-toast';

const ManageConcerts = () => {
  const [concerts, setConcerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({});
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    page: 1
  });

  // Modal states
  const [showConcertModal, setShowConcertModal] = useState(false);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [selectedConcert, setSelectedConcert] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  useEffect(() => {
    fetchConcerts();
  }, [filters]);

  const fetchConcerts = async () => {
    try {
      setLoading(true);
      const response = await concertsAPI.getConcerts(filters);
      setConcerts(response.data.data.items);
      setPagination(response.data.data.pagination);
    } catch (error) {
      setError('Failed to fetch concerts');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    setFilters({
      ...filters,
      search: e.target.value,
      page: 1
    });
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

  const handleCreateConcert = () => {
    setSelectedConcert(null);
    setShowConcertModal(true);
  };

  const handleEditConcert = (concert) => {
    setSelectedConcert(concert);
    setShowConcertModal(true);
  };

  const handleDeleteConcert = async (concertId) => {
    if (!confirm('Are you sure you want to delete this concert?')) {
      return;
    }

    try {
      await concertsAPI.deleteConcert(concertId);
      toast.success('Concert deleted successfully');
      fetchConcerts();
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to delete concert';
      toast.error(message);
    }
  };

  const handleManageTickets = (concert) => {
    setSelectedConcert(concert);
    setShowTicketModal(true);
  };

  return (
    <div className="min-h-screen bg-base-200 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-4">Manage Concerts</h1>
            <p className="text-base-content/70">Create and manage concert events</p>
          </div>
          <button onClick={handleCreateConcert} className="btn btn-primary">
            <HiPlus className="w-5 h-5 mr-2" />
            Create Concert
          </button>
        </div>

        {/* Filters */}
        <div className="card bg-base-100 shadow-lg mb-6">
          <div className="card-body">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="form-control flex-1">
                <input
                  type="text"
                  placeholder="Search concerts..."
                  className="input input-bordered"
                  value={filters.search}
                  onChange={handleSearchChange}
                />
              </div>
              <div className="form-control">
                <select
                  className="select select-bordered"
                  value={filters.status}
                  onChange={handleStatusChange}
                >
                  <option value="">All Status</option>
                  <option value="upcoming">Upcoming</option>
                  <option value="ongoing">Ongoing</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              {(filters.search || filters.status) && (
                <button
                  onClick={() => setFilters({ search: '', status: '', page: 1 })}
                  className="btn btn-ghost"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Concerts Table */}
        {loading ? (
          <LoadingSpinner text="Loading concerts..." />
        ) : error ? (
          <ErrorMessage message={error} onRetry={fetchConcerts} />
        ) : (
          <div className="card bg-base-100 shadow-lg">
            <div className="card-body p-0">
              <div className="overflow-x-auto">
                <table className="table table-zebra">
                  <thead>
                    <tr>
                      <th>Concert</th>
                      <th>Date & Time</th>
                      <th>Venue</th>
                      <th>Status</th>
                      <th>Tickets</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {concerts.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="text-center py-12">
                          <div className="text-base-content/70">
                            {filters.search || filters.status 
                              ? 'No concerts match your criteria' 
                              : 'No concerts created yet'}
                          </div>
                        </td>
                      </tr>
                    ) : (
                      concerts.map((concert) => (
                        <tr key={concert.concert_id}>
                          <td>
                            <div>
                              <h4 className="font-semibold">{concert.title}</h4>
                              {concert.description && (
                                <p className="text-sm text-base-content/70 truncate max-w-xs">
                                  {concert.description}
                                </p>
                              )}
                            </div>
                          </td>
                          <td>
                            <div className="text-sm">
                              <div>{formatDate(concert.date)}</div>
                              <div className="text-base-content/70">{formatTime(concert.time)}</div>
                            </div>
                          </td>
                          <td>{concert.venue}</td>
                          <td>
                            <div className={`badge ${getConcertStatusBadge(concert.status)}`}>
                              {concert.status}
                            </div>
                          </td>
                          <td>
                            <div className="text-sm">
                              {concert.ticket_types?.length || 0} types
                            </div>
                          </td>
                          <td>
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleManageTickets(concert)}
                                className="btn btn-ghost btn-sm"
                                title="Manage Tickets"
                              >
                                <HiTicket className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleEditConcert(concert)}
                                className="btn btn-ghost btn-sm"
                                title="Edit Concert"
                              >
                                <HiPencil className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteConcert(concert.concert_id)}
                                className="btn btn-ghost btn-sm text-error"
                                title="Delete Concert"
                              >
                                <HiTrash className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Pagination */}
        <Pagination
          currentPage={pagination.page}
          totalPages={pagination.pages}
          hasNext={pagination.has_next}
          hasPrev={pagination.has_prev}
          onPageChange={handlePageChange}
        />

        {/* Modals */}
        <ConcertModal
          isOpen={showConcertModal}
          onClose={() => setShowConcertModal(false)}
          concert={selectedConcert}
          onSuccess={() => {
            setShowConcertModal(false);
            fetchConcerts();
          }}
        />

        <TicketModal
          isOpen={showTicketModal}
          onClose={() => setShowTicketModal(false)}
          concert={selectedConcert}
          onSuccess={() => {
            setShowTicketModal(false);
            fetchConcerts();
          }}
        />
      </div>
    </div>
  );
};

// Concert Modal Component
const ConcertModal = ({ isOpen, onClose, concert, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    venue: '',
    date: '',
    time: '',
    banner_image: '',
    status: 'upcoming'
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (concert) {
      setFormData({
        title: concert.title || '',
        description: concert.description || '',
        venue: concert.venue || '',
        date: concert.date || '',
        time: concert.time ? concert.time.substring(0, 5) : '',
        banner_image: concert.banner_image || '',
        status: concert.status || 'upcoming'
      });
    } else {
      setFormData({
        title: '',
        description: '',
        venue: '',
        date: '',
        time: '',
        banner_image: '',
        status: 'upcoming'
      });
    }
  }, [concert]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      if (concert) {
        await concertsAPI.updateConcert(concert.concert_id, formData);
        toast.success('Concert updated successfully');
      } else {
        await concertsAPI.createConcert(formData);
        toast.success('Concert created successfully');
      }
      
      onSuccess();
    } catch (error) {
      const message = error.response?.data?.message || `Failed to ${concert ? 'update' : 'create'} concert`;
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={concert ? 'Edit Concert' : 'Create Concert'} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="form-control">
          <label className="label">
            <span className="label-text">Title *</span>
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="input input-bordered"
            required
          />
        </div>

        <div className="form-control">
          <label className="label">
            <span className="label-text">Description</span>
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="textarea textarea-bordered h-24"
          />
        </div>

        <div className="form-control">
          <label className="label">
            <span className="label-text">Venue *</span>
          </label>
          <input
            type="text"
            name="venue"
            value={formData.venue}
            onChange={handleChange}
            className="input input-bordered"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="form-control">
            <label className="label">
              <span className="label-text">Date *</span>
            </label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className="input input-bordered"
              required
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Time *</span>
            </label>
            <input
              type="time"
              name="time"
              value={formData.time}
              onChange={handleChange}
              className="input input-bordered"
              required
            />
          </div>
        </div>

        <div className="form-control">
          <label className="label">
            <span className="label-text">Banner Image URL</span>
          </label>
          <input
            type="url"
            name="banner_image"
            value={formData.banner_image}
            onChange={handleChange}
            className="input input-bordered"
            placeholder="https://example.com/image.jpg"
          />
        </div>

        <div className="form-control">
          <label className="label">
            <span className="label-text">Status</span>
          </label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="select select-bordered"
          >
            <option value="upcoming">Upcoming</option>
            <option value="ongoing">Ongoing</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        <div className="flex gap-4 pt-4">
          <button type="button" onClick={onClose} className="btn btn-ghost flex-1">
            Cancel
          </button>
          <button type="submit" className="btn btn-primary flex-1" disabled={loading}>
            {loading ? (
              <>
                <span className="loading loading-spinner loading-sm"></span>
                {concert ? 'Updating...' : 'Creating...'}
              </>
            ) : (
              concert ? 'Update Concert' : 'Create Concert'
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};

// Ticket Modal Component
const TicketModal = ({ isOpen, onClose, concert, onSuccess }) => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    quantity_total: ''
  });

  useEffect(() => {
    if (isOpen && concert) {
      fetchTickets();
    }
  }, [isOpen, concert]);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const response = await concertsAPI.getConcertTickets(concert.concert_id);
      setTickets(response.data.data);
    } catch (error) {
      toast.error('Failed to fetch tickets');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTicket = () => {
    setSelectedTicket(null);
    setFormData({ name: '', price: '', quantity_total: '' });
    setShowForm(true);
  };

  const handleEditTicket = (ticket) => {
    setSelectedTicket(ticket);
    setFormData({
      name: ticket.name,
      price: ticket.price.toString(),
      quantity_total: ticket.quantity_total.toString()
    });
    setShowForm(true);
  };

  const handleDeleteTicket = async (ticketId) => {
    if (!confirm('Are you sure you want to delete this ticket type?')) {
      return;
    }

    try {
      await ticketsAPI.deleteTicket(ticketId);
      toast.success('Ticket type deleted successfully');
      fetchTickets();
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to delete ticket type';
      toast.error(message);
    }
  };

  const handleSubmitTicket = async (e) => {
    e.preventDefault();
    
    try {
      if (selectedTicket) {
        await ticketsAPI.updateTicket(selectedTicket.ticket_type_id, formData);
        toast.success('Ticket type updated successfully');
      } else {
        await concertsAPI.createTicketType(concert.concert_id, formData);
        toast.success('Ticket type created successfully');
      }
      
      setShowForm(false);
      fetchTickets();
    } catch (error) {
      const message = error.response?.data?.message || `Failed to ${selectedTicket ? 'update' : 'create'} ticket type`;
      toast.error(message);
    }
  };

  if (!concert) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Manage Tickets - ${concert.title}`} size="xl">
      <div className="space-y-6">
        {!showForm ? (
          <>
            <div className="flex justify-between items-center">
              <h4 className="font-semibold">Ticket Types</h4>
              <button onClick={handleCreateTicket} className="btn btn-primary btn-sm">
                <HiPlus className="w-4 h-4 mr-2" />
                Add Ticket Type
              </button>
            </div>

            {loading ? (
              <LoadingSpinner size="sm" />
            ) : (
              <div className="space-y-3">
                {tickets.length === 0 ? (
                  <div className="text-center py-8 text-base-content/70">
                    No ticket types created yet
                  </div>
                ) : (
                  tickets.map((ticket) => (
                    <div key={ticket.ticket_type_id} className="bg-base-200 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h5 className="font-medium">{ticket.name}</h5>
                          <p className="text-primary font-semibold">{formatCurrency(ticket.price)}</p>
                          <p className="text-sm text-base-content/70">
                            {ticket.quantity_available} / {ticket.quantity_total} available
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditTicket(ticket)}
                            className="btn btn-ghost btn-sm"
                          >
                            <HiPencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteTicket(ticket.ticket_type_id)}
                            className="btn btn-ghost btn-sm text-error"
                          >
                            <HiTrash className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </>
        ) : (
          <form onSubmit={handleSubmitTicket} className="space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="font-semibold">
                {selectedTicket ? 'Edit Ticket Type' : 'Create Ticket Type'}
              </h4>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="btn btn-ghost btn-sm"
              >
                Back
              </button>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Ticket Name *</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="input input-bordered"
                placeholder="e.g. VIP, Regular, Student"
                required
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Price *</span>
              </label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="input input-bordered"
                placeholder="0"
                min="0"
                step="0.01"
                required
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Total Quantity *</span>
              </label>
              <input
                type="number"
                value={formData.quantity_total}
                onChange={(e) => setFormData({ ...formData, quantity_total: e.target.value })}
                className="input input-bordered"
                placeholder="0"
                min="1"
                required
              />
            </div>

            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="btn btn-ghost flex-1"
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary flex-1">
                {selectedTicket ? 'Update Ticket Type' : 'Create Ticket Type'}
              </button>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
};

export default ManageConcerts;