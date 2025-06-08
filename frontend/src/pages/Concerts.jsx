import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { concertsAPI } from '../services/concerts';
import { formatDate, formatTime, formatCurrency, getConcertStatusBadge } from '../utils/helpers';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import Pagination from '../components/common/Pagination';
import { HiCalendar, HiLocationMarker, HiTicket, HiSearch, HiFilter } from 'react-icons/hi';

const Concerts = () => {
  const [concerts, setConcerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({});
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    page: 1
  });

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

  const clearFilters = () => {
    setFilters({
      search: '',
      status: '',
      page: 1
    });
  };

  return (
    <div className="min-h-screen bg-base-100">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-primary to-secondary text-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-4xl font-bold mb-4">Browse Concerts</h1>
          <p className="text-lg opacity-90">
            Discover amazing live music events and secure your tickets
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Filters */}
        <div className="card bg-base-100 shadow-lg mb-8">
          <div className="card-body">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="form-control flex-1">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search concerts or venues..."
                    className="input input-bordered w-full pl-10"
                    value={filters.search}
                    onChange={handleSearchChange}
                  />
                  <HiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-base-content/50" />
                </div>
              </div>

              {/* Status Filter */}
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

              {/* Clear Filters */}
              {(filters.search || filters.status) && (
                <button onClick={clearFilters} className="btn btn-ghost">
                  Clear Filters
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <LoadingSpinner text="Loading concerts..." />
        ) : error ? (
          <ErrorMessage message={error} onRetry={fetchConcerts} />
        ) : concerts.length === 0 ? (
          <div className="text-center py-12">
            <HiTicket className="w-16 h-16 text-base-content/30 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No concerts found</h3>
            <p className="text-base-content/70">
              {filters.search || filters.status 
                ? 'Try adjusting your search criteria' 
                : 'Check back later for new concerts'}
            </p>
          </div>
        ) : (
          <>
            {/* Results Info */}
            <div className="flex justify-between items-center mb-6">
              <p className="text-base-content/70">
                Showing {concerts.length} of {pagination.total} concerts
              </p>
            </div>

            {/* Concert Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {concerts.map((concert) => (
                <div key={concert.concert_id} className="card bg-base-100 shadow-xl card-hover">
                  <figure className="h-48 bg-gradient-to-br from-primary/20 to-secondary/20">
                    {concert.banner_image ? (
                      <img 
                        src={concert.banner_image} 
                        alt={concert.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <HiTicket className="w-16 h-16 text-primary/50" />
                      </div>
                    )}
                  </figure>
                  
                  <div className="card-body">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="card-title text-lg flex-1">{concert.title}</h3>
                      <div className={`badge ${getConcertStatusBadge(concert.status)}`}>
                        {concert.status}
                      </div>
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm">
                        <HiCalendar className="w-4 h-4 text-primary" />
                        <span>{formatDate(concert.date)} at {formatTime(concert.time)}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm">
                        <HiLocationMarker className="w-4 h-4 text-primary" />
                        <span>{concert.venue}</span>
                      </div>
                    </div>

                    {concert.description && (
                      <p className="text-sm text-base-content/70 mb-4 line-clamp-2">
                        {concert.description}
                      </p>
                    )}

                    {concert.ticket_types && concert.ticket_types.length > 0 && (
                      <div className="mb-4">
                        <p className="text-sm text-base-content/70">Starting from</p>
                        <p className="text-lg font-bold text-primary">
                          {formatCurrency(Math.min(...concert.ticket_types.map(t => t.price)))}
                        </p>
                      </div>
                    )}
                    
                    <div className="card-actions justify-end">
                      <Link 
                        to={`/concerts/${concert.concert_id}`} 
                        className="btn btn-primary btn-sm"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.pages}
              hasNext={pagination.has_next}
              hasPrev={pagination.has_prev}
              onPageChange={handlePageChange}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default Concerts;