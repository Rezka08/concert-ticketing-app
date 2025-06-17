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
  const [currentSlide, setCurrentSlide] = useState(0);

  // Array of background images for slideshow
  const heroImages = [
    'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
    'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
    'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
    // 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
    'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80'
  ];

  useEffect(() => {
    fetchUpcomingConcerts();
  }, []);

  // Slideshow auto-rotation effect
  useEffect(() => {
    const slideInterval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroImages.length);
    }, 4000); // Change slide every 4 seconds

    return () => clearInterval(slideInterval);
  }, [heroImages.length]);

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
    <div className="min-h-screen">      {/* Hero Section with Slideshow */}
      <div className="relative min-h-[70vh] overflow-hidden">
        {/* Background Images */}
        {heroImages.map((image, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <div 
              className="w-full h-full bg-cover bg-center bg-no-repeat"
              style={{ backgroundImage: `url(${image})` }}
            >
              {/* Dark overlay for better text readability */}
              <div className="absolute inset-0 bg-black bg-opacity-50"></div>
            </div>
          </div>
        ))}
        
        {/* Content Overlay */}
        <div className="relative z-10 hero min-h-[70vh]">
          <div className="hero-content text-center text-white">
            <div className="max-w-md">
              <h1 className="mb-5 text-5xl font-bold drop-shadow-lg">
                🎵 Concert Ticketing
              </h1>
              <p className="mb-5 text-lg drop-shadow-md">
                Discover amazing concerts and secure your tickets for unforgettable live music experiences.
              </p>
              <div className="flex gap-4 justify-center">
                <Link to="/concerts" className="btn btn-white btn-lg shadow-lg hover:shadow-xl transition-shadow">
                  Browse Concerts
                  <HiArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Slide Indicators */}
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-20">
          <div className="flex space-x-2">
            {heroImages.map((_, index) => (
              <button
                key={index}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentSlide 
                    ? 'bg-white scale-110' 
                    : 'bg-white bg-opacity-50 hover:bg-opacity-75'
                }`}
                onClick={() => setCurrentSlide(index)}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Navigation Arrows */}
        <button
          className="absolute left-4 top-1/2 transform -translate-y-1/2 z-20 bg-black bg-opacity-30 hover:bg-opacity-50 text-white rounded-full p-3 transition-all duration-300"
          onClick={() => setCurrentSlide((prev) => (prev - 1 + heroImages.length) % heroImages.length)}
          aria-label="Previous slide"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        <button
          className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20 bg-black bg-opacity-30 hover:bg-opacity-50 text-white rounded-full p-3 transition-all duration-300"
          onClick={() => setCurrentSlide((prev) => (prev + 1) % heroImages.length)}
          aria-label="Next slide"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
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