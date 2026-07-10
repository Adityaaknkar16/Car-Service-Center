import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-luxury-bg-deep border-t border-white/5 pt-16 pb-8 px-6 md:px-12 text-luxury-text-secondary">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
        {/* Brand Column */}
        <div className="space-y-4">
          <Link to="/" className="flex items-center space-x-2">
            <span className="font-serif text-xl tracking-widest text-luxury-gold-light font-bold">
              V E L O C I T Y
            </span>
          </Link>
          <p className="text-xs leading-relaxed text-luxury-text-secondary/70">
            A premium automotive care facility providing timeless precision, master level craft, and modern engineering standards for your luxury and sport vehicles.
          </p>
        </div>

        {/* Navigation Links */}
        <div>
          <h4 className="text-xs uppercase tracking-widest text-luxury-text-primary font-semibold mb-4">
            Navigation
          </h4>
          <ul className="space-y-2 text-xs">
            <li>
              <Link to="/" className="hover:text-luxury-gold-light transition-colors">Home</Link>
            </li>
            <li>
              <Link to="/services" className="hover:text-luxury-gold-light transition-colors">Services & Packages</Link>
            </li>
            <li>
              <Link to="/about" className="hover:text-luxury-gold-light transition-colors">About Our Workshop</Link>
            </li>
            <li>
              <Link to="/contact" className="hover:text-luxury-gold-light transition-colors">Contact & Enquiries</Link>
            </li>
          </ul>
        </div>

        {/* Operating Hours */}
        <div>
          <h4 className="text-xs uppercase tracking-widest text-luxury-text-primary font-semibold mb-4">
            Workshop Hours
          </h4>
          <ul className="space-y-2 text-xs text-luxury-text-secondary/80">
            <li className="flex justify-between">
              <span>Monday – Friday</span>
              <span>8:00 AM – 6:00 PM</span>
            </li>
            <li className="flex justify-between">
              <span>Saturday</span>
              <span>9:00 AM – 4:00 PM</span>
            </li>
            <li className="flex justify-between">
              <span>Sunday</span>
              <span className="text-luxury-gold-dark/60">Closed</span>
            </li>
          </ul>
        </div>

        {/* Contact Info */}
        <div>
          <h4 className="text-xs uppercase tracking-widest text-luxury-text-primary font-semibold mb-4">
            Direct Contact
          </h4>
          <ul className="space-y-2 text-xs">
            <li className="flex items-center space-x-2">
              <span className="text-luxury-gold-light">📍</span>
              <span>100 Precision Way, Suite A, Automotive District</span>
            </li>
            <li className="flex items-center space-x-2">
              <span className="text-luxury-gold-light">📞</span>
              <a href="tel:+15550070007" className="hover:text-luxury-gold-light transition-colors">+1 (555) 007-0007</a>
            </li>
            <li className="flex items-center space-x-2">
              <span className="text-luxury-gold-light">✉️</span>
              <a href="mailto:service@velocitystudio.com" className="hover:text-luxury-gold-light transition-colors">service@velocitystudio.com</a>
            </li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between text-[11px] text-luxury-text-secondary/50">
        <span>© 2026 VELOCITY STUDIO. All Rights Reserved.</span>
        <div className="flex space-x-6 mt-4 md:mt-0">
          <a href="#" className="hover:text-luxury-gold-light">Privacy Policy</a>
          <a href="#" className="hover:text-luxury-gold-light">Terms of Service</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
