import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from './Button';

const AdminLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const menuItems = [
    { name: 'Dashboard', path: '/admin', icon: '📊' },
    { name: 'Appointments', path: '/admin/bookings', icon: '📅' },
    { name: 'Services', path: '/admin/services', icon: '🚗' },
    { name: 'Enquiries', path: '/admin/enquiries', icon: '✉️' },
  ];

  return (
    <div className="min-h-screen bg-luxury-bg-deep flex">
      {/* Fixed Left Sidebar */}
      <aside className="w-64 bg-luxury-bg-panel border-r border-white/5 flex flex-col justify-between p-6">
        <div className="space-y-8">
          {/* Brand Logo */}
          <div className="flex items-center space-x-2 border-b border-white/5 pb-4">
            <span className="font-serif text-lg tracking-widest text-luxury-gold-light font-bold">
              V E L O C I T Y
            </span>
            <span className="text-[8px] uppercase tracking-widest bg-luxury-gold-light/20 text-luxury-gold-light px-1 py-0.5 rounded">
              ADMIN
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col space-y-2">
            {menuItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                end={item.path === '/admin'}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-4 py-2.5 rounded-xl text-xs uppercase tracking-wider font-semibold transition-all ${
                    isActive
                      ? 'bg-luxury-gold-light text-luxury-bg-deep shadow-md shadow-[rgba(212,196,160,0.15)]'
                      : 'text-luxury-text-secondary hover:text-luxury-text-primary hover:bg-white/5'
                  }`
                }
              >
                <span>{item.icon}</span>
                <span>{item.name}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="space-y-4">
          <NavLink
            to="/"
            className="flex items-center space-x-3 px-4 py-2.5 rounded-xl text-xs uppercase tracking-wider font-semibold text-luxury-text-secondary hover:text-luxury-text-primary hover:bg-white/5"
          >
            <span>🏠</span>
            <span>View Studio Site</span>
          </NavLink>

          <Button variant="outline" size="sm" onClick={handleLogout} className="w-full">
            Log Out
          </Button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top Header Bar */}
        <header className="h-16 bg-luxury-bg-panel/50 backdrop-blur-md border-b border-white/5 px-8 flex items-center justify-between">
          {/* Search Bar */}
          <div className="relative w-64">
            <input
              type="text"
              placeholder="Search records..."
              className="w-full bg-luxury-bg-deep border border-white/5 text-xs text-luxury-text-primary px-3 py-1.5 pl-8 rounded-lg outline-none"
            />
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs">🔍</span>
          </div>

          {/* User Profile Info */}
          <div className="flex items-center space-x-4">
            {/* Notification Icon */}
            <button className="text-luxury-text-secondary hover:text-luxury-text-primary relative">
              <span className="text-sm">🔔</span>
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-luxury-gold-dark rounded-full" />
            </button>
            
            <div className="flex items-center space-x-2 border-l border-white/5 pl-4">
              <div className="w-8 h-8 rounded-full bg-luxury-gold-dark/20 border border-luxury-gold-light flex items-center justify-center font-bold text-xs text-luxury-gold-light">
                {user?.name?.slice(0, 2).toUpperCase()}
              </div>
              <div className="text-left hidden md:block">
                <span className="text-xs font-semibold text-luxury-text-primary block leading-none">
                  {user?.name}
                </span>
                <span className="text-[9px] uppercase text-luxury-gold-light font-bold">
                  {user?.role}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Route Pages */}
        <main className="flex-1 p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
