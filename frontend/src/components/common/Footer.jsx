import { Link } from 'react-router-dom';
import { HiMail, HiPhone, HiLocationMarker } from 'react-icons/hi';

const Footer = () => {
  return (
    <footer className="bg-neutral text-neutral-content">
      <div className="footer p-10 max-w-7xl mx-auto">
        <div>
          <span className="footer-title">Concert Ticketing</span>
          <p className="text-sm max-w-xs">
            Your premier destination for concert tickets. Experience the best live music events.
          </p>
        </div>
        <div>
          <span className="footer-title">Quick Links</span>
          <Link to="/concerts" className="link link-hover">Browse Concerts</Link>
          <Link to="/orders" className="link link-hover">My Orders</Link>
          <Link to="/profile" className="link link-hover">Profile</Link>
        </div>
        <div>
          <span className="footer-title">Contact</span>
          <div className="flex items-center gap-2">
            <HiMail className="w-4 h-4" />
            <span>support@concerttix.com</span>
          </div>
          <div className="flex items-center gap-2">
            <HiPhone className="w-4 h-4" />
            <span>+62 811 581 233</span>
          </div>
          <div className="flex items-center gap-2">
            <HiLocationMarker className="w-4 h-4" />
            <span>Makassar, Indonesia</span>
          </div>
        </div>
        <div>
          <span className="footer-title">Follow Us</span>
          <div className="grid grid-flow-col gap-4">
            <a href="#" className="link link-hover">Facebook</a>
            <a href="#" className="link link-hover">Twitter</a>
            <a href="#" className="link link-hover">Instagram</a>
          </div>
        </div>
      </div>
      <div className="footer footer-center p-4 bg-base-300 text-base-content">
        <div>
          <p>Copyright © 2025 - All rights reserved by Concert Ticketing App</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;