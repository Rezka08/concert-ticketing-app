import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { concertsAPI } from '../services/concerts';
import { formatDate, formatTime, formatCurrency } from '../utils/helpers';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import { HiCalendar, HiLocationMarker, HiTicket, HiArrowRight } from 'react-icons/hi';

const Home = () => {
  const [upcomingConcerts, setUpcomingConcerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUpcomingConcerts();
  }, []);

  const fetchUpcomingConcerts = async () => {
    try {
      setLoading(true);
      const response = await concertsAPI.getConcerts({ 
        status: 'upcoming', 
        per_page: 6 
      });
      setUpcomingConcerts(response.data.data.items);
    } catch (error) {
      setError('Failed to fetch concerts');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="hero min-h-[70vh] bg-gradient-to-r from-primary to-secondary">
        <div className="hero-content text-center text-white">
          <div className="max-w-md">
            <h1 className="mb-5 text-5xl font-bold">
              🎵 Concert Ticketing
            </h1>
            <p className="mb-5 text-lg">
              Discover amazing concerts and secure your tickets for unforgettable live music experiences.
            </p>
            <div className="flex gap-4 justify-center">
              <Link to="/concerts" className="btn btn-white btn-lg">
                Browse Concerts
                <HiArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 bg-base-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Why Choose ConcertTix?</h2>
            <p className="text-lg text-base-content/70">
              Your trusted partner for live music experiences
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body text-center">
                <div className="text-primary text-4xl mb-4">🎫</div>
                <h3 className="card-title justify-center">Easy Booking</h3>
                <p>Simple and secure ticket booking process with instant confirmation.</p>
              </div>
            </div>
            
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body text-center">
                <div className="text-primary text-4xl mb-4">🔒</div>
                <h3 className="card-title justify-center">Secure Payment</h3>
                <p>Multiple payment options with bank-level security for your peace of mind.</p>
              </div>
            </div>
            
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body text-center">
                <div className="text-primary text-4xl mb-4">📱</div>
                <h3 className="card-title justify-center">Mobile Friendly</h3>
                <p>Access your tickets anytime, anywhere with our mobile-optimized platform.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Upcoming Concerts Section */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold">Upcoming Concerts</h2>
            <Link to="/concerts" className="btn btn-primary btn-outline">
              View All Concerts
            </Link>
          </div>

          {loading ? (
            <LoadingSpinner text="Loading concerts..." />
          ) : error ? (
            <ErrorMessage message={error} onRetry={fetchUpcomingConcerts} />
          ) : upcomingConcerts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-lg text-base-content/70">No upcoming concerts at the moment.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingConcerts.map((concert) => (
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
                    <h3 className="card-title text-lg">{concert.title}</h3>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <HiCalendar className="w-4 h-4 text-primary" />
                        <span>{formatDate(concert.date)} at {formatTime(concert.time)}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm">
                        <HiLocationMarker className="w-4 h-4 text-primary" />
                        <span>{concert.venue}</span>
                      </div>
                    </div>

                    {concert.ticket_types && concert.ticket_types.length > 0 && (
                      <div className="mt-4">
                        <p className="text-sm text-base-content/70">Starting from</p>
                        <p className="text-lg font-bold text-primary">
                          {formatCurrency(Math.min(...concert.ticket_types.map(t => t.price)))}
                        </p>
                      </div>
                    )}
                    
                    <div className="card-actions justify-end mt-4">
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
          )}
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-primary text-white py-16">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-3xl font-bold mb-4">Ready to Experience Live Music?</h2>
          <p className="text-lg mb-8">
            Join thousands of music lovers who trust ConcertTix for their live music experiences.
          </p>
          <Link to="/concerts" className="btn btn-white btn-lg">
            Explore Concerts
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;