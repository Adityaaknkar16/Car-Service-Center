import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from './Button';

const Navbar = ({ onBookClick }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Services', path: '/services' },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <nav className="sticky top-0 z-40 bg-luxury-bg-deep/80 backdrop-blur-md border-b border-white/5 py-4 px-6 md:px-12">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center space-x-2">
          <span className="font-serif text-xl md:text-2xl tracking-widest text-luxury-gold-light font-bold">
            V E L O C I T Y
          </span>
          <span className="text-[9px] uppercase tracking-widest text-luxury-text-secondary border border-luxury-text-secondary/30 px-1.5 py-0.5 rounded">
            STUDIO
          </span>
        </Link>

        {/* Desktop Nav Items */}
        <div className="hidden md:flex items-center space-x-8">
          {navLinks.map((link) => (
            <NavLink
              key={link.name}
              to={link.path}
              className={({ isActive }) =>
                `text-xs uppercase tracking-widest font-semibold transition-colors duration-300 ${
                  isActive ? 'text-luxury-gold-light' : 'text-luxury-text-secondary hover:text-luxury-text-primary'
                }`
              }
            >
              {link.name}
            </NavLink>
          ))}
          {user && (
            <>
              {user.role === 'admin' ? (
                <>
                  <NavLink
                    to="/admin"
                    className={({ isActive }) =>
                      `text-xs uppercase tracking-widest font-semibold transition-colors duration-300 ${
                        isActive ? 'text-luxury-gold-light' : 'text-luxury-text-secondary hover:text-luxury-text-primary'
                      }`
                    }
                  >
                    Admin Panel
                  </NavLink>
                  <NavLink
                    to="/admin/user-history"
                    className={({ isActive }) =>
                      `text-xs uppercase tracking-widest font-semibold transition-colors duration-300 ${
                        isActive ? 'text-luxury-gold-light' : 'text-luxury-text-secondary hover:text-luxury-text-primary'
                      }`
                    }
                  >
                    User Booking History
                  </NavLink>
                </>
              ) : (
                <>
                  <NavLink
                    to="/dashboard"
                    className={({ isActive }) =>
                      `text-xs uppercase tracking-widest font-semibold transition-colors duration-300 ${
                        isActive ? 'text-luxury-gold-light' : 'text-luxury-text-secondary hover:text-luxury-text-primary'
                      }`
                    }
                  >
                    My Dashboard
                  </NavLink>
                  <NavLink
                    to="/my-bookings"
                    className={({ isActive }) =>
                      `text-xs uppercase tracking-widest font-semibold transition-colors duration-300 ${
                        isActive ? 'text-luxury-gold-light' : 'text-luxury-text-secondary hover:text-luxury-text-primary'
                      }`
                    }
                  >
                    My Bookings
                  </NavLink>
                </>
              )}
            </>
          )}
        </div>

        {/* Desktop Call to Action */}
        <div className="hidden md:flex items-center space-x-4">
          {user ? (
            <>
              {user.role !== 'admin' && (
                <Button size="sm" variant="solid" onClick={onBookClick}>
                  Book Service
                </Button>
              )}
              <Button size="sm" variant="outline" onClick={handleLogout}>
                Logout
              </Button>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button size="sm" variant="ghost">
                  Login
                </Button>
              </Link>
              <Link to="/register">
                <Button size="sm" variant="solid">
                  Register
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden text-luxury-text-primary focus:outline-none"
        >
          <svg className="h-6 w-6 fill-current" viewBox="0 0 24 24">
            {isOpen ? (
              <path fillRule="evenodd" clipRule="evenodd" d="M18.278 16.864a1 1 0 0 1-1.414 1.414l-4.829-4.828-4.828 4.828a1 1 0 0 1-1.414-1.414l4.828-4.829-4.828-4.828a1 1 0 0 1 1.414-1.414l4.829 4.828 4.828-4.828a1 1 0 1 1 1.414 1.414l-4.828 4.828 4.828 4.829z" />
            ) : (
              <path fillRule="evenodd" d="M4 5h16a1 1 0 0 1 0 2H4a1 1 0 1 1 0-2zm0 6h16a1 1 0 0 1 0 2H4a1 1 0 0 1 0-2zm0 6h16a1 1 0 0 1 0 2H4a1 1 0 0 1 0-2z" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Nav Overlay */}
      {isOpen && (
        <div className="md:hidden mt-4 pt-4 border-t border-white/5 flex flex-col space-y-4">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              onClick={() => setIsOpen(false)}
              className="text-xs uppercase tracking-widest font-medium text-luxury-text-secondary hover:text-luxury-text-primary"
            >
              {link.name}
            </Link>
          ))}
          {user && (
            <>
              {user.role === 'admin' ? (
                <>
                  <Link
                    to="/admin"
                    onClick={() => setIsOpen(false)}
                    className="text-xs uppercase tracking-widest font-medium text-luxury-text-secondary hover:text-luxury-text-primary"
                  >
                    Admin Panel
                  </Link>
                  <Link
                    to="/admin/user-history"
                    onClick={() => setIsOpen(false)}
                    className="text-xs uppercase tracking-widest font-medium text-luxury-text-secondary hover:text-luxury-text-primary"
                  >
                    User Booking History
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/dashboard"
                    onClick={() => setIsOpen(false)}
                    className="text-xs uppercase tracking-widest font-medium text-luxury-text-secondary hover:text-luxury-text-primary"
                  >
                    My Dashboard
                  </Link>
                  <Link
                    to="/my-bookings"
                    onClick={() => setIsOpen(false)}
                    className="text-xs uppercase tracking-widest font-medium text-luxury-text-secondary hover:text-luxury-text-primary"
                  >
                    My Bookings
                  </Link>
                </>
              )}
            </>
          )}
          <div className="pt-2 flex flex-col space-y-2">
            {user ? (
              <>
                {user.role !== 'admin' && (
                  <Button
                    size="sm"
                    variant="solid"
                    onClick={() => {
                      setIsOpen(false);
                      onBookClick();
                    }}
                  >
                    Book Service
                  </Button>
                )}
                <Button size="sm" variant="outline" onClick={handleLogout}>
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setIsOpen(false)} className="w-full">
                  <Button size="sm" variant="ghost" className="w-full">
                    Login
                  </Button>
                </Link>
                <Link to="/register" onClick={() => setIsOpen(false)} className="w-full">
                  <Button size="sm" variant="solid" className="w-full">
                    Register
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
